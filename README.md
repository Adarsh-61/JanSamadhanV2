# JanSamadhan — Public Complaint Board

Anonymous public complaint board with real-time status tracking. Built on a 100% free-tier stack.

## 🏗️ Stack

| Service | Purpose | Tier |
|---------|---------|------|
| **Next.js** (App Router) | Frontend + API routes | — |
| **Vercel** | Hosting & Serverless | Free |
| **Supabase** | Postgres, Auth, Realtime, Storage | Free |
| **Google reCAPTCHA v3** | Spam protection | Free |

## 🚀 Quick Start

### 1. Prerequisites
- This project includes a portable Node.js — no global install needed.
- Activate the dev environment:

```powershell
# Windows PowerShell
. .\dev.ps1
```

### 2. Setup Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/migrations/001_init.sql` → Run
3. Go to **Storage** → Create a bucket named `attachments` (set as **Public**)
4. Go to **Settings > API** → Copy your project URL and keys

### 3. Environment Variables
```powershell
Copy-Item .env.example .env.local
# Then edit .env.local with your Supabase values
```

### 4. Run Locally
```powershell
. .\dev.ps1
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 👤 Admin Setup

### Create Admin User
1. Go to Supabase **Authentication** → **Users** → **Add User**
2. Create user with email + password
3. Copy the user's UUID
4. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (id, email, display_name)
VALUES ('<user-uuid>', 'admin@example.com', 'Admin');
```

### Login
Go to `/admin/login` and sign in with the admin credentials.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── page.js             # Public board
│   │   ├── submit/page.js      # Submit complaint form
│   │   ├── complaint/[id]/     # Complaint detail
│   │   ├── admin/              # Admin login + panel
│   │   └── api/                # Serverless API routes
│   ├── components/             # React components
│   ├── contexts/               # Auth + Toast contexts
│   ├── hooks/                  # Realtime hooks
│   └── lib/                    # Supabase clients, rate limiter
├── supabase/migrations/        # SQL schema
├── .node/                      # Portable Node.js (local only)
├── dev.ps1                     # Dev environment activation
└── .env.example                # Environment template
```

## 🔒 Security

- **No PII** — no personal data collected or stored
- **Anonymous submissions** — no user accounts for submitters
- **Admin-only updates** — protected by Supabase Auth + RLS policies
- **Mandatory notes** — status changes to Working/Solved require admin note (enforced API + DB trigger)
- **Audit log** — every admin action logged in `complaint_history`
- **Rate limiting** — in-memory + reCAPTCHA v3
- **File limits** — 2MB max, images & PDFs only

## 🧹 Clean Removal

Delete the project folder to remove everything:
```powershell
Remove-Item -Recurse -Force x:\JanSamadhan
```
**✔ No global installs. ✔ No system PATH changes. ✔ Zero system trace.**

## 📊 Free Tier Limits

| Service | Limits |
|---------|--------|
| Supabase DB | 500MB storage, 2 GB bandwidth |
| Supabase Auth | 50,000 MAU |
| Supabase Storage | 1GB, 2GB transfer |
| Supabase Realtime | 200 concurrent connections |
| Vercel | 100GB bandwidth, 100,000 invocations |

### Staying Within Limits
- Attachments limited to 2MB, max 3 per complaint
- Pagination limits queries to 50 per page
- Rate limiting prevents spam (5 requests/minute/IP)
- If realtime hits limits, the public board falls back to manual refresh
