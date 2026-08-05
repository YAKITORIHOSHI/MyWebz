export const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  'Midyear / Summer'
];

export const getCurrentAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 5 ? year : year - 1;
  return `AY ${startYear}-${startYear + 1}`;
};

const parseAcademicYearStart = (academicYear) => {
  const match = String(academicYear || '').match(/(\d{4})\s*[-–]\s*(\d{4})/);
  return match ? Number(match[1]) : 0;
};

export const buildAcademicYearOptions = (records = [], pastYears = 12, futureYears = 4) => {
  const currentLabel = getCurrentAcademicYear();
  const currentStart = parseAcademicYearStart(currentLabel);
  const years = new Set(records.map((record) => record.academicYear).filter(Boolean));

  for (let offset = -pastYears; offset <= futureYears; offset += 1) {
    const start = currentStart + offset;
    years.add(`AY ${start}-${start + 1}`);
  }

  return Array.from(years).sort((a, b) => parseAcademicYearStart(b) - parseAcademicYearStart(a));
};

export const normalizeAcademicYear = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return getCurrentAcademicYear();
  if (/^AY\s+/i.test(trimmed)) return trimmed.replace(/^ay/i, 'AY');
  return `AY ${trimmed}`;
};

export const RECORD_STATUS = {
  DRAFT: 'Draft',
  PENDING: 'Pending Dean Approval',
  APPROVED: 'Approved',
  RETURNED: 'Returned for Revision'
};
