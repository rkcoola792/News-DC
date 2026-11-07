from pathlib import Path
import re

path = Path(__file__).resolve().parents[1] / 'docs' / 'CLIENT_PRESENTATION_GUIDE.md'
text = path.read_text(encoding='utf-8')

# Real headings create navigation anchors and separate entries in Markdown viewers.
text = re.sub(r'^\*\*Question (\d+): (.+)\*\*$', r'#### Question \1\n\n\2', text, flags=re.M)
text = re.sub(r'^\*\*Answer:\*\* (.+)$', r'**Answer**\n\n\1\n', text, flags=re.M)

start = text.index('## 10 Engineering problems to explain')
end = text.index('## 11 Client question bank')
old = text[start:end]
intro, *entries = old.split('\n- ')
blocks = [intro.rstrip()]
for number, entry in enumerate(entries, 1):
    title, body = entry.strip().split(': ', 1)
    if title == 'Competing background and interactive work':
        problem = 'Background enrichment and reader questions compete for the same provider capacity.'
        solution = body
    elif title == 'Environment problems':
        problem = 'Historical logs record Docker/WSL engine recovery and sandbox loopback restrictions.'
        solution = 'Investigate and recover the development environment separately from application behavior. These incidents are environment issues, not news ingestion or AI algorithm features.'
    else:
        problem, solution = body.split('. ', 1)
        problem += '.'
    blocks.append(f'### {number} {title}\n\n**Problem**\n\n{problem}\n\n**Solution**\n\n{solution}')
text = text[:start] + '\n\n'.join(blocks) + '\n\n' + text[end:]

start = text.index('## 14 Code map for deeper study')
text = text[:start] + '''## 14 Code map for deeper study

Use this map to find the implementation behind each explanation. Paths are relative to the project root.

### Frontend screens and reader state

- `apps/web/src/app/routes.jsx`

  Maps page URLs to screen components.

- `apps/web/src/components/layout/`

  Contains the shared application shell, header and navigation.

- `apps/web/src/components/content/FeedPage.jsx`

  Builds filters, personalization arguments, pagination and export links.

- `apps/web/src/context/NewsContext.jsx`

  Connects reader state, bookmarks and theme to the interface.

- `apps/web/src/hooks/` and `apps/web/src/utils/`

  Handle local preferences, reading history, storage normalization and resource fetching.

- `apps/web/src/pages/AskAI.jsx`

  Renders questions, answers, source cards and temporary exchange history.

### API and content discovery

- `services/api/src/app.js`

  Defines HTTP setup, security headers, request IDs and consistent error handling.

- `services/api/src/routes.js`

  Defines public and operator endpoints and checks operator authorization.

- `services/api/src/content/service.js`

  Implements query validation, public eligibility, serialization, full-text filters and ranking.

### Ingestion and source processing

- `services/api/src/ingestion/sources.js`

  Defines approved sources and maps API, RSS and research responses into candidates.

- `services/api/src/ingestion/video.js`

  Retrieves bounded public metadata for supported discovered video links.

- `services/api/src/ingestion/normalize.js`

  Cleans and validates fields, canonicalizes URLs, creates fingerprints and applies initial topic rules.

- `services/api/src/ingestion/service.js`

  Coordinates ingestion, deduplication, persistence, metadata refresh and run records.

- `services/api/src/ingestion/scheduler.js`

  Coordinates opt-in scheduled ingestion and overlapping-tick protection.

- `services/api/src/ingestion/backfill.js`

  Coordinates reviewed research pages and persistent backfill progress.

### AI providers and enrichment

- `services/api/src/ai/providers.js`

  Implements provider transport, retries, fallback and validated generation.

- `services/api/src/ai/limits.js`

  Records provider attempts, usage and conservative fallback reservations.

- `services/api/src/ai/enrichment-input.js`

  Defines eligibility, evidence scope, input hashing and output currentness.

- `services/api/src/ai/enrichment-contract.js`

  Defines the structured output contract and validates supporting evidence.

- `services/api/src/ai/enrichment.js`

  Processes enrichment jobs and saves validated output transactionally.

### Assistant and background automation

- `services/api/src/ai/assistant.js`

  Retrieves evidence, validates citations and caches answers.

- `services/api/src/ai/trends.js`

  Compares topic windows and produces cached, source-linked theme reports.

- `services/api/src/ai/automation.js`

  Runs opt-in pending processing and persists pause and resume settings.

- `services/api/src/runtime.js`

  Connects ingestion, AI services and their shared runtime guards.

### Database and shared contracts

- `packages/db/prisma/schema.prisma`

  Describes the database models exposed through Prisma Client.

- `database/migrations/`

  Contains versioned PostgreSQL schema, constraint, taxonomy and index migrations.

- `packages/shared/src/taxonomy.js`

  Supplies the controlled topics shared by the frontend and backend.

### Tests and implementation evidence

- `services/api/test/`

  Contains API, ingestion, provider, enrichment, assistant and regression tests.

- `packages/db/test/`

  Contains database foundation verification.

- `apps/web/src/utils/`

  Contains local-state utilities and their automated tests.

- `docs/IMPLEMENTATION_STATUS.md` and `docs/ASSISTANT_AUTOMATION.md`

  Record historical implementation evidence, runtime checks and remaining acceptance work.

### Requirements context

`docs/MVP_SCOPE.md` and `docs/FEATURES.md` define core discovery, ingestion, AI, local-state and delivery requirements.

Dashboard, themes, exports and research/video enhancements are included P1 work.

Custom shortcuts, vector search, user accounts and cross-device synchronization remain outside the delivered MVP scope. This guide adds no application feature or dependency.
'''

# Separate each technology bullet in the source as well as the rendered document.
text = re.sub(r'(?m)^(\- .+)\n(?=\- )', r'\1\n\n', text)
# Keep paragraphs readable in raw editors without introducing forced line breaks.
import textwrap
lines=[]
for line in text.splitlines():
    if len(line)>110 and not line.startswith(('#', '- ', '  ', '`')):
        lines.append(textwrap.fill(line, width=100, break_long_words=False, break_on_hyphens=False))
    else:
        lines.append(line)
text='\n'.join(lines)
text=re.sub(r'\n{3,}', '\n\n', text).strip()+'\n'
assert len(re.findall(r'^#### Question \d+$',text,re.M))==48
assert text.count('**Answer**')==48
assert text.count('**Problem**')==16
assert text.count('**Solution**')==16
path.write_text(text,encoding='utf-8')
print('Formatted 48 question blocks, 16 problem and solution blocks, and grouped code map.')
