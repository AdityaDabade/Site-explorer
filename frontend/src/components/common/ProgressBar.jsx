import PropTypes from 'prop-types';

/**
 * Global async job progress indicator for AI generation queues.
 */
export default function ProgressBar({ label, progress }) {
  return (
    <div className="panel-strong p-4 shadow-soft">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span className="font-medium text-white">{label}</span>
        <span className="glass-chip">{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,_rgba(110,231,183,1)_0%,_rgba(245,166,35,1)_100%)] shadow-[0_0_24px_rgba(245,166,35,0.35)] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  label: PropTypes.string,
  progress: PropTypes.number
};

ProgressBar.defaultProps = {
  label: 'Preparing AI guide...',
  progress: 0
};
