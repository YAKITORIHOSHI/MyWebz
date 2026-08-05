// City College of Tagaytay (CCT) initial production seed dataset and institutional role presets.

export const CCT_DEPARTMENTS = [
  'School of Computer Studies (Informatics)',
  'School of Business and Management',
  'School of Engineering',
  'School of Medical Technology',
  'School of Nursing',
  'Research & Development Office (RDO)'
];

export const INITIAL_SUBJECT_CATALOG = [
  { id: 'subj_1', code: 'CC 101', title: 'Introduction to Computing', department: 'School of Computer Studies (Informatics)' },
  { id: 'subj_2', code: 'CC 102', title: 'Computer Programming 1', department: 'School of Computer Studies (Informatics)' },
  { id: 'subj_3', code: 'BSBA 101', title: 'Principles of Management', department: 'School of Business and Management' },
  { id: 'subj_4', code: 'ENG 101', title: 'Engineering Mathematics 1', department: 'School of Engineering' },
  { id: 'subj_5', code: 'MT 101', title: 'Human Anatomy and Physiology', department: 'School of Medical Technology' },
  { id: 'subj_6', code: 'NURS 101', title: 'Theoretical Foundations of Nursing', department: 'School of Nursing' },
  { id: 'subj_7', code: 'RDO 101', title: 'Research Methodology and Statistics', department: 'Research & Development Office (RDO)' }
];

export const CCT_ROLES = [
  {
    id: 'VPAA',
    label: 'Vice President for Academic Affairs',
    description: 'Full administrative authority across records, approvals, accounts, reports, backups, and system settings.'
  },
  {
    id: 'President',
    label: 'Office of the College President',
    description: 'Executive read-only oversight of approved institutional performance and reports.'
  },
  {
    id: 'Deans',
    label: 'School Deans',
    description: 'Reviews, edits, approves, or returns records within the assigned academic school.'
  },
  {
    id: 'Heads',
    label: 'Department / Office Heads',
    description: 'Encodes and submits records from the assigned unit for dean or VPAA review.'
  }
];

export const INITIAL_ACCOUNTS = [
  {
    id: 'usr_vpaa',
    name: 'Vice President for Academic Affairs',
    email: 'vpaa@gmail.com',
    role: 'VPAA',
    department: 'Office of VPAA',
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: '2026-08-05 17:30'
  },
  {
    id: 'usr_pres',
    name: 'Office of the College President',
    email: 'president@gmail.com',
    role: 'President',
    department: 'Office of the College President',
    status: 'Active',
    createdAt: '2024-01-15',
    lastLogin: '2026-08-05 16:30'
  },
  {
    id: 'usr_dean_info',
    name: 'Dean of Informatics (Computer Studies)',
    email: 'dean_informatics@gmail.com',
    role: 'Deans',
    department: 'School of Computer Studies (Informatics)',
    status: 'Active',
    createdAt: '2024-01-15',
    lastLogin: '2026-08-05 15:45'
  },
  {
    id: 'usr_head_info',
    name: 'Informatics Department Chair',
    email: 'head_informatics@gmail.com',
    role: 'Heads',
    department: 'School of Computer Studies (Informatics)',
    status: 'Active',
    createdAt: '2024-01-20',
    lastLogin: '2026-08-05 13:20'
  },
  {
    id: 'usr_dean_bus',
    name: 'Dean of Business Administration',
    email: 'dean_businessad@gmail.com',
    role: 'Deans',
    department: 'School of Business and Management',
    status: 'Active',
    createdAt: '2024-02-05',
    lastLogin: '2026-08-05 14:10'
  },
  {
    id: 'usr_dean_eng',
    name: 'Dean of Engineering',
    email: 'dean_engineering@gmail.com',
    role: 'Deans',
    department: 'School of Engineering',
    status: 'Active',
    createdAt: '2024-02-01',
    lastLogin: '2026-08-04 11:20'
  },
  {
    id: 'usr_dean_med',
    name: 'Dean of Medical Technology',
    email: 'dean_medtech@gmail.com',
    role: 'Deans',
    department: 'School of Medical Technology',
    status: 'Active',
    createdAt: '2024-02-10',
    lastLogin: '2026-08-05 08:30'
  },
  {
    id: 'usr_dean_nurse',
    name: 'Dean of Nursing',
    email: 'dean_nurse@gmail.com',
    role: 'Deans',
    department: 'School of Nursing',
    status: 'Active',
    createdAt: '2024-02-12',
    lastLogin: '2026-08-05 09:15'
  },
  {
    id: 'usr_rdo',
    name: 'RDO Chairperson',
    email: 'rdo_chairperson@gmail.com',
    role: 'Heads',
    department: 'Research & Development Office (RDO)',
    status: 'Active',
    createdAt: '2024-02-15',
    lastLogin: '2026-08-05 10:00'
  }
];

const approvedMeta = {
  status: 'Approved',
  approvedBy: 'Vice President for Academic Affairs',
  approvedAt: '2026-08-04 09:00:00',
  reviewNote: 'Validated for institutional reporting.'
};

