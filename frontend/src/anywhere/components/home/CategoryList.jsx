/**
 * CategoryList
 * Renders a row of pill badges inside the hero section.
 *
 * Props:
 *   categories {string[]}  e.g. ['Monuments', 'Nature', 'Food']
 */
export default function CategoryList({ categories = [] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {categories.map((cat) => (
        <span
          key={cat}
          className="rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          {cat}
        </span>
      ))}
    </div>
  );
}
