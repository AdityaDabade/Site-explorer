import { REVIEW_CARDS } from '../../../constants/homeData';

/**
 * ReviewCard — single traveler review card.
 */
function ReviewCard({ name, region, date, title, text, place }) {
  return (
    <article className="card card-bordered p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">
            {name} · {region}
          </p>
          <p className="text-sm text-[var(--c-text-secondary)]">{date}</p>
        </div>
        <span className="score-bubble">9.0</span>
      </div>
      <h3 className="mt-5 text-lg">{title}</h3>
      <p className="mt-3 text-[var(--c-text-secondary)]">{text}</p>
      <p className="mt-4 text-sm font-semibold text-[var(--c-primary)]">
        Reviewed {place}
      </p>
    </article>
  );
}

/**
 * ReviewsSection — aggregate rating + traveler review cards.
 */
export default function ReviewsSection() {
  return (
    <section className="section-sm">
      <div className="container">
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-[var(--c-teal)] font-heading text-4xl font-extrabold text-white">
            9.2
          </div>
          <p className="mt-5 text-2xl font-bold">Exceptional</p>
          <p className="mt-2 text-[var(--c-text-secondary)]">
            based on 50,000+ traveler reviews
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {REVIEW_CARDS.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
