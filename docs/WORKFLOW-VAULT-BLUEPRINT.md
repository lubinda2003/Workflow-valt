# Workflow Vault — Master Project Documentation & Handover Blueprint

**Status:** Living document. Last updated: 2026-08-12, after Phase 7 (Workflow Experience).
**Repository:** `lubinda2003/Workflow-valt` (this repository is the single source of truth — this document is a summary of its actual, inspected state, not a plan or aspiration unless explicitly labeled "Future").

This document exists so that another Claude account, a human developer, or any other AI agent can read it and continue development on Workflow Vault correctly, without needing access to the original conversation history.

---

## 1. What Workflow Vault is

Workflow Vault is a static website of production-ready AI automation workflow guides, built with Astro and deployed on Cloudflare Pages. It is intended to become a practical resource for **AI Automation Workflows & Implementation Guides** — helping people build real, useful automations using AI, APIs, automation platforms (n8n, Make, Zapier), cloud services (Cloudflare, GitHub Actions), and developer tools.

### Project vision (agreed direction)

Workflow Vault should **not** simply publish generic AI-generated tutorials. The long-term goal is:

> Generate practical workflows, test/verify them where technically possible, and publish detailed implementation guides that ordinary users can actually follow.

Guides should eventually be understandable to: beginners, non-developers, developers, indie hackers, automation builders, and technical users. **The site must not be designed exclusively for experienced developers** — this is an explicit, repeated project requirement (see Section 7).

### Who it's for

Freelancers, indie hackers, small agencies, and developers who want working automations, not marketing pages about automation.

---

## 2. Content categories

**Categories actually present in the repository** (`src/content/categories/`, 8 entries, verified):

| Slug | Name | Workflows currently in this category |
|---|---|---|
| `ai-agents` | AI Agents | 1 (Claude + Notion) |
| `n8n` | n8n | 1 (n8n Docker + Caddy) |
| `make` | Make | 0 |
| `zapier` | Zapier | 1 (Zapier migration) |
| `github-actions` | GitHub Actions | 1 (GitHub Actions deploy) |
| `cloudflare-workers` | Cloudflare Workers | 1 (Cloudflare rate-limit) |
| `data-ocr` | Data & OCR | 1 (OCR receipts) |
| `apis` | APIs | 0 |

Two categories (`make`, `apis`) currently have **zero** workflows and render an empty-state message on `/categories/[slug]`. This is expected, working behavior, not a bug.

**Future intended broader scope** (not yet built out): AI Workflows, Automation, Cloud & APIs, Business Automation, Developer Workflows, Data & Integrations, Productivity Automation, Self-hosted/Open Source automation. These are directional, not committed categories — do not create new category JSON files speculatively; only add a category when real workflow content exists for it.

---

## 3. Current website architecture

- **Framework:** Astro `^5.13.5`, using the modern Content Layer API (`src/content.config.ts` at the `src` root, not the legacy `src/content/config.ts` location)
- **Adapter:** `@astrojs/cloudflare` `^12.6.0`
- **Output mode:** `static` (confirmed in `astro.config.mjs`)
- **Sitemap:** `@astrojs/sitemap` `^3.6.0` is installed and wired into `integrations: [sitemap()]`
- **`site` value in `astro.config.mjs` is still `"https://example.com"` — a placeholder, never updated to the real production domain.** This affects the generated sitemap and any canonical-URL logic. **This must be fixed before real SEO/AdSense work.**
- **Styling:** Plain CSS only. No Tailwind (removed in Phase 1; do not reintroduce). Design tokens live in `src/styles/tokens.css`, imported by `src/styles/global.css` via `@import "./tokens.css";`, which is in turn imported once by `src/layouts/BaseLayout.astro`.
- **JavaScript:** Minimal, targeted vanilla JS only, always inside `<script>` tags scoped to the component that needs it (mobile nav toggle, search/filter logic, copy-to-clipboard). No client-side framework (no React/Vue/Svelte islands anywhere in this repo). No external JS libraries.
- **Dependencies (full list, from `package.json`):** `astro`, `@astrojs/cloudflare`, `@astrojs/sitemap`, `@astrojs/rss`. That's it. `@astrojs/rss` is installed but **not currently used anywhere** — no RSS feed route exists yet.
- **TypeScript:** `tsconfig.json` extends `astro/tsconfigs/strict`. Astro frontmatter (`---` blocks) is TypeScript; inline `<script>` tags are plain JS and are not type-checked at build time.

