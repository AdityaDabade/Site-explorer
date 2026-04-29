import PropTypes from 'prop-types';

export default function Header({ onMenuClick, onSearchClick }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="container flex items-center justify-between py-5">
        <div className="rounded-full bg-white/90 px-4 py-2 font-heading text-lg font-extrabold text-[#18212f] shadow-[0_12px_28px_rgba(21,32,43,0.12)] backdrop-blur">
          TourVision
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-[#18212f] shadow-[0_12px_28px_rgba(21,32,43,0.12)] backdrop-blur"
            onClick={onSearchClick}
            aria-label="Search"
          >
            🔍
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-[#18212f] shadow-[0_12px_28px_rgba(21,32,43,0.12)] backdrop-blur"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffcf24] font-heading font-bold text-[#18212f] shadow-[0_12px_28px_rgba(255,207,36,0.32)]">
            TV
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func,
  onSearchClick: PropTypes.func,
};

Header.defaultProps = {
  onMenuClick: () => {},
  onSearchClick: () => {},
};
