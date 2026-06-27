import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Displays place gallery with responsive layout.
 * Desktop: Large main image + 4 smaller images
 * Mobile: Horizontal scroll with dots
 */
export default function PlaceGallery({ gallery, locationName, mobileGallery, onStartGuide, placeName, rating }) {
  const primaryImage =
    gallery[0] ||
    mobileGallery[0] ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80';

  return (
    <motion.section
      className="place-gallery-hero"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="group relative h-[350px] w-full overflow-hidden rounded-[inherit] lg:h-[500px]">
        <motion.img
          alt={placeName}
          animate={{ scale: [1.03, 1.06, 1.03] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          className="h-full w-full scale-[1.03] object-cover transition-transform duration-700 lg:group-hover:scale-[1.08]"
          src={primaryImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />

        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-md sm:left-6 sm:top-6">
          <span className="max-w-[13rem] truncate sm:max-w-none">📍 {locationName}</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/80 sm:inline-block" />
          <span>⭐ {Number(rating || 4.8).toFixed(1)} Rating</span>
        </div>

        <div className="absolute bottom-6 left-5 right-5 pr-24 text-white sm:bottom-8 sm:left-8 sm:right-8">
          <h1 className="max-w-3xl text-4xl font-black leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
            {placeName}
          </h1>
        </div>

        <button
          type="button"
          className="absolute bottom-5 right-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/25 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-white/80 sm:bottom-8 sm:right-8 sm:px-6"
          onClick={onStartGuide}
        >
          🎧 AI Guide
        </button>
      </div>
    </motion.section>
  );
}

PlaceGallery.propTypes = {
  gallery: PropTypes.arrayOf(PropTypes.string),
  locationName: PropTypes.string,
  mobileGallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  onStartGuide: PropTypes.func,
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeName: PropTypes.string.isRequired
};

PlaceGallery.defaultProps = {
  gallery: [],
  locationName: 'TourVision destination',
  onStartGuide: undefined,
  rating: 4.8
};
