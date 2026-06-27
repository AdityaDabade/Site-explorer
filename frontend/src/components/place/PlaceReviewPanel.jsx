import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getFeedback, submitFeedback } from '../../api/feedbackApi';
import { extractArray, extractMessage } from '../../api/responseUtils';

function formatDate(value) {
  if (!value) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function Stars({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled || !onChange}
          onClick={() => onChange?.(rating)}
          className={`text-lg leading-none transition ${rating <= value ? 'text-amber-400' : 'text-slate-300'} ${
            onChange ? 'hover:text-amber-300' : 'cursor-default'
          }`}
          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
        >
          {'\u2605'}
        </button>
      ))}
    </div>
  );
}

export default function PlaceReviewPanel({ place }) {
  const placeId = place?.place_id || place?.id || place?._id || place?.slug;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return Number(place?.rating || 4.8).toFixed(1);
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [place?.rating, reviews]);

  const latestReviews = reviews.slice(0, 5);

  const loadReviews = async () => {
    if (!placeId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getFeedback({ placeId });
      setReviews(extractArray(response, ['feedback']));
    } catch (error) {
      toast.error(extractMessage(error, 'Unable to load reviews.'));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [placeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.comment.trim()) {
      toast.error('Please write your review before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({
        place_id: placeId,
        rating: form.rating,
        comment: form.comment.trim()
      });
      toast.success('Review submitted.');
      setForm({ rating: 5, comment: '' });
      setModalOpen(false);
      await loadReviews();
    } catch (error) {
      toast.error(extractMessage(error, 'Unable to submit review.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <aside className="place-review-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-black leading-tight text-slate-950">{'\u2b50'} Visitor Reviews</p>
            <p className="mt-2 text-sm font-black text-slate-500">
              {averageRating}/5 &bull; {reviews.length} Total Reviews
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-800"
            onClick={() => setModalOpen(true)}
          >
            Write Review
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
              Loading reviews...
            </div>
          ) : latestReviews.length ? (
            latestReviews.map((review) => {
              const name = review.user_name || review.name || 'Guest';
              return (
                <article key={review.id || review._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-black text-teal-700">
                      {name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="truncate text-sm font-black text-slate-950">{name}</p>
                          <p className="text-xs font-bold text-slate-500">{formatDate(review.created_at || review.createdAt)}</p>
                        </div>
                        <Stars value={Number(review.rating || 0)} />
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-slate-600">{review.comment}</p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
              No reviews yet.
            </div>
          )}
        </div>

        {reviews.length > 5 ? (
          <button type="button" className="mt-5 w-full text-sm font-black text-teal-700 transition hover:text-teal-900">
            View All Reviews
          </button>
        ) : null}

        <p className="mt-6 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-500">
          Share your experience to help future visitors.
        </p>
      </aside>

      {modalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <form className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20" onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Write Review</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{place?.name || 'This place'}</h2>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-600 transition hover:bg-slate-200"
                onClick={() => setModalOpen(false)}
                aria-label="Close review modal"
              >
                &times;
              </button>
            </div>

            <div className="mt-6">
              <p className="input-label">Star Rating</p>
              <div className="mt-2">
                <Stars value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} disabled={submitting} />
              </div>
            </div>

            <label className="input-wrap mt-5">
              <span className="input-label">Feedback Text</span>
              <textarea
                className="input min-h-36 resize-y"
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                placeholder="Share your experience..."
                disabled={submitting}
                required
              />
            </label>

            <button type="submit" className="btn-primary btn-full btn-lg mt-6" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

Stars.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.number.isRequired
};

PlaceReviewPanel.propTypes = {
  place: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    place_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    slug: PropTypes.string
  })
};

PlaceReviewPanel.defaultProps = {
  place: null
};
