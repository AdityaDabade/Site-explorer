import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4zM14 18h2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Nearby', to: '/nearby' },
  { label: 'Trip Planner', to: '/trip-planner' },
  { label: 'My Trips', to: '/trips' }
];

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

  const handleQrScan = () => {
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        window.dispatchEvent(new Event('tourvision:open-qr'));
      }, 300);
      return;
    }

    window.dispatchEvent(new Event('tourvision:open-qr'));
  };

  const closeMenu = () => setMenuOpen(false);

  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-[var(--c-text-primary)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">
              TV
            </span>
            <span className="hidden sm:inline">TourVision Admin</span>
          </Link>
          <button
            type="button"
            className="rounded-[var(--r-md)] border border-[var(--c-border)] px-3 py-2 text-sm font-semibold text-[var(--c-text-primary)] transition-colors hover:bg-[var(--c-surface-inset)]"
            onClick={onChatOpen}
          >
            Help
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-2xl transition-all duration-300 ${
        isScrolled ? 'shadow-lg shadow-slate-200/60' : 'shadow-sm shadow-slate-200/30'
      }`}
    >
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
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white shadow-lg shadow-slate-300/70">
              TV
            </span>
            <span className="hidden font-heading font-black tracking-tight text-[var(--c-text-primary)] sm:inline">
              TourVision
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1 shadow-sm backdrop-blur-xl md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5',
                  isActive ? 'bg-slate-950 text-white shadow-md shadow-slate-300/60' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={onChatOpen}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-teal-800"
          >
            AI Guide
          </button>
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={handleQrScan}
            className="flex h-10 items-center gap-2 rounded-full bg-slate-950 px-3 text-white shadow-sm shadow-slate-300/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md active:scale-95 md:px-4"
            aria-label="Scan QR"
          >
            <QrIcon />
            <span className="hidden text-sm font-bold md:inline">QR Scan</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-md active:scale-95"
              aria-label="Menu"
            >
              <span className="text-sm font-black text-slate-800">ME</span>
              <span className="hidden text-sm font-bold text-slate-800 md:inline">Menu</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-300/40 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)] md:hidden"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/nearby');
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)] md:hidden"
                >
                  Nearby
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/trips');
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)] md:hidden"
                >
                  Trips
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChatOpen();
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)] md:hidden"
                >
                  AI Guide
                </button>

                {isAuthenticated ? (
                  <>
                    <div className="border-y border-[var(--c-border)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--c-text-primary)]">{user?.name || user?.email || 'Traveler'}</p>
                      <p className="text-xs text-[var(--c-text-secondary)]">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/trip-planner');
                        closeMenu();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Trip Planner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/saved');
                        closeMenu();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Saved Places
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        closeMenu();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Profile
                    </button>
                    <div className="border-t border-[var(--c-border)] p-2">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          closeMenu();
                        }}
                        className="w-full rounded-[var(--r-md)] px-4 py-2 text-sm font-semibold text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t border-[var(--c-border)]" />
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/login');
                        closeMenu();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/signup');
                        closeMenu();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--c-text-secondary)] transition-colors hover:bg-[var(--c-surface-inset)] hover:text-[var(--c-text-primary)]"
                    >
                      Sign up
                    </button>
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
