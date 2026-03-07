# JanSamadhan (Public Complaint Board)

A high-performance, anonymous platform for civic grievance tracking. This project provides a production-grade interface for citizens to submit issues and track resolution status in real-time.

## Technology Stack

| Component | Technology | Tier |
|-----------|------------|------|
| Framework | Next.js (App Router) | - |
| Platform | Vercel (Serverless) | Free |
| Database | Supabase (Postgres) | Free |
| Realtime | Supabase Realtime | Free |
| Storage | Supabase Storage | Free |
| Auth | Supabase Auth | Free |
| Security | Google reCAPTCHA v3 | Free |

## Architecture Overview

The system architecture is designed for scalability and security on a zero-cost infrastructure:

1. **Frontend**: Next.js client with React 19 and Tailwind CSS v4, utilizing a glassmorphism design system.
2. **API Layer**: Next.js Serverless Functions for secure database interactions and input validation.
3. **Database**: Postgres on Supabase with Row-Level Security (RLS) policies enforcing data integrity.
4. **Realtime Engine**: WebSocket-based updates using Supabase Realtime to keep the public board synchronized.

## Setup and Installation

### 1. Prerequisites
This repository includes a portable Node.js environment. No global installation is required. Activate the local environment using:

```powershell
# In PowerShell
. .\dev.ps1
```

### 2. Database Migration
1. Initialize a new project at [supabase.com](https://supabase.com).
2. Execute the schema defined in `supabase/migrations/001_init.sql` using the Supabase SQL Editor.
3. Create a public storage bucket named `attachments`.

### 3. Environment Configuration
Copy the template and populate it with your Supabase credentials:

```bash
cp .env.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server-side only)
- `RECAPTCHA_SECRET_KEY`

### 4. Local Development
Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Admin Configuration

### 1. Account Creation
1. Create a user via Supabase **Authentication** -> **Users**.
2. Copy the generated User ID (UUID).
3. Map the user as an administrator:

```sql
INSERT INTO admin_users (id, email, display_name)
VALUES ('<USER_UUID>', 'admin@example.com', 'Admin');
```

### 2. Dashboard Access
Authenticate at `/admin/login` to manage complaints, update resolution status, and add administrative notes.

## Security Considerations

- **Data Privacy**: No Personal Identifiable Information (PII) is collected or stored. All citizen submissions are anonymous.
- **Access Control**: Row-Level Security (RLS) policies prevent unauthorized modifications. Administrative actions require valid JWT tokens.
- **Audit Logging**: Every status update is recorded in the `complaint_history` table with mandatory administrative notation.
- **Input Sanitization**: Client and server-side validation using custom sanitization logic for all text and file inputs.
- **Spam Prevention**: Integrated reCAPTCHA v3 scoring and IP-based rate limiting (5 requests per minute).

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Connect your project to Vercel.
3. Inject the keys from `.env.local` into the **Environment Variables** panel in Vercel settings.
4. The deployment will automatically handle the build and optimized serving.

## License and Attribution

Open-source project authored by Adarsh-61.
copyright 2026 Adarsh-61. All rights reserved.
