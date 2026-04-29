import { COLLECTIONS } from '../../../constants/homeData';

/**
 * CollectionCard — single horizontally-scrollable collection tile.
 */
function CollectionCard({ title, count, image }) {
  return (
    <article className="card card-bordered min-w-[240px] max-w-[240px] cursor-pointer p-4 hover:shadow-[var(--shadow-hover)]">
      <div className="flex gap-4">
        <img
          alt={title}
          className="h-[120px] w-[120px] rounded-[var(--r-lg)] object-cover"
          src={image}
        />
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-base">{title}</h3>
            <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{count}</p>
          </div>
          <p className="text-sm font-semibold text-[var(--c-primary)]">Explore →</p>
        </div>
      </div>
    </article>
  );
}

/**
 * CollectionsSection — horizontally scrollable curated experience collections.
 */
export default function CollectionsSection() {
  return (
    <section className="section-sm">
      <div className="container">
        <div className="section-eyebrow">Collections</div>
        <h2 className="section-title">Curated Experiences</h2>
        <div className="scroll-row mt-6">
          {COLLECTIONS.map((col) => (
            <CollectionCard key={col.title} {...col} />
          ))}
        </div>
      </div>
    </section>
  );
}
