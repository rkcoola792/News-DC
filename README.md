# NewsDC

A modular monorepo, starting with a React frontend written in plain JavaScript and JSX, styled with Tailwind CSS.

## Getting started

Install Node.js 22.12+ (or a newer supported LTS release) and npm. From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Edit `apps/web/src/App.jsx` to begin building the UI.

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

The frontend includes folders for assets, components, pages, hooks, services, utilities, and styles. These are placeholders for upcoming designs and features; routing and UI libraries have not been added.

## Workspaces

The root uses npm workspaces for `apps/*`, `services/*`, and `packages/*`. Add a `package.json` to a placeholder module when implementing it. Install frontend dependencies from the root with `npm install <package> --workspace=@newsdc/web`.

## Environment and infrastructure

Use `.env.example` as a reference. For frontend configuration, copy the needed variables into `apps/web/.env.local`. Only browser-safe values should use the `VITE_` prefix.

`docker-compose.yml` is an empty placeholder for future infrastructure; there are no containers to start yet.

## Styling

Tailwind CSS v4 is connected through the @tailwindcss/vite plugin in apps/web/vite.config.js. The global stylesheet imports Tailwind, and App.jsx uses utility classes. Add utilities directly to your JSX; no Tailwind config file is needed for this setup.

