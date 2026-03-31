# Careverse Regulator — Frontend Design Language

**This is the canonical UI/UX reference for all frontend work in `careverse_regulator`.**

Written for:

- Product and UX decisions
- Frontend implementation
- AI-assisted module generation

If any new UI work conflicts with this document, update this document first, then implement.

---

## 1. Product Context

Careverse Regulator is a company-scoped operational portal for healthcare regulatory bodies managing licenses, inspections, affiliations, and compliance.

**Core UX context:**

- One active regulator company per user session
- Operator workflow — not marketing, not consumer
- Fast scanning of risk, queues, and required actions
- Professional, authoritative, institutional tone

**Header identity contract:**

- Top-right MUST show:
  - Line 1: `Username`
  - Line 2: `Agency / Company`
- Never hardcode regulator names in UI
- Always read from boot/context payload

---

## 2. Design Philosophy

**Corporate Clarity.** The application is primarily used by government and regulatory staff — professionals with high data density tolerance and a strong need for trust, clarity, and predictability.

**Core principles:**

1. **Professional over decorative** — No gradients for the sake of aesthetics, no micro-animations that slow workflows. The UI is a tool.
2. **Scannable at a glance** — Status is always visually obvious. Hierarchy is communicated through layout, not just color.
3. **Mobile-first, desktop-enhanced** — Build for small screens first; layer in density and multi-column layout as screen width increases.
4. **Consistent over creative** — Use existing patterns. An agent building a new module should produce UI indistinguishable from existing modules.
5. **Dark mode is not optional** — Every component must work in both light and dark modes from the start.

---

## 3. Design System: shadcn/ui + Tailwind CSS 4

The project uses **shadcn/ui** with Radix UI headless primitives and **Tailwind CSS 4** (CSS-first configuration).

**DO NOT import `antd` or any Ant Design packages.** Ant Design has been removed from the frontend. CSS bridge tokens may remain in `index.css` from the migration — do not copy those patterns.

### Component ownership

shadcn/ui components live in `src/components/ui/` — they are owned by the project, not imported from a library. Customize them in place. Never recreate alternatives.

### Token decision tree

| You are styling...                               | Use                       | Example                                       |
| ------------------------------------------------ | ------------------------- | --------------------------------------------- |
| shadcn/ui component (button, card, input, badge) | Tailwind semantic classes | `bg-card`, `text-foreground`, `border-border` |
| App shell (header, sidebar, page background)     | Portal CSS variables      | `var(--portal-bg)`, `var(--portal-surface)`   |
| Glass/elevated shell surface                     | Portal CSS variables      | `background: var(--portal-surface)`           |
| Chart / data visualization                       | Chart tokens              | `hsl(var(--chart-1))`                         |

**Rule of thumb:** Feature components → Tailwind classes. Shell/layout code → portal variables. Never mix.

---

## 4. Color System

### Primary palette (teal)

| Purpose                                    | Token                        | Value                             |
| ------------------------------------------ | ---------------------------- | --------------------------------- |
| Primary actions, active nav, focus accents | `--primary` via `bg-primary` | teal `oklch(0.694 0.123 181.083)` |
| Brand accent (shell)                       | `--portal-teal`              | `#0f766e`                         |
| Success/approved status                    | `text-teal-700 bg-teal-50`   | —                                 |

Never use blue/purple as a primary — the portal is locked to the teal family.

### Semantic color tokens (shadcn/ui OKLch)

All components must use Tailwind semantic classes. **Never use raw hex or OKLch values in components.**

| Token                  | Tailwind class                        | Usage                    |
| ---------------------- | ------------------------------------- | ------------------------ |
| `--background`         | `bg-background`                       | Page background          |
| `--foreground`         | `text-foreground`                     | Primary text             |
| `--card`               | `bg-card`                             | Card/surface background  |
| `--card-foreground`    | `text-card-foreground`                | Card text                |
| `--primary`            | `bg-primary` / `text-primary`         | Primary actions, accents |
| `--primary-foreground` | `text-primary-foreground`             | Text on primary          |
| `--secondary`          | `bg-secondary`                        | Secondary surfaces       |
| `--muted`              | `bg-muted`                            | Muted backgrounds        |
| `--muted-foreground`   | `text-muted-foreground`               | Secondary/hint text      |
| `--destructive`        | `bg-destructive` / `text-destructive` | Destructive actions      |
| `--border`             | `border-border`                       | Borders                  |
| `--input`              | `border-input`                        | Input borders            |
| `--ring`               | `ring-ring`                           | Focus rings              |

