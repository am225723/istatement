# ConRes rebuilt with Neon + Clerk + UploadThing

This is a Vercel-ready remake of the `conres` app concept. The original repo is a Vite/React communication-coaching app that used Supabase, OpenAI/OpenRouter, React Router, Pusher, Tailwind, and Vercel tooling. This rebuild uses:

- **Next.js App Router** for app + API routes
- **Clerk** for authentication
- **Neon Postgres** for saved statements, journal entries, and file metadata
- **UploadThing** for uploads
- **OpenRouter/OpenAI-compatible route** for AI communication coaching

## 1. Create your services

### Clerk
1. Create a Clerk app at <https://dashboard.clerk.com>.
2. Copy your publishable key and secret key.
3. Add these URLs in Clerk if needed:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/app`
   - After sign-up URL: `/app`

### Neon
1. Create a Neon project at <https://console.neon.tech>.
2. Copy the pooled or direct `DATABASE_URL`.
3. Open the Neon SQL editor and run `schema.sql` from this repo.

### UploadThing
1. Create an UploadThing app at <https://uploadthing.com>.
2. Copy your `UPLOADTHING_TOKEN`.
3. Upload routes are already configured at `/api/uploadthing`.

### OpenRouter
1. Create/get an API key at <https://openrouter.ai>.
2. You can use the default free model in `.env.example` or replace it.

## 2. Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
UPLOADTHING_TOKEN=
OPENROUTER_API_KEY=
APP_URL=http://localhost:3000
```

Then visit <http://localhost:3000>.

## 3. Deploy to Vercel

1. Upload this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add the same environment variables in Vercel Project Settings → Environment Variables.
4. Deploy.
5. After Vercel gives you a production URL, update:

```bash
APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
```

## 4. Database tables

Run `schema.sql` in Neon. It creates:

- `statements`
- `journal_entries`
- `uploaded_files`

Each table stores `clerk_user_id`, so data is scoped to the signed-in user by server-side API routes.

## 5. What changed from the old app

- Supabase Auth/RPC/functions were replaced by Clerk + Next.js API routes.
- Supabase database was replaced with Neon Postgres.
- UploadThing handles file uploads, while Neon stores file metadata.
- The AI route keeps the OpenRouter-compatible pattern from the original repo.
- Pusher/realtime features were intentionally left out for the first clean migration. Add Ably, Pusher, or Pusher later only if you need live couples sessions.

## 6. Important production notes

This starter is a functional migration foundation, not a compliance certification. For clinical or therapy data, review HIPAA/security needs, access logging, encryption, backups, business associate agreements, and data-retention policies before storing protected health information.
