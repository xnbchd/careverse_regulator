---
project_name: "careverse_regulator-bench"
user_name: "Eric"
date: "2026-03-29"
sections_completed:
  [
    "technology_stack",
    "language_rules",
    "framework_rules",
    "testing_rules",
    "code_quality",
    "workflow_rules",
    "critical_rules",
  ]
status: "complete"
rule_count: 52
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Frontend

- React 19.2.4 (React Compiler enabled — no manual useMemo/useCallback)
- TanStack React Router 1.168.3 (file-based routing with Vite plugin)
- Zustand 5.0.12 (one store per feature domain)
- Vite 7.3.1 (build tool + Tailwind CSS 4.2.2 plugin)
- TypeScript 5.9.3 (strict mode, erasableSyntaxOnly)
- React Hook Form 7.71.2 + Zod 4.3.6 (form validation)
- shadcn/ui + Radix UI (accessible component primitives)
- Recharts 2.15.4, Leaflet 1.9.4, Socket.io 4.8.3
- Sonner 2.0.7 (toasts), date-fns 4.1.0, dayjs 1.11.19

### Backend

- Frappe framework (Python, bench-managed version)
- REST API via `@frappe.whitelist()` decorators
- Multi-tenant architecture with company isolation

### Build

- Node managed via NVM (requires Node v24)
- Yarn package manager
- `bench build --app careverse_regulator` for production builds
- Dev server: port 8080, proxies to Frappe on port 8000

## Critical Implementation Rules

### Language-Specific Rules

#### TypeScript

- Strict mode enforced — no unused locals, parameters, or fallthrough cases
- `erasableSyntaxOnly: true` — NEVER use `enum`, use `as const` objects instead
- Always use `@/` import alias (maps to `src/`), never relative paths like `../../`
- One type file per feature domain in `src/types/`
- Error handling: try-catch around API calls, `toast.success()`/`toast.error()` for user feedback
- Always log failed mutations to audit via `useAuditLog` hook

#### Python (Frappe Backend)

- All callable endpoints must use `@frappe.whitelist()` decorator
- Use `frappe.throw()` for errors, not `raise`
- Every API entry point must call `require_active_company()` first
- Use `with_company_filter()` to auto-inject company isolation on queries
- Validate document ownership with `has_company_permission()` before mutations

### Framework-Specific Rules

#### React 19

- React Compiler handles memoization — NEVER use `useMemo`, `useCallback`, or `React.memo`
- `useEffect` ONLY for true side effects (DOM, subscriptions, external systems) — NOT data fetching
- Data fetching goes in TanStack Router loaders or Zustand store actions

#### Component Architecture

- Components grouped by feature domain: `components/{domain}/`
- Shared cross-domain components in `components/shared/`
- UI primitives (shadcn/ui) in `components/ui/`
- All list views must support both table (desktop) and card (mobile) via `useResponsive()` hook

#### State Management (Zustand)

- One store per feature domain — never mix domains in a single store
- Pattern: state + actions in single `create<StoreType>()` call
- Filter changes must reset pagination to page 1
- React Context only for providers (Auth, EntityDrawer, Theme) — NOT feature state

#### Routing (TanStack Router)

- File-based routes in `src/routes/`, `routeTree.gen.ts` is auto-generated (never edit)
- Dynamic segments: `$paramName` syntax
- Base path: `/compliance-360`
- Use route loaders for page data, not useEffect

#### API Layer

- Centralized client (`src/api/client.ts`): 5min GET cache, 3x retry, in-flight dedup
- One API module per domain in `src/api/`
- Transform backend snake_case to frontend camelCase in API layer

### Testing Rules

- Hook tests go in `__tests__/` subdirectory next to the hook file
- Utility tests co-located with source: `{name}.test.ts` beside `{name}.ts`
- Use `.test.ts` extension (not `.spec.ts`)
- Test files use the same `@/` import alias as source code

### Code Quality & Style Rules

#### Linting

- ESLint 9 flat config with React hooks + React Refresh + typescript-eslint
- All components must be valid for React Refresh (named exports)

#### Naming Conventions

- Components: PascalCase (`AffiliationsView.tsx`)
- Hooks: camelCase + `use` prefix (`useAuditLog.ts`)
- Stores: camelCase + `Store` suffix (`affiliationStore.ts`)
- API modules: camelCase + `Api` suffix (`licensingApi.ts`)
- Type files: camelCase, exports PascalCase types (`license.ts` → `License`)
- Route directories: kebab-case matching URL segments