Dark mode values are applied automatically via the `.dark` class. No manual `dark:` overrides needed for these tokens.

### Portal shell tokens

| Token                     | Light                    | Dark                   | Usage           |
| ------------------------- | ------------------------ | ---------------------- | --------------- |
| `--portal-bg`             | `#f4f7fb`                | `#08101d`              | App background  |
| `--portal-bg-deep`        | `#edf2f7`                | `#0b1728`              | Deep background |
| `--portal-surface`        | `rgba(255,255,255,0.82)` | `rgba(15,23,42,0.68)`  | Glass surfaces  |
| `--portal-surface-strong` | `rgba(255,255,255,0.92)` | `rgba(15,23,42,0.82)`  | Solid surfaces  |
| `--portal-text`           | `#0f172a`                | `#e2e8f0`              | Shell text      |
| `--portal-body`           | `#334155`                | `#cbd5e1`              | Body text       |
| `--portal-muted`          | `#64748b`                | `#94a3b8`              | Muted text      |
| `--portal-teal`           | `#0f766e`                | `#0f766e`              | Brand accent    |
| `--portal-danger`         | `#dc2626`                | `#dc2626`              | Danger accent   |
| `--portal-border`         | `#d8e1eb`                | `rgba(71,85,105,0.48)` | Shell borders   |

### Semantic status colors

Status colors must be used consistently across ALL domains:

| Semantic                      | Tailwind (light)             | Tailwind (dark)                            | Use for                         |
| ----------------------------- | ---------------------------- | ------------------------------------------ | ------------------------------- |
| Success / Active / Approved   | `text-teal-700 bg-teal-50`   | `dark:text-teal-400 dark:bg-teal-950/30`   | Active licenses, approved items |
| Warning / Attention           | `text-amber-700 bg-amber-50` | `dark:text-amber-400 dark:bg-amber-950/30` | Expiring, pending review        |
| Danger / Rejected / Suspended | `text-red-600 bg-red-50`     | `dark:text-red-400 dark:bg-red-950/30`     | Rejected, suspended, revoked    |
| Info / In Review              | `text-cyan-700 bg-cyan-50`   | `dark:text-cyan-400 dark:bg-cyan-950/30`   | Under review, processing        |
| Neutral / Pending             | `text-slate-500 bg-slate-50` | `dark:text-slate-400 dark:bg-slate-800/30` | Pending, draft, inactive        |

**Never use raw hex values for status colors.** Never use color alone to convey status — always pair with a text label.

---

## 5. Typography

### Font stack

| Role           | Font                                      | Tailwind class | Weights       |
| -------------- | ----------------------------------------- | -------------- | ------------- |
| Body (default) | Public Sans → Manrope → Plus Jakarta Sans | (inherit)      | 400–700       |
| Headings       | Roboto Variable                           | `font-heading` | 500, 600, 700 |

**Never introduce new font families.** Use the existing stack.

### Type scale

| Level                | Size                 | Weight                | Usage                        |
| -------------------- | -------------------- | --------------------- | ---------------------------- |
| H1 / Page title      | 28px (`text-2xl`)    | 700 (`font-bold`)     | Page titles                  |
| H2 / Section heading | 24px (`text-xl`)     | 700 (`font-bold`)     | Section headings             |
| H3 / Subsection      | 20px (`text-lg`)     | 600 (`font-semibold`) | Subsection headings          |
| H4 / Card title      | 16px (`text-base`)   | 600 (`font-semibold`) | Card titles, labels          |
| Body                 | 14px (`text-sm`)     | 400–500               | Default text                 |
| Small / Metadata     | 13px (`text-[13px]`) | 500                   | Secondary text, metadata     |
| XS / Badge / Caption | 12px (`text-xs`)     | 500                   | Badges, captions, timestamps |
| XXS / Micro label    | 11px (`text-[11px]`) | 500                   | Micro labels, overlines      |

**Rules:**

