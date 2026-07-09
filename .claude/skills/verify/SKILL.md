# Verify: Atlantic Premier Experience

React 19 + Vite + Tailwind SPA against the TC Leisure sandbox API.

## Build / launch

```bash
npm run dev -- --port 5199    # dev server (background)
npm run build                  # tsc + vite build
npm run lint
```

## Drive

Playwright with the **system Chrome channel** (`chromium.launch({ channel: 'chrome' })`) —
the ms-playwright cache may not match the installed playwright version, but system
Chrome always works. Install playwright in a scratch dir, not the repo.

**Use `launchPersistentContext` with a reusable profile dir.** A fresh browser
context has empty localStorage, which triggers a full API crawl (products
pagination + 6 static-data endpoints + inventory). The sandbox rate-limits hard
(429s) after 2-3 fresh crawls; a persistent profile crawls once and reuses
localStorage after that. If you hit 429s, wait ~90s.

First load with an empty profile takes up to 60-90s before event cards render
(full product crawl). Subsequent loads are instant.

## Flows worth driving

- `/` hero + search + carousel with from-prices (inventory sync lands ~5s after cards)
- `/fixtures` — competition select, team combobox, month chips; filters live in URL params (deep-link `?month=YYYY-MM` should filter)
- `/teams` → `/team/:slug` (slugs are client-generated from team names)
- `/event/:id/:slug` — ticket quantity selects, total math, Add to cart (stub alert)
- Bad routes: `/team/not-a-real-team`, `/event/99999999/x` → friendly not-found states

## Gotchas

- API returns products of type `event` with `match: null` — any code reading `product.match.*` must guard (crashed the whole app once).
- Sandbox inventory only exists for a small subset of products; cards without inventory show "See tickets", genuinely sold-out ones show "Sold out". Don't read "few prices" as a bug.
- Console shows periodic sync logs; 429 errors mean rate limit, not app breakage.
