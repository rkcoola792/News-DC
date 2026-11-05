# NewsDC — Design System v1.0

Status: **Approved design direction / specification only**. No UI implementation is implied.

## 1. Design goal

A calm, minimal, editorial discovery product for data-center intelligence. Prioritize scannability, meaningful whitespace, clear source attribution, and progressive disclosure. Avoid a dense news portal, oversized dashboard tiles, gratuitous gradients, and walls of AI-generated text.

Approved reference: the nine-screen NewsDC visual mockup (Discover, Detail, Ask AI, Trending, Topics, Search, Saved, Dashboard, Mobile). Mockup data and counts are illustrative, not actual ingested content.

## 2. Design principles

1. **Content first**: headlines and sources lead; imagery is optional and compact.
2. **One visual hierarchy**: page title → filters → results → supporting metadata.
3. **Progressive disclosure**: feed cards show a two-line summary; deeper insights, score explanations, and full metadata live in detail views.
4. **Accessible by default**: semantic elements, keyboard access, visible focus, meaningful labels, contrast targets WCAG AA.
5. **Trustworthy AI**: label AI-generated summaries, distinguish source facts from model interpretation, provide clickable citations and original source actions.
6. **Responsive**: sidebar desktop, compact header and mobile bottom navigation.

## 3. Visual tokens

### Palette (light)

| Token | Value | Use |
|---|---|---|
| `--background` | `#FAFAF9` | App background |
| `--surface` | `#FFFFFF` | Main content surface |
| `--surface-muted` | `#F5F6F8` | Selected nav, subtle panels |
| `--text-primary` | `#111827` | Titles, body |
| `--text-secondary` | `#667085` | Metadata, descriptions |
| `--border` | `#E7E9EE` | Dividers, input/card borders |
| `--accent` | `#172B4D` | Active tab, primary action |
| `--accent-soft` | `#EEF2FF` | AI panel background, sparingly |
| `--success` | `#15803D` | Job success |
| `--danger` | `#B42318` | Error states |

### Palette (dark)

| Token | Value |
|---|---|
| `--background` | `#101318` |
| `--surface` | `#171B22` |
| `--surface-muted` | `#222833` |
| `--text-primary` | `#F3F4F6` |
| `--text-secondary` | `#A3AAB8` |
| `--border` | `#303744` |
| `--accent` | `#AFC4FF` |
| `--accent-soft` | `#252D43` |

Avoid using accent color for ordinary text labels. Use status colors only when they convey meaning. Verify actual text/background combinations with an automated contrast checker.

### Typography

- Primary font: `Inter` or `Geist`, fallback `system-ui, sans-serif`.
- App logo: 16–18px / 700.
- Page title: 28–32px / 700 / 1.2.
- Section heading: 18–20px / 650 / 1.35.
- Feed title: 16–18px / 600 / 1.4.
- Body: 14–16px / 400 / 1.55.
- Metadata: 12–13px / 400–500 / 1.4.
- Minimum ordinary interactive label: 13px. Avoid tiny labels in production, even if the concept mockup appears smaller.

### Spacing and sizing

Use an 8px base rhythm with 4px increments where necessary: `4, 8, 12, 16, 24, 32, 40, 48, 64`.

- Desktop sidebar: 224px wide; collapsible to 64px optional.
- Desktop main content max width: 1120px; reading/article column max width: 760px.
- Desktop outer padding: 32px; tablet 24px; mobile 16px.
- Header height: 64px; mobile header 56px.
- Feed row padding: 20–24px vertical.
- Section gaps: 24–32px; page-title to tabs: 20–24px.
- Card radius: 10–12px; button/input radius: 8–10px; pill radius: 999px.
- Use 1px borders; no heavy shadows. Shadow only for floating popovers/dialogs.
- Touch targets: aim for 44×44px minimum on mobile.

### Motion

- 120–180ms ease-out hover/focus transitions.
- No entrance animations for every feed item.
- Respect `prefers-reduced-motion`.

## 4. App shell

Desktop: persistent left sidebar, compact top search/header, centered content area. Sidebar items: For You, Trending, Topics, Saved, Ask AI; Search accessible in header; Dashboard placed below a separator or in an admin/utility section. Theme toggle at bottom.

Mobile: header with logo, search, menu; bottom navigation for For You, Trending, Topics, Saved, Ask AI. Dashboard accessible from overflow/menu. Main content full width with 16px gutters. Do not render desktop sidebar simultaneously.

## 5. Screen-by-screen wireframes

### 5.1 Discover / For You

```text
[Sidebar]  [Search topics, articles, videos...]                 [Theme]
           Discover
           The latest in data center intelligence.
           [All] [Articles] [Videos] [Research] [Discussions]
           ---------------------------------------------------
           [optional thumbnail] TOPIC · date
                                Headline
                                Two-line description
                                Source · Type             [Save]
           ---------------------------------------------------
           [Next item...]
```

Content feed is a single column. Show one prominent headline per item. Thumbnail optional, max about 96×72px on desktop; do not reserve blank space if absent. Limit summary to 2 lines. No relevance-score badges on feed by default; offer score details in detail view. Empty state suggests choosing a different topic or type.

### 5.2 Trending

Use same feed row with subtle rank number, timeframe selector (e.g. 24h / 7d) and type filters. Label ranking as heuristic based on available signals; do not imply precise social engagement if not available. Avoid loud charts.

### 5.3 Topics

Topic directory with restrained 2–4 column cards depending on viewport, icon, name, and verified item count when available. Click opens topic feed with familiar content rows. No large decorative illustrations.

### 5.4 Content Detail

