import PropTypes from 'prop-types';

/**
 * Caption overlay shown below or above AR narration surfaces.
 */
export default function AROverlay({ caption, title }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,_rgba(245,166,35,0.18),_rgba(255,255,255,0.04))] p-5 text-amber-50 shadow-soft backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <p className="text-xs uppercase tracking-[0.22em] text-amber-100">{title}</p>
      <p className="mt-3 text-sm leading-7 text-white/90">
        {caption || 'Narration captions will appear here when the guide speaks.'}
      </p>
    </div>
  );
}

AROverlay.propTypes = {
  caption: PropTypes.string,
  title: PropTypes.string
};

AROverlay.defaultProps = {
  caption: '',
  title: 'Live Captions'
};
