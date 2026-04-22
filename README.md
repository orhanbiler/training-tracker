# TRN//OPS — Police Training & Certification Command

A command-center / tactical interface for tracking officer training and
certification expirations. Built to feel like a dispatch terminal during shift
briefing rather than a corporate dashboard.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** — Auth (email/password + Google) + Firestore (real-time)
- Monospace type, dark theme, color reserved for status (red / yellow / green)

## Routes

| Route           | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `/login`        | Email/password + Google sign-in                               |
| `/signup`       | Create an operator account                                    |
| `/`             | Command center — 90-day timeline + grouped roster             |
| `/grid`         | Heatmap grid — officers × certifications                      |
| `/training`     | Training schedule + assignment (list-first)                   |
| `/expirations`  | Urgency-sorted certification queue with bulk actions          |
| `/files`        | Attach documents to an officer's certifications               |

All `/` routes are behind an `AuthGate` that redirects to `/login` when no
user is signed in.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase config
npm run dev
```

Firebase **is required** — the app refuses to boot without the
`NEXT_PUBLIC_FIREBASE_*` env vars. There is no offline demo mode.

### First run

Your Firestore will be empty. On first sign-in you'll see an empty state
with two options:

- **ADD FIRST OFFICER** — opens a dialog to create an officer + attach
  certifications from the catalog.
- **LOAD DEMO DATASET** — writes the full seed (12 officers, training
  sessions, sample files, audit entries) into Firestore via a batch.

## Firebase setup

1. **Authentication** — enable **Email/Password** and **Google** providers
   in the Firebase Console.
2. **Firestore** — create a database (Native mode).
3. **Security rules** — a minimal "signed in only" starting point:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   Tighten per collection later (e.g. only admins can write `officers`,
   users can only read their own `users/{uid}` profile).

## Collections

| Collection | Shape (see `src/lib/types.ts`)                       |
| ---------- | ---------------------------------------------------- |
| `users`    | `{ email, displayName, photoURL, role, createdAt }`  |
| `officers` | `{ name, badge, rank, unit, certifications: [...] }` |
| `training` | `{ title, code, date, capacity, assignedOfficerIds }`|
| `files`    | `{ name, size, officerId, certificationId, ... }`    |
| `audit`    | `{ timestamp, actor, action, target }`               |

## Environment variables

All six are public (`NEXT_PUBLIC_*`) and expected to be embedded in the
client bundle — security lives in Firestore rules + Firebase Auth.

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

In Vercel: Settings → Environment Variables, enable for Production /
Preview / Development, redeploy.

## Architecture notes

- `src/lib/firebase.ts` — lazy, required Firebase initialization.
- `src/lib/auth.tsx` — `AuthProvider` / `useAuth()` with
  `onAuthStateChanged` + local persistence. Auto-creates a `users/{uid}`
  profile doc on first sign-in.
- `src/lib/store.tsx` — `StoreProvider` / `useStore()`. Subscribes to
  four Firestore collections via `onSnapshot`, exposes mutations
  (`renewCertification`, `assignToTraining`, `createOfficer`,
  `addCertification`, `attachFile`, `logAudit`).
- `src/lib/seed.ts` — one-click demo seeder, called from the empty state.
- `src/app/(app)/` — authenticated routes, wrapped in `AuthGate`.
- `src/app/(auth)/` — public routes (`/login`, `/signup`).
