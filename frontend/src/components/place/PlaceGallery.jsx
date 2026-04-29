import PropTypes from 'prop-types';

/**
 * Displays place gallery with responsive layout.
 * Desktop: Large main image + 4 smaller images
 * Mobile: Horizontal scroll with dots
 */
export default function PlaceGallery({ gallery, placeName, mobileGallery }) {
  return (
    <section className="overflow-hidden rounded-[var(--r-xl)]">
      {/* Desktop Gallery */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-[var(--r-xl)]">
          <img
            alt={placeName}
            className="h-full min-h-[420px] w-full object-cover"
            src={
              gallery[0] ||
              'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80'
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(gallery.slice(1, 5).length
            ? gallery.slice(1, 5)
            : [placeName, placeName, placeName, placeName]
          ).map((image, index) => (
            <div key={`gallery-${index}`} className="relative overflow-hidden rounded-[var(--r-lg)]">
              <img
                alt={`${placeName} ${index + 2}`}
                className="h-full min-h-[204px] w-full object-cover"
                src={image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'}
              />
              {index === 3 ? (
                <button type="button" className="btn-ghost btn-sm absolute bottom-4 right-4">
                  Show all photos
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Gallery */}
      <div className="scroll-row pb-3 lg:hidden">
        {mobileGallery.map((image, index) => (
          <div key={`mobile-gallery-${index}`} className="min-w-full overflow-hidden rounded-[var(--r-xl)]">
            <img alt={`${placeName} ${index + 1}`} className="h-[320px] w-full object-cover" src={image} />
          </div>
        ))}
      </div>
      <div className="step-dots py-4 lg:hidden">
        {mobileGallery.slice(0, 4).map((_, index) => (
          <span key={`dot-${index}`} className={`step-dot ${index === 0 ? 'active' : ''}`} />
        ))}
      </div>
    </section>
  );
}

PlaceGallery.propTypes = {
  gallery: PropTypes.arrayOf(PropTypes.string),
  mobileGallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  placeName: PropTypes.string.isRequired
};

PlaceGallery.defaultProps = {
  gallery: []
};
