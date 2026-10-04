# Website Health Checker

Free, no-login website audit: one URL → one scan → one explainable health report.
No AI, no database, no accounts. Scores come from deterministic rules applied to real signals.

## Structure

```
apps/
  web/        Next.js (App Router) + TypeScript + Tailwind v4 — landing site + report UI
  scanner/    Fastify + TypeScript — crawler, audit rules, scoring, in-memory job queue
packages/
  shared/     Domain types (modules, severity, report, scan job), scoring, URL parsing
```

### Scan pipeline (`apps/scanner/src/scan/run-scan.ts`)

`Discover → Inspect → Test → Score → Explain`

| Layer           | Folder         | Responsibility                                                       |
| --------------- | -------------- | -------------------------------------------------------------------- |
| Network         | `net/`         | SSRF-safe HTTP client, TLS inspection                                |
| Crawl           | `crawl/`       | Homepage, robots.txt/sitemap, page crawl, asset sizing, probes        |
| Audit modules   | `audit/modules/` | One file per area (seo, security, performance, accessibility, mobile, links, content). Each is `(AuditContext) => Issue[]` |
| Technology      | `audit/technology/` | Table-driven signatures (`signatures.ts`) — add a row to teach a new tech |
| Browser         | `browser/`     | Playwright + Chromium: lab Core Web Vitals, mobile layout, axe-core accessibility, console errors, screenshot. Every request passes an SSRF guard |
| Jobs            | `scan/`        | In-memory queue + TTL store (reports expire after 30 min)             |
| API             | `routes/`      | `POST /api/scans`, `GET /api/scans/:id`, rate-limited                 |

Adding a check = add one `check()`/`forEach()` call in a module; scoring and the report UI pick it up automatically.

### Security model

The scanner fetches user-supplied URLs, so: only public IPs are reachable (checked on the URL *and* on the
resolved address at connect time, including every redirect hop), ports are restricted, responses are
size/time-capped, and `POST /api/scans` is rate-limited per IP with a bounded queue.
`ALLOW_PRIVATE_HOSTS` exists for local development only.

### Web conventions (`apps/web/src`)

| Folder               | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `app/`               | Routes only — thin pages that compose features/components          |
| `components/ui/`     | Generic, reusable primitives (Button, Section, ScoreRing, …)       |
| `components/layout/` | Site chrome (header, footer, page hero)                            |
| `components/motion/` | Shared animation primitives (Reveal, CountUp, MotionProvider)      |
| `features/<name>/`   | Feature modules: `components/`, `data/`, `hooks/`, `lib/`          |
| `content/`           | Copy shared across features                                        |
| `config/`            | Site metadata and navigation                                       |

Rules: design values live only in `app/globals.css` tokens; the platform is **light theme only**;
copy lives in `data/`/`content/` files, not inline in JSX.

## Develop

```bash
npm install
cp apps/scanner/.env.example apps/scanner/.env   # optional
npm run dev:all        # web → http://localhost:3000, scanner → http://localhost:4100
npm run typecheck && npm run lint && npm run build
```

Put `PSI_API_KEY` in the repo-root `.env` (or `apps/scanner/.env`) to use Google PageSpeed Insights for
Core Web Vitals (incl. real-user INP). Without it, vitals are measured in the scanner's own browser.

First-time setup also needs the browser binary: `npx playwright install chromium`.
Docker: `docker build -f apps/scanner/Dockerfile -t whc-scanner .` (uses the official Playwright image).

## Not built yet

`/checks` and `/how-it-works` full content, sharing beyond the 30-minute in-memory window.
SEO checks read the server-rendered HTML; JS-only content (e.g. an H1 injected client-side) can be reported as missing.
