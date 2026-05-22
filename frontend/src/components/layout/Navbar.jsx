import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/**
 * Modern mobile-first navbar with Airbnb-inspired design.
 * Features sticky positioning, search pill, and profile menu.
 */
export default function Navbar({ onChatOpen = () => {}, onMenuToggle = () => {}, user = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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

  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-[var(--c-text-primary)]">
            <span>🌍</span>
            <span className="hidden sm:inline">TourVision Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-[var(--r-md)] border border-[var(--c-border)] px-3 py-2 text-sm font-semibold text-[var(--c-text-primary)] transition-colors hover:bg-[var(--c-surface-inset)]" onClick={onChatOpen}>
              Help
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-2xl transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-slate-200/60' : 'shadow-sm shadow-slate-200/30'}`}>
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 md:h-16 lg:px-8">
        <div className="flex flex-shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-teal-700 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5">
            <span className="text-2xl">🌍</span>
            <span className="hidden font-heading font-bold text-[var(--c-text-primary)] sm:inline">TourVision</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => navigate('/nearby')}
          className="hidden min-w-[300px] flex-shrink-0 items-center gap-3 rounded-full border border-slate-200/80 bg-white/75 px-5 py-2.5 text-left shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-lg hover:shadow-teal-100/70 active:scale-[0.99] md:flex"
        >
          <span className="flex-1 text-sm font-medium text-slate-500">Search destinations...</span>
          <SearchIcon />
        </button>

        <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => navigate('/nearby')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-700 active:scale-95 md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 md:flex" aria-label="Notifications">
            <BellIcon />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-md active:scale-95"
              aria-label="Menu"
            >
              <span className="text-lg">👤</span>
              <span className="hidden text-sm font-bold text-slate-800 md:inline">Menu</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-300/40 backdrop-blur-xl">
                {isAuthenticated ? (
                  <>
                    <div className="border-b border-[var(--c-border)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--c-text-primary)]">{user?.name || user?.email || 'Traveler'}</p>
                      <p className="text-xs text-[var(--c-text-secondary)]">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/trip-planner');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Trip Planner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/saved');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Saved Places
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/trips');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Trips & Expenses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Profile
                    </button>
                    <button type="button" onClick={onChatOpen} className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]">
                      Help & Support
                    </button>
                    <div className="border-t border-[var(--c-border)] p-2">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="w-full rounded-[var(--r-md)] px-4 py-2 text-sm font-semibold text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { navigate('/login'); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]">
                      Sign in
                    </button>
                    <button type="button" onClick={() => { navigate('/signup'); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]">
                      Sign up
                    </button>
                    <div className="border-t border-[var(--c-border)] p-2">
                      <button type="button" onClick={onChatOpen} className="w-full rounded-[var(--r-md)] px-4 py-2 text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]">
                        Help & Support
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  onChatOpen: PropTypes.func,
  onMenuToggle: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  })
};
