import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { getFeedback, submitFeedback } from '../api/feedbackApi';
import { extractArray, extractMessage } from '../api/responseUtils';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function StarRating({ disabled = false, onChange, value }) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => onChange(rating)}
          className={`text-3xl transition duration-200 disabled:cursor-not-allowed ${
            rating <= value ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
          }`}
          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
          aria-checked={rating === value}
          role="radio"
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function FeedbackSection({ embedded = false }) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    rating: 5,
    comment: ''
  });

  const displayNameHint = useMemo(() => {
    if (user?.name) {
      return `Posting as ${user.name}`;
    }

    return 'Leave blank to post as Guest.';
  }, [user?.name]);

  const loadFeedback = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getFeedback();
      setFeedback(extractArray(response, ['feedback']));
    } catch (loadError) {
      setError(extractMessage(loadError, 'Unable to load feedback right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setForm((current) => ({ ...current, name: current.name || user.name }));
    }
  }, [user?.name]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.comment.trim()) {
      toast.error('Please write your feedback before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      await submitFeedback({
        name: form.name.trim(),
        rating: form.rating,
        comment: form.comment.trim()
      });
      toast.success('Thanks for sharing your feedback.');
      setForm((current) => ({ ...current, comment: '', rating: 5 }));
      await loadFeedback();
    } catch (submitError) {
      toast.error(extractMessage(submitError, 'Unable to submit feedback.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="feedback" className={embedded ? 'scroll-mt-24 bg-slate-50 py-16 sm:py-20' : 'section-sm scroll-mt-24'}>
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="card card-bordered h-fit p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Feedback</p>
            <h1 className="mt-2 text-[2rem] font-black text-slate-950">Share your TourVision experience</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tell us what worked well and what should improve. Your feedback is saved and shown here after submission.
            </p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <label className="input-wrap">
                <span className="input-label">Name</span>
                <input
                  className="input"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={user?.name || 'Your name'}
                  disabled={submitting}
                />
                <span className="mt-1 block text-xs font-semibold text-slate-500">{displayNameHint}</span>
              </label>

              <div>
                <p className="input-label">Rating</p>
                <StarRating
                  disabled={submitting}
                  value={form.rating}
                  onChange={(rating) => setForm((current) => ({ ...current, rating }))}
                />
              </div>

              <label className="input-wrap">
                <span className="input-label">Feedback</span>
                <textarea
                  className="input min-h-36 resize-y"
                  value={form.comment}
                  onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder="Write your feedback..."
                  disabled={submitting}
                  required
                />
              </label>

              <button type="submit" className="btn-primary btn-full btn-lg" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">{feedback.length} response{feedback.length === 1 ? '' : 's'}</p>
                <h2 className="text-2xl font-black text-slate-950">Latest feedback</h2>
              </div>
              <button type="button" className="btn-outline btn-sm" onClick={loadFeedback} disabled={loading || submitting}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="card card-bordered flex min-h-56 items-center justify-center p-8">
                <Loader label="Loading feedback..." />
              </div>
            ) : error ? (
              <div className="card card-bordered border-red-200 bg-red-50 p-6 text-red-800">
                <p className="font-bold">Could not load feedback</p>
                <p className="mt-2 text-sm">{error}</p>
              </div>
            ) : feedback.length ? (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <article key={item.id} className="card card-bordered p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950">{item.user_name || item.name || 'Guest'}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {formatDate(item.created_at || item.createdAt)}
                        </p>
                      </div>
                      <div className="text-lg text-amber-400" aria-label={`${item.rating} out of 5 stars`}>
                        {'★'.repeat(Number(item.rating || 0))}
                        <span className="text-slate-300">{'★'.repeat(5 - Number(item.rating || 0))}</span>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{item.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="card card-bordered p-8 text-center">
                <p className="font-bold text-slate-950">No feedback yet.</p>
                <p className="mt-2 text-sm text-slate-500">Be the first to share your experience.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

FeedbackSection.propTypes = {
  embedded: PropTypes.bool
};

FeedbackSection.defaultProps = {
  embedded: false
};

export default function FeedbackPage() {
  return <FeedbackSection />;
}