### Routes actually implemented (verified against the repository)

| Route | File | Type |
|---|---|---|
| `/` | `src/pages/index.astro` | Static |
| `/about` | `src/pages/about.astro` | Static |
| `/resources` | `src/pages/resources.astro` | Static (explicit placeholder page) |
| `/search` | `src/pages/search.astro` | Static, client-side filtered |
| `/workflows` | `src/pages/workflows/index.astro` | Static, data-driven from collection |
| `/workflows/[slug]` | `src/pages/workflows/[slug].astro` | Static-generated per entry via `getStaticPaths` (6 pages currently) |
| `/categories` | `src/pages/categories/index.astro` | Static, data-driven from collection |
| `/categories/[slug]` | `src/pages/categories/[slug].astro` | Static-generated per entry via `getStaticPaths` (8 pages currently) |

No other routes exist. No `/about` sub-pages, no auth, no API routes, no server endpoints.

---

## 4. Content architecture

### `src/content.config.ts`

Defines two collections using Astro's Content Layer API `glob()` loader (not the legacy `defineCollection` file-based type):

- `workflows` — loads every `*.json` file in `src/content/workflows/`
- `categories` — loads every `*.json` file in `src/content/categories/`

The `difficulty` enum in the workflow schema is sourced from `src/data/difficultyLevels.js` (`DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"]`) rather than being duplicated inline — this is the single source of truth for valid difficulty values.

### Workflow schema (full, current, verified)

| Field | Type | Required | Purpose | Example (from `n8n-docker-caddy.json`) |
|---|---|---|---|---|
| `slug` | string | Yes | URL slug, must match filename | `"n8n-docker-caddy"` |
| `title` | string | Yes | Page title / card title | `"Self-host n8n with Docker + Caddy"` |
| `description` | string | Yes | Card summary / meta description | `"A production n8n stack with automatic HTTPS..."` |
| `category` | string | Yes | Must match a category's `name` (not slug) for grouping to work | `"n8n"` |
| `difficulty` | enum | Yes | One of `DIFFICULTY_LEVELS` | `"Intermediate"` |
| `readingTime` | string | Yes | Free-text display string | `"15 min"` |
| `featured` | boolean | No (default `false`) | Used by homepage Featured Workflows (currently hardcoded there, not read from this field — see Section 17 gap notes) | `true` |
| `tags` | string[] | Yes | Used for tag chips | `["n8n", "Docker", "Self-Hosted"]` |
| `tools` | string[] | Yes | Drives `ToolList`, `/search` tool filter, and `ArchitectureDiagram` | `["n8n", "Docker", "Caddy"]` |
| `cover` | string | No | Image path — **no actual cover images exist in the repo; this field is unused/unpopulated in effect** | `"/images/workflows/n8n-docker-caddy.webp"` |
| `overview` | string | Yes | Overview section body | — |
| `prerequisites` | string[] | Yes | Rendered as a checklist | — |
| `steps` | array of `{title, content, code?}` | Yes | `code` is optional per-step: `{language, code}` | — |
| `architecture` | string | Yes | Architecture section body, paired with `ArchitectureDiagram` (which is generated from `tools`, not a separate field) | — |
| `result` | string | Yes | Final Result section body | — |
| `troubleshooting` | array of `{issue, cause, fix}` | No (default `[]`) | Added in Phase 7. Renders as collapsible cards; entire section and its TOC entry only appear when non-empty | — |
| `nextSteps` | string[] | No (default `[]`) | Added in Phase 7. Renders under Final Result as "Possible Next Steps" | — |

### Category schema (full, current, verified)

| Field | Type | Required | Purpose |
|---|---|---|---|
| `slug` | string | Yes | URL slug |
| `name` | string | Yes | Display name; **must exactly string-match the `category` field on workflows** for grouping to work (grouping uses a `slugify()` comparison, not the raw category field, so casing/spacing differences are tolerated as long as they slugify to the same value) |
| `description` | string | Yes | Shown on `/categories`, `/categories/[slug]` |

