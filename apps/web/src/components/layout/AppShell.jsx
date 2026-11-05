import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileNav from './MobileNav.jsx';
export default function AppShell() {
  const { pathname } = useLocation();
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <div className="workspace">
        <Header />
        <main id="main" className={`main ${pathname.startsWith('/content/') ? 'reading' : ''}`}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </>
  );
}
