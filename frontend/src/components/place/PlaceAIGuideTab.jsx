import PropTypes from 'prop-types';
import AudioPlayer from '../common/AudioPlayer';

/**
 * AI Guide tab component with narration controls and summary.
 */
export default function PlaceAIGuideTab({
  aiContent,
  audioSource,
  captions,
  guideLoading,
  isInsideGeofence,
  onStartTour
}) {
  return (
    <div className="space-y-5">
      <div className="card card-bordered p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">AI Narration</p>
            <p className="mt-1 text-sm text-[var(--c-text-secondary)]">
              Context-aware narration for this landmark and the surrounding zone.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onStartTour(isInsideGeofence ? 'inside' : 'outside')}
            disabled={guideLoading}
          >
            {guideLoading ? 'Starting...' : 'Start AI Tour'}
          </button>
        </div>

        <div className="mt-5">
          <AudioPlayer autoPlay src={audioSource} title="Audio Guide" />
        </div>
      </div>

      <div className="card card-bordered p-6">
        <h3>Guide summary</h3>
        <p className="mt-3 text-[var(--c-text-secondary)]">
          {captions || aiContent?.summary || 'The AI guide summary will appear here once the experience starts.'}
        </p>
      </div>
    </div>
  );
}

PlaceAIGuideTab.propTypes = {
  aiContent: PropTypes.shape({
    summary: PropTypes.string
  }),
  audioSource: PropTypes.string,
  captions: PropTypes.string,
  guideLoading: PropTypes.bool.isRequired,
  isInsideGeofence: PropTypes.bool.isRequired,
  onStartTour: PropTypes.func.isRequired
};

PlaceAIGuideTab.defaultProps = {
  aiContent: null,
  audioSource: '',
  captions: ''
};