- Default body text is `text-sm` (14px) — not `text-base` (16px)
- Use `font-semibold` (600) for most headings; `font-bold` (700) for page titles only
- Use `text-muted-foreground` for secondary text — never `text-gray-500`
- Avoid `text-muted-foreground` at sizes below 14px (contrast risk) — use `text-foreground` for XS/XXS
- Keep line-height generous (`leading-normal` or `leading-relaxed`) for data-dense surfaces
- Letter-spacing only on uppercase labels: `tracking-wide uppercase text-xs`

---

## 6. Spacing & Layout

### Spacing scale (4px base unit)

| Tailwind        | px   | Primary use             |
| --------------- | ---- | ----------------------- |
| `gap-1` / `p-1` | 4px  | Tight inline            |
| `gap-2` / `p-2` | 8px  | Compact element spacing |
| `gap-3` / `p-3` | 12px | Default element spacing |
| `gap-4` / `p-4` | 16px | Card padding (mobile)   |
| `gap-5` / `p-5` | 20px | Section spacing         |
| `gap-6` / `p-6` | 24px | Card padding (desktop)  |
| `gap-8` / `p-8` | 32px | Major section gaps      |

### Border radius

| Tailwind       | Value | Usage                    |
| -------------- | ----- | ------------------------ |
| `rounded-sm`   | ~4px  | Inputs, small elements   |
| `rounded-md`   | ~6px  | Buttons, form controls   |
| `rounded-lg`   | ~7px  | Default component radius |
| `rounded-xl`   | ~10px | Cards, panels            |
| `rounded-2xl`  | ~13px | Large cards, modals      |
| `rounded-full` | 999px | Badges, pills, avatars   |

### Shadow pattern

- Light mode cards: `shadow-md border border-border/60`
- Dark mode cards: `dark:shadow-none dark:border-foreground/15`
- Modals / overlays: `shadow-xl`

### App shell dimensions

| Element                   | Value  | Tailwind / CSS                |
| ------------------------- | ------ | ----------------------------- |
| Header height             | 64px   | `h-16`, sticky, `z-40`        |
| Sidebar (expanded)        | 256px  | `w-64`                        |
| Sidebar (collapsed)       | 80px   | `w-20`                        |
| Sidebar (mobile drawer)   | 288px  | full overlay                  |
| Content max-width         | 1360px | `max-w-[1360px]`              |
| Content padding (desktop) | 24px   | `p-6`                         |
| Content padding (mobile)  | 16px   | `p-4`                         |
| Table row min-height      | 44px   | `min-h-[44px]` (touch target) |

---

## 7. Responsive Design — Mobile First

**The frontend is mobile-first.** Start with the mobile layout, then enhance for larger screens using shadcn breakpoints and Tailwind's responsive prefix system.

### Breakpoints (shadcn/Tailwind standard)

| Name             | Width      | Tailwind prefix | Layout strategy                             |
| ---------------- | ---------- | --------------- | ------------------------------------------- |
| Mobile (default) | `< 640px`  | (no prefix)     | Single column, stacked, full-width          |
| sm               | `≥ 640px`  | `sm:`           | Wider single column, minor adjustments      |
| md               | `≥ 768px`  | `md:`           | Two-column grids, sidebar appears           |
| lg               | `≥ 1024px` | `lg:`           | Data tables, multi-column, sidebar expanded |
| xl               | `≥ 1280px` | `xl:`           | Full layout, maximum density                |
| 2xl              | `≥ 1536px` | `2xl:`          | Wide-screen optimizations                   |

The `useResponsive()` hook maps these to `isMobile` (`< 768px`), `isTablet` (`768–1199px`), `isDesktop` (`≥ 1200px`) for programmatic layout switching.

### Mobile layout (default — no prefix)

```tsx
// Grids: single column
<div className="grid grid-cols-1 gap-4">

// Content padding
<main className="p-4">

// Forms: single column
<div className="grid grid-cols-1 gap-4">

// Table → card switch
{isMobile ? <DomainCardList /> : <DomainTable />}
```

### Tablet layout (`md:` prefix)

```tsx
// Grids: two columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Sidebar: collapses to icon-only
// Filter bar: may wrap to second row
```

### Desktop layout (`lg:` prefix)

```tsx
// Grids: three or four columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Full tables with all columns
// Multi-column forms: grid-cols-2
// Sidebar: always expanded
```

### Responsive rules for agents

