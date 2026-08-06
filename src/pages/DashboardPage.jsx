import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { RECORD_STATUS } from '../utils/academic';

const COLORS = ['#0284c7', '#38bdf8', '#0f2b5c', '#14b8a6', '#6366f1', '#0369a1'];

const shortDepartmentName = (department) => {
  const name = typeof department === 'string'
    ? department
    : (department?.name || department?.id || String(department || ''));
  return name
    .replace(/^School of\s+/i, '')
    .replace(/^Office of\s+/i, '')
    .trim();
};

export const DashboardPage = ({ setActiveTab, isDarkMode }) => {
  const { currentUser, records, accounts, departments, permissions } = useAuth();

  const approvedYears = useMemo(() => Array.from(new Set(
    records
      .filter((record) => record.status === RECORD_STATUS.APPROVED)
      .map((record) => record.academicYear)
      .filter(Boolean)
  )).sort().reverse(), [records]);

  const activeAcademicYear = approvedYears[0] || 'No approved academic year';
  const roleScopedRecords = records.filter((record) => (
    permissions.canViewAllDepartments || record.department === currentUser?.department
  ));
  const approvedRecords = roleScopedRecords.filter((record) => (
    record.status === RECORD_STATUS.APPROVED && record.academicYear === activeAcademicYear
  ));
  const pendingRecords = roleScopedRecords.filter((record) => record.status === RECORD_STATUS.PENDING);
  const returnedRecords = roleScopedRecords.filter((record) => record.status === RECORD_STATUS.RETURNED);

  const totalEnrolled = approvedRecords.reduce((total, record) => total + (Number(record.enrolledCount) || 0), 0);
  const totalPassed = approvedRecords.reduce((total, record) => total + (Number(record.passedCount) || 0), 0);
  const overallPassingRate = totalEnrolled > 0 ? ((totalPassed / totalEnrolled) * 100).toFixed(2) : '0.00';

  const departmentChartData = departments.map((department) => {
    const departmentRecords = approvedRecords.filter((record) => record.department === department);
    const enrolled = departmentRecords.reduce((total, record) => total + (Number(record.enrolledCount) || 0), 0);
    const passed = departmentRecords.reduce((total, record) => total + (Number(record.passedCount) || 0), 0);
    return {
      department: shortDepartmentName(department),
      fullName: department,
      enrolled,
      passed,
      passingRate: enrolled > 0 ? Number(((passed / enrolled) * 100).toFixed(2)) : 0
    };
  }).filter((item) => permissions.canViewAllDepartments ? item.enrolled > 0 : item.fullName === currentUser?.department);

  const enrollmentShare = departmentChartData.filter((item) => item.enrolled > 0).map((item) => ({
    name: item.department,
    value: item.enrolled
  }));

  const roleDescription = permissions.isVPAA
    ? 'Full administrative access across academic records, approvals, accounts, reports, and system recovery.'
    : permissions.isPresident
      ? 'Executive oversight of approved institutional performance. Data changes are restricted.'
      : permissions.isDean
        ? `Review, edit, and approve academic records for ${currentUser?.department || 'your department'}.`
        : `Encode and submit performance records for ${currentUser?.department || 'your department'}.`;

  const primaryAction = permissions.isPresident
    ? { label: 'Open Reports', tab: 'reports' }
    : permissions.isDean || permissions.isVPAA
      ? { label: pendingRecords.length ? `Review ${pendingRecords.length} Pending` : 'Manage Records', tab: 'records' }
      : { label: 'Encode Record', tab: 'records' };

  return (
    <div className="page-stack space-y-4 sm:space-y-5">
      <section className="hero-panel hero-motion relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-950 p-5 text-white sm:p-6 lg:p-7 shadow-xl shadow-sky-950/40">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
              <Building2 className="h-4 w-4" />
              Academic affairs command center
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Welcome, {currentUser?.name}</h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-sky-100/90 sm:text-sm">{roleDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-blue-900/40 px-3 py-1.5 text-[10px] font-bold text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> {currentUser?.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-blue-900/40 px-3 py-1.5 text-[10px] font-bold text-sky-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Reporting cycle: {activeAcademicYear}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => setActiveTab(primaryAction.tab)}
              className="hero-action button-shine inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-4 text-xs font-black text-slate-950 transition shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              {primaryAction.label}<ArrowRight className="h-4 w-4" />
            </button>
            {!permissions.isPresident && (
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="glass-control control-lift min-h-11 rounded-xl border border-sky-400/30 bg-blue-950/40 px-4 text-xs font-bold text-sky-200 transition hover:bg-blue-900/60 cursor-pointer"
              >
                View Reports
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Approved Passing Rate"
          value={`${overallPassingRate}%`}
          subtitle={`${totalPassed.toLocaleString()} passed of ${totalEnrolled.toLocaleString()} enrolled`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Approved Enrollment"
          value={totalEnrolled.toLocaleString()}
          subtitle={`Official data for ${activeAcademicYear}`}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Pending Dean Review"
          value={pendingRecords.length}
          subtitle={pendingRecords.length ? 'Records awaiting an approval decision' : 'Approval queue is clear'}
          icon={ClipboardCheck}
          color="amber"
        />
        <StatCard
          title="Active Personnel"
          value={accounts.filter((account) => account.status === 'Active').length}
          subtitle="VPAA, President, Deans, and Heads"
          icon={Users}
          color="violet"
        />
      </section>

      {(pendingRecords.length > 0 || returnedRecords.length > 0) && (
        <section className="grid gap-3 lg:grid-cols-2">
          {pendingRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className="notice-card flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-left text-sky-800 transition hover:border-sky-300 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:border-sky-800"
            >
              <span className="notice-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><ClipboardCheck className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-sky-950 dark:text-sky-100">{pendingRecords.length} pending approval{pendingRecords.length === 1 ? '' : 's'}</span>
                <span className="mt-0.5 block text-[11px] text-sky-700 dark:text-sky-300/80">Review submitted records before they enter official reports.</span>
              </span>
              <ArrowRight className="notice-arrow h-4 w-4 shrink-0 text-sky-600" />
            </button>
          )}
          {returnedRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className="notice-card flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-rose-700 transition hover:border-rose-300 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:border-rose-800"
            >
              <span className="notice-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"><FileCheck2 className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-rose-950 dark:text-rose-100">{returnedRecords.length} returned record{returnedRecords.length === 1 ? '' : 's'}</span>
                <span className="mt-0.5 block text-[11px] text-rose-700 dark:text-rose-300/80">Corrections are required before resubmission.</span>
              </span>
              <ArrowRight className="notice-arrow h-4 w-4 shrink-0 text-rose-600" />
            </button>
          )}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="surface-panel surface-panel-hover chart-panel interactive-surface relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-950 dark:text-white">Approved Passing Rate by Academic Unit</h2>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Only dean/VPAA-approved records are included.</p>
            </div>
            <span className="w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">{activeAcademicYear}</span>
          </div>

          <div className="mt-4 h-64 w-full sm:h-72">
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 8, left: -22, bottom: 6 }}>
                  <defs>
                    <linearGradient id="passingRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} interval={0} angle={departmentChartData.length > 4 ? -12 : 0} textAnchor={departmentChartData.length > 4 ? 'end' : 'middle'} height={departmentChartData.length > 4 ? 55 : 35} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} unit="%" />
                  <Tooltip
                    cursor={{ fill: isDarkMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.05)' }}
                    formatter={(value) => [`${value}%`, 'Passing rate']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: 14,
                      boxShadow: isDarkMode ? '0 18px 38px -18px rgba(0, 0, 0, 0.9)' : '0 18px 38px -20px rgba(15, 23, 42, 0.32)',
                      fontSize: 11
                    }}
                  />
                  <Bar
                    dataKey="passingRate"
                    fill="url(#passingRateGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={58}
                    animationDuration={720}
                    activeBar={{ fill: '#7dd3fc', stroke: isDarkMode ? '#bae6fd' : '#0284c7', strokeWidth: 1 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700">No approved records are available for this reporting cycle.</div>
            )}
          </div>
        </div>

        <div className="surface-panel surface-panel-hover chart-panel interactive-surface relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <h2 className="text-sm font-black text-slate-950 dark:text-white">Enrollment Distribution</h2>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Approved enrollment share by academic unit.</p>
          <div className="h-52 w-full">
            {enrollmentShare.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={enrollmentShare} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" animationDuration={720}>
                    {enrollmentShare.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()} students`, 'Enrolled']}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: 14,
                      boxShadow: isDarkMode ? '0 18px 38px -18px rgba(0, 0, 0, 0.9)' : '0 18px 38px -20px rgba(15, 23, 42, 0.32)',
                      fontSize: 11
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-xs text-slate-400">No approved enrollment data.</div>
            )}
          </div>
          <div className="space-y-2">
            {enrollmentShare.map((item, index) => (
              <div key={item.name} className="legend-row flex items-center justify-between gap-3 px-2 py-1.5 text-[10px]">
                <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate font-semibold">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
