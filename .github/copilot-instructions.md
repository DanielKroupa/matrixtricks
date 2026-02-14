# Matrix Tricks - AI Coding Guidelines

## Project Overview

This is a Next.js social media platform with posts, fanwall, authentication, and monetization features. Built with TypeScript, Prisma (PostgreSQL), Better Auth, and Socket.io for realtime chat.

## Architecture

- **Layered Architecture**: Follow clean architecture with domain/application/infrastructure/interface layers (aspirational - currently evolving)
- **Next.js App Router**: Server components by default, API routes for external integrations
- **Database**: Prisma ORM with PostgreSQL, generated client in `src/app/generated/prisma/`
- **Authentication**: Better Auth with social providers (Google, Facebook, Apple) and email/password
- **Realtime**: Socket.io for fanwall messages (`server/socket.ts`)

## Key Directories

- `src/app/`: App router pages and API routes
- `src/components/`: Reusable UI components (Radix UI + Tailwind)
- `src/actions/`: Server actions for data operations
- `src/lib/`: Utilities, auth config, Prisma client
- `prisma/`: Schema and migrations
- `server/`: Socket.io server

## Development Workflows

- **Start dev server**: `npm run dev` (runs Next.js + scheduler concurrently)
- **Socket server**: `npm run dev:socket` (separate for realtime features)
- **Full dev**: `npm run dev:all` (Next.js + Socket.io)
- **Database**: Use Prisma CLI for migrations (`npx prisma migrate dev`)
- **Linting**: `npm run lint` (Biome)
- **Formatting**: `npm run format` (Biome + Prettier)

## Coding Patterns

- **Server Actions**: Use `"use server"` in `src/actions/` for data mutations, validate with Zod schemas from `src/app/helpers/`
- **Auth Checks**: Always verify session with `getServerSession()` from `@/lib/get-session`
- **Prisma Usage**: Import client from `@/lib/prisma`, avoid direct queries in components
- **Validation**: Zod schemas for API boundaries, form validation with react-hook-form
- **Rich Text**: TipTap editor for post content (`components/RichTextEditor.tsx`)
- **File Uploads**: AWS S3 for media storage (`@aws-sdk/client-s3`)
- **Emails**: Resend for transactional emails (`@/lib/resend`)

## Examples

- **Creating a post**: Use `src/actions/social.ts` with `CreatePostSchema` validation
- **Auth-protected route**: Check `src/app/(site)/layout.tsx` for session handling
- **Database query**: See `getVideoPosts` in `src/actions/social.ts` for include patterns
- **Realtime updates**: Fanwall uses Socket.io, see `src/lib/fanwall-realtime.ts`

## Conventions

- **Imports**: Use `@/` alias for `src/`
- **Error Handling**: Throw errors in server actions, handle in components
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Styling**: Tailwind CSS with `class-variance-authority` for variants
- **Environment**: Use `process.env` for secrets, validate with Zod

## Security Notes

- Never expose Prisma models directly to client
- Validate all user inputs with Zod
- Use HTTPS in production for auth cookies
- Rate limit Socket.io connections</content>
  <parameter name="filePath">c:\Users\dedic\Desktop\matrix-tricks\.github\copilot-instructions.md
