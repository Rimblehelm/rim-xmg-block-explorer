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

**Environment Variables**
- **NEXTAUTH_URL**: The canonical URL where your app runs locally, e.g. `http://localhost:3000`.
- **NEXTAUTH_SECRET**: A long random string used to sign NextAuth tokens. Generate with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- **EMAIL_SERVER** / **EMAIL_FROM**: Required if you enable the EmailProvider in `next-auth`. `EMAIL_SERVER` should be a SMTP connection string, for example:

```
# SMTP URL form: smtp://USER:PASSWORD@smtp.example.com:587
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM="Your App <noreply@example.com>"
```

Notes:
- `.env.local` is ignored by `.gitignore` by default; keep secrets out of version control.
- If you add or change env vars, restart the dev server so Next.js picks them up.

**Email / TLS note (development)**
- During development you may be tempted to bypass TLS verification (for example by setting
	`tls: { rejectUnauthorized: false }` on your SMTP transport). This is insecure and should never
	be used in production. Instead, for Gmail use an App Password (see steps above). I removed the
	temporary TLS bypass from the code and recommend using an App Password or a trusted SMTP
	provider (SendGrid, Mailgun, Postmark) for reliable delivery.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<a name="github-actions--ci-secrets"></a>
## GitHub Actions / CI Secrets

The repository contains two CI workflows under `.github/workflows/`: `ci-unit.yml` (runs Vitest) and `ci-e2e.yml` (runs Playwright E2E against a PostgreSQL service). To run those workflows successfully you should add the following GitHub Secrets in your repository settings (Settings → Secrets → Actions).

- **NEXTAUTH_SECRET**: The NextAuth secret used to sign and encrypt session cookies and tokens. Example generation (locally):

```pwsh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- **DATABASE_URL**: Optional override for the CI job. The E2E workflow sets a default `DATABASE_URL` for the included Postgres service; use this secret if you want to point CI to a different database instance. Example value:

```
postgresql://postgres:postgres@localhost:5432/postgres?schema=public
```

- **SMTP_URL / EMAIL_SERVER / EMAIL_FROM**: If your app sends email during tests (not required by the default tests), set these to your SMTP connection string and the sender address. Example SMTP URL form:

```
# smtp://USER:PASSWORD@smtp.example.com:587
SMTP_URL=smtp://user:pass@smtp.example.com:587
EMAIL_FROM="Your App <noreply@example.com>"
```

Notes:

- The `ci-e2e.yml` workflow uses a temporary Postgres service and runs `npx prisma migrate deploy` against it. Make sure your migrations are committed to `prisma/migrations/` before running the workflow.
- If you add providers that require additional secrets (e.g. OAuth providers like GitHub, Google), add their client IDs / secrets to GitHub Secrets and update the workflow to expose them as environment variables.
- For secrets referenced in the workflows, use the `secrets.*` syntax in the workflow file (for example `${{ secrets.NEXTAUTH_SECRET }}`). Currently the workflows set `DATABASE_URL` in the E2E job to the service value; adapt as needed for your environment.

If you'd like, I can update the workflows to reference `secrets.NEXTAUTH_SECRET` and other secrets explicitly and add an example `.github/workflows/ci-e2e.template.yml` showing the exact secrets mapping.
