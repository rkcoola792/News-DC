import { BrowserRouter } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext.jsx';
import AppRoutes from './app/routes.jsx';
export default function App() {
  return (
    <BrowserRouter>
      <NewsProvider>
        <AppRoutes />
      </NewsProvider>
    </BrowserRouter>
  );
}