Breadcrumb/back → topic/type chips → title → publisher/date/source link → softly tinted AI Summary panel → 3–5 Key Insights → optional technical/business implications → related items. Show attribution and AI-generated label. Video detail may show thumbnail, duration, and external video link; transcript-dependent insights only when text is available. Relevance/quality scoring behind expandable explanation.

### 5.5 Search

Prominent search input, result count if known, sort dropdown, compact filters. Desktop filters can appear in a narrow left rail; mobile filters in a drawer. Results reuse `ContentCard`. Search term retained in URL query parameters.

### 5.6 Saved

Same list component with saved state. Filter by type. Explain that bookmarks are stored in this browser in MVP. No authentication requirement.

### 5.7 Ask AI

Centered empty state with one-line purpose, 3–4 suggested prompts, restrained chat composer. After submission, show answer in readable paragraphs, source citations immediately adjacent to claims, and a source list. Streaming state should not jump layout. When evidence is weak, state that indexed evidence is insufficient; do not fabricate sources.

### 5.8 Dashboard

Operational view rather than consumer homepage: 3–5 small metric cards, one simple ingestion chart, job status list, last successful sync. Keep graphs muted and labels legible. Protect admin actions server-side; UI hiding alone is not security.

### 5.9 Mobile

One-column cards; no cramped two-column feed. Content thumbnails may stack or disappear at narrow widths. Bottom navigation with concise labels. Search/filter drawers must be keyboard-accessible.

## 6. Component contracts

| Component | Responsibilities | Key props (JavaScript) |
|---|---|---|
| `AppShell` | Shared layout, navigation, responsive shell | `children` |
| `Sidebar` | Desktop navigation, active route, theme | `items`, `activePath` |
| `Header` | Search trigger, page utilities | `onSearch` |
| `MobileNav` | Mobile primary routes | `items`, `activePath` |
| `ContentCard` | Scannable unified content row | `item`, `isSaved`, `onToggleSave` |
| `ContentFeed` | Feed loading, empty/error, pagination | `items`, `status`, `onLoadMore` |
| `ContentTypeTabs` | All/Article/Video/Research/Discussion filter | `value`, `onChange` |
| `TopicChip` | Compact taxonomy filter | `topic`, `selected`, `onClick` |
| `AIInsightPanel` | AI summary and insight display | `summary`, `insights`, `modelLabel` |
| `AssistantChat` | Prompt entry, answer, streaming state | `messages`, `onSubmit`, `status` |
| `SourceCitation` | Link answer claim to real source | `source`, `label` |
| `EmptyState` | No content explanation and action | `title`, `description`, `action` |
| `Skeleton` | Stable loading placeholders | `variant`, `count` |
| `ErrorState` | Recoverable errors with retry | `message`, `onRetry` |

Use semantic `<article>` for content rows, real `<button>` elements for filters/bookmarks, and `<a>` for navigation/source links. Include `aria-pressed` or `aria-current` where appropriate. Avoid click handlers on generic `<div>` elements.

## 7. Suggested React structure (JavaScript only)

```text
src/
  app/App.jsx
  app/routes.jsx
  components/layout/{AppShell,Sidebar,Header,MobileNav}.jsx
  components/content/{ContentCard,ContentFeed,ContentTypeTabs,TopicChip}.jsx
  components/ai/{AIInsightPanel,AssistantChat,SourceCitation}.jsx
  components/common/{EmptyState,Skeleton,ErrorState}.jsx
  pages/{Discover,Trending,Topics,ContentDetail,Search,Saved,AskAI,Dashboard}.jsx
  hooks/{useBookmarks,useTheme}.js
  services/{api,content,assistant}.js
  context/PreferencesContext.jsx
  styles/index.css
```

Tech: React, Vite, JavaScript, Tailwind CSS, Lucide React, React Router. Avoid Redux unless the app actually needs shared global server-state orchestration; MVP preferences/bookmarks can use localStorage + context/hooks.

## 8. Implementation sequence

1. Define Tailwind/theme tokens and global typography.
2. Build `AppShell`, sidebar, header, mobile nav.
3. Implement `ContentCard` using mock content, including all four content types.
4. Build Discover and shared feed states.
5. Reuse feed for Trending, Search, Saved, and topic detail.
6. Build Content Detail and AI Insight panel.
7. Build Ask AI and Dashboard.
8. Connect real APIs, test responsive behavior, keyboard navigation, empty/error/loading states.

## 9. UI acceptance checklist

- [ ] Consistent page widths and 8px spacing rhythm across all screens.
- [ ] Feed descriptions capped at 2 lines; full insight in detail view.
- [ ] All screens support loading, empty and error states.
- [ ] Bookmarks have clear accessible labels and persist in localStorage.
- [ ] Every content item shows original source attribution.
- [ ] AI summaries clearly marked as generated.
- [ ] No fabricated metrics, counts, citations or video transcripts.
- [ ] Mobile navigation usable at 320px viewport width.
- [ ] Keyboard focus visible, dialogs/drawers accessible, reduced motion respected.
- [ ] Color contrast verified for both themes.

## 10. Interview explanation

**Why this design?** NewsDC solves information overload. A dense portal would recreate the same problem. We therefore keep feed rows brief, prioritize headline/source/date, and reveal AI detail only on demand.

**Why reusable feed components?** Discover, Trending, Search and Saved all render the same normalized content model; reusing cards and states avoids inconsistent behavior and makes mixed article/video/research/discussion feeds simpler to maintain.

**Why no login for MVP?** Browser-local bookmarks and preferences reduce scope and friction; multi-device sync and authenticated personalization are later-stage enhancements.

**What is not yet built?** This document is a design specification, not evidence of completed frontend implementation.
