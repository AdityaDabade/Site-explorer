import { FEATURE_ROWS } from '../../../constants/homeData';

/**
 * FeatureRow — alternating image + text feature block.
 *
 * Props:
 *   badge   {string}
 *   title   {string}
 *   body    {string}
 *   cta     {string}
 *   image   {string}
 *   bullets {string[]}
 *   reverse {boolean} flips image/text order on large screens
 */
function FeatureRow({ badge, title, body, cta, image, bullets, reverse }) {
  return (
    <div
      className={`grid items-center gap-8 lg:grid-cols-2 ${
        reverse ? 'lg:[&>div:first-child]:order-2' : ''
      }`}
    >
      <div className="overflow-hidden rounded-[var(--r-2xl)]">
        <img alt={title} className="h-[420px] w-full object-cover" src={image} />
      </div>
      <div>
        <span className="badge badge-orange">{badge}</span>
        <h2 className="mt-4">{title}</h2>
        <p className="mt-4 max-w-[520px] text-[var(--c-text-secondary)]">{body}</p>
        <ul className="mt-5 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm">
              <span className="mt-1 text-[var(--c-success)]">✓</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-primary mt-6">
          {cta}
        </button>
      </div>
    </div>
  );
}

/**
 * FeatureRowsSection - alternating feature highlights.
 */
export default function FeatureRowsSection() {
  return (
    <section className="section">
      <div className="container space-y-12">
        {FEATURE_ROWS.map((feature, index) => (
          <FeatureRow key={feature.title} {...feature} reverse={index % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