#### Theming & Styling

- Theme-aware classes ONLY: `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-background`, `bg-card`, `border-border`
- NEVER hardcode grays (`text-gray-900`, `bg-gray-50`) without paired `dark:` variants
- Cards: `shadow-md border border-border/60` (light), `dark:shadow-none dark:border-foreground/15` (dark)
- Colored cards: `bg-gradient-to-br` with related color families
- OkLch color space for custom properties in `index.css`

#### File Organization

- One store, one API module, one type file per feature domain
- New features follow the domain pattern: `components/{domain}/`, `stores/{domain}Store.ts`, `api/{domain}Api.ts`, `types/{domain}.ts`

### Development Workflow Rules

#### Build Process

- Production: `bench build --app careverse_regulator` (requires Node v24 via nvm)
- Frontend output: `careverse_regulator/public/compliance-360/`
- Vite manifest (`.vite/manifest.json`) consumed by `www/compliance_360.py` for asset URLs
- `hooks.py` triggers frontend build on `before_build` and `after_migrate`

#### Repository Structure

- Git repo is `apps/careverse_regulator/` — NOT the bench root
- `compliance_360` is a separate Frappe app providing doctypes/business logic
- Frontend SPA served at `/compliance-360` via Frappe website route rules
- `www/compliance_360.py` injects boot data (user, company, roles, branding) into SPA

#### Frappe SPA Integration

- SPA entry: `index.html` → `main.tsx` → TanStack Router
- Auth initialized from Frappe boot data + `get_user_context` API call
- Session company set via `set_active_company_in_session()`
- All sub-routes under `/compliance-360/` handled by client-side router

### Critical Don't-Miss Rules

#### Anti-Patterns (NEVER do these)

- NEVER `useEffect` for data fetching → use router loaders or store actions
- NEVER `useMemo`/`useCallback`/`React.memo` → React Compiler handles memoization
- NEVER use TypeScript `enum` → use `as const` objects (`erasableSyntaxOnly`)
- NEVER hardcode gray classes without `dark:` variant → use theme tokens
- NEVER query Frappe without company filter → breaks tenant isolation
- NEVER edit `routeTree.gen.ts` → auto-generated by TanStack Router plugin
- NEVER use raw `fetch()` for Frappe endpoints → use the API client (handles CSRF, retry, caching)
- NEVER bypass `frappe-react-sdk` for Frappe resources → it manages session context

#### Multi-Tenancy (data isolation is non-negotiable)

- `require_active_company()` MUST be first call in every `@whitelist` endpoint
- Always use `with_company_filter()` on list queries
- Always call `set_doc_company()` when creating documents
- 0 or 2+ Company User Permissions = hard error, not graceful fallback
- Breaking tenant isolation is a compliance/legal violation, not just a bug

#### Frappe-React Coupling (this is NOT a standalone SPA)

- Boot data injected server-side by `www/compliance_360.py` before React mounts
- API calls are RPC-style (`/api/method/module.function`), NOT RESTful resources
- Dev proxy (port 8080→8000) masks production asset paths — never hardcode URLs
- Frappe owns sessions, auth, and CSRF — React is a consumer, not the authority

#### State Authority (three layers, each has its role)

- **Frappe session**: company context, user identity — server-authoritative, never duplicate in Zustand alone
- **Zustand stores**: UI state, cached API data — refreshable, not the source of truth for auth/tenant
- **URL/Router**: current page, entity IDs — must remain bookmarkable and shareable

#### New Feature Checklist (minimum 6 touch points)

1. `types/{domain}.ts` — type definitions
2. `api/{domain}Api.ts` — API client with transforms
3. `stores/{domain}Store.ts` — Zustand store (state + actions)
4. `components/{domain}/` — UI components (desktop + mobile)
5. `routes/` — route file (auto-regenerates `routeTree.gen.ts`)
6. Backend: `@whitelist` endpoint with `require_active_company()` guard

#### State Machine Compliance

- Status changes MUST go through `is_valid_transition()` — no direct assignment
- Health worker and facility have SEPARATE state graphs
- Invalid transitions must throw, not silently fail

#### Security

- CSRF token required on all mutations (API client handles it; custom fetches must too)
- Role checks enforced on BOTH frontend (UI gating) and backend (permission guard)
- Never rely on frontend-only permission checks

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-29
