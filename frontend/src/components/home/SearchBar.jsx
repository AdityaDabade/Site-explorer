import PropTypes from 'prop-types';

export default function SearchBar({ onSearchChange, onSubmit, search }) {
  return (
    <div className="mt-8 overflow-hidden rounded-[28px] bg-white p-2 shadow-[var(--shadow-search)]">
      <div className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
        <label className="input-wrap rounded-[22px] px-4 py-3 hover:bg-[var(--c-surface-inset)]">
          <span className="input-label">Destination</span>
          <input
            className="border-none bg-transparent p-0 text-[15px] shadow-none focus:shadow-none"
            placeholder="Search destinations"
            value={search.destination}
            onChange={(event) =>
              onSearchChange((current) => ({
                ...current,
                destination: event.target.value,
              }))
            }
          />
        </label>

        <label className="input-wrap rounded-[22px] px-4 py-3 hover:bg-[var(--c-surface-inset)]">
          <span className="input-label">Date</span>
          <select
            className="border-none bg-transparent p-0 text-[15px] shadow-none focus:shadow-none"
            value={search.date}
            onChange={(event) =>
              onSearchChange((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
          >
            <option>Any week</option>
            <option>This weekend</option>
            <option>Next week</option>
            <option>Next month</option>
          </select>
        </label>

        <label className="input-wrap rounded-[22px] px-4 py-3 hover:bg-[var(--c-surface-inset)]">
          <span className="input-label">Travelers</span>
          <select
            className="border-none bg-transparent p-0 text-[15px] shadow-none focus:shadow-none"
            value={search.travelers}
            onChange={(event) =>
              onSearchChange((current) => ({
                ...current,
                travelers: event.target.value,
              }))
            }
          >
            <option>Any travelers</option>
            <option>Solo</option>
            <option>Couple</option>
            <option>Family</option>
            <option>Group</option>
          </select>
        </label>

        <button type="button" className="btn-amber btn-lg" onClick={onSubmit}>
          Search
        </button>
      </div>
    </div>
  );
}

SearchBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  search: PropTypes.shape({
    destination: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    travelers: PropTypes.string.isRequired,
  }).isRequired,
};
