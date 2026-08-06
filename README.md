# CCT Academic Records Dashboard

A responsive React/Vite application for institutional academic records, approvals, reporting, catalog administration, and Firebase backup/recovery.

## Current architecture

The workspace follows a component-first data flow:

1. All authorized workspace pages are imported and mounted during the initial authenticated render.
2. Cached collections render immediately when available.
3. Firebase Realtime Database subscriptions start during an idle/background task after the interface is mounted.
4. Large catalog and record snapshots are normalized in a Web Worker before React state is updated.
5. Catalog and record mutations update the interface optimistically, then synchronize to Firebase while the sidebar and Settings page expose synchronization status.

Authentication and authorization checks still complete before protected workspace content is shown.

## Database-driven academic hierarchy

The Institutional Subject Catalog no longer derives programs or courses from source-code constants. Its hierarchy is:

```text
Academic unit / school
└── Program
    └── Subject
```

Firebase collections:

- `departments`: academic units or schools
- `programs`: program records linked by their `department` value
- `subjects`: subject records linked by `department` and optional `programId`
- `requests`: academic performance records linked to the same department/program scope

The VPAA can add or remove academic units, programs, and subjects from **System Settings**. Department-wide/common subjects use an empty `programId`. Existing subjects in the supplied database migration remain department-wide until assigned through the catalog workflow.

See [DATABASE_SCHEMA_V6.md](DATABASE_SCHEMA_V6.md) for the field model and migration notes.

## Interface changes

- Non-scrolling compact desktop sidebar with viewport-height adaptations
- Mobile navigation drawer with safe-area and touch support
- Program filters and program labels in records, reports, CSV export, and the subject combobox
- Portal-based responsive dropdowns and modal-safe menus
- Responsive record table/cards and mobile bottom-sheet forms
- Restored school logo for the browser tab/favicon
- Database synchronization and pending-write status indicators

## Role matrix

| Role | Records | Approval | Catalog | Accounts | Backups | Reports |
| --- | --- | --- | --- | --- | --- | --- |
| VPAA | Create, edit, delete all | Approve/return all | Full control | Full control | Full control | All units |
| President | Read-only | None | Read-only | None | None | All units |
| Deans | Assigned unit | Approve/return assigned unit | Read-only | None | None | Assigned unit |
| Heads | Create/revise assigned unit | Submit to dean | Read-only | None | None | Assigned unit |

## Local development

Use an operating-system-native dependency installation. Do not reuse `node_modules` copied from another operating system.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run check
npm run preview
```

Deployment:

```bash
npm run deploy
```

Copy `.env.example` to `.env.local` and confirm the Firebase values before running the application. The source package intentionally excludes `.env.local`, build output, and `node_modules`.
