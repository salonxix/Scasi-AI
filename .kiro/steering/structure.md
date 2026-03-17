# Project Structure

## Directory Organization

```
/app                    # Next.js App Router
  /api                  # API routes
    /ai                 # AI processing endpoints
    /auth               # NextAuth configuration
    /db                 # Database operations
    /gmail              # Gmail API integration
    /rag                # RAG search endpoints
  /dashboard            # Dashboard page
  /features             # Features page
  /how-it-works         # Info page
  /pricing              # Pricing page
  layout.jsx            # Root layout
  page.jsx              # Home page

/components             # React components
  /dashboard            # Dashboard-specific components

/lib                    # Shared utilities
  supabase.ts           # Supabase client setup
  appUser.ts            # User ID helpers
  dateUtils.ts          # Date formatting
  /__tests__            # Unit tests

/src                    # Core business logic
  /agents               # Agent system architecture
    /_shared            # Shared agent utilities
    /nlp                # NLP agent (classify, summarize, reply)
    /rag                # RAG agent (embeddings, search)
    /orchestrator       # Workflow orchestration
    /testing            # Testing utilities
    /voice              # Voice agent (future)
  /llm                  # LLM infrastructure
    cache.ts            # Response caching
    policy.ts           # Usage policies
    rate-limiter.ts     # Rate limiting
    registry.ts         # Model registry
    router.ts           # Model routing
    tracing.ts          # Observability

/supabase               # Database
  /migrations           # SQL migrations
  config.toml           # Supabase config

/public                 # Static assets
```

## Architecture Patterns

### API Routes

- Use Next.js App Router convention: `route.js` or `route.ts`
- Handle errors with try-catch, return appropriate status codes
- Use `NextResponse.json()` for responses
- Validate input with Zod schemas
- Check session with `getServerSession(authOptions)`

### Agent System

- Each agent in `/src/agents/{name}/` with `index.ts` and `types.ts`
- Barrel exports from `src/agents/index.ts`
- Shared utilities in `src/agents/_shared/`
- Prompts versioned in `/prompts/{name}.v{N}.ts`

### Components

- Use `"use client"` directive for client components
- Mix of `.jsx` and `.tsx` files (prefer TypeScript for new code)
- Inline styles common in dashboard components
- Tailwind classes for layout and utilities

### Database Access

- Use `supabase` for client-side (respects RLS)
- Use `getSupabaseAdmin()` for server-side admin operations
- Use `getSupabaseWithUser(userId)` for RLS-aware server operations
- Always call `ensureUserExists(session)` before user operations

### LLM Layer

- Model registry in `src/llm/registry.ts`
- Router selects model based on task requirements
- Rate limiting and caching applied automatically
- Tracing for observability

## File Naming Conventions

- API routes: `route.js` or `route.ts`
- Pages: `page.jsx` or `page.tsx`
- Components: PascalCase (e.g., `Dashboard.jsx`)
- Utilities: camelCase (e.g., `dateUtils.ts`)
- Types: `types.ts` in each module

## Import Patterns

- Use `@/` path alias for absolute imports
- Barrel exports from index files
- Group imports: external → internal → relative

## Testing

- Test files in `__tests__` subdirectories
- Use `.test.ts` or `.test.tsx` suffix
- Jest + React Testing Library setup
