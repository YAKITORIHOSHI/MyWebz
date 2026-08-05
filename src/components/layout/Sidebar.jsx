import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Users,
  HardDriveDownload,
  Building,
  ShieldCheck,
  X,
  CheckCircle2,
  ClipboardCheck,
  Sliders
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser, permissions, records } = useAuth();

  const pendingForUser = records.filter((record) => {
    if (record.status !== 'Pending Dean Approval') return false;
    if (permissions.isVPAA) return true;
    return permissions.isDean && record.department === currentUser.department;
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'KPIs and approval activity',
      visible: true
    },
    {
      id: 'records',
      label: 'Academic Records',
      icon: FileSpreadsheet,
      description: 'Encode, review, and approve',
      visible: true,
      badge: pendingForUser || null
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Approved institutional results',
      visible: true
    },
    {
      id: 'accounts',
      label: 'Accounts & Access',
      icon: Users,
      description: 'VPAA user administration',
      visible: permissions.canManageAccounts
    },
    {
      id: 'backup',
      label: 'Backup & Recovery',
      icon: HardDriveDownload,
      description: 'VPAA data protection tools',
      visible: permissions.canManageBackups
    }
  ];

  const accessSummary = permissions.isVPAA
    ? 'Full administrative authority'
    : permissions.isPresident
      ? 'Executive read-only oversight'
      : permissions.isDean
        ? 'Department review and approval'
        : 'Department encoding and submission';

  const sidebarContent = (
    <div className="flex min-h-full flex-col p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="control-lift icon-control grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="profile-panel overflow-hidden rounded-2xl border border-rose-900/20 bg-gradient-to-br from-rose-50/70 via-amber-50/30 to-white p-4 dark:border-rose-900/60 dark:from-rose-950/70 dark:to-slate-900">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-900 dark:text-amber-300">
          <ShieldCheck className="h-4 w-4 text-amber-500" />
          Access profile
        </div>
        <div className="text-sm font-bold leading-snug text-slate-950 dark:text-white">{currentUser?.name}</div>
        <div className="mt-1 text-xs font-semibold text-rose-800 dark:text-amber-300">{currentUser?.role}</div>
        <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
          <Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{currentUser?.department}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-rose-900/10 pt-3 text-[11px] font-medium text-slate-600 dark:border-rose-900/40 dark:text-slate-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {accessSummary}
        </div>
      </div>

      <nav className="mt-5 space-y-1.5" aria-label="System modules">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Workspace
        </div>
        {navItems.filter((item) => item.visible).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`nav-item group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                active
                  ? 'nav-item-active bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-amber-100 border border-amber-500/40 shadow-lg shadow-rose-950/40'
                  : 'text-slate-600 hover:bg-rose-950/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-rose-950/30 dark:hover:text-white'
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-100 group-hover:bg-white dark:bg-slate-800 dark:group-hover:bg-slate-700'}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className="truncate">{item.label}</span>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${active ? 'bg-amber-400 text-rose-950' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span className={`mt-0.5 block truncate text-[10px] ${active ? 'text-amber-200/80' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {(permissions.isVPAA || permissions.isDean) && (
        <div className="notice-card mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <ClipboardCheck className="h-4 w-4" />
            Approval queue
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/80">
            {pendingForUser > 0
              ? `${pendingForUser} record${pendingForUser === 1 ? '' : 's'} require review.`
              : 'No records are waiting for your review.'}
          </p>
        </div>
      )}

      <div className="mt-auto pt-6 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="font-bold text-slate-600 dark:text-slate-400">City College of Tagaytay</p>
          <p>Academic Affairs System · 2026</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar-shell sticky top-[5.75rem] hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block xl:w-72">
        {sidebarContent}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="drawer-backdrop absolute inset-0 h-full w-full bg-slate-950/65 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="mobile-drawer absolute inset-y-0 left-0 w-[min(88vw,22rem)] overflow-y-auto bg-white dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
