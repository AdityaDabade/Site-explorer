import PropTypes from 'prop-types';
import PlaceCard from './PlaceCard';

/**
 * Listing grid wrapper used for nearby/explore discovery surfaces.
 */
export default function NearbyList({ emptyLabel, onSelect, places, renderMeta, title }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Results</p>
          <h2 className="mt-1 text-[1.5rem] font-bold">{title}</h2>
        </div>
        <span className="text-sm text-[var(--c-text-secondary)]">{places.length} results</span>
      </div>

      {places.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {places.map((place) => (
            <PlaceCard
              key={place.id || `${place.lat}-${place.lng}`}
              meta={renderMeta(place)}
              onSelect={onSelect}
              place={place}
            />
          ))}
        </div>
      ) : (
        <div className="card card-bordered flex items-center gap-4 p-6">
          <div className="text-3xl">🧭</div>
          <div>
            <p className="font-semibold">Nothing matched your current filters</p>
            <p className="text-sm text-[var(--c-text-secondary)]">{emptyLabel}</p>
          </div>
        </div>
      )}
    </section>
  );
}

NearbyList.propTypes = {
  emptyLabel: PropTypes.string,
  onSelect: PropTypes.func,
  places: PropTypes.arrayOf(PropTypes.object),
  renderMeta: PropTypes.func,
  title: PropTypes.string
};

NearbyList.defaultProps = {
  emptyLabel: 'Try a broader area or fewer filters.',
  onSelect: undefined,
  places: [],
  renderMeta: () => '',
  title: 'Nearby Places'
};