- **Mobile-first always** — write the default styles for mobile, add `md:` / `lg:` for wider screens
- **Never CSS-only for layout switching** — use `useResponsive()` hook when conditionally rendering different components (Table vs Card)
- **Touch targets** — minimum 44px height on all interactive elements at all breakpoints
- **Full-width inputs on mobile** — `w-full` is the default; constrain width only on `lg:`
- **Tables replaced by cards on mobile** — these are separate components, not responsive variants of the same component

### Responsive grid pattern

```tsx
// KPI / metric cards
<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Content + sidebar layout
<div className="flex flex-col lg:flex-row gap-6">

// Form fields
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

---

## 8. Component Patterns

### Card

Standard card pattern:

```tsx
<Card className="rounded-xl border border-border/60 bg-card shadow-md dark:shadow-none dark:border-foreground/15">
  <CardHeader>
    <CardTitle className="text-base font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Status badge

Each domain has its own `StatusBadge.tsx` mapping status values to semantic colors. Always use a `Badge` component — never a colored `<span>`:

```tsx
// Example pattern
const STATUS_STYLES: Record<string, string> = {
  active: 'text-teal-700 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/30',
  pending: 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/30',
  rejected: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
}

<Badge className={cn('rounded-full text-xs font-medium', STATUS_STYLES[status])}>
  {label}
</Badge>
```

### Button hierarchy

| Priority    | Variant          | Usage                                                     |
| ----------- | ---------------- | --------------------------------------------------------- |
| Primary     | `default` (teal) | One per view — "Save", "Submit", "Create"                 |
| Secondary   | `outline`        | "Cancel", "Back", "Reset"                                 |
| Destructive | `destructive`    | "Delete", "Revoke", "Suspend" — needs AlertDialog confirm |
| Toolbar     | `ghost`          | Icon buttons, "More options"                              |
| Inline      | `link`           | Within text — "View details"                              |

**Maximum one primary button per visible context.**

### Forms

```tsx
// React Hook Form + Zod schema — always
// Single column on mobile, two columns on md+
<form>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Field label="Field name" error={errors.field?.message}>
      <Input {...register("field")} />
    </Field>
  </div>
  <div className="flex gap-3 mt-6">
    <Button type="submit" disabled={isSubmitting}>
      Save
    </Button>
    <Button type="button" variant="outline">
      Cancel
    </Button>
  </div>
</form>
```

### Tables vs cards

- **Desktop** (`lg:`): Use `<Table>` component with all columns
- **Mobile** (default): Use card list — separate component, not a responsive variant

```tsx
const { isMobile } = useResponsive()

return isMobile ? <DomainCardList data={data} /> : <DomainTable data={data} />
```

### Empty states

Every empty state must include a reason and a next action — no dead-end messages:

```tsx
<Empty
  icon={<FileX className="size-8 text-muted-foreground" />}
  title="No licenses found"
  description="No licenses match your current filters."
  action={
    <Button variant="outline" onClick={clearFilters}>
      Clear filters
    </Button>
  }
/>
```

### Loading states

Use `<Skeleton>` for content area loading, `<Spinner>` for action loading:

```tsx
// Content loading
{
  isLoading ? <Skeleton className="h-[300px] w-full rounded-xl" /> : <DomainTable />
}

// Action loading
;<Button disabled={isSubmitting}>
  {isSubmitting && <Spinner className="mr-2 size-4" />}
  Submit
</Button>
```

### Feedback (toasts)

Every mutation requires a toast on both success AND failure:

```tsx
try {
  await approveLicense(id)
  toast.success("License approved")
} catch {
  toast.error("Failed to approve license. Please try again.")
}
```

---

## 9. App Shell Architecture

### Global shell

- **Header**: 64px height, sticky, glassmorphic (`bg-card/80 backdrop-blur-lg`)
- **Sidebar**: 256px expanded, 80px collapsed icon-only
- **Content**: `p-4` (mobile) → `p-6` (desktop), `max-w-[1360px]` centered on dashboard pages

### Header zones

```
[ Menu toggle ] [ Page context: eyebrow + title ]    [ Notifications | Theme | User identity ]
```

- **Left**: hamburger/toggle + page context (eyebrow label + title)
- **Right**: notifications, theme toggle, user identity (username + agency)

### Sidebar

- Primary navigation only — no secondary/utility links
- Group routes under section labels
- Active item visually obvious in both themes
- Icon + label aligned consistently
- Mobile: replaced with Drawer overlay

