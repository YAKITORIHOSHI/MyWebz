# CCT Academic Records Dashboard

A responsive React/Vite dashboard for encoding, reviewing, approving, reporting, and backing up City College of Tagaytay academic records.

## Improvements in this version

- Dynamic academic-year entry and filtering instead of a fixed two-year list
- Mobile, tablet, and desktop layouts for the dashboard, records, reports, accounts, navigation, and dialogs
- Formal record workflow: **Head submission -> Dean review -> approved reporting**
- Dean review actions for records within the dean's assigned department
- VPAA full administrative authority across records, approvals, accounts, backups, and system reset
- President read-only institutional oversight
- Reports and official dashboard metrics use approved records only
- Returned-for-revision notes, audit logging, passing-rate calculations, and outcome validation
- Legacy Realtime Database records are normalized into the current academic-year/status model
- Unified elevation system for cards, controls, menus, notices, tables, charts, and dialogs
- Page slide-ins, staggered section reveals, animated drawers/dropdowns/modals, and subtle ambient motion
- Pointer-aware hover lift effects that remain stable on touch devices
- Reduced-motion support for users who disable interface animation at the operating-system level

## Role matrix

| Role | Records | Approval | Accounts | Backups | Reports |
| --- | --- | --- | --- | --- | --- |
| VPAA | Create, edit, delete all | Approve/return all | Full control | Full control | All departments |
| President | Read-only | None | None | None | All departments |
| Deans | Create/edit assigned department | Approve/return assigned department | None | None | Assigned department |
| Heads | Create and revise own department records | Submit to dean | None | None | Assigned department |

## Demo workflow

1. Switch to a **Heads** account and encode a record. It enters `Pending Dean Approval`.
2. Switch to the matching **Deans** account and approve it or return it with a review note.
3. Approved records become available in official reports and approved-only dashboard KPIs.
4. Switch to **VPAA** to edit any record, administer accounts, or manage backups.

The seed data includes `head_informatics@gmail.com` and a pending Informatics record for review.

## Local development

Use a fresh dependency installation for the operating system where the project will run:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The application can run with local demo data. Add the Vite Firebase environment variables used by `src/firebase/config.js` to enable Firebase Authentication and Realtime Database synchronization.


## Contrast and elevation correction

- Tailwind dark-mode utilities now follow the application theme toggle instead of the operating-system preference.
- Cards, tables, filters, dropdowns, and header controls use opaque surfaces.
- Lift is created with neutral shadows and a restrained 2px hover translation.
- Decorative sheen was removed from container panels to preserve text contrast.
