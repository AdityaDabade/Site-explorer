import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  STATUS_META,
  TRIP_STATUSES,
  calculateTripSummary,
  createTrip,
  readTripsFromStorage,
  updateTripStatus,
  writeTripsToStorage
} from '../utils/tripExpenses';

const STATUS_GROUPS = [
  { statuses: [TRIP_STATUSES.PLANNED], title: 'Planned Trips', eyebrow: 'Trip Planner', empty: 'Saved plans will appear here.' },
  { statuses: [TRIP_STATUSES.ONGOING, TRIP_STATUSES.PAUSED], title: 'Ongoing Trips', eyebrow: 'Manage Trip', empty: 'Started trips move here for live tracking and split expenses.' },
  { statuses: [TRIP_STATUSES.COMPLETED], title: 'Completed Trips', eyebrow: 'Completed', empty: 'Finished trips will collect here.' },
  { statuses: [TRIP_STATUSES.CANCELLED], title: 'Cancelled Trips', eyebrow: 'Cancelled', empty: 'Cancelled trips are archived here.' }
];

function createInitialTripForm() {
  return {
    budget: '',
    destinations: '',
    name: '',
    participants: ''
  };
}

function formatCurrency(value) {
  return `INR ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;
}

function getTripImage(trip) {
  if (trip.coverImage) {
    return trip.coverImage;
  }

  const seed = encodeURIComponent(trip.destinations?.[0] || trip.name || 'travel');
  return `https://source.unsplash.com/800x500/?${seed},travel`;
}

