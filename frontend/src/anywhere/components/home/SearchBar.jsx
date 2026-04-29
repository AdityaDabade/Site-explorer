/**
 * SearchBar
 * Three-field search widget: destination, date, and traveler count.
 * Calls onSubmit when the search button is clicked.
 *
 * Props:
 *   search          {object}    { destination: string, date: string, travelers: string }
 *   onSearchChange  {function}  called with the updated search object on any field change
 *   onSubmit        {function}  called when the user clicks the Search button
 */
export default function SearchBar({ search, onSearchChange, onSubmit }) {
  const update = (field) => (e) =>
    onSearchChange({ ...search, [field]: e.target.value });

  return (
    <div className="mt-6 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col divide-y divide-gray-100 sm:flex-row sm:divide-x sm:divide-y-0">

        {/* Destination */}
        <div className="flex flex-1 flex-col px-5 py-4">
          <label className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Where to?
          </label>
          <input
            type="text"
            placeholder="Search destinations"
            value={search.destination}
            onChange={update('destination')}
            className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Date */}
        <div className="flex flex-1 flex-col px-5 py-4">
          <label className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            When
          </label>
          <input
            type="text"
            placeholder="Any week"
            value={search.date}
            onChange={update('date')}
            className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Travelers */}
        <div className="flex flex-1 flex-col px-5 py-4">
          <label className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Travelers
          </label>
          <input
            type="text"
            placeholder="Any travelers"
            value={search.travelers}
            onChange={update('travelers')}
            className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center px-4 py-3 sm:py-0">
          <button
            type="button"
            onClick={onSubmit}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--c-primary)] px-6 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
          >
            {/* Search icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
        </div>

      </div>
    </div>
  );
}
