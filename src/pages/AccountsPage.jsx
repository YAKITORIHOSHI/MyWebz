import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  CheckCircle2,
  Edit3,
  History,
  Lock,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  XCircle
} from 'lucide-react';

const ROLE_STYLES = {
  VPAA: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
  President: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Deans: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Heads: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
};

const roleDescription = {
  VPAA: 'Full administrative authority',
  President: 'Executive read-only oversight',
  Deans: 'Department review and approval',
  Heads: 'Department encoding and submission'
};

export const AccountsPage = () => {
  const {
    currentUser,
    accounts,
    addAccount,
    updateAccount,
    toggleAccountStatus,
    auditLogs,
    departments,
    permissions
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Heads',
    department: departments[0]
  });

  const departmentOptions = useMemo(() => [
    ...departments,
    'Office of VPAA',
    'Office of the College President'
  ], [departments]);

  const filteredAccounts = accounts.filter((account) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [account.name, account.email, account.department]
      .some((value) => String(value || '').toLowerCase().includes(query));
    return matchesSearch
      && (roleFilter === 'ALL' || account.role === roleFilter)
      && (deptFilter === 'ALL' || account.department === deptFilter);
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormError('');
    setFormData({ name: '', email: '', role: 'Heads', department: departments[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormError('');
    setFormData({ name: user.name, email: user.email, role: user.role, department: user.department });
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    const normalizedEmail = formData.email.trim().toLowerCase();
    const duplicate = accounts.find((account) => account.email.toLowerCase() === normalizedEmail && account.id !== editingUser?.id);
    if (duplicate) {
      setFormError('An account with this email address already exists.');
      return;
    }

    const result = editingUser
      ? updateAccount(editingUser.id, { ...formData, email: normalizedEmail })
      : addAccount({ ...formData, email: normalizedEmail });

    if (!result?.success) {
      setFormError(result?.message || 'The account could not be saved.');
      return;
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (user) => {
    const action = user.status === 'Active' ? 'suspend' : 'reactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
    const result = toggleAccountStatus(user.id);
    if (!result?.success) window.alert(result?.message || 'Unable to change account status.');
  };

  if (!permissions.canManageAccounts) return null;

  return (
    <div className="page-stack space-y-4 sm:space-y-5">
      <section className="surface-panel rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
              <ShieldCheck className="h-4 w-4" />
              VPAA administration
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Accounts and Access Control</h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The VPAA is the sole authority for creating accounts, assigning roles, changing department scope, and suspending access.
            </p>
          </div>
          <button type="button" onClick={openAddModal} className="primary-action button-shine inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700 sm:w-auto">
            <UserPlus className="h-4 w-4" /> Create Account
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total accounts</div><div className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">{accounts.length}</div></div>
        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Active</div><div className="mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">{accounts.filter((account) => account.status === 'Active').length}</div></div>
        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Deans</div><div className="mt-1 font-mono text-2xl font-black text-blue-600 dark:text-blue-400">{accounts.filter((account) => account.role === 'Deans').length}</div></div>
        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Heads</div><div className="mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">{accounts.filter((account) => account.role === 'Heads').length}</div></div>
      </section>

      <section className="surface-panel surface-panel-hover rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.5fr)_minmax(10rem,1fr)_minmax(12rem,1fr)]">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Search name, email, or department" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="form-control pl-9" />
          </label>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="form-control">
            <option value="ALL">All roles</option>
            {Object.keys(ROLE_STYLES).map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select value={deptFilter} onChange={(event) => setDeptFilter(event.target.value)} className="form-control">
            <option value="ALL">All departments</option>
            {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>
        <div className="mt-3 text-[10px] font-medium text-slate-400">Showing {filteredAccounts.length} of {accounts.length} accounts</div>
      </section>

      <section className="surface-panel hidden overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr><th className="px-4 py-3.5">User</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Department scope</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Created</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.map((user) => (
                <tr key={user.id} className="table-row-lift transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{user.name.charAt(0)}</div>
                      <div className="min-w-0"><div className="font-bold text-slate-900 dark:text-white">{user.name}</div><div className="mt-0.5 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{user.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${ROLE_STYLES[user.role]}`}>{user.role}</span><div className="mt-1.5 text-[9px] text-slate-400">{roleDescription[user.role]}</div></td>
                  <td className="max-w-[17rem] px-4 py-4"><div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"><Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />{user.department}</div></td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{user.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{user.status}</span></td>
                  <td className="px-4 py-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">{user.createdAt}</td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => openEditModal(user)} className="control-lift icon-control grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300" title="Edit account"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => handleToggleStatus(user)} disabled={user.id === currentUser.id} className="control-lift icon-control grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:text-slate-400" title="Change account status"><Lock className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {filteredAccounts.map((user) => (
          <article key={user.id} className="surface-panel surface-panel-hover interactive-surface rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{user.name.charAt(0)}</div><div className="min-w-0 flex-1"><h2 className="text-sm font-black text-slate-950 dark:text-white">{user.name}</h2><p className="mt-0.5 truncate font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{user.email}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{user.status}</span></div>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${ROLE_STYLES[user.role]}`}>{user.role}</span><p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{roleDescription[user.role]}</p><p className="mt-2 flex items-start gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"><Building className="mt-0.5 h-3.5 w-3.5 shrink-0" />{user.department}</p></div>
            <div className="mt-3 flex gap-2"><button type="button" onClick={() => openEditModal(user)} className="control-lift inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><Edit3 className="h-4 w-4" />Edit</button><button type="button" onClick={() => handleToggleStatus(user)} disabled={user.id === currentUser.id} className="control-lift inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 disabled:opacity-35 dark:border-slate-700 dark:text-slate-300"><Lock className="h-4 w-4" />{user.status === 'Active' ? 'Suspend' : 'Activate'}</button></div>
          </article>
        ))}
      </section>

      <section className="surface-panel rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800"><div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white"><History className="h-4 w-4 text-indigo-500" />Audit trail</div><span className="text-[10px] text-slate-400">{auditLogs.length} events</span></div>
        <div className="mt-2 max-h-64 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          {auditLogs.slice(0, 10).map((log) => <div key={log.id} className="py-3 text-[10px]"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span><span className="text-slate-500 dark:text-slate-400"> — {log.details}</span><div className="mt-1 text-indigo-600 dark:text-indigo-400">{log.user}</div></div><span className="shrink-0 font-mono text-slate-400">{log.timestamp}</span></div></div>)}
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="modal-surface w-full max-w-lg rounded-t-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">VPAA access control</div><h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{editingUser ? 'Edit Account' : 'Create Account'}</h2></div><button type="button" onClick={() => setIsModalOpen(false)} className="control-lift icon-control grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">{formError}</div>}
              <label><span className="form-label">Full name / office name</span><input type="text" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-control" /></label>
              <label><span className="form-label">Institutional email</span><input type="email" required placeholder="name@citycollegeoftagaytay.edu.ph" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="form-control" /></label>
              <label><span className="form-label">Role assignment</span><select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} className="form-control">{Object.keys(ROLE_STYLES).map((role) => <option key={role} value={role}>{role} — {roleDescription[role]}</option>)}</select></label>
              <label><span className="form-label">Department scope</span><select value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })} className="form-control">{departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
              <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsModalOpen(false)} className="control-lift min-h-11 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Cancel</button><button type="submit" className="primary-action button-shine min-h-11 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white hover:bg-violet-700">{editingUser ? 'Save Changes' : 'Create Account'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
