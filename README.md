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

## BetterAuth Social Login Setup

This project supports social sign-in via Google, Facebook, and Apple through BetterAuth.

### Required environment variables

Add these variables to your environment configuration:

```bash
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

Keep `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` aligned to the same origin.

For production, set `BETTER_AUTH_URL` to your HTTPS domain.

### Callback URLs

Use these callback URLs in provider dashboards:

- Google: `<BETTER_AUTH_URL>/api/auth/callback/google`
- Facebook: `<BETTER_AUTH_URL>/api/auth/callback/facebook`
- Apple: `<BETTER_AUTH_URL>/api/auth/callback/apple`

Examples:

- Local: `http://localhost:3000/api/auth/callback/{provider}`
- Production: `https://your-domain.com/api/auth/callback/{provider}`

### Facebook provider checklist

1. Create an app in Meta for Developers.
2. Enable Facebook Login product.
3. Add valid OAuth redirect URI:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://your-domain.com/api/auth/callback/facebook`
4. Request minimum scopes for this app setup:
   - `email`
   - public profile
5. Add test users (development mode) or switch app to live mode for production.

### Apple provider checklist

1. Create an Identifier for Sign in with Apple (Services ID).
2. Configure Sign in with Apple for your domain and return URL.
3. Create a Sign in with Apple private key and keep:
   - Team ID
   - Key ID
   - Client ID (Services ID)
4. Generate Apple client secret (JWT) and set it as `APPLE_CLIENT_SECRET`.
5. Use this return URL:
   - `http://localhost:3000/api/auth/callback/apple` (local)
   - `https://your-domain.com/api/auth/callback/apple` (production)

Note: Apple can be stricter for local development. If local callback fails, use a publicly reachable HTTPS environment for verification.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
