# NewsDC

A modular monorepo, starting with a React frontend written in plain JavaScript and JSX, styled with Tailwind CSS.

## Getting started

Install Node.js 22.12+ (or a newer supported LTS release) and npm. From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The frontend currently provides preview screens with illustrative content, local bookmarks/theme, sample filters, and local reading history at `/history`. Backend ingestion, AI processing, and PostgreSQL search are not connected.

See [the feature tracker](docs/IMPLEMENTATION_STATUS.md) for the status of every catalogue item and verification evidence.

```sh
npm run build
npm run preview
```

The production build is written to `apps/web/dist`. Preview serves that build locally.

## Repository structure

```text
apps/web/           React + JavaScript + Tailwind CSS frontend, powered by Vite
services/api/       Future backend API
services/ingestion/ Future news ingestion service
services/ai-worker/ Future AI processing service
packages/shared/   Future shared utilities and contracts
packages/db/       Future database access package
database/          Future schemas, migrations, and seed data
docs/              Project documentation
.github/           Future GitHub configuration and workflows
```

The frontend includes folders for assets, components, pages, hooks, services, utilities, and styles. Routing uses React Router and icons use Lucide React. Most screen content remains a design preview; see the feature tracker for implemented behavior.

## Workspaces

The root uses npm workspaces for `apps/*`, `services/*`, and `packages/*`. Add a `package.json` to a placeholder module when implementing it. Install frontend dependencies from the root with `npm install <package> --workspace=@newsdc/web`.

## Environment and infrastructure

Use `.env.example` as a reference. For frontend configuration, copy the needed variables into `apps/web/.env.local`. Only browser-safe values should use the `VITE_` prefix.

`docker-compose.yml` is an empty placeholder for future infrastructure; there are no containers to start yet.

## Styling

Tailwind CSS v4 is connected through the @tailwindcss/vite plugin in apps/web/vite.config.js. The global stylesheet imports Tailwind, and App.jsx uses utility classes. Add utilities directly to your JSX; no Tailwind config file is needed for this setup.

## Feature verification

Run the reading-history logic checks with:

```sh
node --test apps/web/src/utils/readingHistory.test.js
```

History is stored in this browser, keeps the latest 200 unique opened items, and can be viewed or cleared at `/history`. Browser interaction verification remains pending.

## Formatting

Run `npm run format` to format supported project files with Prettier, and `npm run format:check` to verify them. Generated builds, dependencies, lockfiles, and environment files are excluded. Formatting uses two spaces, single quotes, semicolons, and a 100-character print width.

## Requirements roadmap

See [requirements in implementation order](docs/REQUIREMENTS_SEQUENCE.md) for the chronological build sequence, feature IDs, dependencies, acceptance criteria, and next planned requirement. Current completion evidence remains in the [feature tracker](docs/IMPLEMENTATION_STATUS.md).

## Local preferences

Open Discover and choose **Personalize your feed**, or visit `/preferences`. Choose any of the 14 topics and four content formats, then save. Cancel discards draft edits; Reset selections clears the draft and requires Save. Empty selections mean no specific preferences. Choices are stored in this browser. Discover uses a local preference/history-based preview order; live server ranking is not connected yet.

Run all local-state logic tests with `node --test apps/web/src/utils/*.test.js`. Preference and history browser interaction checks remain pending.

## ForYou preview ordering

On Discover, **For You (preview)** prioritizes preferred topics (two internal ordering points) and formats (one point). Unread items win equal-match ties; other ties preserve source order. No items are hidden by preferences. Topic/type/text filters still apply; Title A–Z overrides personalized ordering. Read the expandable explanation beneath the filters for details. These are ordering rules, not measured quality or relevance scores. Live recommendation signals and server ranking remain pending.
