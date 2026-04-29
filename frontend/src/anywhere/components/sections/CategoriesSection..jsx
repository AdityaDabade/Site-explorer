import { CATEGORIES } from '../../../constants/homeData';

/**
 * CategoryCard — individual category tile with image overlay.
 */
function CategoryCard({ title, image }) {
  return (
    <article className="relative h-40 cursor-pointer overflow-hidden rounded-[var(--r-xl)]">
      <img
        alt={title}
        className="h-full w-full object-cover transition duration-300 hover:scale-105"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
      <p className="absolute bottom-4 left-4 font-heading text-lg font-bold text-white">
        {title}
      </p>
    </article>
  );
}

/**
 * CategoriesSection — "Things To Do" grid of category tiles.
 */
export default function CategoriesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-eyebrow">Things To Do</div>
        <h2 className="section-title">What do you want to explore?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
