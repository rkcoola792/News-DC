import { NavLink } from 'react-router-dom';
import { nav } from '../../data/preview.js';
export default function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Primary navigation">
      {nav.map(([url, label, Icon]) => (
        <NavLink end={url === '/'} key={url} to={url}>
          <Icon size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
