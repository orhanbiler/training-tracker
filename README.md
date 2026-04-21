# TRN//OPS — Police Training & Certification Command

A command-center / tactical interface for tracking officer training and
certification expirations. Built to feel like a dispatch terminal during shift
briefing rather than a corporate dashboard.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** (Auth + Firestore) — optional, auto-falls back to deterministic
  in-memory mock data when env vars are absent
- Monospace type, dark theme, color reserved for status (red / yellow / green)

## Routes

| Route           | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `/`             | Horizontal 90-day expiration timeline + grouped officer rows  |
| `/grid`         | Heatmap grid — officers × certifications                      |
| `/training`     | Training schedule + assignment (list-first)                   |
| `/expirations`  | Urgency-sorted certification queue with bulk actions          |
| `/files`        | Attach documents to an officer's certifications               |

## Running

```bash
npm install
npm run dev
```

The app runs in **DEMO** mode by default with realistic seed data. To enable
live Firestore listeners, set the following env vars in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Expected Firestore collections: `officers`, `training`, `files`, `audit`
(see `src/lib/types.ts` for shapes).

## Key components

- `ExpirationTimeline` — 90-day horizontal axis with expired gutter
- `OfficerRow` — dense horizontal roster row with inline renew / assign / notify
- `HeatmapGrid` — certification matrix view
- `SidePanel` — ESC-dismissable slide-over for officer detail
- `StatusTag`, `ProgressBar` — shared primitives
