/**
 * Header
 * Fixed/absolute nav bar rendered on top of the hero section.
 *
 * Props:
 *   onMenuClick   {function}  opens the nav drawer / menu
 *   onSearchClick {function}  navigates to /nearby or opens search
 */
export default function Header({ onMenuClick, onSearchClick }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5">
      {/* Brand */}
      <span className="font-heading text-2xl font-extrabold text-white tracking-tight">
        TourVision
      </span>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          onClick={onSearchClick}
        >
          {/* Search icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          onClick={onMenuClick}
        >
          {/* Hamburger icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
