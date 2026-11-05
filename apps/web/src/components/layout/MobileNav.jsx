import { NavLink } from 'react-router-dom';
import { ChartNoAxesCombined } from 'lucide-react';
import { nav } from '../../data/preview.js';
import { useNews } from '../../context/NewsContext.jsx';
export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {nav.map(([url, label, Icon]) => (
        <NavLink end={url === '/'} key={url} to={url}>
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
      <NavLink to="/dashboard">
        <ChartNoAxesCombined size={19} />
        <span>System</span>
      </NavLink>
    </nav>
  );
}
