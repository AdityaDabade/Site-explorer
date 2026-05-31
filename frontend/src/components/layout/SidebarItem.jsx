import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Reusable sidebar navigation item with active styling and collapsed tooltip support.
 */
export default function SidebarItem({
  icon,
  isActive,
  isCollapsed,
  label,
  onClick,
  showTooltip,
  to
}) {
  return (
    <div className="group relative flex justify-center">
      <Link
        to={to}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        title={isCollapsed ? label : undefined}
        className={[
          'relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-sm font-semibold transition-colors duration-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2',
          isCollapsed ? 'justify-center' : 'justify-start',
          isActive
            ? 'bg-gradient-to-br from-teal-500 to-purple-600 text-white shadow-lg shadow-teal-500/25'
            : 'bg-white/55 text-slate-600 hover:bg-white hover:text-teal-700'
        ].join(' ')}
      >
        <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300">
          {icon}
        </span>
        <span
          className={[
            'relative z-10 whitespace-nowrap transition-all duration-300',
            isCollapsed ? 'hidden' : 'w-auto translate-x-0 opacity-100'
          ].join(' ')}
        >
          {label}
        </span>
      </Link>

      {showTooltip && isCollapsed ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

SidebarItem.propTypes = {
  icon: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  showTooltip: PropTypes.bool,
  to: PropTypes.string.isRequired
};

SidebarItem.defaultProps = {
  isActive: false,
  isCollapsed: false,
  onClick: undefined,
  showTooltip: true
};
