# Bhakty Studio Admin CMS

Standalone private admin dashboard for managing Bhakty Studio portfolio content, media, service tiers, pricing, hero copy, submissions, and site settings.

## Run Locally

```bash
npm install
npm run dev
```

When Supabase env vars are not configured, the app runs in local demo mode with seeded CMS data.

Demo login:

```text
Email: admin@bhakty.studio
Password: any 6+ characters
```

## Environment

Copy `.env.example` to `.env.local` and fill:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAIL=admin@bhakty.studio
VITE_CLOUDINARY_CLOUD_NAME=
```

## Supabase

Apply the schema in:

```text
supabase/migrations/202605120001_admin_cms.sql
```

Then create one Supabase Auth user for `VITE_ADMIN_EMAIL` and insert that user into `admin_profiles`.

Cloudinary upload signing lives at:

```text
supabase/functions/cloudinary-sign-upload/index.ts
```

Required Supabase function secrets:

```bash
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=bhakty-studio
```

## Included

- React + Vite admin UI
- Tailwind glassmorphism design system
- Supabase Auth/client setup
- CMS schema with Row Level Security
- Signed Cloudinary Edge Function
- Seeded dashboard data for immediate local use

