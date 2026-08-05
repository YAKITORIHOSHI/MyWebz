import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_RECORDS,
  INITIAL_BACKUPS,
  INITIAL_AUDIT_LOGS,
  CCT_DEPARTMENTS,
  INITIAL_SUBJECT_CATALOG
} from '../firebase/seedData';
import { RECORD_STATUS, normalizeAcademicYear } from '../utils/academic';
import { auth, rtdb, isFirebaseInitialized, KEEP_SIGNED_IN_KEY } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import {
  ref as rtdbRef,
  onValue,
  set as rtdbSet,
  push as rtdbPush,
  remove as rtdbRemove
} from 'firebase/database';

const AuthContext = createContext(null);
const DATA_VERSION = '4.0-firebase-live-clean';

const readStoredCollection = (key, fallback) => {
  try {
    if (localStorage.getItem('cct_data_version') !== DATA_VERSION) return fallback;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const timestamp = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

export const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(() => readStoredCollection('cct_accounts', INITIAL_ACCOUNTS));
  const [records, setRecords] = useState(() => readStoredCollection('cct_records', []));
  const [backups, setBackups] = useState(() => readStoredCollection('cct_backups', []));
  const [auditLogs, setAuditLogs] = useState(() => readStoredCollection('cct_audit_logs', []));
  const [departments, setDepartments] = useState(() => readStoredCollection('cct_departments', CCT_DEPARTMENTS));
  const [subjectCatalog, setSubjectCatalog] = useState(() => readStoredCollection('cct_subject_catalog', INITIAL_SUBJECT_CATALOG));
  const [rtdbLiveTicker, setRtdbLiveTicker] = useState([]);

  // Every app update/refresh defaults to logged out state on login screen
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState('');

  // 5 Minutes = 300,000 ms
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let inactivityTimer = null;
    let awayTimestamp = null;

    const performAutoLogout = () => {
      logout();
      setInactivityNotice('Session expired: You were away or inactive for 5 minutes. Please sign in again.');
    };

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(performAutoLogout, INACTIVITY_TIMEOUT_MS);
    };

    const handleVisibilityOrFocusChange = () => {
      if (document.hidden) {
        awayTimestamp = Date.now();
      } else {
        if (awayTimestamp && (Date.now() - awayTimestamp >= INACTIVITY_TIMEOUT_MS)) {
          performAutoLogout();
          return;
        }
        awayTimestamp = null;
        resetInactivityTimer();
      }
    };

    const handleWindowBlur = () => {
      awayTimestamp = Date.now();
    };

    const handleWindowFocus = () => {
      if (awayTimestamp && (Date.now() - awayTimestamp >= INACTIVITY_TIMEOUT_MS)) {
        performAutoLogout();
        return;
      }
      awayTimestamp = null;
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocusChange);

    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocusChange);
    };
  }, [isAuthenticated]);

  const clearInactivityNotice = () => setInactivityNotice('');

  const permissions = useMemo(() => {
    const role = currentUser?.role;
    return {
      isVPAA: role === 'VPAA',
      isPresident: role === 'President',
      isDean: role === 'Deans',
      isHead: role === 'Heads',
      canCreateRecords: Boolean(currentUser) && role !== 'President',
      canManageAccounts: role === 'VPAA',
      canManageBackups: role === 'VPAA',
      canManageInstitutionalData: role === 'VPAA',
      canViewAllDepartments: role === 'VPAA' || role === 'President'
    };
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cct_data_version', DATA_VERSION);
    localStorage.setItem('cct_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('cct_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('cct_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('cct_subject_catalog', JSON.stringify(subjectCatalog));
  }, [subjectCatalog]);

  useEffect(() => {
    localStorage.setItem('cct_backups', JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem('cct_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);



  const parseRtdbSnapshot = (snapshot) => {
    if (!snapshot.exists()) return [];
    const value = snapshot.val();
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return Object.keys(value).map((key) => ({ id: key, ...value[key] }));
  };

  useEffect(() => {
    if (!isFirebaseInitialized || !rtdb) return undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }
      const matched = accounts.find((account) => account.email.toLowerCase() === firebaseUser.email?.toLowerCase());
      if (!matched || matched.status === 'Suspended') {
        if (auth) firebaseSignOut(auth).catch(console.warn);
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(matched);
    });

    const unsubAccounts = onValue(rtdbRef(rtdb, 'accounts'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      if (list.length > 0) {
        setAccounts(list);
        setCurrentUser((previous) => (previous ? (list.find((account) => account.id === previous.id) || previous) : null));
      } else {
        const map = {};
        INITIAL_ACCOUNTS.forEach((acc) => { map[acc.id] = acc; });
        rtdbSet(rtdbRef(rtdb, 'accounts'), map).catch(console.warn);
      }
    });

    const unsubRequests = onValue(rtdbRef(rtdb, 'requests'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      if (list.length > 0) {
        setRecords(list.map((record) => ({
          ...record,
          academicYear: normalizeAcademicYear(record.academicYear),
          status: record.status || RECORD_STATUS.APPROVED,
          droppedCount: Number.parseInt(record.droppedCount, 10) || 0,
          incCount: Number.parseInt(record.incCount, 10) || 0,
          approvedBy: record.approvedBy || (record.status ? '' : 'Legacy data migration'),
          approvedAt: record.approvedAt || '',
          reviewNote: record.reviewNote || ''
        })));
      } else {
        const map = {};
        INITIAL_RECORDS.forEach((rec) => { map[rec.id] = rec; });
        rtdbSet(rtdbRef(rtdb, 'requests'), map).catch(console.warn);
      }
    });

    const unsubDepartments = onValue(rtdbRef(rtdb, 'departments'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      if (list.length > 0) {
        const deptNames = list.map((item) => (typeof item === 'string' ? item : item.name || item.id)).filter(Boolean);
        if (deptNames.length > 0) setDepartments(deptNames);
      } else {
        rtdbSet(rtdbRef(rtdb, 'departments'), CCT_DEPARTMENTS).catch(console.warn);
      }
    });

    const unsubSubjects = onValue(rtdbRef(rtdb, 'subjects'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      if (list.length > 0) {
        setSubjectCatalog(list);
      } else {
        const map = {};
        INITIAL_SUBJECT_CATALOG.forEach((subj) => { map[subj.id] = subj; });
        rtdbSet(rtdbRef(rtdb, 'subjects'), map).catch(console.warn);
      }
    });

    const unsubBackups = onValue(rtdbRef(rtdb, 'backups'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      setBackups(list);
    });

    const unsubAuditLogs = onValue(rtdbRef(rtdb, 'auditLogs'), (snapshot) => {
      const list = parseRtdbSnapshot(snapshot);
      setAuditLogs(list.reverse());
    });

    const unsubTicker = onValue(rtdbRef(rtdb, 'activityTicker'), (snapshot) => {
      setRtdbLiveTicker(parseRtdbSnapshot(snapshot).reverse().slice(0, 5));
    });

    return () => {
      unsubscribeAuth();
      unsubAccounts();
      unsubRequests();
      unsubDepartments();
      unsubSubjects();
      unsubBackups();
      unsubAuditLogs();
      unsubTicker();
    };
  }, []);

  const broadcastRealtimeActivity = (action, details) => {
    const item = {
      timestamp: new Date().toLocaleTimeString(),
      user: currentUser?.email || 'System',
      action,
      details
    };

    if (isFirebaseInitialized && rtdb) {
      rtdbPush(rtdbRef(rtdb, 'activityTicker'), item).catch((error) => {
        console.warn('RTDB activity broadcast:', error);
      });
    }

    setRtdbLiveTicker((previous) => [item, ...previous].slice(0, 5));
  };

  const addAuditLog = (action, details) => {
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: timestamp(),
      user: currentUser?.email || 'System',
      action,
      details
    };

    setAuditLogs((previous) => [newLog, ...previous]);

    if (isFirebaseInitialized && rtdb) {
      rtdbSet(rtdbRef(rtdb, `auditLogs/${newLog.id}`), newLog).catch((error) => {
        console.warn('RTDB audit log write:', error);
      });
    }

    broadcastRealtimeActivity(action, details);
  };

  const syncRecord = (record) => {
    if (!isFirebaseInitialized || !rtdb) return;
    rtdbSet(rtdbRef(rtdb, `requests/${record.id}`), record).catch((error) => {
      console.warn('RTDB record write:', error);
    });
  };

  const syncAccount = (account) => {
    if (!isFirebaseInitialized || !rtdb) return;
    rtdbSet(rtdbRef(rtdb, `accounts/${account.id}`), account).catch((error) => {
      console.warn('RTDB account write:', error);
    });
  };

  const loginWithEmail = async (email, password, keepSignedIn = false) => {
    if (!isFirebaseInitialized || !auth) {
      return { success: false, message: 'Firebase Auth service is not initialized.' };
    }

    try {
      if (keepSignedIn) {
        localStorage.setItem(KEEP_SIGNED_IN_KEY, 'true');
        await setPersistence(auth, browserLocalPersistence);
      } else {
        localStorage.removeItem(KEEP_SIGNED_IN_KEY);
        await setPersistence(auth, inMemoryPersistence);
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const matched = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());

      if (matched?.status === 'Suspended') {
        return { success: false, message: 'This account has been suspended.' };
      }

      const userProfile = matched || {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authenticated User',
        email: fbUser.email,
        role: 'Deans',
        department: 'School of Computer Studies (Informatics)',
        status: 'Active'
      };

      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      addAuditLog('Firebase Auth Sign In', `Signed in as ${email}`);
      return { success: true };
    } catch (error) {
      console.warn('Firebase Auth sign in failure:', error.code, error.message);
      let message = 'Invalid email or password.';
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid')) {
        message = 'Firebase API key is invalid. Please copy .env.example to .env.local and enter your real Firebase VITE_FIREBASE_API_KEY.';
      } else if (error.code === 'auth/invalid-email') message = 'Please enter a valid institutional email address.';
      else if (error.code === 'auth/user-disabled') message = 'This account has been disabled.';
      else if (error.code === 'auth/too-many-requests') message = 'Too many failed attempts. Please try again later.';
      else if (error.code === 'auth/network-request-failed') message = 'Network connection issue. Please check your internet connection.';
      else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid institutional email or password.';
      } else if (error.message) {
        message = error.message.replace(/^Firebase:\s*/, '');
      }
      return { success: false, message };
    }
  };

  const registerWithEmail = async ({ email, password, name, role, department }) => {
    if (!isFirebaseInitialized || !auth) {
      return { success: false, message: 'Firebase Auth service is not initialized.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const newAccount = {
        id: fbUser.uid,
        name: name || fbUser.email?.split('@')[0] || 'Staff Member',
        email: fbUser.email,
        role: role || 'Heads',
        department: department || 'School of Computer Studies (Informatics)',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setAccounts((previous) => [...previous, newAccount]);
      syncAccount(newAccount);
      setCurrentUser(newAccount);
      setIsAuthenticated(true);
      addAuditLog('Firebase Account Registered', `Registered new account ${email} (${newAccount.role})`);
      return { success: true };
    } catch (error) {
      console.warn('Firebase Auth registration failure:', error.code, error.message);
      let message = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists.';
      else if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      else if (error.code === 'auth/invalid-email') message = 'Please enter a valid email format.';
      else if (error.message) message = error.message.replace(/^Firebase:\s*/, '');
      return { success: false, message };
    }
  };

  const logout = async () => {
    localStorage.removeItem(KEEP_SIGNED_IN_KEY);
    if (isFirebaseInitialized && auth) {
      try {
        await setPersistence(auth, inMemoryPersistence);
        await firebaseSignOut(auth);
      } catch (error) {
        console.warn('Logout note:', error);
      }
    }
    if (currentUser?.email) {
      addAuditLog('Sign Out', `User ${currentUser.email} signed out.`);
    }
    localStorage.removeItem('cct_current_user_id');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = (userId) => {
    const user = accounts.find((account) => account.id === userId && account.status !== 'Suspended');
    if (!user) return false;
    setCurrentUser(user);
    setIsAuthenticated(true);
    addAuditLog('Role Switch', `Switched active preview to ${user.name} (${user.role})`);
    return true;
  };

  const addAccount = (accountData) => {
    if (!permissions.canManageAccounts) return { success: false, message: 'Only the VPAA can create accounts.' };

    const newAccount = {
      id: `usr_${Date.now()}`,
      ...accountData,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    setAccounts((previous) => [...previous, newAccount]);
    syncAccount(newAccount);
    addAuditLog('Create Account', `Created account ${newAccount.email} (${newAccount.role})`);
    return { success: true, account: newAccount };
  };

  const updateAccount = (id, updatedData) => {
    if (!permissions.canManageAccounts) return { success: false, message: 'Only the VPAA can edit accounts.' };
    const existing = accounts.find((account) => account.id === id);
    if (!existing) return { success: false, message: 'Account not found.' };

    const updatedAccount = { ...existing, ...updatedData };
    setAccounts((previous) => previous.map((account) => account.id === id ? updatedAccount : account));
    if (currentUser?.id === id) setCurrentUser(updatedAccount);
    syncAccount(updatedAccount);
    addAuditLog('Update Account', `Updated profile for ${updatedAccount.email}`);
    return { success: true, account: updatedAccount };
  };

  const toggleAccountStatus = (id) => {
    if (!permissions.canManageAccounts) return { success: false, message: 'Only the VPAA can change account status.' };
    const existing = accounts.find((account) => account.id === id);
    if (!existing) return { success: false, message: 'Account not found.' };
    if (existing.id === currentUser?.id) return { success: false, message: 'The active VPAA account cannot suspend itself.' };

    const updatedAccount = {
      ...existing,
      status: existing.status === 'Active' ? 'Suspended' : 'Active'
    };
    setAccounts((previous) => previous.map((account) => account.id === id ? updatedAccount : account));
    syncAccount(updatedAccount);
    addAuditLog('Account Status Changed', `Set ${updatedAccount.email} to ${updatedAccount.status}`);
    return { success: true, account: updatedAccount };
  };

  const isRecordInUserDepartment = (record) => record?.department === currentUser?.department;
  const isRecordOwner = (record) => record?.encodedById === currentUser?.id || record?.encodedBy === currentUser?.name;

  const canEditRecord = (record) => {
    if (!record || !currentUser) return false;
    if (permissions.isVPAA) return true;
    if (permissions.isDean) return isRecordInUserDepartment(record);
    if (permissions.isHead) {
      return isRecordInUserDepartment(record)
        && isRecordOwner(record)
        && record.status !== RECORD_STATUS.APPROVED;
    }
    return false;
  };

  const canDeleteRecord = (record) => {
    if (!record || !currentUser) return false;
    if (permissions.isVPAA) return true;
    if (permissions.isDean) return isRecordInUserDepartment(record) && record.status !== RECORD_STATUS.APPROVED;
    if (permissions.isHead) return canEditRecord(record);
    return false;
  };

  const canApproveRecord = (record) => {
    if (!record || !currentUser) return false;
    if (permissions.isVPAA) return true;
    return permissions.isDean && isRecordInUserDepartment(record);
  };

  const normalizeRecordNumbers = (recordData, fallbackGrade = 1.75) => {
    const enrolledCount = Number.parseInt(recordData.enrolledCount, 10) || 0;
    const passedCount = Number.parseInt(recordData.passedCount, 10) || 0;
    const failedCount = Number.parseInt(recordData.failedCount, 10) || 0;
    const droppedCount = Number.parseInt(recordData.droppedCount, 10) || 0;
    const incCount = Number.parseInt(recordData.incCount, 10) || 0;

    return {
      enrolledCount,
      passedCount,
      failedCount,
      droppedCount,
      incCount,
      passingRate: enrolledCount > 0 ? Number(((passedCount / enrolledCount) * 100).toFixed(2)) : 0,
      averageGrade: Number.parseFloat(recordData.averageGrade) || fallbackGrade
    };
  };

  const addRecord = (recordData) => {
    if (!permissions.canCreateRecords) return { success: false, message: 'The President role is read-only.' };

    const isSubmittedForApproval = permissions.isHead;
    const now = timestamp();
    const status = isSubmittedForApproval ? RECORD_STATUS.PENDING : RECORD_STATUS.APPROVED;
    const numbers = normalizeRecordNumbers(recordData);

    const newRecord = {
      id: `rec_${Date.now()}`,
      ...recordData,
      ...numbers,
      academicYear: normalizeAcademicYear(recordData.academicYear),
      encodedBy: currentUser.name,
      encodedById: currentUser.id,
      updatedAt: new Date().toISOString().split('T')[0],
      status,
      submittedAt: isSubmittedForApproval ? now : '',
      approvedBy: status === RECORD_STATUS.APPROVED ? currentUser.name : '',
      approvedAt: status === RECORD_STATUS.APPROVED ? now : '',
      reviewNote: status === RECORD_STATUS.APPROVED ? 'Created by an authorized approver.' : ''
    };

    setRecords((previous) => [newRecord, ...previous]);
    syncRecord(newRecord);
    addAuditLog(
      isSubmittedForApproval ? 'Record Submitted for Dean Approval' : 'Record Approved and Encoded',
      `${newRecord.subjectCode} (${newRecord.department})`
    );
    return { success: true, record: newRecord };
  };

  const updateRecord = (id, updatedData) => {
    const existing = records.find((record) => record.id === id);
    if (!existing) return { success: false, message: 'Record not found.' };
    if (!canEditRecord(existing)) return { success: false, message: 'You do not have permission to edit this record.' };

    const numbers = normalizeRecordNumbers(updatedData, existing.averageGrade);
    const updatedRecord = {
      ...existing,
      ...updatedData,
      ...numbers,
      academicYear: normalizeAcademicYear(updatedData.academicYear || existing.academicYear),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (permissions.isHead) {
      updatedRecord.status = RECORD_STATUS.PENDING;
      updatedRecord.submittedAt = timestamp();
      updatedRecord.approvedBy = '';
      updatedRecord.approvedAt = '';
      updatedRecord.reviewNote = '';
    }

    setRecords((previous) => previous.map((record) => record.id === id ? updatedRecord : record));
    syncRecord(updatedRecord);
    addAuditLog(
      permissions.isHead ? 'Record Revised and Resubmitted' : 'Record Updated',
      `${updatedRecord.subjectCode} (${updatedRecord.department})`
    );
    return { success: true, record: updatedRecord };
  };

  const reviewRecord = (id, decision, note = '') => {
    const existing = records.find((record) => record.id === id);
    if (!existing) return { success: false, message: 'Record not found.' };
    if (!canApproveRecord(existing)) return { success: false, message: 'You do not have approval authority for this record.' };

    const approved = decision === RECORD_STATUS.APPROVED || decision === 'approve';
    const updatedRecord = {
      ...existing,
      status: approved ? RECORD_STATUS.APPROVED : RECORD_STATUS.RETURNED,
      approvedBy: approved ? currentUser.name : '',
      approvedAt: approved ? timestamp() : '',
      reviewedBy: currentUser.name,
      reviewedAt: timestamp(),
      reviewNote: note.trim() || (approved ? 'Reviewed and approved.' : 'Returned for revision.'),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRecords((previous) => previous.map((record) => record.id === id ? updatedRecord : record));
    syncRecord(updatedRecord);
    addAuditLog(
      approved ? 'Record Approved' : 'Record Returned for Revision',
      `${updatedRecord.subjectCode} reviewed by ${currentUser.name}`
    );
    return { success: true, record: updatedRecord };
  };

  const deleteRecord = (id) => {
    const target = records.find((record) => record.id === id);
    if (!target) return { success: false, message: 'Record not found.' };
    if (!canDeleteRecord(target)) return { success: false, message: 'You do not have permission to delete this record.' };

    setRecords((previous) => previous.filter((record) => record.id !== id));
    if (isFirebaseInitialized && rtdb) {
      rtdbRemove(rtdbRef(rtdb, `requests/${id}`)).catch((error) => {
        console.warn('RTDB record remove:', error);
      });
    }
    addAuditLog('Record Deleted', `Deleted ${target.subjectCode} (${target.department})`);
    return { success: true };
  };

  const createBackup = (type = 'Manual Export') => {
    if (!permissions.canManageBackups) return { success: false, message: 'Only the VPAA can create system backups.' };

    const now = new Date();
    const timestampString = timestamp();
    const dateCode = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomHex = Math.random().toString(16).substring(2, 8);
    const snapshotData = {
      accounts,
      records,
      auditLogs,
      exportedAt: timestampString,
      version: DATA_VERSION,
      college: 'City College of Tagaytay'
    };
    const jsonString = JSON.stringify(snapshotData, null, 2);

    const newBackup = {
      id: `bkp_${Date.now()}`,
      fileName: `cct_academic_db_${dateCode}_${randomHex}.json`,
      fileSize: `${(jsonString.length / 1024).toFixed(2)} KB`,
      createdAt: timestampString,
      type,
      status: 'Completed',
      createdBy: currentUser.name,
      checksum: `sha256-${randomHex}${Date.now().toString(16)}`,
      rawContent: jsonString
    };

    setBackups((previous) => [newBackup, ...previous]);
    if (isFirebaseInitialized && rtdb) {
      rtdbSet(rtdbRef(rtdb, `backups/${newBackup.id}`), newBackup).catch((error) => {
        console.warn('RTDB backup write:', error);
      });
    }
    addAuditLog('Backup Created', `Generated ${type} snapshot: ${newBackup.fileName}`);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = newBackup.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return { success: true, backup: newBackup };
  };

  const restoreBackup = (backupJsonData) => {
    if (!permissions.canManageBackups) return { success: false, message: 'Only the VPAA can restore system data.' };
    try {
      const parsed = typeof backupJsonData === 'string' ? JSON.parse(backupJsonData) : backupJsonData;
      if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (Array.isArray(parsed.records)) setRecords(parsed.records);
      if (Array.isArray(parsed.auditLogs)) setAuditLogs(parsed.auditLogs);
      addAuditLog('System Restore', `Restored snapshot at ${new Date().toLocaleTimeString()}`);
      return { success: true, message: 'Database state restored successfully.' };
    } catch (error) {
      console.error('Restoration error:', error);
      return { success: false, message: 'Invalid backup file format.' };
    }
  };

  const addDepartment = (name) => {
    if (!permissions.isVPAA) return { success: false, message: 'Only the VPAA can create new departments.' };
    const trimmed = name?.trim();
    if (!trimmed) return { success: false, message: 'Department name cannot be empty.' };
    if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: 'This department already exists.' };
    }
    const updated = [...departments, trimmed];
    setDepartments(updated);
    if (isFirebaseInitialized && rtdb) {
      rtdbSet(rtdbRef(rtdb, 'departments'), updated).catch((error) => console.warn('RTDB dept write:', error));
    }
    addAuditLog('Add Department', `VPAA created department: ${trimmed}`);
    return { success: true, department: trimmed };
  };

  const deleteDepartment = (name) => {
    if (!permissions.isVPAA) return { success: false, message: 'Only the VPAA can remove departments.' };
    const updated = departments.filter((d) => d !== name);
    setDepartments(updated);
    if (isFirebaseInitialized && rtdb) {
      rtdbSet(rtdbRef(rtdb, 'departments'), updated).catch((error) => console.warn('RTDB dept remove:', error));
    }
    addAuditLog('Remove Department', `VPAA removed department: ${name}`);
    return { success: true };
  };

  const addSubjectToCatalog = ({ code, title, department }) => {
    if (!permissions.isVPAA) return { success: false, message: 'Only the VPAA can add subjects to the catalog.' };
    if (!code?.trim() || !title?.trim() || !department) {
      return { success: false, message: 'Subject code, title, and department are required.' };
    }
    const newSubject = {
      id: `subj_${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      department
    };
    setSubjectCatalog((previous) => [...previous, newSubject]);
    if (isFirebaseInitialized && rtdb) {
      rtdbSet(rtdbRef(rtdb, `subjects/${newSubject.id}`), newSubject).catch((error) => console.warn('RTDB subject write:', error));
    }
    addAuditLog('Add Subject/Course', `Added ${newSubject.code} - ${newSubject.title} (${department})`);
    return { success: true, subject: newSubject };
  };

  const deleteSubjectFromCatalog = (id) => {
    if (!permissions.isVPAA) return { success: false, message: 'Only the VPAA can remove subjects.' };
    const target = subjectCatalog.find((s) => s.id === id);
    setSubjectCatalog((previous) => previous.filter((s) => s.id !== id));
    if (isFirebaseInitialized && rtdb) {
      rtdbRemove(rtdbRef(rtdb, `subjects/${id}`)).catch((error) => console.warn('RTDB subject remove:', error));
    }
    if (target) {
      addAuditLog('Remove Subject/Course', `Removed subject ${target.code} - ${target.title}`);
    }
    return { success: true };
  };

  const resetToSeedData = () => {
    if (!permissions.isVPAA) return { success: false, message: 'Only the VPAA can reset system data.' };
    setAccounts(INITIAL_ACCOUNTS);
    setRecords(INITIAL_RECORDS);
    setBackups(INITIAL_BACKUPS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDepartments(CCT_DEPARTMENTS);
    setSubjectCatalog(INITIAL_SUBJECT_CATALOG);
    setCurrentUser(INITIAL_ACCOUNTS[0]);
    localStorage.setItem('cct_data_version', DATA_VERSION);
    if (isFirebaseInitialized && rtdb) {
      const accMap = {}; INITIAL_ACCOUNTS.forEach((a) => { accMap[a.id] = a; });
      const recMap = {}; INITIAL_RECORDS.forEach((r) => { recMap[r.id] = r; });
      const subjMap = {}; INITIAL_SUBJECT_CATALOG.forEach((s) => { subjMap[s.id] = s; });
      rtdbSet(rtdbRef(rtdb, 'accounts'), accMap).catch(console.warn);
      rtdbSet(rtdbRef(rtdb, 'requests'), recMap).catch(console.warn);
      rtdbSet(rtdbRef(rtdb, 'departments'), CCT_DEPARTMENTS).catch(console.warn);
      rtdbSet(rtdbRef(rtdb, 'subjects'), subjMap).catch(console.warn);
    }
    addAuditLog('System Reset', 'Reset database to the CCT seed dataset.');
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        accounts,
        records,
        backups,
        auditLogs,
        rtdbLiveTicker,
        departments,
        subjectCatalog,
        isFirebaseConnected: isFirebaseInitialized,
        permissions,
        inactivityNotice,
        clearInactivityNotice,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchUser,
        addAccount,
        updateAccount,
        toggleAccountStatus,
        addDepartment,
        deleteDepartment,
        addSubjectToCatalog,
        deleteSubjectFromCatalog,
        addRecord,
        updateRecord,
        reviewRecord,
        deleteRecord,
        canEditRecord,
        canDeleteRecord,
        canApproveRecord,
        createBackup,
        restoreBackup,
        resetToSeedData,
        addAuditLog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
