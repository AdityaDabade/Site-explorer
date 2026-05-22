import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
export default function NavbarModern({ onChatOpen, user }) {
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
      <header className="sticky top-0 z-40 border-b border-[var(--c-border)] bg-white transition-all duration-300">
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
    <header
      className={`sticky top-0 z-40 border-b border-[var(--c-border)] bg-gradient-to-r from-white to-[var(--c-surface)] transition-all duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 md:h-16">
        {/* Logo */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="hidden font-heading font-bold text-[var(--c-text-primary)] sm:inline">TourVision</span>
        </Link>

        {/* Search bar - hidden on mobile */}
        <button
          type="button"
          onClick={() => navigate('/nearby')}
          className="hidden flex-shrink-0 min-w-[280px] items-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-inset)] px-4 py-2 text-left transition-all hover:shadow-sm hover:border-[var(--c-border-focus)] md:flex"
        >
          <span className="flex-1 text-sm text-[var(--c-text-secondary)]">Search destinations...</span>
          <SearchIcon />
        </button>

        {/* Right section */}
        <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => navigate('/nearby')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] md:flex"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 items-center gap-2 rounded-full border border-[var(--c-border)] px-3 transition-all hover:shadow-sm hover:border-[var(--c-border-focus)]"
              aria-label="Menu"
            >
              <span className="text-lg">👤</span>
              <span className="hidden text-sm font-semibold text-[var(--c-text-primary)] md:inline">Menu</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-48 rounded-[var(--r-lg)] border border-[var(--c-border)] bg-white shadow-lg">
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
                      My Trips
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/expenses');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Wishlist
                    </button>
                    <button
                      type="button"
                      onClick={onChatOpen}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
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
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/login');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/signup');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
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

NavbarModern.propTypes = {
  onChatOpen: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  })
};

NavbarModern.defaultProps = {
  onChatOpen: () => {},
  user: null
};
