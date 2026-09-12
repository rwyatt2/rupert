# Rupert Web — Vois Design System Audit & Remediation Plan

Audit date: 2026-09-12  
Scope: `apps/web` (Next.js 16, Tailwind CSS v4)  
Reference: Vois design system rules — 8pt grid, 60/30/10 color, typography scale (H0–H6), Tailwind v4 `@theme`, shadcn/ui patterns, motion guidelines.

---

## Executive summary

Rupert's web UI has a consistent dark zinc aesthetic and strong brand voice (mono uppercase labels, adversarial tone). However, it is built almost entirely with ad-hoc Tailwind classes, hardcoded hex values, and duplicated patterns. It does not yet implement the Vois token layer, typography scale, shared primitives, or accessibility/motion standards.

This document catalogs every gap and organizes remediation into three waves, ordered by dependency and impact.

---

## Current state snapshot

| Area | Status | Notes |
|------|--------|-------|
| Tailwind v4 | Partial | `@import "tailwindcss"` present; no `@theme` tokens |
| shadcn/ui | Missing | No `components/ui`, no CVA, no Radix primitives |
| Typography | Ad hoc | `text-[10px]`, `text-[11px]`, mixed `text-xl`/`text-2xl`/`text-5xl` |
| Spacing | Mixed | Some 8pt values (`p-4`, `gap-4`) but also `py-1.5`, `gap-3`, `gap-1.5` |
| Color | Hardcoded | `#09090b`, `#f4f4f5`, inline zinc/emerald/amber/rose everywhere |
| Components | Duplicated | Buttons, inputs, labels, cards redefined in 10+ files |
| Motion | Partial | `fadeIn` uses `ease-out` ✓; generic `transition` elsewhere; no `prefers-reduced-motion` |
| Accessibility | Gaps | Settings close uses `✕` char; inconsistent focus rings; some missing `aria-*` |
| Debug code | Present | Agent logging `fetch` blocks in `layout.tsx` and `page.tsx` |

---

## Findings by category

### 1. Design tokens & theming (Critical)

**Issues**
- `globals.css` sets raw hex on `html, body` instead of semantic CSS variables.
- No `@theme` block mapping `--color-background`, `--color-foreground`, chart/status colors.
- No `@custom-variant dark` for consistent dark-mode scoping.
- Verdict/status colors (emerald, amber, rose) duplicated inline in 6+ components.

**Opportunity**
- Introduce semantic tokens: `background`, `foreground`, `muted`, `border`, `accent`, `destructive`, `success`, `warning`.
- Map tokens in `@theme` for Tailwind utility generation.
- Centralize score/verdict color logic in `lib/score-colors.ts`.

**Wave:** 1

---

### 2. Typography scale (High)

**Issues**
- Page titles use arbitrary sizes (`text-5xl sm:text-7xl` on landing vs `text-xl` in dashboard header).
- Labels use `text-[10px]`, `text-[11px]` — off the H5/H6 scale (12px/14px).
- Section headings mix `text-sm`, `text-base`, `text-2xl` without semantic roles.
- Rule of thirds violated: some cards show 4+ distinct text styles.

**Vois mapping (target)**

| Role | Class | Current misuse |
|------|-------|----------------|
| H0 (page title) | `text-(52)` / `text-(40)` mobile | Landing `text-7xl`, dashboard `text-xl` |
| H1 (section) | `text-4xl` / `text-(32)` mobile | Mixed `text-2xl`, `text-sm uppercase` |
| H2 (feature) | `text-2xl` | OK in some places |
| H3 (item) | `text-lg` | Score values use `text-4xl` (acceptable for data) |
| H5 (label) | `text-sm font-medium` | `text-[10px] font-mono uppercase` |
| H6 (caption) | `text-xs font-medium` | `text-[10px]` |
| Body | `text-base` | OK |
| Description | `text-sm` | OK |

**Wave:** 1 (utilities) → 2 (component migration)

---

### 3. Spacing & layout (High)

**Issues**
- Non-grid values: `py-1.5` (6px), `gap-1.5` (6px), `gap-3` (12px — acceptable), `mt-0.5`, `mb-0.5`.
- Inconsistent page padding: `p-6 md:p-12` vs `px-5 py-4` vs `px-4 py-16`.
- Card padding varies: `p-3`, `p-4`, `p-5`, `p-6` without system.

**Target**
- Standardize page shell: `px-6 py-8 md:px-8 md:py-12`.
- Card padding: `p-4` (compact) or `p-6` (default).
- Gaps: `gap-2`, `gap-4`, `gap-6`, `gap-8` only.
- Replace `py-1.5` → `py-2`, `gap-1.5` → `gap-2`.

**Wave:** 2

---

### 4. Component architecture (High)

**Issues**
- No shared `Button`, `Input`, `Label`, `Card`, `Badge` components.
- Button styles copied ~15 times with slight variations.
- Form field classes duplicated in `IdeaForm`, `SignInForm`, `SettingsModal`.
- Modal is hand-rolled without focus trap or Radix Dialog.

**Opportunity**
- Add `components/ui/` with CVA-based Button, Input, Label, Card, Badge.
- Add `lib/utils.ts` with `cn()` (clsx + tailwind-merge).
- Optional Wave 3: shadcn Dialog for SettingsModal.

**Wave:** 1 (primitives) → 2 (adoption) → 3 (Dialog)

---

### 5. Color balance — 60/30/10 (Medium)

