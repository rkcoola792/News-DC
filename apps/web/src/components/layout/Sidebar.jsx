import { Link, NavLink } from 'react-router-dom';
import { Layers, Moon, Sun, ChartNoAxesCombined, History } from 'lucide-react';
import { nav } from '../../data/preview.js';
import { useNews } from '../../context/NewsContext.jsx';
export default function Sidebar() {
  const { dark, setDark, persistTheme } = useNews();
  return (
    <aside className="sidebar">
      <Link className="brand" to="/">
        <Layers size={25} />
        NewsDC
      </Link>
      <nav>
        {nav.map(([url, label, Icon]) => (
          <NavLink end={url === '/'} to={url} key={url}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <div className="divider" />
        <NavLink to="/history">
          <History size={18} />
          Reading history
        </NavLink>
        <NavLink to="/dashboard">
          <ChartNoAxesCombined size={18} />
          Dashboard <small>P1</small>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <p>
          Data center intelligence.
          <br />A clearer perspective.
        </p>
        <button
          onClick={() => {
            setDark(!dark);
            persistTheme(!dark);
          }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />} {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  );
}
