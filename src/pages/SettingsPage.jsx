import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Database,
  CheckCircle2,
  Save,
  Sliders,
  Check,
  Server,
  Key,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  AlertCircle
} from 'lucide-react';

export const SettingsPage = ({ setActiveTab }) => {
  const {
    currentUser,
    updateAccount,
    isFirebaseConnected,
    permissions,
    departments,
    subjectCatalog,
    addDepartment,
    deleteDepartment,
    addSubjectToCatalog,
    deleteSubjectFromCatalog
  } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Department Management Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [deptMsg, setDeptMsg] = useState({ type: '', text: '' });

  // Subject Management Form State
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjTitle, setNewSubjTitle] = useState('');
  const [newSubjDept, setNewSubjDept] = useState(departments?.[0] || '');
  const [subjMsg, setSubjMsg] = useState({ type: '', text: '' });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    updateAccount(currentUser.id, { name, department });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    setDeptMsg({ type: '', text: '' });
    const res = addDepartment(newDeptName);
    if (!res.success) {
      setDeptMsg({ type: 'error', text: res.message });
    } else {
      setDeptMsg({ type: 'success', text: `Department "${res.department}" created and synced with Database.` });
      setNewDeptName('');
    }
  };

  const handleDeleteDepartment = (deptName) => {
    if (window.confirm(`Are you sure you want to remove department "${deptName}"?`)) {
      const res = deleteDepartment(deptName);
      if (!res.success) {
        setDeptMsg({ type: 'error', text: res.message });
      } else {
        setDeptMsg({ type: 'success', text: `Department "${deptName}" removed.` });
      }
    }
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    setSubjMsg({ type: '', text: '' });
    const targetDept = newSubjDept || departments?.[0] || 'School of Computer Studies (Informatics)';
    const res = addSubjectToCatalog({ code: newSubjCode, title: newSubjTitle, department: targetDept });
    if (!res.success) {
      setSubjMsg({ type: 'error', text: res.message });
    } else {
      setSubjMsg({ type: 'success', text: `Subject "${newSubjCode.toUpperCase()} - ${newSubjTitle}" added to catalog.` });
      setNewSubjCode('');
      setNewSubjTitle('');
    }
  };

  const handleDeleteSubject = (id, code) => {
    if (window.confirm(`Remove subject ${code} from catalog?`)) {
      deleteSubjectFromCatalog(id);
      setSubjMsg({ type: 'success', text: `Subject ${code} removed.` });
    }
  };

  const permissionList = [
    { label: 'Create & Encode Academic Records', granted: permissions.canCreateRecords },
    { label: 'View All Departments Dataset', granted: permissions.canViewAllDepartments },
    { label: 'Manage Accounts & User Roles', granted: permissions.canManageAccounts },
    { label: 'System Backup & Recovery Tools', granted: permissions.canManageBackups },
    { label: 'Manage Institutional Data (Depts/Subjects)', granted: permissions.canManageInstitutionalData },
    { label: 'Academic Approvals Authority', granted: permissions.isVPAA || permissions.isDean }
  ];

  return (
    <div className="page-stack space-y-4 sm:space-y-6">
      
      {/* Header Banner */}
      <section className="hero-panel relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-rose-950 to-amber-950 p-5 text-white sm:p-6 lg:p-7 shadow-xl shadow-rose-950/30">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              <Sliders className="h-4 w-4" />
              Account & System Configuration
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">System & Institutional Settings</h1>
            <p className="max-w-2xl text-xs leading-relaxed text-amber-100/90 sm:text-sm">
              Manage your credentials, maintain institutional departments and course catalog, and inspect database parameters.
            </p>
          </div>

          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 shrink-0 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-amber-500/40 bg-rose-900/30 hover:bg-rose-900/50 text-xs font-bold text-amber-200 transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Return to Workspace</span>
            </button>
          )}
        </div>
      </section>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">Account preferences updated and synchronized with Realtime Database.</span>
        </div>
      )}

      {/* VPAA Institutional Data Controls (Departments & Subjects) */}
      {permissions.isVPAA && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-900 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            VPAA Executive Administrative Controls
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            
            {/* Department Management Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Institutional Departments</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{departments.length} active departments in RTDB</p>
                    </div>
                  </div>
                </div>

                {deptMsg.text && (
                  <div className={`p-3 mb-3 rounded-xl text-xs flex items-center gap-2 ${
                    deptMsg.type === 'error'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}>
                    {deptMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{deptMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleAddDepartment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="Enter new department name..."
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              </div>

              <div className="max-h-80 min-h-[14rem] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs flex-1">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium text-xs">
                      <Building className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{dept}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept)}
                      className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject / Course Catalog Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Subject & Course Catalog</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{subjectCatalog.length} courses cataloged</p>
                    </div>
                  </div>
                </div>

                {subjMsg.text && (
                  <div className={`p-3 mb-3 rounded-xl text-xs flex items-center gap-2 ${
                    subjMsg.type === 'error'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}>
                    {subjMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{subjMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleAddSubject} className="space-y-2 text-xs mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Code (e.g. CS 101)"
                      value={newSubjCode}
                      onChange={(e) => setNewSubjCode(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Subject Title"
                      value={newSubjTitle}
                      onChange={(e) => setNewSubjTitle(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newSubjDept}
                      onChange={(e) => setNewSubjDept(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Add Course
                    </button>
                  </div>
                </form>
              </div>

              <div className="max-h-80 min-h-[14rem] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs flex-1">
                {subjectCatalog.map((subj) => (
                  <div key={subj.id} className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {subj.code}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate text-xs">
                          {subj.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1 pl-0.5">{subj.department}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(subj.id, subj.code)}
                      className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Left Column: Account Profile Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-900/10 text-rose-900 dark:bg-rose-950 dark:text-amber-300 font-black">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Account Profile Details</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Update your institutional display name and unit</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-rose-900/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Institutional Email</label>
                <div className="relative opacity-70">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono text-[11px]"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Email is managed by Firebase Authentication.</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Department / Academic School</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-rose-900/30"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-600 text-amber-100 border border-amber-500/40 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-rose-950/20"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: System Status & Permissions */}
        <div className="space-y-4">
          
          {/* Core System Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Core Status</h3>
                <p className="text-[10px] text-slate-400">Live connection and security telemetry</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Realtime Database</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Firebase Authentication</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Session Token Persistence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-amber-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-500" /> In-Memory Only
                </span>
              </div>
            </div>
          </div>

          {/* Role Permissions Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-900/10 text-rose-800 dark:bg-rose-950 dark:text-amber-300">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Role Authority</h3>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{currentUser?.role}</span>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              {permissionList.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                  {item.granted ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Granted
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-medium">Restricted</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
