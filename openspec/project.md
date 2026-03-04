# Project Context

## Purpose
Tsunfimeistrid ("Guild Masters") is a searchable database of Estonian craft guild masters from the 16th–20th centuries. Built for the Estonian Academy of Arts (EKA) and the Estonian Heritage Conservation Board, it provides researchers and the public with a filterable interface to explore historical craftspeople, their trades, locations, and associated museum artifacts.

## Tech Stack
- **Framework:** Next.js 14 (Pages Router)
- **Language:** JavaScript (no TypeScript)
- **UI:** React 18 with functional components
- **Styling:** CSS Modules (`.module.css`) + global CSS
- **Data parsing:** PapaParse (CSV), fast-xml-parser (XML/RDF)
- **Path aliases:** `@/*` maps to project root via `jsconfig.json`
- **No linter/formatter config** — relies on IDE defaults

## Project Conventions

### Code Style
- **Components:** PascalCase filenames (`Header.js`, `FiltersPanel.js`), functional with default exports, props destructured in parameters
- **Hooks:** `use` prefix, camelCase (`useSearchData.js`, `usePersistentFilters.js`)
- **Utils/Lib:** camelCase filenames (`fetchData.js`, `parseMuisUrl.js`, `normalizeString.js`)
- **CSS Modules:** camelCase class names (`styles.container`, `styles.imageFrame`), imported as `styles`
- **Pages:** kebab-case following Next.js convention (`search.js`, `meister/[id].js`)
- **Imports:** Absolute `@/` paths throughout. Order: React → Next.js → components → utils/lib → styles
- **Error handling:** try/catch with `console.error`, optional chaining (`item?.field`), graceful fallbacks
- **No TypeScript, no PropTypes** — plain JavaScript throughout

### Architecture Patterns
- **Pages Router** (not App Router) with `pages/`, `pages/api/` structure
- **Data fetching:**
  - `getStaticProps` with ISR (`revalidate: 600`) for the search page
  - `getServerSideProps` for detail pages (`/meister/[id]`)
  - Client-side `fetch` with `AbortController` cleanup in custom hooks
- **API routes** (`/api/data`, `/api/valikud`) act as thin wrappers around Google Sheets fetching
- **State management:** React hooks (useState, useEffect, useCallback, useMemo) + URL query params + sessionStorage for filter persistence. No external state library.
- **Flat directory structure** — no nested subdirectories within `components/`, `hooks/`, `utils/`, `lib/`
- **Google Sheets as CMS** — all content is managed in a Google Spreadsheet, fetched via Google Visualization Query API

### Testing Strategy
No test framework is currently configured. No test files or test scripts exist in the project.

### Git Workflow
- `.gitignore` covers: `node_modules/`, `.next/`, `out/`, `build/`, `.env*` (except `.env.example`), lock files, `.DS_Store`, IDE folders
- No specific branching strategy or commit convention documented

## Domain Context
- **Tsunft** = Estonian word for craft guild (from German "Zunft")
- **Meister** = master craftsperson within a guild
- The "Andmed" sheet (Estonian: "Data") contains all master records with fields for name, trade/profession, city, dates, guild affiliation, and external links
- The "Valikud" sheet (Estonian: "Choices/Options") provides dropdown filter values and city-to-country mappings
- **MUIS** = Eesti Muuseumide Veebivärav (Estonian Museums Portal) — the national open cultural heritage database at `opendata.muis.ee`
- Records may link to MUIS museum objects and/or WikiMedia Commons images
- All UI text is in **Estonian**

## Important Constraints
- **Google Sheets is the single source of truth** — there is no traditional database. All CRUD happens in the spreadsheet by human editors.
- **Environment variable `SHEET_ID` is required** — the app cannot function without it
- **No authentication** — the app is public and read-only
- **Image proxying** — Next.js is configured to allow remote images from `opendata.muis.ee`, `commons.wikimedia.org`, and `upload.wikimedia.org`
- **ISR cache** — search page data is revalidated every 10 minutes; changes in the spreadsheet take up to 10 minutes to appear
- **No build-time type safety** — JavaScript-only, no compile-time checks

## External Dependencies

### Google Sheets (Primary data source)
- **API:** Google Visualization Query Language (CSV export endpoint)
- **Sheets:** "Andmed" (master data), "Valikud" (filter options / city-country map)
- **Env vars:** `SHEET_ID` (required), `DATA_SHEET_NAME`, `DATA_RANGE`, `DATA_SHEET_GID`, `VALIKUD_SHEET_NAME`, `VALIKUD_RANGE`, `VALIKUD_SHEET_GID`, `SHEET_GID`

### MUIS — Estonian Open Cultural Heritage Database
- **Base URL:** `https://opendata.muis.ee`
- **Endpoints:** `/media-list/{id}` (image list XML), `/object/{id}` (RDF/XML metadata)
- **Image CDN:** `opendata.muis.ee/dhmedia/**`

### WikiMedia Commons
- **API:** `https://commons.wikimedia.org/w/api.php` (MediaWiki API)
- **Image CDN:** `upload.wikimedia.org`
- **Used for:** Historical images linked from master records
