# Careverse Regulator Frontend Design Language

This document is the canonical UI/UX context for all current and future frontend module work in
`careverse_regulator`.

It is written for:

- Product and UX decisions
- Frontend implementation
- AI-assisted module generation

If any new UI work conflicts with this document, update this document first, then implement.

---

## 1. Product Context

Careverse Regulator is a company-scoped (regulator-scoped) operational portal for licensing and
compliance operations.

Core UX context:

- One active regulator company per user session
- Operator workflow over marketing visuals
- Fast scanning of risk, queues, and actions
- Strict trust and clarity in identity, status, and ownership

Header identity contract:

- Top-right identity always shows:
  - Line 1: `Username`
  - Line 2: `Agency / Company`
- No hardcoded regulator names in UI

---

## 2. Design Values

The design language follows Ant Design enterprise principles:

- Natural: familiar enterprise patterns, no surprise interactions
- Certain: strong visual clarity of state, hierarchy, and ownership
- Meaningful: information density with purpose
- Growing: reusable patterns that scale to new modules

Navigation and hierarchy principles:

- Findability and efficiency in navigation
- Clear hierarchy through grouping and proximity
- Layout rhythm based on multiples of 8px

Reference:

- https://ant.design/docs/spec/research-navigation
- https://ant.design/docs/spec/detail-page
- https://ant.design/docs/spec/layout
- https://ant.design/docs/spec/proximity
- https://ant.design/docs/spec/introduce

---

## 3. App Shell Architecture

### Global shell

- Header height: `64px`
- Sidebar width:
  - Expanded: `260px`
  - Collapsed: `80px`
- Main content wrapper:
  - Max width: `1360px`
  - Centered

### Breakpoints (from `useResponsive`)

- Mobile: `< 768px`
- Tablet: `768px - 1199px`
- Desktop: `>= 1200px`

### Responsive shell behavior

- Desktop:
  - Persistent sidebar
  - Full header context and user meta
- Tablet:
  - Collapsed sidebar by default
  - Reduced header content density
- Mobile:
  - Drawer menu
  - Compact header controls
  - User trigger collapses to avatar button

---

## 4. Theme System and Tokens

## 4.1 Source of truth

- Ant Design theme config in:
  - `frontend/src/ThemeRoot.tsx`
- CSS variable layer in:
  - `frontend/src/index.css`
- Regulator color identity is locked to this app's token system.
- Do not import or retain external palette styles from `careverse_hq` or other apps.

Do not hardcode colors inside new components unless unavoidable. Use theme tokens and existing CSS
variables.

## 4.2 AntD token baseline

- `colorPrimary`: `#0f766e`
- `colorBgLayout`: light `#f4f7fb`, dark `#08111f`
- `colorBgContainer`: light `#ffffff`, dark `#0f1a2a`
- `colorText`: light `#111827`, dark `#e2e8f0`
- `colorTextSecondary`: light `#64748b`, dark `#94a3b8`
- `colorBorder`: light `#d8e1eb`, dark `#334155`
- `borderRadius`: `12`
- `fontFamily`: `"Public Sans", "Manrope", "Plus Jakarta Sans", "Nunito Sans", sans-serif`

## 4.3 CSS semantic variables

Primary semantic variables:

- `--portal-bg`, `--portal-bg-deep`
- `--portal-surface`, `--portal-surface-strong`
- `--portal-border`
- `--portal-text`, `--portal-body`, `--portal-muted`
- `--portal-teal`

Rule:

- New custom CSS should read from semantic variables.
- New component-level CSS should not redefine global palette.

## 4.4 Regulator palette contract (mandatory)

Canonical operational palette:

- Primary teal: `#0f766e`
- Secondary green: `#16a34a`
- Warning amber: `#d97706`
- Error red: `#dc2626`
- Light layout base: `#f4f7fb` and `#edf3f7/#e7eef5` surface gradients
- Dark layout base: `#08111f` with dark surfaces from theme tokens

Application rules:

- Primary actions, active nav states, focus accents, and key status emphasis use the green family.
- Do not swap the portal to blue/purple brand schemes unless explicitly approved in this document.
- New modules must inherit `colorPrimary` from `ThemeRoot` and semantic variables from `index.css`.
- Landing, login, unauthorized, and dashboard views must all use the same regulator palette system.

Change-control for palette edits:

- Any color-token change requires an explicit update to this section, with rationale and light/dark
  screenshots.

---

## 5. Contrast and Accessibility Standards

Minimum requirements:

- Body/primary text: WCAG AA (`>= 4.5:1`)
- Large text (>= 18px regular or 14px bold): `>= 3:1`
- Interactive/focus indicators must remain visible in both themes

Dark mode contract:

- Dark mode must not contain white card backgrounds with low-contrast light text.
- Surfaces, borders, and text must switch together.
- If a component sets fixed light background, provide explicit dark override.

Accessibility behavior:

- All actionable controls keyboard reachable
- Visible focus state for buttons, inputs, and menu triggers
- Icon-only controls require tooltips or `aria-label`

---

## 6. Typography Language

Typography goals:

- Professional and readable
- Lower visual noise
- Avoid overly heavy headings

Recommended weights:

- Body/default: `500` when needed, otherwise normal
- Section headings: `600`
- Major page title in operational shell: `500-600` (not 700/800 by default)

Recommended sizes:

