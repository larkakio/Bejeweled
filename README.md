# Bejeweled

**Production:** [https://bejeweled-teal.vercel.app](https://bejeweled-teal.vercel.app)

- **`web/`** — Next.js app (Vercel project root: `web`)
- **`contracts/`** — Foundry `CheckIn` contract

Set in Vercel → Environment Variables (Production/Preview as needed):

- `NEXT_PUBLIC_SITE_URL=https://bejeweled-teal.vercel.app`
- `NEXT_PUBLIC_BASE_APP_ID=69c7c270480a9d8cb993add0` (also baked into `web/app/layout.tsx` as fallback for base.dev domain verification meta tag)

Pushing to `main` triggers a Vercel deployment when the project is connected to this repo.
