# JobVerse — Project Analysis

Comprehensive documentation of the JobVerse project. This file is the single source of truth for project information. **When any new feature is added, it MUST be documented here** (see [Feature Changelog](#feature-changelog)).

---

## 1. Overview

**JobVerse** is a production-style **Job & College Placement Portal** built as a React SPA. It connects job seekers (students) with tailored opportunities and recruiters with ideal candidates. It was generated from a detailed design spec (`src/imports/pasted_text/job-portal-spec.md`) and aims to feel like a blend of LinkedIn Jobs, Internshala, Notion, and Stripe.

**Key characteristics:**
- **UI/UX first:** A high-fidelity, fully functional front end with polished, animated, responsive UI.
- **Backend is real:** Authentication, profiles, jobs, applications, and resumes are all persisted in **Supabase** (`supabase/schema.sql`). Demo jobs are seeded into the DB on first run; `mockData` is used only as the seed source.
- **Three roles:** Student, Recruiter, and Admin (admin has a separate management panel; provisioned manually in the DB).
- **Theme:** Light/dark mode toggle with system-preference detection.

---

## 2. Tech Stack

### Runtime & Libraries
| Layer | Technology |
|---|---|
| Framework | React 19 + React DOM 19 |
| Language | TypeScript 5.7 (used in JS style; no strict types) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Routing | react-router-dom 7 |
| Forms | react-hook-form 7 + zod 4 (installed; not yet used) |
| Animation | framer-motion 12 |
| Icons | lucide-react 1 |
| Toasts | sonner 2 |
| Backend client | @supabase/supabase-js 2 (Auth, profiles, jobs, applications, resumes + Storage all wired) |
| Formatting | oxfmt |

### Dev Tooling
- Node 22, pnpm 10.34.3 (`.mise.toml`)
- `@vitejs/plugin-react`, `@tailwindcss/vite`, `@types/node`, `@types/react`, `@types/react-dom`
- Figma Make plugins (see `vite.config.ts`)

### Scripts (`package.json`)
- `dev` — `vite --host 0.0.0.0`
- `build` — `vite build`
- `preview` — `vite preview`
- `format` — `oxfmt`

### Environment / Config
- `vite.config.ts` — port 8443 (strict), `@` alias → `src`, site config plugin driven by `.figma/make/site.json`, error-overlay replay, React Refresh boundary fallback, and a dev-only Figma Make "kit" page at `/.figma/make/kit.html`.
- `.figma/make/site.json` — meta description, `robots: noindex`, accessibility bypass links disabled.
- `tsconfig.json` — strict mode, `@/*` path alias, `noEmit`.
- `index.html` — HTML shell with Figma-comment slots for lang/title/head/body injection.

---

## 3. Project Structure

```
JobVerse/
├── .figma/make/            # Figma Make tooling + site.json
├── src/
│   ├── main.tsx            # React entrypoint, mounts App into #root
│   ├── App.tsx             # Router, providers, protected routes
│   ├── index.css           # Tailwind v4 import, theme tokens, dark mode overrides
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx  # Sidebar + TopNav + content + MobileNav shell
│   │   │   ├── Sidebar.tsx          # Desktop sidebar (role-based links, logout modal)
│   │   │   ├── TopNav.tsx           # Greeting, search, theme toggle, notifications, avatar
│   │   │   └── MobileNav.tsx        # Bottom tab navigation (mobile)
│   │   ├── ConfirmModal.tsx         # Reusable delete/confirm dialog (admin pages)
│   │   └── SignOutModal.tsx         # Reusable sign-out confirmation modal
│   ├── hooks/
│   │   ├── useAuth.tsx          # Auth context: Supabase login/register/role/logout/profile
│   │   ├── useJobs.ts           # useJobs + useRecruiterJobs (DB) + useSavedJobs (localStorage)
│   │   ├── useApplications.ts   # useStudentApplications + useRecruiterApplications
│   │   ├── useResume.ts         # Fetch/upload/remove/save student resume
│   │   └── useTheme.tsx         # Dark/light theme context
│   ├── lib/
│   │   ├── api.ts               # All Supabase DB + Storage calls, demo-job seeding
│   │   ├── adminApi.ts          # Admin panel: stats, students, recruiters, jobs, applications
│   │   ├── mockData.ts          # Seed source for jobs (mockJobs)
│   │   ├── companies.ts         # COMPANY_REGISTRY for recruiter verification
│   │   ├── supabase.ts          # Supabase client (URL + publishable key via env)
│   │   ├── types.ts             # (placeholder — types removed, JS-style code)
│   │   └── utils.ts             # formatDate, getInitials, status/type color+label maps, getRoleHomePath
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── auth/Login.tsx, Register.tsx, RoleSelect.tsx, CompleteProfile.tsx
│   │   ├── student/Dashboard, Jobs, JobDetail, Resume, AIResumeBuilder, Applications, Profile
│   │   ├── recruiter/Dashboard, PostJob, MyJobs, Applicants, Profile
│   │   └── admin/Dashboard, Students, Recruiters, Jobs, Applications
│   └── imports/pasted_text/  # Original design specs (job-portal-spec.md, job-placement-portal.md)
├── supabase/
│   └── schema.sql               # profiles/jobs/applications/resumes + RLS + triggers + storage
├── .env                         # VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (gitignored)
└── index.html, vite.config.ts, tsconfig.json, package.json, .mise.toml, AGENTS.md
```

---

## 4. Routing (`src/App.tsx`)

| Route | Component | Access |
|---|---|---|
| `/` | `Landing` (or redirect to dashboard if logged in) | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/role-select` | `RoleSelect` | Onboarding step 1 (after register / sign-in while profile incomplete) |
| `/student/dashboard` | `StudentDashboard` | Student |
| `/student/jobs` | `Jobs` | Student |
| `/student/jobs/:id` | `JobDetail` | Student |
| `/student/resume` | `Resume` | Student |
| `/student/resume/builder` | `AIResumeBuilder` | Student |
| `/student/applications` | `Applications` | Student |
| `/student/profile` | `StudentProfile` | Student |
| `/recruiter/dashboard` | `RecruiterDashboard` | Recruiter |
| `/recruiter/post-job` | `PostJob` | Recruiter |
| `/recruiter/jobs` | `MyJobs` | Recruiter |
| `/recruiter/applicants` | `Applicants` | Recruiter |
| `/recruiter/profile` | `RecruiterProfile` | Recruiter |
| `/admin/dashboard` | `AdminDashboard` | Admin |
| `/admin/students` | `AdminStudents` | Admin |
| `/admin/recruiters` | `AdminRecruiters` | Admin |
| `/admin/jobs` | `AdminJobs` | Admin |
| `/admin/applications` | `AdminApplications` | Admin |
| `*` | Redirect to `/` | — |

**Route protection:** `ProtectedRoute` checks auth via `useAuth()`; if unauthenticated → `/login`; if the profile is **incomplete** → its `onboardingPath` (not-yet-onboarded → `/role-select`; onboarded but unfinished → that role's profile page) unless `allowIncomplete`; if role mismatch → that role's dashboard. Loading spinner shown while auth **and profile** initialize (routes never render before the profile is loaded, so completed users are never misrouted to `/role-select`).

**Onboarding flow (two steps, once per account):** Register (or sign-in with an incomplete profile) → **1. `/role-select`** (choose Student/Recruiter; recruiters verify company) → **2. role profile page** (name/phone/college) → Save → role dashboard. Role is chosen **once** — `setRole` marks the profile `onboarded`, and completed/onboarded users are redirected away from `/role-select` on every future visit. Root `/` redirects incomplete profiles to their `onboardingPath`.

**Providers (`App.tsx`):** `BrowserRouter` → `ThemeProvider` → `AuthProvider` → routes + sonner `Toaster` (top-right, rich colors, Inter font, 14px radius).

---

## 5. Authentication & State (`src/hooks/useAuth.tsx`)

**Supabase Auth** (real backend auth via `@supabase/supabase-js`):
- `login(email, password)` — `supabase.auth.signInWithPassword`; on success fetches the user's `profiles` row and returns it.
- `register(email, password, name)` — `supabase.auth.signUp` with `full_name` in user metadata; returns `{ user, session }`. If `session` exists the user is signed in immediately; otherwise email confirmation is pending (Register page then redirects to `/login`).
- `setRole(role)` — sets `role` **and** `onboarded: true` on the current user's `profiles` row (used once by RoleSelect; locks the role per account).
- `updateProfile(data)` — updates `profiles` row (name/phone/college/…) and refreshes local state.
- `logout()` — `supabase.auth.signOut`.
- `isProfileComplete(profile)` — returns true when the profile has a role, name, phone, and college (company for recruiters). Used to gate the dashboard until onboarding is finished.
- `onboardingPath(profile)` — where an incomplete profile should go: `/role-select` while `onboarded` is false, otherwise that role's profile page.
- Session restore — `onAuthStateChange` + `getSession()` on mount load the user and their profile; `loading` stays `true` until the profile is fetched so the router never redirects before it arrives. Persists automatically via Supabase's own storage.
- The `profiles` row is **auto-created** by a DB trigger on signup (`supabase/schema.sql`).
- Supabase credentials come from `.env`: `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (read in `src/lib/supabase.ts`).

**Theme (`useTheme.tsx`):** reads `jv-theme` from localStorage; defaults to `prefers-color-scheme`; toggles `.dark` class on `<html>`.

**Jobs (`useJobs.ts`):**
- `useJobs` — fetches all jobs from the DB (seeds demo jobs on first run via `api.bootstrapJobs`); `addJob`, `deleteJob`, `refresh`.
- `useRecruiterJobs(recruiterId)` — fetches jobs owned by a recruiter.
- `useStudentApplications(studentId)` / `useRecruiterApplications(recruiterId)` (`useApplications.ts`) — fetch applications with embedded job/profile; `updateStatus`.
- `useResume(studentId)` (`useResume.ts`) — fetch/upload/remove/save the student's latest resume.
- `useSavedJobs` — saved job IDs persisted in `localStorage` key `jobverse_saved`; `toggle`, `isSaved`.

---

## 6. Features by Role

### 6.1 Public / Auth
- **Landing page** — responsive fixed navbar (desktop links + mobile hamburger menu with animated dropdown), hero with gradient headline, floating job/stats/AI-badge cards; stats grid; 6 feature cards; trusted-companies strip; gradient CTA; footer.
- **Login** — email/password with show/hide, links to register; redirects to the `onboardingPath` if the profile is incomplete, else to the role dashboard; shows real Supabase error messages.
- **Register** — name/email/password (min 6 chars); success → `/role-select` (or `/login` with "check your email" if email confirmation is enabled).
- **RoleSelect** (`/role-select`) — onboarding step 1, shown **only until a role is chosen once**: completed or already-onboarded users are redirected straight to their dashboard/profile. Choose **Student** or **Recruiter** (no company-ID verification). Continue saves the role (`setRole`, marks `onboarded: true`; recruiters are set to **pending** approval) then goes to that role's profile page.
- **CompleteProfile** (`/complete-profile`) — onboarding step 2: shows the selected role, collects **name, phone, and college** (recruiters see their verified company read-only). Save → `updateProfile` → role dashboard.

### 6.2 Student
- **Dashboard** — live stat cards (Applications, Under Review, Interviews, Saved Jobs from DB + localStorage); 4 quick-action cards (AI Resume, Upload Resume, Browse Jobs, Applications); recommended jobs list; recent applications with status badges; resume-status ATS progress banner.
- **Browse Jobs** — search (title/company/skill), location & type selects, category chips (All, Engineering, Design, Data Science, DevOps, Product); animated job cards with save/bookmark toggle, salary, type badge, skills; skeleton loading; empty state with "Clear all filters". Jobs come from Supabase.
- **Job Detail** — hero card (title, company, location, salary, posted date, skills); About the Role, Requirements (checklist), Benefits sections; sticky sidebar with salary/type/category summary and **Apply Now** button. Apply inserts a real `applications` row (unique per job); if no resume on file, opens modal offering **Upload Resume** or **Generate AI Resume**. Already-applied jobs show "Applied!".
- **Resume** — AI-powered promo banner linking to builder; drag-and-drop PDF upload (PDF only, ≤5MB) stored in **Supabase Storage** `resumes` bucket; uploaded/AI-generated state shows preview/download/replace/delete actions.
- **AI Resume Builder** — 7-step wizard: (1) Personal Info, (2) Education, (3) Skills (tag inputs for technical, frameworks, databases, soft, languages), (4) Projects (dynamic add/remove), (5) Experience (optional), (6) Achievements (certificates, awards), (7) Preview/Generate. Stepper UI with progress bar; Generate simulates 3s AI processing; displays formatted resume preview and **Save Resume** persists it to the `resumes` table; **Download Resume** exports a formatted text file.
- **Applications** — live stat chips (Total, Reviewing, Interview, Accepted); sorted status list of application cards (job title, company, location, status badge, applied date, resume attached, View Job link); skeleton loading + empty state.
- **Profile** — avatar (initials), verified badge, edit profile (name/phone/college) saved to DB, contact info, live resume status card with download, sign out (via reusable `SignOutModal`).

### 6.3 Recruiter
- **Dashboard** — live stat cards (Jobs Posted, Total Applicants, Interviews, Accepted); quick actions (Post a Job, Manage Jobs, View Applicants); active job listings with real applicant counts; recent applicants with status badges. Pending/rejected accounts show an approval-status banner.
- **Post Job** — form: title, company, location, salary/stipend, job type (full-time/internship/part-time/contract), category (Engineering, Design, Data Science, DevOps, Product, Marketing), description, plus tag inputs for skills, requirements, and benefits; validates required fields; on submit inserts a real `jobs` row owned by the recruiter and navigates to `/recruiter/jobs`. **Blocked until the recruiter is `approved`** (pending → awaiting-approval screen; rejected → rejected screen).
- **My Jobs** — the recruiter's jobs from the DB (skeleton loading); per-row View Applicants, Edit, Delete; empty state with CTA to post a job.
- **Applicants** — the recruiter's applications from the DB (with student profile + job); search by name/college, status filter dropdown; desktop table (candidate, college, applied, status, resume view/download, Accept/Reject actions); mobile card layout; Accept/Reject persist the status to the DB; "Decided" state once accepted/rejected.
- **Profile** — avatar (initials), recruiter badge, edit name/**company**/phone/website (saved to DB), contact info (email/phone/company/website), sign out. New recruiters are **pending** until an admin approves them.

### 6.4 Admin
- **Dashboard** — four live stat cards (Total Students, Total Recruiters, Total Jobs, Total Applications) plus quick-navigation cards to each management section.
- **Students** — all student profiles (name, email, college, joined); search by name; delete with confirmation (cascades to the auth user and their applications).
- **Recruiters** — all recruiter profiles (company, recruiter name, email, website, status badge, joined); search by company name; Approve/Reject actions that update `profiles.status` (pending → approved/rejected, approved → rejected, rejected → approved).
- **Jobs** — all job listings (title, company, location, posted date); delete any job with confirmation (cascades to its applications).
- **Applications** — all applications (student name + email, job title, company, applied date, status badge).
- **Access** — `admin` role only; non-admins are redirected to their own dashboard; unauthenticated users go to `/login`. Admins skip profile-completion onboarding.

---

## 7. Data Layer

**Supabase (`src/lib/supabase.ts`):** client created with project URL from `VITE_SUPABASE_URL` (default `https://dzfpymaahnavhldjmsyw.supabase.co`) and publishable/anon key from `VITE_SUPABASE_PUBLISHABLE_KEY` (falls back to `VITE_SUPABASE_ANON_KEY`). All data access goes through **`src/lib/api.ts`** (jobs, applications, resumes + Storage), consumed by the hooks in `src/hooks/`.

**Database schema (`supabase/schema.sql`):** run in the Supabase SQL editor to set up:
- `profiles` table (id → `auth.users`, name, email, role default `student`, `onboarded` boolean default `false`, phone, college, avatar, created_at)
- `jobs` table (title, company, logo, location, salary, min/max, description, skills/requirements/benefits as jsonb, recruiter_id → `auth.users`, type, category, created_at)
- `resumes` table (student_id, resume_type `uploaded`/`ai_generated`, resume_url, file_name, content)
- `applications` table (student_id, job_id, resume_id, status with check constraint, created_at, **unique (student_id, job_id)**)
- RLS policies: users see/edit their own profile & resumes; any authenticated user browses jobs; recruiters own their jobs; recruiters + students access relevant applications
- `handle_new_user()` trigger: auto-inserts a profile row on every new signup
- `handle_user_email_update()` trigger: syncs `profiles.email` when the auth email changes
- **Storage bucket `resumes`** (public) with per-user folder RLS (`{user-id}/…`)

**API layer (`src/lib/api.ts`):**
- `fetchJobs` / `fetchJob(id)` / `fetchRecruiterJobs(recruiterId)` / `insertJob` / `deleteJob`
- `bootstrapJobs` — seeds the 6 demo jobs into the `jobs` table on first run (only when empty; `recruiter_id = null` = community listing)
- `applyToJob` / `fetchStudentApplications` / `fetchApplicationForJob` / `fetchRecruiterApplications` / `updateApplicationStatus`
- `fetchResume` / `uploadResume` (Storage) / `deleteResume` / `saveGeneratedResume`

**Mock data (`src/lib/mockData.ts`):** now used **only as the seed source** for `bootstrapJobs` (`mockApplications` / `mockRecruiterApplicants` are no longer referenced by pages).

**Utils (`src/lib/utils.ts`):**
- `formatDate(dateStr)` — Today / Yesterday / `Nd ago` / short date.
- `getInitials(name)` — up to 2 uppercase initials.
- `statusColors` / `statusLabels` — applied, reviewing, interview, accepted, rejected.
- `typeColors` — full-time, internship, part-time, contract.

**Companies (`src/lib/companies.ts`):** `COMPANY_REGISTRY` used by CompleteProfile for recruiter company verification.

---

## 8. Design System

Defined in `src/index.css` (Tailwind v4 `@theme inline` + CSS variables).

| Token | Light | Dark |
|---|---|---|
| Primary | `#4F46E5` (indigo) | — |
| Secondary | `#06B6D4` (cyan) | — |
| Success / Warning / Error | `#22C55E` / `#F59E0B` / `#EF4444` | — |
| Background | `#F8FAFC` | `#0F172A` |
| Card | `#FFFFFF` | `#1E293B` |
| Foreground | `#111827` | `#F1F5F9` |
| Muted | `#6B7280` | `#94A3B8` |
| Border | `#E2E8F0` | `#334155` |
| Radius | `18px` | — |

- **Fonts:** Poppins (headings), Inter (body) via Google Fonts.
- **Utilities/classes:** `.gradient-text`, `.card-lift`, `.shadow-soft`, `.shadow-card`, `.mesh-bg`, `.float-1/2/3`, `.skeleton`, `.scroll-hidden`.
- **Dark mode:** `.dark` class on `<html>`; extensive `!important` overrides for raw hex Tailwind arbitrary classes (backgrounds, text, borders, badges/pills per color, inputs, scrollbar, shadows, mesh bg, skeleton).
- **Animations:** framer-motion page/section entrances, `layoutId` sidebar indicator, animated stepper, card lift hovers, modal spring transitions.
- **Responsive:** Desktop sidebar (`lg:flex`), mobile bottom nav (`lg:hidden`), sticky TopNav, responsive grids/tables.

---

## 9. Implementation Status vs Spec

Implemented:
- Landing (responsive navbar with mobile menu), auth flow, profile-completion onboarding with role selection + company verification
- Student: dashboard, job browse/search/filter/save, job detail + real apply flow, resume upload (Supabase Storage), AI resume builder (7 steps, mock generate, real save), applications, profile — all DB-backed
- Recruiter: dashboard, post job, my jobs (delete), applicants (accept/reject), profile — all DB-backed
- Full Supabase persistence: profiles, jobs, applications, resumes + Storage; RLS policies; demo jobs auto-seeded
- Dark mode, toasts, skeleton loading, empty states, responsive layouts, framer-motion animations

Not yet implemented / stubbed:
- **Email verification** — handled client-side (redirect to login with hint); toggle "Confirm email" in Supabase Auth settings to suit your flow.
- **Password reset** — "Forgot password?" link is still a no-op.
- **Uploaded-resume PDF preview/download** — uploaded PDFs are stored in Supabase Storage and opened in a new tab / browser viewer rather than rendered inline.
- **Search (⌘K)** — decorative button only.
- **Notifications** — hardcoded sample items.
- **Salary filter** in job list; **Edit job** button (no-op); **camera/avatar upload** (decorative); **forgot password** link (no-op).
- `react-hook-form` / `zod` installed but unused (forms are controlled manually).
- `types.ts` intentionally emptied (JS-style code).

---

## 10. Feature Changelog

> **Instructions:** Every time a feature is added, changed, or removed, append an entry here. Keep it short: date, feature, and what it does. Use the most recent date at the top.

| Date | Feature | Description |
|---|---|---|
| 2026-08-05 | PDF resume export | Added `src/lib/resumePdf.ts` using `jspdf` to render the resume as a properly structured A4 PDF: centered name header + contact/links, accent-colored section titles with rules (Summary, Education, Skills, Projects, Experience, Certifications & Awards), hanging-indent bullets, word wrapping, auto page-breaks, and footer page numbers. `Download Resume` in the AI Resume Builder now exports this PDF, and the My Resume page exports saved AI-generated resumes as PDF too (older saved payloads still fall back to raw JSON download). Added `jspdf` dependency. |
| 2026-08-05 | Gemini-powered AI Resume Builder | Replaced the simulated 3s resume generation with a real call to the Gemini REST API. New `src/lib/gemini.ts` (`generateResume`, `isGeminiConfigured`) posts the candidate's details and gets back a rewritten ATS-optimized resume + ATS score + improvement feedback (strict JSON via `responseMimeType: "application/json"`, robust JSON extraction). Key/model come from `VITE_GEMINI_API_KEY` / `VITE_GEMINI_MODEL` (default `gemini-2.0-flash`). Without a key the builder falls back to a local demo result with a warning toast. Preview now renders the AI output (summary, feedback, skills chips, quantified bullets); Save persists the AI resume (shape compatible with the applicants resume viewer); Download exports a formatted PDF. **Note:** a `VITE_` key is bundled client-side — fine for demos, restrict it in Google AI Studio or proxy it server-side for production. |
| 2026-08-05 | Recruiter onboarding without company verification | Removed the company-ID verification step from `RoleSelect`. Recruiters now just pick the Recruiter role and finish their profile (company name + phone + website) on the profile page. Recruiters are created as **pending** and cannot post jobs until an admin approves them (already enforced by RLS `jobs_insert` + PostJob gate). |
| 2026-08-05 | Admin panel | Added `/admin/*` routes (`Dashboard`, `Students`, `Recruiters`, `Jobs`, `Applications`, `Profile`) gated to the `admin` role via `ProtectedRoute`. Admin provisioning: insert a `profiles` row with `role='admin'` (instructions in `supabase/migrations/20260805_admin_panel.sql`). Dashboard shows Total Students / Recruiters / Jobs / Applications. Students list + name search + delete (confirm modal, cascades to auth user + applications). Recruiters list (company, recruiter name, email, website, status) with search by company + Approve/Reject. Jobs list + delete. Applications list (student, job, company, status). Admin Profile page shows name/email/role/member-since + sign out. Added `profiles.status` (`pending`/`approved`/`rejected`, default `pending`) + `profiles.website`, extended role check to include `admin`, added `is_admin()` (security definer) and admin RLS policies on profiles/jobs/applications. **Only Approved recruiters can post jobs** (enforced in RLS `jobs_insert` + PostJob page gate + dashboard banner). New recruiters start `pending` (set in `useAuth.setRole`). Admins skip profile-completion onboarding. |
| 2026-08-03 | One-time role selection (one role per email) | Role is now chosen once and locked per account. Added `onboarded` flag to `profiles` (`supabase/schema.sql` + idempotent migration); `setRole` persists `onboarded: true`. Fixed the auth loading race in `useAuth.tsx` so `loading` stays true until the profile is fetched — previously `onAuthStateChange` cleared it early and the root route redirected completed users to `/role-select` on every visit. `RoleSelect` now redirects completed/onboarded users straight to their dashboard or profile page, and `App.tsx`/`Login.tsx` route incomplete-but-onboarded profiles to their role profile page instead of re-asking for a role. |
| 2026-08-03 | Two-step onboarding (role select → profile) | Split onboarding into two steps per request: `/role-select` (pick Student/Recruiter, recruiters verify company via `COMPANY_REGISTRY`) then `/complete-profile` (name/phone/college, company read-only for recruiters) → dashboard. Login/Register and `ProtectedRoute` now route incomplete profiles to `/role-select`; recreated `RoleSelect.tsx`; `CompleteProfile.tsx` now only collects profile fields. |
| 2026-08-03 | Responsive navbar | Landing page navbar now has a mobile hamburger menu (animated dropdown with Features/Companies/Browse Jobs + Sign in/Get started); desktop links and CTA buttons hidden on small screens. |
| 2026-08-03 | Supabase jobs/applications/resumes wiring | Extended `supabase/schema.sql` with `jobs`, `applications`, `resumes` tables + RLS + Storage bucket `resumes`. Added `src/lib/api.ts` (fetch/insert/delete jobs, apply + applications, resume upload/save/delete, demo-job seeding). Rewrote `useJobs.ts` (DB-backed) and added `useApplications.ts`, `useResume.ts`. Converted all student & recruiter pages to load/save from Supabase with skeleton loading, real apply flow, real resume upload, and DB-persisted applicant status. `mockData` now only seeds the jobs table. |
| 2026-08-03 | Profile-completion onboarding | Added `/complete-profile` onboarding page gating dashboards until the profile is complete; `ProtectedRoute` blocks dashboards for incomplete profiles. Company registry extracted to `src/lib/companies.ts`. (Later split into the two-step role-select → profile flow — see top entry.) |
| 2026-08-03 | Supabase Auth integration | Replaced mock auth with real Supabase Auth. Added `src/lib/supabase.ts` env-driven client, rewrote `src/hooks/useAuth.tsx` (login/register/setRole/updateProfile/logout via Supabase), added `supabase/schema.sql` (profiles table + RLS + auto-profile trigger), created `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`, and updated Login/Register/Profile/Sidebar flows for the real backend (email-confirmation handling, DB-backed role + profile updates). |
| (initial build) | JobVerse v1.0 | Full front-end prototype: landing, mock auth, role select + company verification, student & recruiter dashboards, job browsing/detail/apply, resume upload + AI resume builder, applications, applicant management, dark mode. |

---

## 11. Useful Commands

- `npm install` — install dependencies
- `npm dev` — start dev server (already running on port 8443)
- `npm build` — production build
- `npm preview` — preview build
- `npm format` — format code with oxfmt
