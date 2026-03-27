# PR: License Application Detail Pages, Affiliation UX Cleanup, Chart Fixes, and Theme Updates

## Summary

Replaces the right-side drawer for license applications with full detail pages, redesigns the
facility application page layout for better UX, fixes the donut chart component, makes Application
ID columns sticky, removes all approve/reject CTAs from affiliations (regulator is view-only), adds
Compliance360 header logo, updates sidebar branding, and applies new primary color theme with dark
mode text contrast fixes.

## Changes

### License Application Detail Pages (New)

Replaced the `ApplicationDrawer` with dedicated full-page routes for reviewing and actioning license
applications:

- **`/license-management/facility-application/$applicationId`** — full-page facility application
  review with Issue/Deny/Request Info action buttons
- **`/license-management/professional-application/$applicationId`** — full-page professional
  application review with the same action flow

Both pages load application data via TanStack Router loaders using new single-fetch API functions
(`getFacilityApplication`, `getProfessionalApplication`).

### Facility Application Page Redesign

- **Full-width layout** — removed narrow 260px sidebar; data cards now use a responsive 2-column
  grid (Facility Details + Location & Contact side-by-side)
- **Application Details** spans full width with 4-column grid; documents use 3-column grid
- **Clear action flow** — replaced confusing dropdown + "Submit" button pattern with three direct
  action buttons (Issue/Deny/Request Info) in the top bar. Clicking one scrolls to a decision
  section with a single clearly-labeled submit button (e.g. "Issue License", not "Submit")
- **Page heading** — H1 "New Facility License Application" with facility name, registration number,
  and status badge inline
- **Audit trail info** moved inline below the heading as compact metadata

### Professional Application Page

- Matches facility page patterns: full-width layout, tighter spacing (260px sidebar removed),
  centered with `max-w-6xl`
- Same action button flow as facility page

### API Extensions (`licensingApi.ts`)

- Extended `LicenseApplication` type with 16 new fields (location, contact, operational details)
- Extended `ProfessionalLicenseApplication` type with 10 new fields
- Added `applicationId` filter to both list endpoints
- Added `getFacilityApplication()` and `getProfessionalApplication()` single-fetch functions
- Added `updateFacilityApplicationStatus()` and `updateProfessionalApplicationStatus()` status
  update functions

### Sticky Application ID Column

- `ApplicationsTable` and `ProfessionalApplicationsTable` — Application ID column is now the only
  sticky column with a right border (previously both ID and Name were sticky)

### StatusDistribution Chart Fix

- Fixed single-segment (360) SVG arc bug — renders a `<circle>` instead of a collapsed arc path when
  one status has 100% of data
- Fixed empty data crash (`Math.max(...[])` returning `-Infinity`)
- Fixed SVG fill colors — replaced `fill-card`/`fill-foreground` CSS classes with inline
  `fill="var(--card)"` for proper SVG rendering
- Added "No data available" empty state for both pie and bar modes

### Affiliation Detail Page

- Removed duplicate `AppLayout` wrapper (parent layout already provides it)
- Redesigned layout: 2-column grid for Professional + Facility cards, full-width Affiliation
  Information with 4-column grid

### Affiliations — Remove All CTAs

The regulator does not approve or reject affiliations; they only view status. Removed:

- **`$affiliationId.tsx`** — removed Approve/Reject buttons and handlers
- **`AffiliationsDashboard.tsx`** — removed Approve/Reject buttons from pending items (now "View"
  only), renamed "Review Pending" to "View Pending"
- **`AffiliationsView.tsx`** — removed bulk approve/reject bar, confirmation dialogs, and all
  related state/handlers

### LicenseManagementView Cleanup

- Removed `ApplicationDrawer` import and all drawer-related state
- Row click handlers now navigate to detail pages

### Header Logo

- Added Compliance360 SVG logo in the header bar between the sidebar collapse button and the page
  title, separated by vertical splitters

### Sidebar Branding Update

- Removed logo image from sidebar header
- Collapsed sidebar now shows an avatar with the first character of the regulator name
- Expanded sidebar shows regulator name and subtitle as text only

