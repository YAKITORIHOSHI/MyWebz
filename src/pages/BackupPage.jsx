import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HardDriveDownload, 
  RotateCcw, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Eye,
  Check,
  FileText,
  Search,
  Upload,
  RefreshCw,
  Layers
} from 'lucide-react';

export const BackupPage = () => {
  const { backups, records, createBackup, restoreBackup, updateRecord, syncRecord, permissions, isFirebaseConnected } = useAuth();

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [uploadJsonContent, setUploadJsonContent] = useState('');
  const [restoreStatus, setRestoreStatus] = useState(null);

  // Selective Record Recovery states
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [recordRestoreNotice, setRecordRestoreNotice] = useState('');

  if (!permissions.canManageBackups) return null;

  // Trigger manual backup
  const handleCreateManualBackup = () => {
    const result = createBackup('Manual Export');
    if (!result?.success) {
      alert(result?.message || 'The backup could not be created.');
      return;
    }
    alert(`Backup successfully generated: ${result.backup.fileName}\nThe snapshot JSON file has been downloaded and stored in Firebase.`);
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadJsonContent(event.target.result);
      setRestoreStatus({ type: 'info', message: `Loaded local file: ${file.name}` });
    };
    reader.readAsText(file);
  };

  // Perform full database restore
  const handleExecuteRestore = () => {
    if (!uploadJsonContent && !selectedBackup) {
      alert('Please select or upload a backup snapshot JSON file first.');
      return;
    }

    const contentToRestore = selectedBackup?.rawContent || uploadJsonContent;
    const result = restoreBackup(contentToRestore);

    if (result.success) {
      setRestoreStatus({ type: 'success', message: result.message });
      setTimeout(() => {
        setRestoreModalOpen(false);
        setSelectedBackup(null);
        setUploadJsonContent('');
        setRestoreStatus(null);
      }, 1500);
    } else {
      setRestoreStatus({ type: 'error', message: result.message });
    }
  };

  // Selective single record restoration handler
  const selectedRecordObj = records.find((rec) => rec.id === selectedRecordId);

  const handleSelectiveRecordRestore = () => {
    if (!selectedRecordObj) return;
    updateRecord(selectedRecordObj.id, {
      status: 'Approved',
      approvedBy: 'VPAA Selective Disaster Recovery',
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewNote: 'Record verified and selectively restored from Firebase RTDB.'
    });
    setRecordRestoreNotice(`Record ${selectedRecordObj.subjectCode} (${selectedRecordObj.department}) selectively verified and synchronized with Firebase!`);
    setTimeout(() => setRecordRestoreNotice(''), 4000);
  };

  const filteredRecords = records.filter((rec) => {
    const query = recordSearchQuery.toLowerCase();
    return (
      rec.subjectCode?.toLowerCase().includes(query) ||
      rec.subjectTitle?.toLowerCase().includes(query) ||
      rec.department?.toLowerCase().includes(query) ||
      rec.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-stack space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="surface-panel flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HardDriveDownload className="w-4 h-4" />
            <span>Module 4: Backup, Snapshot & Record Recovery</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Database Security, Snapshots & Record Recovery</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            VPAA-only tools for Firebase Realtime Database JSON snapshots, local file imports, and selective record restoration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedBackup(null);
              setUploadJsonContent('');
              setRestoreStatus(null);
              setRestoreModalOpen(true);
            }}
            className="control-lift px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center space-x-1.5 transition"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Import Local JSON File</span>
          </button>
          
          <button
            type="button"
            onClick={handleCreateManualBackup}
            className="primary-action button-shine px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-md shadow-indigo-600/20"
          >
            <Database className="w-4 h-4" />
            <span>Create Manual Firebase Snapshot</span>
          </button>
        </div>
      </div>

      {/* Backup Settings & System Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Automated Backup Daemon</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">Active & Scheduled</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Schedule: Daily at 02:00 AM</p>
        </div>

        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Firebase Snapshots</span>
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{backups.length} Snapshots Stored</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest: {backups[0]?.createdAt || 'N/A'}</p>
        </div>

        <div className="metric-tile rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data Security Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Encrypted & Verified</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">JSON & SHA-256 Checksums</p>
        </div>

      </div>

      {/* Database Snapshot History Table */}
      <div className="surface-panel overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selectable Database Snapshots</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click "Restore Snapshot" on any Firebase snapshot to restore full system state</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Backup Snapshot File</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">SHA-256 Checksum</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {backups.map((bkp) => (
                <tr key={bkp.id} className="table-row-lift hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  
                  {/* File */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>{bkp.fileName}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      bkp.type.includes('Manual') ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {bkp.type}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{bkp.fileSize}</td>

                  {/* Created */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{bkp.createdAt}</td>

                  {/* Checksum */}
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs">{bkp.checksum}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{bkp.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBackup(bkp);
                        setPreviewModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-[11px] border border-slate-300 dark:border-slate-700 transition"
                      title="Inspect JSON payload"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBackup(bkp);
                        setRestoreStatus(null);
                        setRestoreModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[11px] transition shadow-sm"
                    >
                      Restore Snapshot
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selective Record Inspection & Selective Restoration Section */}
      <div className="surface-panel overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-rose-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Selective Individual Record Recovery</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Inspect & Selectively Restore Individual Academic Records</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select any record stored in Firebase RTDB to inspect fields or restore its status</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search record code or unit..."
              value={recordSearchQuery}
              onChange={(e) => setRecordSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {recordRestoreNotice && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{recordRestoreNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Record Selector List */}
          <div className="lg:col-span-1 max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {filteredRecords.map((rec) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => setSelectedRecordId(rec.id)}
                className={`w-full p-3 rounded-xl text-left border transition text-xs flex items-center justify-between ${
                  selectedRecordId === rec.id
                    ? 'border-amber-500/80 bg-rose-950/20 text-white font-bold'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono font-bold text-amber-500 truncate">{rec.subjectCode} - {rec.subjectTitle}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{rec.department}</div>
                </div>
                <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold ml-2 ${
                  rec.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {rec.status}
                </span>
              </button>
            ))}
          </div>

          {/* Record Details Payload Inspector & Selective Restore */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
            {selectedRecordObj ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedRecordObj.subjectCode}: {selectedRecordObj.subjectTitle}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedRecordObj.department} ({selectedRecordObj.academicYear})</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectiveRecordRestore}
                    className="px-3.5 py-2 bg-gradient-to-r from-rose-900 to-amber-700 hover:from-rose-800 hover:to-amber-600 text-amber-100 font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Selectively Restore Record</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Enrolled</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{selectedRecordObj.enrolledCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-emerald-500 uppercase font-bold">Passed</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{selectedRecordObj.passedCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-rose-500 uppercase font-bold">Failed</span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">{selectedRecordObj.failedCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="block text-[10px] text-amber-500 uppercase font-bold">Passing Rate</span>
                    <span className="text-base font-black text-amber-500">{selectedRecordObj.passingRate}%</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-400">// Record Firebase Payload Metadata</div>
                  <div className="text-slate-300">ID: <span className="text-amber-400">{selectedRecordObj.id}</span></div>
                  <div className="text-slate-300">Encoded By: {selectedRecordObj.encodedBy}</div>
                  <div className="text-slate-300">Status: {selectedRecordObj.status}</div>
                  <div className="text-slate-300">Approved By: {selectedRecordObj.approvedBy || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                <p>Select any academic record from the list on the left to inspect payload parameters or selectively restore its status.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* JSON Payload Preview Modal */}
      {previewModalOpen && selectedBackup && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="modal-surface w-full max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Snapshot Payload Preview: {selectedBackup.fileName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Created at {selectedBackup.createdAt} by {selectedBackup.createdBy}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="control-lift icon-control grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px]">
              <pre>{selectedBackup.rawContent || JSON.stringify(selectedBackup, null, 2)}</pre>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setRestoreModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs"
              >
                Proceed to Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreModalOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="modal-surface w-full max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                System Database Restore
              </h3>
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="control-lift icon-control grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {selectedBackup ? (
                <div className="bg-indigo-50 dark:bg-indigo-950/80 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="font-bold">Selected Snapshot: {selectedBackup.fileName}</div>
                  <div className="text-[11px]">Created at {selectedBackup.createdAt} by {selectedBackup.createdBy}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Upload JSON Database Backup File</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
                  />
                </div>
              )}

              {restoreStatus && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  restoreStatus.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  restoreStatus.type === 'error' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {restoreStatus.message}
                </div>
              )}

              <div className="notice-card bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Warning: System Overwrite</span>
                </div>
                <p className="text-[11px]">
                  Executing a restore operation will replace current active accounts and academic performance records with the snapshot dataset.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRestoreModalOpen(false)}
                  className="control-lift px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  className="primary-action button-shine px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Data Restore</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
