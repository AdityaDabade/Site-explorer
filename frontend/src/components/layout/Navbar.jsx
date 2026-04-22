import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function GlobeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SearchOverlay({ isMobile, onClose, onSubmit }) {
  const [form, setForm] = useState({
    destination: '',
    date: 'Any week',
    travelers: 'Any travelers'
  });

  return (
    <div className={isMobile ? 'bottom-sheet-overlay' : 'fixed inset-0 z-[70] bg-black/25 backdrop-blur-[2px]'}>
      <div className={isMobile ? 'bottom-sheet' : 'mx-auto mt-24 w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-[var(--shadow-modal)]'}>
        {isMobile ? <div className="bottom-sheet-handle" /> : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Search TourVision</p>
            <h2 className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-extrabold">Find places worth exploring</h2>
          </div>
          <button type="button" className="btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.25fr_0.9fr_0.9fr]">
          <label className="input-wrap">
            <span className="input-label">Destination</span>
            <input
              className="input"
              placeholder="Search destinations"
              value={form.destination}
              onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}
            />
          </label>

          <label className="input-wrap">
            <span className="input-label">When</span>
            <select
              className="input"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            >
              <option>Any week</option>
              <option>This weekend</option>
              <option>Next week</option>
              <option>Next month</option>
            </select>
          </label>

          <label className="input-wrap">
            <span className="input-label">Travelers</span>
            <select
              className="input"
              value={form.travelers}
              onChange={(event) => setForm((current) => ({ ...current, travelers: event.target.value }))}
            >
              <option>Any travelers</option>
              <option>1 traveler</option>
              <option>2 travelers</option>
              <option>Family</option>
              <option>Group</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="filter-chips pb-0">
            {['🏛 Monuments', '🌿 Nature', '🍜 Food', '🎭 Culture', '🏖 Beaches'].map((item) => (
              <span key={item} className="chip">{item}</span>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSubmit(form)}
          >
            <SearchIcon />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

SearchOverlay.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

SearchOverlay.defaultProps = {
  isMobile: false
};

/**
 * Airbnb-inspired sticky navbar with search pill, user menu, and route-aware behavior.
 */
export default function Navbar({ onChatOpen, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const menuItems = useMemo(
    () =>
      isAuthenticated
        ? [
            { label: 'Trips', action: () => navigate('/trip-planner') },
            { label: 'Wishlist', action: () => navigate('/expenses') },
            { label: 'Help Center', action: onChatOpen },
            { label: 'Logout', action: logout }
          ]
        : [
            { label: 'Sign in', action: () => navigate('/login') },
            { label: 'Sign up', action: () => navigate('/signup') },
            { label: 'Help Center', action: onChatOpen },
            { label: 'Trips', action: () => navigate('/trip-planner') },
            { label: 'Wishlist', action: () => navigate('/expenses') }
          ],
    [isAuthenticated, logout, navigate, onChatOpen]
  );

  const handleSearchSubmit = () => {
    setSearchOpen(false);
    navigate('/nearby');
  };

  if (isAdminRoute) {
    return (
      <header className={`sticky top-0 z-50 border-b border-[var(--c-border)] bg-white ${isScrolled ? 'shadow-[var(--shadow-card)]' : ''}`}>
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-primary-light)] text-lg">🧭</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">TourVision Admin</p>
              <p className="font-[var(--font-heading)] text-lg font-extrabold text-[var(--c-text-primary)]">Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="btn-outline btn-sm" onClick={onChatOpen}>
              AI Help
            </button>
            <div className="rounded-full border border-[var(--c-border)] px-4 py-2 text-sm font-semibold">
              {user?.name || user?.email || 'Admin'}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={`sticky top-0 z-50 border-b border-[var(--c-border)] bg-white ${isScrolled ? 'shadow-[var(--shadow-card)]' : ''}`}>
        <div className="container flex h-16 items-center justify-between gap-3 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <span className="font-heading text-xl font-extrabold text-[var(--c-primary)]">TourVision</span>
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="airbnb-search-shadow hidden min-w-[360px] items-center rounded-full border border-[var(--c-border)] bg-white px-4 py-3 text-left md:flex"
          >
            <span className="flex-1 text-sm font-semibold">Search destinations</span>
            <span className="px-4 text-sm text-[var(--c-text-secondary)]">Any week</span>
            <span className="border-l border-[var(--c-border)] pl-4 text-sm text-[var(--c-text-secondary)]">Any travelers</span>
            <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--c-primary)] text-white">
              <SearchIcon />
            </span>
          </button>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--c-border)] bg-white"
              aria-label="Open search"
            >
              <SearchIcon />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="hidden text-sm font-semibold text-[var(--c-text-primary)] md:inline-flex" onClick={onChatOpen}>
              Become a Host
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--c-surface-inset)] md:inline-flex"
              aria-label="Language and region"
            >
              <GlobeIcon />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center gap-3 rounded-full border border-[var(--c-border)] bg-white px-3 py-2 shadow-[var(--shadow-card)]"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <MenuIcon />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--c-surface-inset)] text-sm font-bold text-[var(--c-text-primary)]">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-[16px] border border-[var(--c-border)] bg-white shadow-[var(--shadow-modal)]">
                  {menuItems.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        item.action();
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--c-surface-inset)] ${
                        index === 2 ? 'border-t border-[var(--c-border)]' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <SearchOverlay
          isMobile={window.innerWidth < 768}
          onClose={() => setSearchOpen(false)}
          onSubmit={handleSearchSubmit}
        />
      ) : null}
    </>
  );
}

Navbar.propTypes = {
  onChatOpen: PropTypes.func.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string
  })
};

Navbar.defaultProps = {
  user: null
};