### Theme: Primary Color Update (`#11b5a1`)

- Changed `--primary` to `#11b5a1` (oklch(0.694 0.123 181.083)) in both light and dark themes
- Updated `--primary-foreground` to match the new hue

### Dark Mode Button Text Contrast

- Default button variant (`button.tsx`): added `dark:text-background` for readable dark text on teal
  background
- Default badge variant (`badge.tsx`): added `dark:text-background`
- Dashboard buttons (`MainDashboard.tsx`): added `dark:text-background` to hardcoded `bg-primary`
  buttons

## Files Changed

### Frontend (`frontend/src/`)

| File                                                                    | Change                                                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `api/licensingApi.ts`                                                   | Extended transforms, added filters, single-fetch and status update functions  |
| `types/license.ts`                                                      | Added 26 new fields across both application types                             |
| `components/licensing/FacilityApplicationPage.tsx`                      | **New** — full-page facility application review                               |
| `components/licensing/ProfessionalApplicationPage.tsx`                  | **New** — full-page professional application review                           |
| `routes/license-management/facility-application.$applicationId.tsx`     | **New** — route with loader                                                   |
| `routes/license-management/professional-application.$applicationId.tsx` | **New** — route with loader                                                   |
| `components/licensing/LicenseManagementView.tsx`                        | Removed drawer, navigate to detail pages                                      |
| `components/licensing/ApplicationsTable.tsx`                            | Sticky ID column only, navigate on click                                      |
| `components/licensing/ProfessionalApplicationsTable.tsx`                | Sticky ID column only, navigate on click                                      |
| `components/licensing/ApplicationsDashboard.tsx`                        | Minor cleanup                                                                 |
| `components/dashboard/StatusDistribution.tsx`                           | Fixed 360 arc bug, empty data, SVG fills                                      |
| `routes/affiliations/$affiliationId.tsx`                                | Removed AppLayout, removed CTAs, redesigned layout                            |
| `components/affiliations/AffiliationsDashboard.tsx`                     | Removed approve/reject CTAs, view-only                                        |
| `components/affiliations/AffiliationsView.tsx`                          | Removed bulk approve/reject bar and dialogs                                   |
| `components/AppLayout.tsx`                                              | Removed sidebar logo, added header logo, cleaned up unused state              |
| `components/MainDashboard.tsx`                                          | Added `dark:text-background` to bg-primary buttons                            |
| `components/ui/button.tsx`                                              | Added `dark:text-background` to default variant                               |
| `components/ui/badge.tsx`                                               | Added `dark:text-background` to default variant                               |
| `index.css`                                                             | Updated `--primary` and `--primary-foreground` for both light and dark themes |

### Public Assets

| File                                  | Change                              |
| ------------------------------------- | ----------------------------------- |
| `frontend/public/compliance-logo.svg` | **New** — Compliance360 header logo |

## Testing

- [ ] Visit `/license-management/applications` — click Edit on a facility app, verify full page
      loads
- [ ] On facility detail page — click Issue/Deny/Request Info buttons, verify decision section
      appears with correct label
- [ ] Submit an action with remarks, verify status updates
- [ ] Visit `/license-management/applications` — switch to Professional tab, click Edit, verify page
      loads
- [ ] Scroll tables horizontally — verify only Application ID column is sticky with right border
- [ ] Visit `/license-management` dashboard — verify Application Status Distribution chart renders
      (test with single status)
- [ ] Visit `/affiliations/$id` — verify no Approve/Reject buttons, read-only view
- [ ] Visit `/affiliations` dashboard — verify no Approve/Reject on pending items
- [ ] Visit `/affiliations/list` — verify no bulk action bar
- [ ] Verify Compliance360 logo appears in header between collapse button and page title
- [ ] Verify sidebar shows regulator name text (expanded) or first-character avatar (collapsed), no
      logo image
- [ ] Toggle dark mode — verify primary-colored buttons and badges have dark readable text
- [ ] Verify primary color is teal (`#11b5a1`) across both light and dark modes