### Responsive shell behavior

| Breakpoint            | Sidebar                        | Header                                  |
| --------------------- | ------------------------------ | --------------------------------------- |
| Mobile (`< 768px`)    | Hidden; hamburger opens Drawer | Compact — avatar only for user identity |
| Tablet (`768–1199px`) | Collapses to icon-only         | Reduced density                         |
| Desktop (`≥ 1200px`)  | Always expanded                | Full context and user meta              |

---

## 10. Module Page Structure

Every module page follows this structure:

1. **Command/overview card** — establishes tenant context, surfaces immediate actions
2. **Key metrics strip** — KPI cards (responsive grid)
3. **Work queue / priority list** — filterable table (desktop) or cards (mobile)
4. **Supporting activity panel** — audit log, related items, risk panel

### Command card requirements

```tsx
// Must include:
// - Context label (eyebrow)
// - Concise title
// - One-sentence operational subtitle
// - 1–2 primary actions

<Card>
  <CardHeader>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">License Management</p>
    <CardTitle>Facility Licenses</CardTitle>
    <CardDescription>Review and manage facility licensing queue.</CardDescription>
  </CardHeader>
  <CardContent>
    <Button>New Application</Button>
  </CardContent>
</Card>
```

### KPI cards

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardContent className="pt-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Licenses</p>
      <p className="text-2xl font-bold mt-1">142</p>
      <p className="text-xs text-teal-600 mt-1">+3 this month</p>
    </CardContent>
  </Card>
</div>
```

---

## 11. Navigation & Information Hierarchy

### URL structure

- Base path: `/compliance-360`
- Route segments: kebab-case
- Dynamic segments: `$paramName`
- All sub-routes handled by TanStack Router (client-side)

### Breadcrumbs

All detail pages show breadcrumbs:

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/compliance-360/licenses">Licenses</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>License #1234</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Detail pages over modals

**Use route-based detail pages** for all entity views. Modals are only permitted for:

1. Destructive confirmations (AlertDialog)
2. Simple creation forms with ≤6 fields

Never nest modals. Never use a modal for entity review.

---

## 12. Forms & Data Entry Standards

- **Library**: React Hook Form + Zod schema validation (always)
- **Required fields**: Visually marked (asterisk or label suffix)
- **Validation**: Inline error messages below the field — never hidden behind color alone
- **One primary action, one secondary action** per form
- **Submit button**: Disabled during submission, shows Spinner inside
- **Field layout**: Single column on mobile (`grid-cols-1`), two columns on `md:` (`md:grid-cols-2`)
- **Helper text**: Only where it prevents errors — not decorative

---

## 13. Tables & Lists

- **Prioritize scan order**: status badge is the first visual element in rows and cards
- **Sort affordances**: column headers must be clickable for sortable columns
- **Row height**: minimum 44px (touch target compliance)
- **Sticky actions**: only for high-volume workflows (>50 rows)
- **Pagination**: always paginate — never load all records
- **Desktop**: full `<Table>` component with all columns
- **Mobile**: card-based list — entirely separate component

### Filter bar (required on all list views)

Minimum: search input + status filter + sort. All three:

```tsx
<div className="flex flex-col sm:flex-row gap-3">
  <Input placeholder="Search..." className="sm:w-64" />
  <Select>...</Select>
  <Button variant="outline">Sort</Button>
</div>
```

Filter changes reset pagination to page 1. Filters are persisted in the domain Zustand store.

---

## 14. Motion & Interaction

| Element        | Duration | Property                                |
| -------------- | -------- | --------------------------------------- |
| Button hover   | 0.15s    | background-color, border-color          |
| Card hover     | 0.16s    | transform (translateY -1px), box-shadow |
| Focus ring     | 0.15s    | ring appearance                         |
| Page entrance  | 0.28s    | translateY 8px → 0, opacity             |
| Disabled state | instant  | opacity → 0.5                           |

**Rules:**

- Maximum transition duration: **0.28s**
- No spring physics, no bouncing, no ornamental loops
- Hover effects on interactive elements only — not static content
- New animations should use Tailwind `motion-safe:` prefix

---

## 15. Accessibility Standards

**Target: WCAG 2.1 AA**

- Body text contrast: `≥ 4.5:1` (normal), `≥ 3:1` (large text, ≥18px regular or 14px bold)
- Avoid `text-muted-foreground` at sizes below 14px — use `text-foreground` instead
- All interactive elements keyboard-reachable via Tab
- Focus ring visible on all focusable elements (3px ring, `ring/50` opacity)
- Icon-only buttons require `aria-label` and `<Tooltip>`
- Status badges always include text — never color alone
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<section>`, `<table>`
- Tables use `<th scope="col">` for column headers
- Form fields linked to labels via `htmlFor`/`id`
- Escape closes overlays (dialogs, sheets, dropdowns)

