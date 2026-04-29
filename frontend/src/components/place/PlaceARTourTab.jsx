import PropTypes from 'prop-types';
import ARViewer from '../ar/ARViewer';
import AROverlay from '../ar/AROverlay';

/**
 * AR Tour tab component with AR viewer and overlay captions.
 */
export default function PlaceARTourTab({ aiContent, captions, gallery, place }) {
  return (
    <div className="space-y-5">
      <ARViewer
        alt={`${place?.name || 'Place'} AR model`}
        poster={gallery[0]}
        src={aiContent?.ar_model_url || place?.ar_model_url}
      />
      <AROverlay
        caption={captions || aiContent?.summary || 'Point your camera and follow the guide overlays.'}
        title="AR Caption Layer"
      />
    </div>
  );
}

PlaceARTourTab.propTypes = {
  aiContent: PropTypes.shape({
    ar_model_url: PropTypes.string,
    summary: PropTypes.string
  }),
  captions: PropTypes.string,
  gallery: PropTypes.arrayOf(PropTypes.string),
  place: PropTypes.shape({
    ar_model_url: PropTypes.string,
    name: PropTypes.string
  })
};

PlaceARTourTab.defaultProps = {
  aiContent: null,
  captions: '',
  gallery: [],
  place: null
};
