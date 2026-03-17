# Technology Stack

## Framework & Runtime

- Next.js 16 (App Router)
- React 19
- Node.js 20+
- TypeScript & JavaScript (mixed codebase)

## Core Libraries

- **Authentication**: NextAuth v4 with Google OAuth
- **Database**: Supabase (PostgreSQL with RLS)
- **AI/LLM**: Groq SDK, Google Gemini API
- **Email**: Google Gmail API (googleapis)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React, React Icons
- **Validation**: Zod schemas
- **Testing**: Jest with React Testing Library

## Build System

- **Package Manager**: npm
- **Bundler**: Next.js built-in (Turbopack/Webpack)
- **CSS**: PostCSS with Tailwind
- **Linting**: ESLint with Next.js config

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm run lint         # Run ESLint
npm run clean        # Remove .next build directory

# Testing
npm test             # Run Jest tests
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - App URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access (server-only)
- AI provider keys (Groq, Gemini)

## Path Aliases

Uses `@/*` alias mapping to project root (configured in jsconfig.json):

```javascript
import { supabase } from '@/lib/supabase';
import { nlpAgent } from '@/src/agents/nlp';
```

## Image Optimization

Next.js Image component configured for:
- `lh3.googleusercontent.com` (Google profile images)
- `avatars.githubusercontent.com` (GitHub avatars)

## Production Optimizations

- Console removal in production builds
- Package import optimization for lucide-react and react-icons