### Current content inventory (verified counts)

- **6 workflow entries:** `n8n-docker-caddy`, `github-actions-deploy`, `cloudflare-rate-limit`, `claude-notion-summaries`, `zapier-migration`, `ocr-receipts-sheets` — all 6 have full guide content including `troubleshooting` and `nextSteps` as of Phase 7.
- **8 category entries:** listed in Section 2.

### `src/lib/` (data-access helpers)

- `slugify.js` — single shared slug function, used everywhere a category name needs to become a URL segment
- `workflows.js` — `getAllWorkflows()`, `getWorkflowBySlug()`, `getWorkflowsByCategorySlug()`
- `categories.js` — `getAllCategories()`, `getCategoryBySlug()`

New workflow pages are created purely by adding a JSON file to `src/content/workflows/` that satisfies the schema — `getStaticPaths()` in `[slug].astro` regenerates pages automatically from the collection at build time. **No page code needs to change to add a new workflow.**

---

## 5. Workflow guide page architecture (`/workflows/[slug]`)

Current page structure, top to bottom:

1. `WorkflowHeader` — title, description, category, difficulty badge, reading-time badge, back link, `ToolList` (which wraps `ToolTag` per tool)
2. Mobile-only `TableOfContents` (native `<details>`, no JS) inline at the top of the article
3. **Overview** (`#overview`)
4. **Prerequisites** (`#prerequisites`) — rendered as a checklist (checkmark-badge `::before` styling, not plain bullets)
5. **Step-by-step implementation** (`#steps`) — each step via `StepSection` (numbered marker, title, content, optional `CodeBlock`)
6. **Workflow architecture** (`#architecture`) — text description + `ArchitectureDiagram` (auto-generated pipeline visualization from the workflow's `tools` array — pill nodes connected by arrows, horizontal on desktop, vertical on mobile, pure CSS/HTML, no library)
7. **Final result** (`#result`) — result text + conditional "Possible Next Steps" list if `nextSteps` is non-empty
8. **Troubleshooting** (`#troubleshooting`) — only rendered if `troubleshooting` array is non-empty; each entry is a `<details>` card with Issue/Cause/Fix
9. Desktop-only sticky `TableOfContents` sidebar (220px column, hidden under 900px)
10. `RelatedWorkflows` — same-category workflows excluding the current one, max 3, reuses `WorkflowCard`

### Reusable components confirmed to exist (`src/components/content/`)

`WorkflowHeader.astro`, `StepSection.astro`, `CodeBlock.astro`, `ToolList.astro`, `ToolTag.astro`, `Badge.astro`, `RelatedWorkflows.astro`, `WorkflowCard.astro`, `TableOfContents.astro`, `ArchitectureDiagram.astro`.

`CodeBlock.astro` includes a one-click copy button: vanilla JS, a single deduplicated document-level click listener (guarded by `window.__wvCopyInit`), "Copied!" text confirmation for 1.8s, no external library.

### ⚠️ Content quality problem (explicitly identified, unresolved)

The current guides are technically well-structured but **not yet detailed enough for a true beginner**. They currently assume familiarity with terms like GitHub Actions, Cloudflare Workers, APIs, Docker, webhooks, and authentication.

**Future guides must let someone who has never used the technology understand:**
- what the technology is and why it's being used
- where to create/access accounts or tools
- what buttons/settings to select, step by step
- exactly what code to paste and where
- what the expected result looks like
- how to troubleshoot common failures (Troubleshooting sections exist now, but are currently written at an intermediate level, not a true-beginner level)

This is a **future content-system requirement**, not something implemented in this documentation task.

---

## 6. Workflow verification vision (future architecture — not implemented)

A major long-term goal is moving from **Generated** workflows (written to look correct) to **Verified** workflows (actually executed and confirmed to work). The conceptual future pipeline:

1. Research the required technologies
2. Design the workflow
3. Generate implementation files
4. Create test data
5. Create temporary/mock APIs where necessary
6. Provision test environments
7. Execute the workflow
8. Inspect outputs
9. Detect failures
10. Revise the workflow
11. Rerun tests
12. Only publish when verification requirements are satisfied

**None of this exists today.** All 6 current workflow guides were written by an AI assistant based on technical knowledge and are **unverified** — they have not been executed against real infrastructure. This must never be implied otherwise to a user.

---

## 7. Future sandbox/VPS concept (not implemented)

Future idea: a VPS used as a sandbox/playground for workflow verification, not as the site's backend (the site remains fully static). Conceptual flow:

```
GitHub Actions / future orchestration → AI/research services → temporary VPS sandbox
  → workflow execution → testing → verification → generated guide/workflow
  → GitHub → Cloudflare Pages
```

Potential future VPS uses: Docker containers, temporary databases, mock APIs, webhook endpoints, test services/repositories, temporary automation platform instances, integration/end-to-end testing.

**No VPS is configured. Do not provision one without explicit approval.**

---

## 8. Future research/API layer (not implemented)

Future pipeline may use external research/search APIs (e.g., Exa, or similar) to research current documentation, verify APIs, find current implementation details, reduce hallucination, and detect changes in third-party platforms. **No such API is installed or integrated today.**

---

## 9. Pipeline status — read this section carefully

**This is the most important distinction in this document.**

- ✅ **Website content currently exists**: 6 real, hand-authored workflow guides with full step/code/architecture/troubleshooting content, built by an AI assistant working interactively through Phases 1–7.
- ❌ **An automated content-generation pipeline does NOT exist.** Every workflow JSON file in this repository was individually written and committed by an AI assistant in direct conversation with the project owner. There is no script, workflow, or system that generates new workflow content automatically.
- ❌ **An automated workflow verification system does NOT exist.** No workflow has been executed against real infrastructure. Correctness is based on the AI assistant's technical knowledge only.
- ❌ **No VPS sandbox system exists.**
- ❌ **No research/search API integration exists.**

**Do not let the existence of 6 polished-looking guides create the impression that Workflow Vault has a working content pipeline. It does not, yet.** This is future work (Section 12, "Future roadmap").

---

## 10. Deployment

- **Platform:** Cloudflare Pages, connected to this GitHub repository (`lubinda2003/Workflow-valt`, branch `main`)
- **Adapter:** `@astrojs/cloudflare`
- **Build:** `npm run build` → `astro build`
- **Node version used in CI:** 22 (per `.github/workflows/deploy.yml`)

### Two separate build processes — do not conflate them

1. **`.github/workflows/deploy.yml`** (GitHub Actions): triggers on every push to `main`, checks out the repo, installs Node 22, runs `npm install` and `npm run build`. **This workflow only builds — it has no deploy step** (no `wrangler` action, no `cloudflare/pages-action`). It exists purely as a CI build-verification check.
2. **Cloudflare Pages' own native Git integration**: this is the actual mechanism that builds and deploys the live site. It is configured on Cloudflare's side (not visible in this repository) and is triggered independently by the same pushes to `main`.

Both processes run `npm run build` against the same code, so a GitHub Actions failure is a strong signal that the Cloudflare deploy will also fail, but they are two separate systems.

### Historical build verification

The project owner has reported that Cloudflare Pages successfully built and deployed the site, with output including `astro build` completing and Cloudflare reporting "Success: Your site was deployed!" This is documented here as **owner-reported historical confirmation**, not something independently verified by inspecting Cloudflare's dashboard directly (this assistant has no access to Cloudflare's dashboard or deploy logs). **A successful build in the past is not proof that the current `main` branch builds successfully now** — always request fresh confirmation after making changes.

