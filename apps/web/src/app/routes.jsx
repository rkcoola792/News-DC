import Preferences from '../pages/Preferences.jsx';
import { Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Discover from '../pages/Discover.jsx';
import Trending from '../pages/Trending.jsx';
import Topics from '../pages/Topics.jsx';
import Saved from '../pages/Saved.jsx';
import Search from '../pages/Search.jsx';
import AskAI from '../pages/AskAI.jsx';
import ContentDetail from '../pages/ContentDetail.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ReadingHistory from '../pages/ReadingHistory.jsx';
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Discover />} />
        <Route path="trending" element={<Trending />} />
        <Route path="topics" element={<Topics />} />
        <Route path="saved" element={<Saved />} />
        <Route path="search" element={<Search />} />
        <Route path="ask" element={<AskAI />} />
        <Route path="content/:id" element={<ContentDetail />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="history" element={<ReadingHistory />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Page not found"
              description="Return to Discover to explore the content library."
            />
          }
        />
      </Route>
    </Routes>
  );
}
