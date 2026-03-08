# JanSamadhan+ (Version 2)

JanSamadhan+ is the upgraded, production-grade release of the original JanSamadhan project. It is a high-performance, anonymous platform for civic grievance tracking that allows citizens to submit complaints and monitor resolution status in real time, without requiring any personal information.

The original repository has been retired. This repository (`Adarsh-61/JanSamadhanV2`) contains the current and actively maintained version.

## What Changed in Version 2

- Hardened Content Security Policy (CSP) and security headers
- Server-side input sanitization with HTML entity encoding
- Attachment URL validation against the Supabase storage domain
- Rate limiting on all API endpoints, including admin routes
- Search query injection prevention (ilike pattern escaping)
- Removal of all test files containing credentials
- Improved realtime synchronization with accurate stat counts
- Toast notification positioning fix
- Updated branding, documentation, and deployment references

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Platform | Vercel (Serverless) |
| Database | Supabase (Postgres) |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Anti-Spam | Google reCAPTCHA v3 |
| Styling | Tailwind CSS v4, Inter font |
| Animation | Framer Motion |

## Architecture

The system is built on four layers:

1. **Frontend** -- Next.js with React 19 and Tailwind CSS v4. The UI follows a clean card-based design with skeleton loading states and smooth animations.
2. **API Layer** -- Next.js Serverless Functions handle all database mutations. Every endpoint enforces rate limiting, input sanitization, and (for admin routes) JWT-based authentication with admin role verification.
3. **Database** -- Postgres on Supabase with Row-Level Security (RLS) policies. Complaints can only be created with `status = 'no_action'` and `visible = true`. Only verified admins can update or delete records. A trigger enforces that status changes to `working` or `solved` require an admin note.
4. **Realtime** -- WebSocket-based updates via Supabase Realtime keep the public board and complaint detail pages synchronized without polling.

## Setup

### 1. Prerequisites

This repository includes a portable Node.js environment (Windows). Activate it with:

```powershell
. .\dev.ps1
```

On other systems, ensure Node.js v20+ and npm are available.

### 2. Database

1. Create a project at [supabase.com](https://supabase.com).
2. Run the schema in `supabase/migrations/001_init.sql` using the Supabase SQL Editor. This creates the `complaints`, `complaint_history`, and `admin_users` tables along with all RLS policies, indexes, and triggers.
3. Create a public storage bucket named `attachments`.

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key for privileged operations |
| `RECAPTCHA_SECRET_KEY` | Server only | Google reCAPTCHA v3 secret |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Client | reCAPTCHA site key |

### 4. Development

```bash
npm install
npm run dev
```

The application runs at [http://localhost:3000](http://localhost:3000).

## Admin Setup

1. Create a user via Supabase Authentication (Users tab).
2. Copy the generated UUID.
3. Insert the admin mapping:

```sql
INSERT INTO admin_users (id, email, display_name)
VALUES ('<USER_UUID>', 'admin@example.com', 'Admin');
```

4. Sign in at `/admin/login` to access the dashboard.

## Security

- **Anonymous submissions** -- No PII is collected. All complaints are public and anonymous.
- **Row-Level Security** -- RLS policies enforce read/write permissions at the database level. Public users can only read visible complaints and insert new ones with restricted defaults. Only admins can update or delete.
- **JWT verification** -- Admin API routes extract the Bearer token, verify it against Supabase Auth, and confirm the user exists in `admin_users` before proceeding.
- **Input sanitization** -- All text inputs are stripped of control characters and HTML-encoded. Attachment metadata is validated against the Supabase storage domain.
- **Rate limiting** -- IP-based sliding window rate limiter (5 requests per minute) on all mutation endpoints.
- **Security headers** -- CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, and Permissions-Policy are set on every response.
- **Database triggers** -- A trigger-level constraint ensures `working` and `solved` statuses always require a non-empty admin note, acting as a safety net beyond RLS.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Connect the repository to Vercel.
3. Add all environment variables from `.env.local` to the Vercel Environment Variables panel.
4. Deploy. Vercel handles the build and serving automatically.

The production URL for this project is: `https://jansamadhanplus.vercel.app/`

## Project Structure

```
src/
  app/
    page.js              # Public complaint board
    submit/page.js       # Anonymous complaint submission
    complaint/[id]/      # Complaint detail with activity timeline
    admin/page.js        # Admin dashboard (protected)
    admin/login/page.js  # Admin sign-in
    api/complaints/      # POST: create complaint
    api/admin/complaints/ # PATCH status, DELETE complaint
    layout.js            # Root layout with metadata
    client-layout.js     # Client providers (Auth, Toast, Navbar, Footer)
    globals.css          # Design system tokens and utility classes
  components/
    Navbar.jsx           # Sticky navigation with mobile menu
    Footer.jsx           # Site footer
    ComplaintCard.jsx     # Complaint list item (memoized)
    StatusBadge.jsx      # Status indicator pill
    StatusChangeModal.jsx # Admin status update dialog
    FileUpload.jsx       # Drag-and-drop file uploader
    HistoryTimeline.jsx  # Activity log timeline
    ProtectedRoute.jsx   # Admin route guard
  contexts/
    AuthContext.js       # Authentication state and admin verification
    ToastContext.js      # Toast notification system
  hooks/
    useComplaints.js     # Complaint fetching with realtime sync
    useComplaintHistory.js # Audit log fetching with realtime sync
  lib/
    supabase-client.js   # Browser Supabase client
    supabase-server.js   # Server Supabase client (service role)
    sanitize.js          # Input sanitization and URL validation
    rate-limit.js        # In-memory sliding window rate limiter
supabase/
  migrations/001_init.sql # Full database schema and RLS policies
```

## Future Roadmap (Version 3)

These are planned improvements for a future release:

- **Automatic complaint categorization** using machine learning to classify incoming complaints by department or issue type, reducing manual triage.
- **Upvote and priority ranking** allowing citizens to signal which issues matter most, with complaints ranked by community priority.
- **Smart duplicate detection** using text similarity analysis to flag and merge duplicate complaints before they clutter the board.
- **Advanced analytics dashboard** with trend visualizations, resolution time tracking, and department-level performance metrics.
- **Admin insights panel** surfacing actionable data such as average response time, complaint volume by category, and unresolved aging reports.
- **Notification system** enabling email or push alerts when a complaint's status changes, keeping submitters informed without requiring them to check the board.
- **Performance monitoring** with server-side request tracing and client-side Core Web Vitals reporting to maintain production-grade speed.
- **Progressive Web App (PWA) support** enabling offline access, home screen installation, and background sync for complaint submissions.

## License

This project is licensed under the MIT License. Contributions are welcome.