function ConfirmModal({ action, onClose, onConfirm }) {
  if (!action) {
    return null;
  }

  const destructive = action.type === 'delete';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md animate-[fadeIn_0.2s_ease-out] rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{destructive ? 'Delete trip' : 'Cancel trip'}</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">{action.trip.name}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {destructive
            ? 'This permanently removes the trip and its expenses from this device.'
            : 'This moves the trip into Cancelled Trips while keeping the history available.'}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700" onClick={onClose}>
            Keep Trip
          </button>
          <button
            type="button"
            className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg ${destructive ? 'bg-rose-600' : 'bg-slate-950'}`}
            onClick={() => onConfirm(action)}
          >
            {destructive ? 'Delete' : 'Cancel Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Travel management dashboard for creating, grouping, cancelling, and deleting trips.
 */
export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(() => readTripsFromStorage());
  const [form, setForm] = useState(createInitialTripForm);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const enrichedTrips = useMemo(
    () =>
      trips.map((trip) => ({
        ...trip,
        summary: calculateTripSummary(trip)
      })),
    [trips]
  );

  const stats = useMemo(() => {
    const active = enrichedTrips.filter((trip) => trip.status === TRIP_STATUSES.ONGOING);
    const totalSpent = enrichedTrips.reduce((sum, trip) => sum + trip.summary.total, 0);
    const pending = enrichedTrips.reduce((sum, trip) => sum + trip.summary.pendingSettlementTotal, 0);

    return {
      activeCount: active.length,
      pending,
      totalSpent,
      tripCount: enrichedTrips.length
    };
  }, [enrichedTrips]);

  const persistTrips = (nextTrips) => {
    setTrips(nextTrips);
    writeTripsToStorage(nextTrips);
  };

  const handleCreateTrip = (event) => {
    event.preventDefault();

    const participants = form.participants
      .split(',')
      .map((participant) => participant.trim())
      .filter(Boolean);
    const destinations = form.destinations
      .split(',')
      .map((destination) => destination.trim())
      .filter(Boolean);

    if (!form.name.trim()) {
      setError('Trip name is required.');
      return;
    }

    if (!participants.length) {
      setError('Add at least one traveler.');
      return;
    }

    const nextTrips = [
      createTrip(form.name.trim(), participants, {
        budget: Number(form.budget || 0),
        destinations,
        routeData: {
          currentStopIndex: 0,
          distanceKm: destinations.length ? destinations.length * 85 : 0,
          etaMinutes: destinations.length ? destinations.length * 95 : 0,
          progress: 0
        }
      }),
      ...trips
    ];
    persistTrips(nextTrips);
    setForm(createInitialTripForm());
    setFormOpen(false);
    setError('');
  };

  const handleStatusChange = (trip, status, options = {}) => {
    persistTrips(trips.map((currentTrip) => (currentTrip.id === trip.id ? updateTripStatus(currentTrip, status) : currentTrip)));

    if (options.openDashboard) {
      navigate(`/trips/${trip.id}`);
    }
  };

  const handleConfirm = (action) => {
    if (action.type === 'delete') {
      persistTrips(trips.filter((trip) => trip.id !== action.trip.id));
    } else {
      handleStatusChange(action.trip, TRIP_STATUSES.CANCELLED);
    }
    setConfirmAction(null);
  };

  return (
    <div className="section-sm bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)]">
      <div className="container space-y-7">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/85 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">My Trips</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black text-slate-950">Trip Planner and Manage Trip stay separate</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Save plans from Trip Planner, then start them here to enter Manage Trip for live route tracking, geofencing, split expenses, and completion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/trip-planner" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5">
                Open Trip Planner
              </Link>
              <button type="button" onClick={() => setFormOpen((current) => !current)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5">
                Quick Plan
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Managed trips', stats.tripCount],
              ['Active now', stats.activeCount],
              ['Total spend', formatCurrency(stats.totalSpent)],
              ['Pending settlement', formatCurrency(stats.pending)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          {formOpen ? (
            <form className="mt-7 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2" onSubmit={handleCreateTrip}>
              <label className="input-wrap">
                <span className="input-label">Trip Name</span>
                <input className="input" placeholder="Pune Fort Circuit" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="input-wrap">
                <span className="input-label">Travelers</span>
                <input className="input" placeholder="Rahul, Amit, Priya" value={form.participants} onChange={(event) => setForm((current) => ({ ...current, participants: event.target.value }))} />
              </label>
              <label className="input-wrap">
                <span className="input-label">Destinations</span>
                <input className="input" placeholder="Pune, Sinhagad, Rajgad" value={form.destinations} onChange={(event) => setForm((current) => ({ ...current, destinations: event.target.value }))} />
              </label>
              <label className="input-wrap">
                <span className="input-label">Trip Budget</span>
                <input className="input" min="0" placeholder="12000" type="number" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} />
              </label>

              {error ? <div className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700" onClick={() => setFormOpen(false)}>
                  Close
                </button>
                <button type="submit" className="rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg">
                  Save Planned Trip
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {STATUS_GROUPS.map((group) => {
          const groupTrips = enrichedTrips.filter((trip) => group.statuses.includes(trip.status));

          return (
            <section key={group.title} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{group.eyebrow}</p>
                  <h2 className="text-2xl font-black text-slate-950">{group.title}</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-500 shadow-sm">{groupTrips.length}</span>
              </div>

              {groupTrips.length ? (
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {groupTrips.map((trip) => {
                    const meta = STATUS_META[trip.status] || STATUS_META[TRIP_STATUSES.PLANNED];
                    const budgetUsed = trip.totalBudget ? Math.min(100, Math.round((trip.summary.total / trip.totalBudget) * 100)) : 0;
                    const destinations = trip.destinations?.length ? trip.destinations.join(' -> ') : 'Destinations not set';

                    return (
                      <article key={trip.id} className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="relative h-36 overflow-hidden">
                          <img className="h-full w-full object-cover" src={getTripImage(trip)} alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
                          <span className={`absolute left-5 top-5 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${meta.accent}`}>{meta.label}</span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="truncate text-xl font-black text-slate-950">{trip.name}</h3>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">{destinations}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{trip.participants.length} travelers</span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Travelers</p>
                              <p className="mt-1 text-lg font-black text-slate-950">{trip.participants.join(', ')}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Budget</p>
                              <p className="mt-1 text-lg font-black text-emerald-700">{trip.totalBudget ? `${formatCurrency(trip.totalBudget)} (${budgetUsed}%)` : 'Open'}</p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <Link to={`/trips/${trip.id}`} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5">
                              {trip.status === TRIP_STATUSES.PLANNED ? 'View Plan' : 'Manage Trip'}
                            </Link>
                            {trip.status === TRIP_STATUSES.PLANNED ? (
                              <button type="button" className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white" onClick={() => handleStatusChange(trip, TRIP_STATUSES.ONGOING, { openDashboard: true })}>
                                Start Trip
                              </button>
                            ) : null}
                            {trip.status === TRIP_STATUSES.ONGOING ? (
                              <button type="button" className="rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white" onClick={() => handleStatusChange(trip, TRIP_STATUSES.COMPLETED)}>
                                Finish
                              </button>
                            ) : null}
                            {trip.status === TRIP_STATUSES.PAUSED ? (
                              <button type="button" className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white" onClick={() => handleStatusChange(trip, TRIP_STATUSES.ONGOING)}>
                                Resume
                              </button>
                            ) : null}
                            {trip.status !== TRIP_STATUSES.CANCELLED && trip.status !== TRIP_STATUSES.COMPLETED ? (
                              <button type="button" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700" onClick={() => setConfirmAction({ trip, type: 'cancel' })}>
                                Cancel
                              </button>
                            ) : null}
                            <button type="button" className="rounded-2xl px-4 py-2.5 text-sm font-black text-rose-600 transition hover:bg-rose-50" onClick={() => setConfirmAction({ trip, type: 'delete' })}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-8 text-center shadow-sm">
                  <p className="font-bold text-slate-900">{group.empty}</p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <ConfirmModal action={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleConfirm} />
    </div>
  );
}
