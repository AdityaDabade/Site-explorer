import PropTypes from 'prop-types';

/**
 * Tab navigation component for place page.
 */
export default function PlaceTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="overflow-x-auto border-b border-[var(--c-border)]">
      <div className="flex min-w-max gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 pb-4 pt-2 font-semibold transition ${
              activeTab === tab
                ? 'border-[var(--c-text-primary)] text-[var(--c-text-primary)]'
                : 'border-transparent text-[var(--c-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

PlaceTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired
};