### Known deployment gap

`astro.config.mjs` still has `site: "https://example.com"`. This should be corrected to the real production domain before any serious SEO work, since it affects the sitemap and any `Astro.site`-based canonical URL logic.

---

## 11. Current design/UI system

- **CSS-only, no Tailwind** (removed Phase 1). Do not reintroduce it.
- **`tokens.css`** (single source of truth for all design values):
  - Colors: `--bg:#090909`, `--surface:#111111`, `--surface-2:#191919`, `--text:#ffffff`, `--text-muted:#9b9b9b`, `--accent:#ff6b00`, `--accent-hover:#ff8533`, `--border:#252525`
  - Layout: `--container:1280px`, `--radius-sm:12px`, `--radius:18px`, `--radius-lg:28px`
  - Typography scale: `--fs-xs:.875rem` through `--fs-2xl:4.5rem`
  - Spacing scale: `--space-1:.5rem` through `--space-6:5rem`
  - `--shadow: 0 0 40px rgba(255,107,0,.12)`, `--transition:.3s ease`
- **`global.css`** imports `tokens.css`, then defines resets, base typography, `.container`, `.button`, `.card`, `.grid` utility classes
- Dark theme, orange accent, card-based layouts throughout, generous spacing
- **Navigation**: sticky header, active-page highlighting (prefix-matched against `Astro.url.pathname`), working hamburger mobile menu (vanilla JS toggle, native `<details>` used elsewhere for TOC/troubleshooting)
- **Responsive**: breakpoints generally at 900px and 600px across components