export const INITIAL_RECORDS = [
  {
    id: 'rec_info_101',
    department: 'School of Computer Studies (Informatics)',
    academicYear: 'AY 2025-2026',
    semester: '1st Semester',
    subjectCode: 'CC101',
    subjectTitle: 'Introduction to Computing',
    enrolledCount: 145,
    passedCount: 132,
    failedCount: 9,
    droppedCount: 4,
    incCount: 0,
    passingRate: 91.03,
    averageGrade: 1.75,
    encodedBy: 'Dean of Informatics',
    encodedById: 'usr_dean_info',
    updatedAt: '2026-07-28',
    remarks: 'High performance in practical programming assignments.',
    ...approvedMeta
  },
  {
    id: 'rec_info_201_pending',
    department: 'School of Computer Studies (Informatics)',
    academicYear: 'AY 2026-2027',
    semester: '1st Semester',
    subjectCode: 'CC201',
    subjectTitle: 'Data Structures and Algorithms',
    enrolledCount: 118,
    passedCount: 96,
    failedCount: 12,
    droppedCount: 6,
    incCount: 4,
    passingRate: 81.36,
    averageGrade: 2.18,
    encodedBy: 'Informatics Department Chair',
    encodedById: 'usr_head_info',
    updatedAt: '2026-08-05',
    status: 'Pending Dean Approval',
    submittedAt: '2026-08-05 14:20:00',
    approvedBy: '',
    approvedAt: '',
    reviewNote: '',
    remarks: 'Submitted for dean validation before inclusion in official reports.'
  },
  {
    id: 'rec_bus_101',
    department: 'School of Business and Management',
    academicYear: 'AY 2025-2026',
    semester: '1st Semester',
    subjectCode: 'BM101',
    subjectTitle: 'Basic Accounting & Financial Analysis',
    enrolledCount: 210,
    passedCount: 175,
    failedCount: 25,
    droppedCount: 10,
    incCount: 0,
    passingRate: 83.33,
    averageGrade: 2.25,
    encodedBy: 'Dean of Business Administration',
    encodedById: 'usr_dean_bus',
    updatedAt: '2026-07-29',
    remarks: 'Accounting problem sets posed difficulty to first-year students.',
    ...approvedMeta
  },
  {
    id: 'rec_eng_101',
    department: 'School of Engineering',
    academicYear: 'AY 2025-2026',
    semester: '1st Semester',
    subjectCode: 'ENG101',
    subjectTitle: 'Engineering Mechanics',
    enrolledCount: 130,
    passedCount: 112,
    failedCount: 14,
    droppedCount: 4,
    incCount: 0,
    passingRate: 86.15,
    averageGrade: 2.1,
    encodedBy: 'Dean of Engineering',
    encodedById: 'usr_dean_eng',
    updatedAt: '2026-08-01',
    remarks: 'Solid performance in midterms.',
    ...approvedMeta
  },
  {
    id: 'rec_med_101',
    department: 'School of Medical Technology',
    academicYear: 'AY 2025-2026',
    semester: '1st Semester',
    subjectCode: 'MT101',
    subjectTitle: 'Human Anatomy & Physiology',
    enrolledCount: 160,
    passedCount: 148,
    failedCount: 8,
    droppedCount: 4,
    incCount: 0,
    passingRate: 92.5,
    averageGrade: 1.8,
    encodedBy: 'Dean of Medical Technology',
    encodedById: 'usr_dean_med',
    updatedAt: '2026-08-02',
    remarks: 'Laboratory practicum scores above average.',
    ...approvedMeta
  },
  {
    id: 'rec_nurse_101',
    department: 'School of Nursing',
    academicYear: 'AY 2025-2026',
    semester: '1st Semester',
    subjectCode: 'NUR101',
    subjectTitle: 'Theoretical Foundations in Nursing',
    enrolledCount: 175,
    passedCount: 165,
    failedCount: 6,
    droppedCount: 4,
    incCount: 0,
    passingRate: 94.29,
    averageGrade: 1.65,
    encodedBy: 'Dean of Nursing',
    encodedById: 'usr_dean_nurse',
    updatedAt: '2026-08-03',
    remarks: 'Clinical skills lab assessments completed.',
    ...approvedMeta
  }
];

export const INITIAL_BACKUPS = [
  {
    id: 'bkp_20260805_01',
    fileName: 'cct_academic_db_snapshot_2026-08-05.json',
    fileSize: '1.45 MB',
    createdAt: '2026-08-05 02:00:00',
    type: 'Automated Scheduled',
    status: 'Completed',
    createdBy: 'System Daemon',
    checksum: 'sha256-a9b8c7d6e5f41234',
    rawContent: JSON.stringify({
      college: 'City College of Tagaytay',
      version: '4.0-firebase-live-clean',
      exportedAt: '2026-08-05 02:00:00',
      accounts: INITIAL_ACCOUNTS,
      records: INITIAL_RECORDS,
      auditLogs: []
    }, null, 2)
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log_101',
    timestamp: '2026-08-05 17:30:12',
    user: 'vpaa@gmail.com',
    action: 'VPAA System Check',
    details: 'Reviewed role permissions, approval queue, and Realtime Database status.'
  }
];