- Eyebrow/overline: `10-11px`
- Secondary metadata: `12-13px`
- Body copy: `13-14px`
- Section titles: `14-16px`
- Major view titles: `16-22px` depending on container

Rules:

- Avoid large jumps in type size between neighboring hierarchy levels
- Keep line-height generous for dense data surfaces
- Use letter spacing lightly for uppercase labels only

---

## 7. Spacing, Radius, and Surface System

Spacing rhythm:

- Use multiples of 8 where possible: `8, 16, 24, 32`
- Supporting compact steps: `4, 12`

Radii:

- Primary controls/cards: `8-12px`
- Pills/tags: `999px`

Borders:

- Default subtle border on cards and interactive containers
- Avoid bevel and fake 3D effects

Shadow:

- Minimal, purpose-driven
- No heavy elevation stack
- Flat/minimal mode remains acceptable when contrast is preserved

---

## 8. Navigation and Information Hierarchy

## 8.1 Sidebar

- Primary navigation only
- Group related routes under clear section labels
- Selected item must be visually obvious in both themes
- Keep icon + label alignment consistent

## 8.2 Header

Header is a two-zone structure:

- Left zone:
  - Menu toggle
  - Context divider
  - Page context (`eyebrow + title`)
- Right zone:
  - Notifications
  - Theme toggle
  - User identity trigger (avatar + username + agency)

Do not place oversized decorative chips in header that break alignment or margin flow.

## 8.3 Content hierarchy

Each module page should follow:

1. Command/overview card
2. Key metrics strip
3. Work queues / priority lists
4. Supporting activity/log/risk panel

---

## 9. Component Patterns for Future Modules

## 9.1 Command card

Purpose:

- Establish tenant context
- Surface immediate actions

Must include:

- Context label
- Concise title
- One-sentence operational subtitle
- 1-2 primary actions

## 9.2 KPI cards

Must include:

- Metric title
- Primary value
- Delta/state indicator

Use semantic state tones:

- `critical`
- `attention`
- `steady`

## 9.3 Queue lists

Each row:

- Left: item title + supporting detail
- Right: value/time/status
- Entire row can be clickable where appropriate

## 9.4 Empty states

Must include:

- Clear reason
- Next step/action
- No dead-end text

## 9.5 Profile/admin cards

Use same card language as dashboard cards:

- Same border/radius rhythm
- Same text contrast rules

---

## 10. Forms and Tables Standards

Forms:

- One primary action, one secondary action
- Required fields clearly marked
- Inline validation messages, never hidden behind only color
- Use helper text only where it reduces errors

Tables:

- Prioritize scan order and sort affordances
- Avoid dense low-contrast row separators
- Sticky actions only for high-volume workflows
- Ensure readable row height on both desktop and tablet

---

## 11. Motion and Interaction

Motion:

- Use subtle transitions (`~150ms-220ms`)
- Prefer opacity/background/border transitions over dramatic transform
- No ornamental animation loops in operational views

Micro-interaction rules:

- Hover should confirm interactivity, not shift layout
- Focus styles must be visible and accessible
- Active state should be deterministic and not rely on color alone

---

## 12. Copy and Tone Standards

Voice:

- Operational, precise, and neutral
- Action-oriented labels
- No vague marketing language in workflow surfaces

Examples:

- Prefer: `Open licensing queue`
- Avoid: `Explore licensing possibilities`

---

## 13. Multitenancy and Identity UX Rules

All module UIs must respect company-scoped tenancy:

- Never hardcode regulator names
- Always show active company in user identity context
- Any company/regulator label must come from boot/context payload

Identity display in header:

- `Username` (line 1)
- `Company / Agency` (line 2)

---

## 14. AI Implementation Contract (For Any Future AI Agent)

When generating or modifying module UI:

1. Use existing shell patterns in `AppLayout.tsx`
2. Use existing semantic tokens and AntD theme tokens
3. Implement both light and dark styles together
4. Add dark-mode overrides for any hardcoded light surface
5. Keep spacing on 8px rhythm
6. Keep typography weights restrained (`500/600` default)
7. Maintain top-right identity contract (`Username + Agency`)
8. Never hardcode regulator/company content
9. Provide responsive behavior for mobile/tablet/desktop
10. Validate with lint + build before handoff

Output quality bar for UI changes:

- Visual hierarchy is obvious in first glance
- Text remains readable in both modes
- Components fit container bounds cleanly
- No clipped or overflowing header elements

---

## 15. Definition of Done for New Module UI

A new module is UI-complete only if:

- Shell integration matches existing header/sidebar/content pattern
- Light mode and dark mode both pass readability checks
- Primary workflows are represented (overview, queue, details)
- Empty states and loading states are present
- No hardcoded tenant/regulator data in visuals
- Lint and build pass

---

## 16. Technical References in This Repository

Primary files to consult:

- `frontend/src/ThemeRoot.tsx`
- `frontend/src/components/AppLayout.tsx`
- `frontend/src/components/DashboardView.tsx`
- `frontend/src/components/RoadmapShell.tsx`
- `frontend/src/components/ProfileView.tsx`
- `frontend/src/index.css`
- `frontend/src/hooks/useResponsive.ts`

---

## 17. Change Control

Any major deviation from this design language should include:

- Reason for deviation
- Before/after screenshots in light and dark mode
- Accessibility and contrast impact
- Explicit approval before merge