### ⚠️ UI dissatisfaction (explicitly recorded project feedback)

The current UI works technically, but **the project owner is not satisfied with the overall visual design.** It's described as feeling too generic. A UI reference was provided earlier in the project but was not adequately communicated to the AI assistant during implementation, so it was not followed. **Future visual work should aim for a much more distinctive, polished product aesthetic** — the stated quality bar is closer to Vercel, Linear, or Supabase, but **Workflow Vault should have its own visual identity, not copy theirs.** No redesign has been authorized yet — do not redesign without explicit approval.

---

## 12. SEO and AdSense readiness

**Currently implemented:**
- `@astrojs/sitemap` integration is active (generates a sitemap at build time)
- Every page sets a `title` and `description` via `BaseLayout`
- Semantic HTML structure (headings, `<article>`, `<nav>`)

**Confirmed missing (verified — no `public/` directory exists in the repository at all):**
- No `robots.txt`
- No favicon
- No Open Graph / Twitter card images or meta tags beyond title/description
- No `public/` folder of any kind, so no static assets can currently be served outside what Astro processes
- `astro.config.mjs`'s `site` is still the placeholder `https://example.com` (see Section 10)
- No structured data / JSON-LD
- No AdSense script or ads.txt

None of this should be implemented as part of documentation work — it's listed here as a known gap for future prioritization.

---

## 13. Monetization direction

**Current direction: advertising-first.** There is no current plan to make the entire site premium/paywalled.

**Possible future directions** (not implemented, not committed):
- Keep most workflow resources freely available
- Introduce access restrictions or paywalls for selected high-value/premium workflows
- Potential downloadable assets (templates, workflow exports, boilerplates) as part of a future "Resources" build-out — this is the stated reason Phase 8 was originally going to be "downloads/assets," before this documentation task took priority

This is future planning only.

---

## 14. Search (`/search`) — current implementation

