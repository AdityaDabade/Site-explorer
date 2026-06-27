import PropTypes from 'prop-types';

/**
 * Tab navigation component for place page.
 */
export default function PlaceTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="place-tabs no-scrollbar overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`place-tab-button ${
              activeTab === tab
                ? 'place-tab-button-active'
                : 'text-slate-600 hover:text-slate-950'
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
