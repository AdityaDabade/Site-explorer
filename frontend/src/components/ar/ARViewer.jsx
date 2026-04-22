import PropTypes from 'prop-types';
import '@google/model-viewer';

/**
 * Wrapper around model-viewer for AR-ready place models.
 */
export default function ARViewer({ alt, poster, src }) {
  if (!src) {
    return (
      <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] text-center text-sm text-slate-300 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.16),_transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="relative max-w-sm px-6">
          <p className="font-heading text-xl text-white">AR Preview Unavailable</p>
          <p className="mt-2">No AR model is available for this place yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] shadow-soft backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.14),_transparent_28%),linear-gradient(180deg,_transparent_62%,_rgba(6,17,13,0.24)_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-black/[0.25] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
        AR Story Layer
      </div>
      {/* model-viewer is a web component provided by the model-viewer package. */}
      <model-viewer
        ar
        ar-modes="webxr scene-viewer quick-look"
        auto-rotate
        camera-controls
        className="h-[360px] w-full bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.12),_transparent_30%),linear-gradient(180deg,_rgba(16,34,27,1)_0%,_rgba(8,14,11,1)_100%)]"
        poster={poster}
        shadow-intensity="1"
        src={src}
        alt={alt}
        touch-action="pan-y"
      />
    </div>
  );
}

ARViewer.propTypes = {
  alt: PropTypes.string,
  poster: PropTypes.string,
  src: PropTypes.string
};

ARViewer.defaultProps = {
  alt: 'AR place model',
  poster: '',
  src: ''
};
