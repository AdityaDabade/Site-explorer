import PropTypes from 'prop-types';

export default function CategoryList({ categories }) {
  return (
    <div className="filter-chips mb-6">
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};
