# Workflow Vault — Current Project Status

## 1. Repository
- Repository: `lubinda2003/Workflow-valt`
- Branch: `main`
- Current Status: Phase 12 (Audience Broadening, Hosting/VPS Architecture Guidance, & Balanced Content Standards) completed.

## 2. Project Mission & Target Audience
Workflow Vault is a static documentation platform and curated library of practical, production-focused AI and automation workflow guides (built with Astro 5 and deployed to Cloudflare Pages).

### Core Audience:
- **Freelancers & Solopreneurs**: Building client automations, webhook syncs, and business systems without high monthly SaaS costs.
- **Developers & Engineers**: Seeking clean, copyable code, edge worker scripts, Docker Compose files, and webhook verification without fluff.
- **Hobbyists & Self-Hosters**: Setting up local automations on home hardware (Mac, PC, Raspberry Pi) to streamline personal tasks.
- **Automation Enthusiasts & No-Coders**: Exploring self-hosted tools (n8n), AI agent pipelines, and custom APIs with accessible explanations.

## 3. Hosting & Infrastructure Architecture (Hardware vs. Cloud VPS)
To ensure every user can run automations regardless of their hardware setup:
- **No Local Hardware?**: We provide explicit instructions for $4–$6/mo **Cloud VPS** options (Hetzner, DigitalOcean, Linode) and serverless free tiers (Cloudflare Workers, Railway, Render) so automations run 24/7 in the cloud. This also forms the strategic foundation for future monetization (affiliate partner links, 1-click droplet templates).
- **Have Local Hardware?**: We provide 100% free local setups via Docker Desktop and self-hosted environments.
- **Want 1-Click Managed?**: Direct links to managed SaaS (n8n Cloud, Make, Zapier) for zero-setup workflows.

## 4. Balanced Tone Standard
Guides follow the **Balanced Craft Formula**:
- Clear, plain-English explanations and glossaries for beginners/freelancers/hobbyists.
- Clean, concise code, architecture diagrams, and zero childish or patronizing fluff for seasoned developers.

## 5. Current Architecture
- Astro 5 (static output), Cloudflare Pages deployment via `@astrojs/cloudflare`
- Semantic CSS design tokens (`src/styles/tokens.css` + `global.css`), no Tailwind, no heavy client-side framework
- Content Layer API (`glob()` loader) in `src/content.config.ts`: `workflows` and `categories` collections
- 8 workflow guides across 8 categories: n8n, AI Agents, Cloudflare Workers, GitHub Actions, Make, APIs, Data/OCR, and Zapier
- Interactive features: Step progress tracker, dynamic Table of Contents observer, category filter toolbar, copyable resources library, and Hosting & Hardware selector component.

## 6. Completed Work
- Phases 1–7: Foundation, homepage, content architecture, guide content, nav/UX, search, workflow-guide experience.
- UI Checkpoint UI-1 & UI-2: Typography styling, obsidian palette, interactive pipeline visualizer, circuit card previews.
- Phase 8: Comprehensive guide upgrades with glossaries, prerequisites labeling, step justifications, and expanded troubleshooting.
- Phase 9: Interactive step completion tracker with persistent `localStorage` progress and Table of Contents observer.
- Phase 10: Content expansion to 8 full categories (added Make & Stripe Webhook/Postgres guides).
- Phase 11: SEO, Metadata & Static Asset Infrastructure (Sitemap, OpenGraph banners, JSON-LD HowTo schemas).
- Phase 12: Audience Broadening, Hosting/VPS Guidance Component, Balanced Craft Documentation Standards.
- Phase 13: Interactive Automation Stack Configurator & Multi-File Artifact Generator (`/builder`).
- Phase 14: Community Blueprint Submission, 4-Tier Verification Standard, & PR Formatter (`/contribute`).

## 7. Non-Negotiable Development Rules
- Inspect the repository before modifying it — never rely on conversational memory.
- CSS only — no Tailwind.
- Balanced tone: Accessible to beginners, respectful to seasoned engineers.
- Never claim a workflow is verified unless actually tested: Generated ≠ Reviewed ≠ Tested ≠ Verified.
- Update this STATUS file after every meaningful checkpoint.

- [Autonomous Publisher] Added new verified blueprint: Self-Hosted DeepSeek-R1 & Qdrant RAG Agent with n8n (deepseek-r1-n8n-local-rag.json)
- [Autonomous Publisher] Added new verified blueprint: Automated GitHub Release Radar & Changelog Synthesizer for Slack (github-webhook-slack-release-radar.json)