### Dark mode contract

- All components must work in both light and dark modes
- No white card backgrounds without an explicit dark variant
- Surfaces, borders, and text must switch together
- Dark mode sync: `useThemeBridge()` hook synchronizes Zustand store → `data-theme` attribute + `.dark` class simultaneously

---

## 16. Copy & Tone

**Voice:** Operational, precise, neutral. Action-oriented. No marketing language.

| Prefer                 | Avoid                             |
| ---------------------- | --------------------------------- |
| `Open licensing queue` | `Explore licensing possibilities` |
| `Review application`   | `Discover this application`       |
| `Approve` / `Reject`   | `Accept` / `Decline`              |
| `42 pending items`     | `You have some items to check`    |

---

## 17. Multi-Tenancy & Identity

**All module UIs must respect company-scoped tenancy:**

- Never hardcode regulator/company names
- Always show active company in user identity context
- Any company/regulator label must come from boot/context payload

**Header identity:**

- Line 1: `Username`
- Line 2: `Company / Agency`

---

## 18. AI Implementation Contract

When generating or modifying module UI:

1. Use existing shell patterns in `AppLayout.tsx`
2. Use shadcn/ui components from `components/ui/` — never recreate
3. Use Tailwind semantic classes for component styling; portal CSS variables for shell only
4. Implement mobile-first: default styles for mobile, `md:` and `lg:` for larger screens
5. Implement both light and dark styles together — use `.dark:` Tailwind variants where needed
6. Add dark-mode overrides for any hardcoded light surface
7. Keep spacing on 4px base (Tailwind `gap-*`, `p-*` scale)
8. Keep typography weights restrained: `font-semibold` (600) default, `font-bold` (700) for page titles
9. Maintain top-right identity contract: `Username + Agency`
10. Never hardcode regulator/company content
11. Validate with lint + build before handoff
12. Use `useResponsive()` hook for conditional layout switching — not CSS `hidden`/`block` alone
13. Never use `antd` — it has been removed

---

## 19. Definition of Done for New Module UI

A module is UI-complete only if:

- [ ] Mobile layout is implemented first, desktop enhanced with `md:` / `lg:` prefixes
- [ ] shadcn/ui components used — no custom recreations
- [ ] Shell integration matches existing header/sidebar/content pattern
- [ ] Light mode and dark mode both pass readability checks
- [ ] Primary workflows represented: overview, list/queue, detail
- [ ] Empty states implemented (reason + action)
- [ ] Loading states implemented (Skeleton for content, Spinner for actions)
- [ ] Error states with retry option
- [ ] Toast feedback on all mutations (success + failure)
- [ ] No hardcoded tenant/regulator data in visuals
- [ ] Status badges use semantic color tokens
- [ ] Keyboard navigation works throughout
- [ ] All interactive elements have minimum 44px touch target
- [ ] Icon-only controls have `aria-label` + Tooltip
- [ ] Lint and build pass

---

## 20. Technical References

Primary files to consult:

- `frontend/src/components/AppLayout.tsx` — App shell layout
- `frontend/src/index.css` — CSS custom properties (shadcn tokens + portal variables)
- `frontend/src/hooks/useResponsive.ts` — Responsive hook
- `frontend/src/components/ui/` — All shadcn/ui primitives
- `frontend/src/lib/utils.ts` — `cn()` utility

---

## 21. Change Control

Any major deviation from this design language must:

1. Update this document first with rationale
2. Include before/after screenshots in both light and dark mode
3. Include accessibility and contrast impact assessment
4. Receive explicit approval before merge

Any palette change requires an explicit update to Section 4 with rationale and screenshots.

---

**Last Updated:** 2026-03-31
**Framework:** React 19 + TypeScript + shadcn/ui + Tailwind CSS 4 + Radix UI
**Maintained By:** Development Team
