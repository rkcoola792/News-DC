# UI/UX Specification — NewsDC

## 1. Experience principles

- Research-oriented, calm and information-dense without visual clutter.
- Content type is immediately recognizable.
- AI-generated information is visibly labelled.
- Publisher attribution and original source links are always clear.
- Filters are accessible and persistent where useful.
- Responsive desktop-first layout that remains usable on mobile.

## 2. Main navigation

- ForYou
- Trending
- Topics
- Search
- Bookmarks
- AI Assistant
- Dashboard (P1 / operational view)

A left sidebar on desktop and compact navigation on mobile are suitable.

## 3. Screen requirements

### Home / ForYou

- Personalized feed.
- Content-type filter: All, Articles, Videos, Research, Discussions.
- Topic chips.
- Sort/filter controls.
- Content cards with summary and scores.
- Pagination or infinite loading.
- Loading, empty and error states.

### Trending

- Ranked items with publication date and available engagement signals.
- Explain ranking as a heuristic, not “viral” unless data supports it.
- Filters by topic and type.

### Topics

- Topic directory using the assignment taxonomy.
- Each topic opens a filtered feed.
- Show content counts if available.

### Content detail

- Title, publisher/channel, date, author and content type.
- AI summary and key insights.
- Relevance and quality indicators with explanatory tooltips.
- Topic and tag labels.
- Original source link.
- Video thumbnail/duration and external playback link where applicable.
- Research DOI/publication details when available.
- Related content.
- Bookmark action.

### Search

- Keyword search.
- Filters: type, topic, publisher, date, relevance and quality.
- Sort: newest, relevance and quality.
- Search empty state and clear filters action.

### Bookmarks

- Locally saved items.
- Remove bookmark.
- Empty state explains bookmarks are stored in this browser for MVP.

### AI Assistant

- Suggested question examples:
  - What are the latest developments in AI data center infrastructure?
  - Which hyperscalers are investing in new data centers?
  - What is emerging in liquid cooling and power availability?
  - Which articles discuss GPU utilization optimization?
  - What technologies could improve PUE and WUE?
- Answer with linked source cards.
- Show “not enough indexed evidence” when retrieval is weak.

### Dashboard (P1)

- Total content count.
- Count by content type/category.
- Ingestion run success/failure.
- Pending/completed/failed AI processing.
- Recent job activity.

## 4. Content card specification

Required:

- Title
- Content type label
- Publisher/channel
- Published date
- One or two line description/AI summary
- Category labels
- Bookmark action
- Original source action

Optional:

- Thumbnail
- Duration or reading-time estimate
- Relevance and quality scores
- Engagement count if source provides it

Do not invent reading times, views, likes or scores when unavailable.

## 5. Design system suggestions

- Use a neutral background and restrained accent color.
- Use consistent spacing, typography and card layouts.
- Use badges for content type and category, not for every metadata field.
- Ensure sufficient contrast and keyboard focus states.
- Add dark/light mode as P1.
- Avoid rendering external HTML directly; render text safely.

## 6. Key interactions

- Selecting a type chip updates the feed query.
- Selecting a topic opens that topic's feed.
- Opening a card records reading activity locally.
- Bookmark toggles local storage state.
- Search and filters update URL query parameters where practical.
- “Read original” opens the source in a new tab with safe link attributes.
- Assistant citations open the matching source/detail view.
