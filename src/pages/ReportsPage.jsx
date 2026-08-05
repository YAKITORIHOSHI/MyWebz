import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  FileCheck,
  Filter,
  GraduationCap,
  Printer,
  TrendingUp
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { RECORD_STATUS, SEMESTER_OPTIONS } from '../utils/academic';

const shortDepartmentName = (department) => department
  .replace('School of ', '')
  .replace('Research & Development Office (RDO)', 'RDO')
  .replace(' (Informatics)', '');

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const ReportsPage = ({ isDarkMode }) => {
  const { currentUser, records, departments, permissions } = useAuth();

  const approvedRecords = useMemo(() => records.filter((record) => record.status === RECORD_STATUS.APPROVED), [records]);
  const academicYears = useMemo(() => Array.from(new Set(approvedRecords.map((record) => record.academicYear).filter(Boolean))).sort().reverse(), [approvedRecords]);
  const [selectedAY, setSelectedAY] = useState(academicYears[0] || 'ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState(permissions.canViewAllDepartments ? 'ALL' : (currentUser?.department || ''));

  useEffect(() => {
    if (selectedAY !== 'ALL' && !academicYears.includes(selectedAY)) setSelectedAY(academicYears[0] || 'ALL');
  }, [academicYears, selectedAY]);

  useEffect(() => {
    setSelectedDept(permissions.canViewAllDepartments ? 'ALL' : (currentUser?.department || ''));
  }, [currentUser?.id, currentUser?.department, permissions.canViewAllDepartments]);

  const filtered = approvedRecords.filter((record) => (
    (permissions.canViewAllDepartments || record.department === currentUser?.department)
    && (selectedAY === 'ALL' || record.academicYear === selectedAY)
    && (selectedSem === 'ALL' || record.semester === selectedSem)
    && (selectedDept === 'ALL' || record.department === selectedDept)
  ));

  const totalEnrolled = filtered.reduce((total, record) => total + (Number(record.enrolledCount) || 0), 0);
  const totalPassed = filtered.reduce((total, record) => total + (Number(record.passedCount) || 0), 0);
  const totalFailed = filtered.reduce((total, record) => total + (Number(record.failedCount) || 0), 0);
  const totalDropped = filtered.reduce((total, record) => total + (Number(record.droppedCount) || 0), 0);
  const overallRate = totalEnrolled > 0 ? ((totalPassed / totalEnrolled) * 100).toFixed(2) : '0.00';

  const departmentReportData = departments.map((department) => {
    const departmentRecords = filtered.filter((record) => record.department === department);
    const enrolled = departmentRecords.reduce((total, record) => total + (Number(record.enrolledCount) || 0), 0);
    const passed = departmentRecords.reduce((total, record) => total + (Number(record.passedCount) || 0), 0);
    const failed = departmentRecords.reduce((total, record) => total + (Number(record.failedCount) || 0), 0);
    return {
      name: shortDepartmentName(department),
      fullName: department,
      enrolled,
      passed,
      failed,
      passingRate: enrolled > 0 ? Number(((passed / enrolled) * 100).toFixed(2)) : 0
    };
  }).filter((item) => item.enrolled > 0);

  const topUnit = [...departmentReportData].sort((a, b) => b.passingRate - a.passingRate)[0];

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Department', 'Academic Year', 'Semester', 'Subject Code', 'Subject Title',
      'Enrolled', 'Passed', 'Failed', 'Dropped', 'Incomplete', 'Passing Rate (%)',
      'Average Grade', 'Encoded By', 'Approved By', 'Approved At', 'Review Note', 'Updated At'
    ];
    const rows = filtered.map((record) => [
      record.id,
      record.department,
      record.academicYear,
      record.semester,
      record.subjectCode,
      record.subjectTitle,
      record.enrolledCount,
      record.passedCount,
      record.failedCount,
      record.droppedCount || 0,
      record.incCount || 0,
      record.passingRate,
      record.averageGrade,
      record.encodedBy,
      record.approvedBy,
      record.approvedAt,
      record.reviewNote,
      record.updatedAt
    ].map(csvCell));

    const csv = [headers.map(csvCell).join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CCT_Approved_Academic_Report_${selectedAY.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack space-y-4 sm:space-y-5">
      <section className="surface-panel rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="h-4 w-4" />
              Official reports
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Approved Academic Performance</h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Reports exclude pending and returned records. Every included row has completed dean or VPAA approval.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={handleExportCSV} disabled={filtered.length === 0} className="control-lift button-shine inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className="primary-action button-shine inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </section>

      <section className="surface-panel surface-panel-hover rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4 print:hidden">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4 text-indigo-500" /> Report scope
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <select value={selectedAY} onChange={(event) => setSelectedAY(event.target.value)} className="form-control">
            <option value="ALL">All approved academic years</option>
            {academicYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={selectedSem} onChange={(event) => setSelectedSem(event.target.value)} className="form-control">
            <option value="ALL">All semesters</option>
            {SEMESTER_OPTIONS.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </select>
          {permissions.canViewAllDepartments ? (
            <select value={selectedDept} onChange={(event) => setSelectedDept(event.target.value)} className="form-control sm:col-span-2 lg:col-span-1">
              <option value="ALL">All academic units</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          ) : (
            <div className="form-control flex items-center gap-2 bg-slate-50 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:col-span-2 lg:col-span-1">
              <Building2 className="h-4 w-4 shrink-0 text-indigo-500" /><span className="truncate">{currentUser.department}</span>
            </div>
          )}
        </div>
      </section>

      <div className="hidden border-b-2 border-slate-900 pb-4 text-center print:block">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">City College of Tagaytay</h1>
        <h2 className="mt-1 text-sm font-bold text-slate-700">Office of the Vice President for Academic Affairs</h2>
        <p className="mt-1 text-xs text-slate-500">Approved Academic Performance Report — {selectedAY === 'ALL' ? 'All Academic Years' : selectedAY}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Overall passing rate', value: `${overallRate}%`, icon: TrendingUp, className: 'text-indigo-700 dark:text-indigo-300' },
          { label: 'Approved enrollment', value: totalEnrolled.toLocaleString(), icon: GraduationCap, className: 'text-blue-700 dark:text-blue-300' },
          { label: 'Passed students', value: totalPassed.toLocaleString(), icon: CheckCircle2, className: 'text-emerald-700 dark:text-emerald-300' },
          { label: 'Approved records', value: filtered.length, icon: FileCheck, className: 'text-violet-700 dark:text-violet-300' }
        ].map(({ label, value, icon: Icon, className }) => (
          <div key={label} className="metric-tile rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div>
              <Icon className={`h-4 w-4 ${className}`} />
            </div>
            <div className={`mt-2 font-mono text-xl font-black sm:text-2xl ${className}`}>{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="surface-panel surface-panel-hover chart-panel interactive-surface relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5 print:border-slate-300 print:shadow-none">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Unit Comparison</h2>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Enrollment, passed, and failed counts from approved records.</p>
          </div>
          <div className="h-72 w-full sm:h-80">
            {departmentReportData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentReportData} margin={{ top: 8, right: 8, left: -22, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#64748b' }} interval={0} angle={-12} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: isDarkMode ? 'rgba(129, 140, 248, 0.08)' : 'rgba(79, 70, 229, 0.05)' }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: 14,
                      boxShadow: isDarkMode ? '0 18px 38px -18px rgba(0, 0, 0, 0.9)' : '0 18px 38px -20px rgba(15, 23, 42, 0.32)',
                      fontSize: 11
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#4f46e5" radius={[5, 5, 0, 0]} animationDuration={700} />
                  <Bar dataKey="passed" name="Passed" fill="#10b981" radius={[5, 5, 0, 0]} animationDuration={820} />
                  <Bar dataKey="failed" name="Failed" fill="#e11d48" radius={[5, 5, 0, 0]} animationDuration={940} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700">No approved data matches the selected report scope.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between h-full space-y-3">
          <div className="notice-card rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-100"><Award className="h-4 w-4" />Highest passing rate</div>
            <div className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-300">{topUnit ? `${topUnit.passingRate}%` : '—'}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">{topUnit?.fullName || 'No approved unit data'}</div>
          </div>

          <div className="surface-panel surface-panel-hover rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">Outcome totals</h3>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Institutional aggregate statistics</p>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Passed Students</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{totalPassed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Failed Students</span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400">{totalFailed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Dropped Students</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400">{totalDropped.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Total Enrolled</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{totalEnrolled.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">Approval integrity</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">100% approved</span>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 print:border-slate-300 print:shadow-none">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
          <h2 className="text-sm font-black text-slate-950 dark:text-white">Approved Record Detail</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{filtered.length} record{filtered.length === 1 ? '' : 's'} included in this report.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800/70 dark:text-slate-400 text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Subject</th><th className="px-4 py-3.5">Academic unit</th><th className="px-4 py-3.5">Term</th><th className="px-4 py-3.5 text-right">Enrolled</th><th className="px-4 py-3.5 text-right">Passed</th><th className="px-4 py-3.5 text-right">Rate</th><th className="px-4 py-3.5">Approved by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((record) => (
                <tr key={record.id} className="table-row-lift transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5"><div className="font-mono font-black text-indigo-700 dark:text-indigo-300">{record.subjectCode}</div><div className="mt-0.5 text-slate-600 dark:text-slate-300 font-semibold">{record.subjectTitle}</div></td>
                  <td className="max-w-[15rem] px-4 py-3.5 text-slate-600 dark:text-slate-300">{record.department}</td>
                  <td className="px-4 py-3.5 text-slate-500">{record.academicYear}<br /><span className="text-[11px]">{record.semester}</span></td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold">{record.enrolledCount}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{record.passedCount}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">{record.passingRate}%</td>
                  <td className="px-4 py-3.5 text-slate-500"><div className="font-semibold text-slate-700 dark:text-slate-300">{record.approvedBy || 'Authorized approver'}</div><div className="text-[10px]">{record.approvedAt || record.updatedAt}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-12 text-center text-xs text-slate-400">No approved records match this report scope.</div>}
      </section>
    </div>
  );
};
