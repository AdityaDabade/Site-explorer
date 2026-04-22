import PropTypes from 'prop-types';

/**
 * Small loading indicator used across API-driven views.
 */
export default function Loader({ label, size }) {
  const dimensions = size === 'lg' ? 'h-12 w-12 border-4' : 'h-5 w-5 border-2';

  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-300">
      <span className={`inline-block animate-spin rounded-full border-amber-300 border-r-transparent ${dimensions}`} />
      <span>{label}</span>
    </div>
  );
}

Loader.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'lg'])
};

Loader.defaultProps = {
  label: 'Loading...',
  size: 'sm'
};
