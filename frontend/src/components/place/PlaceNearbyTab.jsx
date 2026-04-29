import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PlaceCard from '../tour/PlaceCard';

const FALLBACK_NEARBY = [
  {
    id: 'nearby-1',
    name: 'Local Museum',
    location_name: '5 min away',
    category: 'Culture',
    rating: 4.8,
    review_count: 834,
    score: 8.8,
    price: 0,
    distance: 0.8,
    has_ar: false,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'nearby-2',
    name: 'Sunset Viewpoint',
    location_name: '12 min away',
    category: 'Nature',
    rating: 4.7,
    review_count: 612,
    score: 8.9,
    price: 250,
    distance: 1.4,
    has_ar: true,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80'
  }
];

/**
 * Nearby experiences tab showing nearby places in grid.
 */
export default function PlaceNearbyTab({ nearbyPlaces }) {
  const navigate = useNavigate();
  const places = nearbyPlaces || FALLBACK_NEARBY;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3>Nearby experiences</h3>
        <span className="urgency-tag">42 people exploring this today</span>
      </div>
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {places.map((item) => (
          <PlaceCard
            key={item.id}
            meta="Explore"
            onSelect={(selected) => {
              if (selected.id && String(selected.id).startsWith('nearby-')) {
                toast('Sample nearby experience preview.');
                return;
              }
              navigate(`/place/${selected.id}`);
            }}
            place={item}
          />
        ))}
      </div>
    </div>
  );
}

PlaceNearbyTab.propTypes = {
  nearbyPlaces: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      location_name: PropTypes.string,
      category: PropTypes.string,
      rating: PropTypes.number,
      review_count: PropTypes.number,
      score: PropTypes.number,
      price: PropTypes.number,
      distance: PropTypes.number,
      has_ar: PropTypes.bool,
      image: PropTypes.string
    })
  )
};

PlaceNearbyTab.defaultProps = {
  nearbyPlaces: FALLBACK_NEARBY
};