**Issues**
- Landing and dashboard are ~90% neutral zinc with accent only on CTAs and verdict badges.
- Rose/amber/emerald used heavily in scorecard (appropriate for data semantics).
- No defined accent brand color — CTAs use `zinc-100` (neutral), not a 10% accent.

**Opportunity**
- Keep neutral base (60%) and complementary zinc layers (30%).
- Introduce a single accent token for primary actions if brand evolves; current mono aesthetic may intentionally avoid color — document decision.
- Ensure status colors are semantic tokens, not raw Tailwind palette spam.

**Wave:** 2

---

### 6. Motion & animation (Medium)

**Issues**
- `animate-fadeIn` uses `transform: translateY(6px)` without `prefers-reduced-motion` disable.
- Buttons use bare `transition` instead of `transition-colors duration-200 ease`.
- No `@media (hover: hover)` guard on hover transitions (touch devices).
- Settings modal has no enter/exit animation.

**Target**
- Wrap motion in `@media (prefers-reduced-motion: no-preference)`.
- Standardize hover: `transition-colors duration-200 ease` for color/opacity.
- Keep animations ≤ 350ms, `ease-out` for entrances.

**Wave:** 1

---

### 7. Accessibility (Medium)

**Issues**
- Settings modal close button uses `✕` without `aria-label`.
- Focus styles inconsistent (`focus:outline-none focus:border-zinc-500` vs none).
- Landing mock scorecard marked `aria-hidden` but is decorative — OK.
- Tab components (`ModeToggle`, `RedTeamTabs`, settings tabs) lack `role="tablist"` / `aria-selected`.

**Wave:** 2–3

---

### 8. Code hygiene (Critical — quick win)

**Issues**
- Debug agent logging in `app/layout.tsx` and `app/page.tsx` (localhost ingest URLs).

**Wave:** 1 (immediate removal)

---

### 9. Per-screen opportunities

#### Landing (`LandingPage.tsx`)
- H0: normalize hero title to typography scale.
- Replace `text-[11px]` labels with H6/H5.
- Header/footer padding → 8pt grid.
- Use shared Button for CTAs.
- Scanline/grid background is on-brand; keep.

#### Sign-in (`SignInForm.tsx`)
- H2 for "Sign in to Rupert".
- Shared Input/Button components.
- Error state could use Alert pattern.

#### Dashboard (`Dashboard.tsx`)
- Page shell spacing tokens.
- Banner component → shared Alert.

#### Header (`Header.tsx`)
- H3 for app title or consistent H2.
- Provider pill → Badge component.

#### Idea form / chat
- Shared form primitives.
- Section title → H2.
- `min-h-112` arbitrary — use token min-height.

#### Scorecard & results
- Consolidate `scoreColor()` / `verdictStyle()`.
- Section headers → H5 uppercase mono (brand) or H1/H2 (system) — pick one pattern.
- Progress bars: consider `aria-valuenow`.

#### History sidebar
- `max-h-[28rem]` → `max-h-112` or token.
- List item focus states.

#### Settings modal
- Dialog primitive with focus trap (Wave 3).
- Tab accessibility.
- Replace `✕` with icon + aria-label.

#### Legal pages
- H1 for title (currently `text-2xl` — should be H1/H2 per scale).

---

## Remediation waves

### Wave 1 — Foundation (complete)
- [x] This planning document
- [x] `@theme` semantic tokens in `globals.css`
- [x] Typography `@utility` classes (H0–H6, Body, Description)
- [x] `lib/utils.ts` + `lib/score-colors.ts`
- [x] `components/ui/{button,input,label,card,badge}.tsx`
- [x] Remove debug agent logs
- [x] `prefers-reduced-motion` + hover media query utilities

### Wave 2 — Component migration (complete)
- [x] LandingPage, LegalPage, SignInForm
- [x] Header, Dashboard, Banner/Alert
- [x] IdeaForm, IdeaChat, FileDropZone, ModeToggle, RunStatusBar
- [x] Scorecard, KillTriggers, RedTeamTabs, NextSteps, HistorySidebar
- [x] SettingsModal token migration + close button a11y
- [x] Spacing normalization pass (8pt grid on primary surfaces)

### Wave 3 — Polish & shadcn expansion (complete)
- [x] `npx shadcn@latest init -d` + Dialog, Tabs, Alert
- [x] SettingsModal → Radix Dialog with Tabs
- [x] ModeToggle and RedTeamTabs → shadcn Tabs
- [x] Dashboard Banner → Alert component
- [x] Focus ring system-wide (`@layer base` + `focus-ring` utility)
- [ ] Optional light mode (deferred — app remains dark-first)

---

## Success criteria

1. All colors flow from CSS variables / `@theme` — no raw hex in components.
2. Typography uses named utilities; no `text-[10px]` or `text-[11px]`.
3. Spacing values divisible by 4 or 8 only.
4. Buttons, inputs, labels imported from `components/ui/`.
5. Build passes; no visual regressions on landing, sign-in, dashboard, scorecard.
6. Debug logging removed from production paths.

---

## Risks & decisions

| Decision | Rationale |
|----------|-----------|
| Keep mono uppercase labels | Core Rupert brand; map to H5/H6 rather than removing |
| Defer full shadcn init to Wave 3 | Minimize dependency churn in Wave 1–2 |
| Keep zinc neutral CTAs | Matches adversarial/minimal brand; accent token reserved for future |
| Dark-only for now | App is dark-first; tokens structured for future light theme |
