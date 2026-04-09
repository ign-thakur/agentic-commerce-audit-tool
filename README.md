# AI Commerce Audit Tool

This project is a `Next.js` app that generates an AI-readiness audit for ecommerce stores.

The product flow is:

1. Homepage: capture website URL and email
2. Loading screen: simulate report generation while the audit runs
3. Report page: show scores, priorities, breakdown, roadmap, and CTA

## Tech Stack

- `Next.js` App Router
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI` primitives
- `lucide-react` icons

## Project Structure

```text
Audit_tool/
|-- app/
|   |-- api/
|   |   `-- audit/route.ts          # POST endpoint that returns the audit report
|   |-- loading/page.tsx            # Timed loading experience before report page
|   |-- report/page.tsx             # Final audit report UI
|   |-- globals.css                 # Global styles
|   |-- layout.tsx                  # App shell
|   `-- page.tsx                    # Homepage / lead capture entry
|
|-- components/
|   |-- landing/                    # Homepage sections
|   |   |-- hero.tsx
|   |   |-- header.tsx
|   |   |-- social-proof.tsx
|   |   |-- how-it-works.tsx
|   |   |-- features.tsx
|   |   |-- cta-section.tsx
|   |   `-- footer.tsx
|   |
|   |-- report/                     # Report page building blocks
|   |   |-- score-card.tsx
|   |   |-- priorities.tsx
|   |   |-- category-breakdown.tsx
|   |   |-- roadmap.tsx
|   |   |-- report-header.tsx
|   |   `-- report-cta.tsx
|   |
|   `-- ui/                         # Shared UI primitives
|
|-- lib/
|   |-- audit.ts                    # Core audit engine and scoring logic
|   `-- utils.ts                    # Shared utility helpers
|
|-- public/                         # Static assets like logo/images
|-- styles/                         # Extra styles if needed
|-- package.json
`-- README.md
```

## Core Files To Know

### 1. `app/page.tsx`

Homepage entry point.

What it does:

- renders the landing page sections
- captures `url` and `email`
- stores them in `sessionStorage`
- redirects the user to `/loading`

If you want to change the first-page flow, start here.

### 2. `app/loading/page.tsx`

Intermediate loading screen.

What it does:

- reads the stored URL from `sessionStorage`
- calls `/api/audit`
- shows a timed loading experience
- redirects to `/report` once the audit is ready

If you want to change timing, animation, progress states, or stage text, edit this file.

### 3. `app/api/audit/route.ts`

API route for audit generation.

What it does:

- accepts `POST` requests
- reads the input URL
- calls `runAudit()` from `lib/audit.ts`
- returns the final audit JSON

This is the bridge between frontend and audit engine.

### 4. `lib/audit.ts`

Main audit engine.

What it does:

- fetches homepage and sample product pages
- derives signals such as:
  - sitemap
  - robots
  - schema coverage
  - pricing coverage
  - attribute coverage
  - description coverage
  - cart coverage
  - platform inference
- scores the 5 audit categories:
  - `LLMs.txt`
  - `Markdown Response`
  - `AI Integrations`
  - `MCP / Agent Connectivity`
  - `GEO / Smart JSON-LD / Schema`
- builds the final report object:
  - `score`
  - `status`
  - `categories`
  - `summary`
  - `priorities`

If you want to change scoring or audit logic, this is the main file.

### 5. `app/report/page.tsx`

Final report page container.

What it does:

- reads the generated report from `sessionStorage`
- prepares the final layout
- passes data into report components

If you want to change report hierarchy or which sections appear, edit this file.

## Report Components

### `components/report/score-card.tsx`

Shows:

- overall score
- score status
- short summary with optional see-more toggle

### `components/report/priorities.tsx`

Shows:

- top high-level priorities from the audit

### `components/report/category-breakdown.tsx`

Shows:

- category list with scores
- accordion-based breakdown for each category

### `components/report/roadmap.tsx`

Shows:

- phased roadmap based on the weakest and strongest categories

### `components/report/report-cta.tsx`

Shows:

- final conversion CTA

## Data Flow

```text
Homepage
  -> save URL/email in sessionStorage
  -> /loading
  -> call /api/audit
  -> runAudit() in lib/audit.ts
  -> store returned report in sessionStorage
  -> /report
  -> render final audit
```

## Session Storage Keys

The app currently uses:

- `auditUrl`
- `auditEmail`
- `auditReport`

These are set on the homepage and consumed on loading/report pages.

## How To Run

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Where To Edit What

### Change homepage messaging

Edit:

- `app/page.tsx`
- `components/landing/*`

### Change loading screen experience

Edit:

- `app/loading/page.tsx`

### Change audit scoring or category logic

Edit:

- `lib/audit.ts`

### Change report layout or UX

Edit:

- `app/report/page.tsx`
- `components/report/*`

### Change shared UI primitives

Edit:

- `components/ui/*`

## Notes

- `issues-list.tsx` exists under `components/report/`, but the current report flow is centered around score, priorities, category breakdown, roadmap, and CTA.
- The report is intentionally driven by `sessionStorage` right now, so page-to-page transitions stay simple.
- The loading screen and report page are presentation-heavy; the actual audit logic lives in `lib/audit.ts`.

## Recommended Reading Order

If you are new to this codebase, read files in this order:

1. `app/page.tsx`
2. `app/loading/page.tsx`
3. `app/api/audit/route.ts`
4. `lib/audit.ts`
5. `app/report/page.tsx`
6. `components/report/*`

That will give you the full product flow from lead capture to final report.