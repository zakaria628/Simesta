This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Data Pengurus

The Pengurus module uses Supabase Auth, Postgres, and a private Storage bucket.

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the project's public URL and publishable/anon key. Never put a service-role key in a `NEXT_PUBLIC_` variable.
2. Before applying the migration, confirm that the remote database does not already contain a `public.pengurus` table or a `pengurus-profile` Storage bucket.
3. Apply `supabase/migrations/20261114000000_create_pengurus.sql` to the Supabase project.
4. Disable public sign-ups in Supabase Auth and provision staff accounts yourself; the module intentionally has no public registration. Database access is restricted by RLS to authenticated users.
5. Restart the Next.js development server after changing environment variables.

The migration creates the `pengurus` table, generated `PGS-` identifiers, RLS policies, and a private profile-photo bucket. Supabase project credentials and live database access are not stored in this repository.