- Fully static at build time: `getAllWorkflows()`, `getAllCategories()`, and `DIFFICULTY_LEVELS` are all resolved server-side; every card is rendered using the existing `WorkflowCard` component with `data-*` attributes (title, description, category, difficulty, tools) attached to a wrapper div
- Filtering is a small vanilla-JS progressive enhancement: toggles `display: none` on non-matching cards
- **Category filter** (chips, from `getAllCategories()`), **Difficulty filter** (chips, from `DIFFICULTY_LEVELS`), **Tool filter** (chips, computed as the unique set of every workflow's `tools[]`) — all combined with **AND logic**; free-text search matches title OR description, AND'd with the other three filters
- Results counter and empty-state message included
- No JavaScript framework, no client-side data fetching, no external search library — degrades gracefully with JS disabled (filters simply become inert; all cards remain visible and readable)
- **This is entirely separate from the future external research/search API concept in Section 8** — that future layer is for the content-generation pipeline researching third-party documentation, not for end-user site search.

---

## 15. Completed phases (chronological project history, verified against commit history)

Repository has 100+ commits spanning **2026-07-30 to 2026-08-12**. Timeline below is reconstructed from actual commit messages and timestamps, not memory.

**Pre-Claude scaffold (2026-07-30, by the project owner via GitHub web UI):**
`README.md`, `deploy.yml`, initial `index.astro`, `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `global.css`, `tokens.css`, `Hero.astro`, `Stats.astro`. Note: this scaffold used Tailwind initially and had inconsistent import depths that later caused build failures (see Section 16).

**Phase 1 — Foundation Cleanup** (2026-07-30): Removed Tailwind dependency from `package.json` and `astro.config.mjs`; consolidated `global.css` to import `tokens.css` as the single source of truth, eliminating duplicate CSS variables.

**Phase 2 — Homepage & core UI** (2026-07-30): Built `FeaturedWorkflows`, `Categories`, `Features`, `CTA` homepage sections; polished `Footer`; wired everything into `index.astro`.

**Phase 3 — Content architecture** (2026-08-03): Created `content.config.ts` with `workflows` and `categories` collections; added all 6 workflow and 8 category JSON files (metadata only at this stage); built `lib/` data-access helpers, `Badge`, `ToolTag`, `WorkflowCard`; built `/workflows`, `/workflows/[slug]`, `/categories`, `/categories/[slug]` routes.

**Phase 3.1** (2026-08-03): Added missing `/categories` index page.

**Verification + Fix phase** (2026-08-03 to 2026-08-05): A verification pass discovered `src/pages/workflows/index.astro` had never actually been overwritten by an earlier Phase 3 commit (a pre-existing file at that path silently blocked the write due to a missing `sha` in the API call) — it was still serving old hardcoded placeholder content. Fixed with the correct `sha`. A second, more severe bug was found afterward: both `workflows/index.astro` and `categories/index.astro` used `../` (single level) instead of `../../` (correct, two levels) in their relative imports, since both files live one directory deeper than a normal page — this broke the Cloudflare build entirely (`BaseLayout cannot be resolved`). Both were corrected. A minor CSS bug (`var(--muted)` instead of `var(--text-muted)` in `Hero.astro`) was also found and fixed.

**Phase 4 — Workflow guide content & structure** (2026-08-03 to 2026-08-04): Extended the workflow schema with `overview`, `prerequisites`, `steps`, `architecture`, `result`; wrote full guide content for all 6 workflows; built `CodeBlock`, `StepSection`, `ToolList`, `WorkflowHeader`, `RelatedWorkflows` components; upgraded `/workflows/[slug]` into the full guide layout.

**Homepage Refactor** (2026-08-05): Converted the homepage from a long scroll into a shorter gateway page — kept Hero, Featured Workflows, a trimmed 4-item Categories preview (with "View all" link), and a shrunk CTA; moved `Stats` and `Features` to a new `/about` page; added a `/resources` placeholder page; added Resources to primary navigation.

**Phase 5 — Homepage & Navigation UX** (2026-08-05): Restored a "Why Workflow Vault" (`Features`) section to the homepage; added active-page highlighting to the header nav; added a working hamburger mobile menu (the previous mobile nav was simply `display: none` with no way to reach it).

**Phase 6 — Search & Discovery** (2026-08-05): Built `/search` with category/difficulty/tool filtering as described in Section 14; added Search to primary navigation.

**Phase 7 — Workflow Experience** (2026-08-07 to 2026-08-09): Added `TableOfContents` (sticky desktop / collapsible mobile, no JS); added one-click copy buttons to `CodeBlock`; added `ArchitectureDiagram` (derived from existing `tools` data, no schema change); extended the schema with optional `troubleshooting` and `nextSteps` fields and populated real content for all 6 workflows; restyled prerequisites as a checklist. A mobile-only horizontal-overflow bug in the new Table of Contents grid layout was found (via user-reported screenshots) and fixed — root cause was a CSS Grid track-sizing issue where the mobile breakpoint's `1fr` column lacked the `minmax(0, ...)` treatment needed to let a wide, non-wrapping code block shrink instead of forcing the whole page wider.

---

## 16. Known technical history / lessons learned

1. **GitHub API file writes without a `sha` can silently fail against pre-existing files.** If a file already exists at a given path, an API write that omits the current `sha` returns an error but may look like a transient/harmless glitch — always verify the actual live content after any "sha wasn't supplied"-type error rather than assuming success.
2. **Relative import depth must match actual file nesting exactly.** `src/pages/workflows/index.astro` and `src/pages/categories/index.astro` are one directory deeper than `src/pages/index.astro` and therefore need `../../` not `../` to reach `src/layouts/` or `src/lib/`. This exact mistake broke the Cloudflare build once already — always sanity-check import depth against the file's actual path before committing new nested pages.
3. **Cloudflare's build failure and GitHub Actions' build failure are correlated but not identical systems** — see Section 10.
4. **This assistant cannot execute `npm run build`, run a browser, or access Cloudflare's dashboard from its working sandbox.** All build verification must happen via the project owner checking GitHub Actions and/or Cloudflare Pages directly and reporting back.
5. **A CSS Grid track with no explicit `minmax(0, ...)` will expand to fit non-wrapping content** (like `white-space: pre` code blocks), even if the element itself has `overflow-x: auto` — the overflow property never gets a chance to activate if the track already grew to accommodate the content. This caused the Phase 7 mobile overflow bug and is worth remembering for any future grid layout containing code blocks.

---

## 17. Non-Negotiable Development Rules

1. Do not make large uncontrolled changes.
2. Work in clearly defined phases.
3. Do not modify unrelated files.
4. Prefer one focused change at a time.
5. Preserve the existing architecture unless a change is explicitly approved.
6. Use CSS only; do not reintroduce Tailwind.
7. Reuse existing design tokens (`tokens.css`) rather than inventing new values.
8. Do not invent content when real repository data is available — inspect the repo first.
9. Verify actual repository state before claiming something exists.
10. Never claim a workflow works unless it has actually been tested, or clearly label it as unverified (see Section 9).
11. Build verification should happen through GitHub Actions/Cloudflare when local execution isn't available — this assistant cannot run builds itself.
12. Keep the website beginner-friendly (see Section 5's content quality problem).
13. Do not start the next phase until the current phase is reviewed and confirmed.
14. Do not redesign the UI without explicit approval (see Section 11's UI dissatisfaction note).
15. Do not introduce a VPS/backend prematurely.
16. Keep future architecture modular so verification infrastructure can be added later without a rewrite.

---

## 18. Current gaps

| Area | Current status | Gap | Priority |
|---|---|---|---|
| Guide depth | 6 full guides with steps/code/architecture/troubleshooting | Content is technically complete but not truly beginner-friendly (Section 5) | High |
| Beginner friendliness | Guides assume intermediate technical knowledge | Needs a rewrite pass or a new content standard | High |
| Workflow verification | Not implemented | No workflow has ever been executed/tested | High (long-term) |
| Automated content pipeline | Not implemented | Every guide is hand-authored by an AI assistant in conversation | High (long-term) |
| Search/research APIs | Not implemented | No external research layer exists | Medium (long-term) |
| UI polish | Functional, on-brand color system, but owner is not satisfied | Needs a distinctive redesign pass (Section 11) | Medium |
| SEO | Sitemap integration exists | Placeholder `site` domain, no robots.txt, no OG tags, no `public/` folder at all | High before launch |
| AdSense readiness | Not started | Needs a real domain, SEO basics, and content volume first | Medium |
| Documentation | This document, just created | Needs to be kept current (Section 20) | Ongoing |
| Testing | None | No automated tests of any kind exist in this repo | Medium |
| VPS sandbox | Not implemented | Future verification infrastructure | Low (until pipeline work begins) |
| Monetization | Direction decided (ads-first), not implemented | No ads, no paywall infrastructure | Low |
| Workflow request feature | Not implemented, not designed | Users currently have no way to request a workflow guide | Low |
| `featured` schema field | Exists in schema, defaults `true` on all 6 entries | `FeaturedWorkflows.astro` on the homepage currently uses its own hardcoded list of 6 workflows rather than reading `featured` from the collection — worth reconciling later | Low |
| `cover` schema field | Exists in schema | No actual cover images exist anywhere in the repo; field is decorative/unused in practice | Low |
| RSS | `@astrojs/rss` installed | No RSS route exists | Low |

---

## 19. Future roadmap (staged, not committed dates)

1. **Content quality** — make guides genuinely beginner-friendly and substantially more detailed (Section 5)
2. **Workflow verification** — design and build automated testing around generated/existing workflows (Section 6)
3. **Pipeline** — build and test an actual automated content-generation system (currently does not exist — Section 9)
4. **Research layer** — add external search/research APIs to reduce hallucination in generated content (Section 8)
5. **Verification sandbox** — introduce a VPS/container sandbox once the pipeline and verification concepts are proven (Section 7)
6. **SEO/AdSense readiness** — fix the placeholder domain, add `robots.txt`, OG tags, `public/` assets, then pursue indexing and AdSense (Sections 12, 13)
7. **UI redesign** — create a stronger, distinctive visual identity once explicitly approved (Section 11)
8. **User workflow requests** — potential future feature letting users request specific guides
9. **Downloads/assets** — the originally-planned "Phase 8," deferred in favor of this documentation task; ties into future monetization (Section 13)

---

## 20. Claude Handover

**Current repository state:** Clean, builds have been reported green by the project owner as of the most recent Phase 7 commits (2026-08-09, plus the mobile-overflow fix). No pending broken commits are known.

**Last completed phase:** Phase 7 — Workflow Experience (Table of Contents, copy-code buttons, architecture diagrams, checklist prerequisites, troubleshooting, next steps).

**Last verified deployment:** Reported successful by the project owner following the Phase 7 mobile-overflow fix (commit `fix: resolve mobile horizontal overflow in workflow guide layout...`, 2026-08-09T14:42:43Z). Not independently verified via Cloudflare dashboard by this assistant — see Section 10.

**Current known issues:**
- `astro.config.mjs` has a placeholder `site` domain
- No `public/` folder, `robots.txt`, favicon, or OG images exist
- `README.md` is stale — still lists Tailwind CSS as part of the tech stack, which was removed in Phase 1
- `FeaturedWorkflows.astro` on the homepage uses a hardcoded list rather than the `featured` schema field
- Guide content is not yet beginner-friendly enough (Section 5)

**Current priorities (per project owner, most recent direction):** Documentation first (this file), then originally Phase 8 was planned as downloads/assets tied to future monetization — confirm with the project owner before starting any new feature phase.

**Next recommended task:** Confirm with the project owner whether to (a) proceed to Phase 8 (downloads/assets), (b) address the content quality/beginner-friendliness gap first, or (c) fix the SEO gaps (placeholder domain, robots.txt, OG tags) before adding more features. Do not assume — ask.

**Things that must not be changed without approval:**
- The content collection schema's existing required fields (adding new *optional* fields is fine and has precedent)
- `tokens.css` values
- The Tailwind-free CSS architecture
- The overall Astro static-site architecture (no framework migration, no server rendering mode change)

**Important architectural decisions:**
- Content Layer API (`glob()` loader), not the legacy content collections API
- All new workflow pages are created purely by adding a JSON file — never hardcode a workflow into a page
- Category grouping matches on `slugify(workflow.category) === category.slug`, not a direct string match
- Search/filtering is static-generation + vanilla-JS progressive enhancement, not a client framework

**Important project-owner preferences:**
- Work in small, reviewable phases; do not bundle unrelated changes
- Wants real GitHub Actions/Cloudflare build confirmation before considering a change "done," but has also explicitly said not to over-formalize this into a hard stop-and-wait ritual for every single commit — use judgment based on risk
- Is not satisfied with the current UI's genericness and wants a more distinctive future redesign, but has not approved starting one
- Cares specifically about guides being usable by true beginners, not just developers
- The eventual bigger vision includes a verified (not just generated) workflow pipeline, a research API layer, a VPS sandbox, and ad-based monetization — all future, all currently unimplemented

---

## 21. Documentation maintenance rule

> This blueprint must be updated whenever a major phase is completed, an architectural decision changes, a significant feature is added, a known issue is resolved, or the project's next priorities materially change.

It is intended to function as Workflow Vault's long-term memory across conversations and, if necessary, across different Claude accounts.
