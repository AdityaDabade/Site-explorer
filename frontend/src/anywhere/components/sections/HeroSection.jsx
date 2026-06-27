import CategoryList from '../home/CategoryList';
import Header from '../home/Header';
import LocationBar from '../home/LocationBar';
import SearchBar from '../home/SearchBar';
import { CATEGORY_PILLS, HERO_IMAGE } from '../../../constants/homeData';

/**
 * HeroSection — full-viewport hero with header, headline, search bar, and CTAs.
 *
 * Props:
 *   search          {object}   { destination, date, travelers }
 *   onSearchChange  {function} called with updated search object
 *   onSearchSubmit  {function} called when user submits search
 *   onScanQR        {function} opens QR scanner
 *   onStartPlanning {function} navigates to trip planner
 *   onMenuClick     {function} opens nav menu
 *   onHeaderSearch  {function} header search icon click
 *   location        {object|null}
 *   isLocating      {boolean}
 *   locationError   {string|null}
 *   onEnableLocation {function}
 */
export default function HeroSection({
  search,
  onSearchChange,
  onSearchSubmit,
  onScanQR,
  onStartPlanning,
  onMenuClick,
  onHeaderSearch,
  location,
  isLocating,
  locationError,
  onEnableLocation,
}) {
  return (
    <section
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%), url(${HERO_IMAGE})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <Header onMenuClick={onMenuClick} onSearchClick={onHeaderSearch} />

      <div className="container w-full pb-[120px]">
        <div className="max-w-[640px]">
          <CategoryList categories={CATEGORY_PILLS} />

          <h1 className="max-w-[640px] text-white">
            Explore the World&apos;s Most
            <br />
            Incredible Places
          </h1>
          <p className="mt-4 max-w-[560px] text-lg text-white/85">
            AI-powered tours, audio guides, and smart trip planning
          </p>

          <SearchBar
            search={search}
            onSearchChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />

          <LocationBar
            error={locationError}
            isLocating={isLocating}
            location={location}
            onEnableLocation={onEnableLocation}
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-ghost btn-sm" onClick={onScanQR}>
              Scan QR Code
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={onStartPlanning}>
              Start planning
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
