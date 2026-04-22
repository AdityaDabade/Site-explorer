import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { planTrip } from '../api/tripApi';
import { extractData, extractMessage } from '../api/responseUtils';
import MapView from '../components/map/MapView';

const STEPS = [
  { label: 'Destinations' },
  { label: 'Dates' },
  { label: 'Transport' },
  { label: 'Group' }
];

const QUICK_DESTINATIONS = ['Delhi', 'Mumbai', 'Jaipur', 'Goa', 'Bengaluru', 'Udaipur'];
const QUICK_DATES = ['This Weekend', 'Next Week', 'Next Month'];
const TRANSPORT_OPTIONS = [
  { id: 'car', icon: '🚗', title: 'Car', description: 'Best for flexible intercity travel', cost: 'Avg. ₹12/km' },
  { id: 'train', icon: '🚆', title: 'Train', description: 'Comfortable and efficient for long routes', cost: 'Avg. ₹1,200/day' },
  { id: 'bike', icon: '🏍️', title: 'Bike', description: 'Great for scenic and compact trips', cost: 'Avg. ₹8/km' },
  { id: 'bus', icon: '🚌', title: 'Bus', description: 'Budget-friendly and group-ready', cost: 'Avg. ₹700/day' }
];

function StepHeader({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="mb-5 flex items-center gap-4">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                index <= currentStep ? 'bg-[var(--c-primary)] text-white' : 'bg-[var(--c-surface-inset)] text-[var(--c-text-secondary)]'
              }`}
            >
              {index + 1}
            </div>
            <div className="hide-mobile">
              <p className={`text-sm font-semibold ${index <= currentStep ? 'text-[var(--c-text-primary)]' : 'text-[var(--c-text-secondary)]'}`}>
                {step.label}
              </p>
            </div>
            {index < STEPS.length - 1 ? (
              <div className={`h-[2px] flex-1 ${index < currentStep ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-border)]'}`} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Multi-step trip planner with a Booking/Airbnb-style checkout flow.
 */
export default function TripPlannerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tripResult, setTripResult] = useState(null);
  const [destinationInput, setDestinationInput] = useState('');
  const [form, setForm] = useState({
    destinations: ['Jaipur', 'Delhi'],
    dates: 'This Weekend',
    transportMode: 'car',
    adults: 2,
    children: 0,
    seniors: 0
  });

  const totalTravelers = form.adults + form.children + form.seniors;

  const summaryTimeline = useMemo(() => {
    if (!tripResult) {
      return [];
    }

    const routeStops = tripResult?.route?.stops || tripResult?.destinations || form.destinations;
    return routeStops.map((stop, index) => ({
      day: index + 1,
      title: stop.name || stop,
      time: `${9 + index}:00 AM`
    }));
  }, [form.destinations, tripResult]);

  const routeCoordinates = useMemo(() => {
    const points = tripResult?.route?.coordinates || [];
    return points.map((point) => (Array.isArray(point) ? point : [point.lat, point.lng]));
  }, [tripResult]);

  const mapCenter = routeCoordinates.length
    ? { lat: routeCoordinates[0][0], lng: routeCoordinates[0][1] }
    : { lat: 20.5937, lng: 78.9629 };

  const addDestination = (value) => {
    const trimmed = value.trim();
    if (!trimmed || form.destinations.includes(trimmed)) {
      return;
    }
    setForm((current) => ({ ...current, destinations: [...current.destinations, trimmed] }));
    setDestinationInput('');
  };

  const removeDestination = (value) => {
    setForm((current) => ({
      ...current,
      destinations: current.destinations.filter((item) => item !== value)
    }));
  };

  const updateCount = (key, delta) => {
    setForm((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + delta)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await planTrip({
        destinations: form.destinations,
        duration: form.destinations.length,
        transport: form.transportMode,
        members: {
          adults: form.adults,
          children: form.children,
          seniors: form.seniors
        },
        datePreference: form.dates
      });
      const data = extractData(response);
      setTripResult(data?.trip || data);
      toast.success('Trip plan generated.');
    } catch (error) {
      toast.error(extractMessage(error, 'Unable to generate this trip right now.'));
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-5">
          <div className="input-wrap">
            <span className="input-label">Destinations</span>
            <input
              className="input"
              placeholder="Search and add destinations"
              value={destinationInput}
              onChange={(event) => setDestinationInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addDestination(destinationInput);
                }
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {form.destinations.map((destination) => (
              <button key={destination} type="button" className="chip active" onClick={() => removeDestination(destination)}>
                {destination} ✕
              </button>
            ))}
          </div>

          <div>
            <p className="input-label mb-2">Most visited</p>
            <div className="filter-chips pb-0">
              {QUICK_DESTINATIONS.map((item) => (
                <button key={item} type="button" className="chip" onClick={() => addDestination(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card card-bordered p-5">
              <p className="text-sm font-semibold">Start</p>
              <div className="mt-4 rounded-[var(--r-md)] bg-[var(--c-surface-inset)] p-4 text-center">
                <p className="font-heading text-lg">Fri</p>
                <p className="text-sm text-[var(--c-text-secondary)]">08 Mar</p>
              </div>
            </div>
            <div className="card card-bordered p-5">
              <p className="text-sm font-semibold">End</p>
              <div className="mt-4 rounded-[var(--r-md)] bg-[var(--c-surface-inset)] p-4 text-center">
                <p className="font-heading text-lg">Sun</p>
                <p className="text-sm text-[var(--c-text-secondary)]">10 Mar</p>
              </div>
            </div>
          </div>

          <div>
            <p className="input-label mb-2">Quick options</p>
            <div className="filter-chips pb-0">
              {QUICK_DATES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip ${form.dates === item ? 'active' : ''}`}
                  onClick={() => setForm((current) => ({ ...current, dates: item }))}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {TRANSPORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setForm((current) => ({ ...current, transportMode: option.id }))}
              className={`card card-bordered p-5 text-left transition ${
                form.transportMode === option.id ? 'border-[var(--c-primary)] bg-[var(--c-primary-light)] shadow-[var(--shadow-card)]' : ''
              }`}
            >
              <div className="text-4xl">{option.icon}</div>
              <h3 className="mt-4">{option.title}</h3>
              <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{option.description}</p>
              <p className="mt-3 text-sm font-semibold text-[var(--c-primary)]">{option.cost}</p>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {[
          ['Adults', 'adults', 'Age 13+'],
          ['Children', 'children', 'Age 2–12'],
          ['Seniors', 'seniors', 'Age 60+']
        ].map(([label, key, helper]) => (
          <div key={key} className="flex items-center justify-between rounded-[var(--r-lg)] border border-[var(--c-border)] bg-white p-5">
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-[var(--c-text-secondary)]">{helper}</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="btn-outline btn-sm !px-3" onClick={() => updateCount(key, -1)}>-</button>
              <span className="min-w-[24px] text-center font-semibold">{form[key]}</span>
              <button type="button" className="btn-outline btn-sm !px-3" onClick={() => updateCount(key, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="section-sm">
      <div className="container">
        <div className="container-sm">
          <div className="section-eyebrow">Trip Planner</div>
          <h1 className="section-title">Build your route like a polished checkout flow</h1>
          <p className="section-sub">Create a multi-stop journey, pick transport, and get a smart trip plan with route context and cost signals.</p>
        </div>

        <div className="container-sm mt-10">
          <div className="card card-bordered p-6 sm:p-8">
            <StepHeader currentStep={currentStep} />

            <div className="min-h-[320px]">{renderCurrentStep()}</div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              >
                Back
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={() => setCurrentStep((step) => Math.min(STEPS.length - 1, step + 1))}>
                  Continue
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Generating plan…' : 'Generate Trip'}
                </button>
              )}
            </div>
          </div>
        </div>

        {tripResult ? (
          <div className="mt-12 space-y-6">
            <div className="overflow-hidden rounded-[var(--r-xl)] border border-[var(--c-border)] bg-white shadow-[var(--shadow-card)]">
              <div className="h-[360px]">
                <MapView center={mapCenter} routeCoordinates={routeCoordinates} zoom={routeCoordinates.length ? 10 : 5} />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="card card-bordered p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Trip Summary</p>
                    <h2 className="mt-2">Your itinerary</h2>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" className="btn-outline btn-sm">Download PDF</button>
                    <button type="button" className="btn-primary btn-sm">Share Trip</button>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  {summaryTimeline.map((item) => (
                    <div key={`${item.day}-${item.title}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-primary-light)] font-heading font-bold text-[var(--c-primary)]">
                          {item.day}
                        </span>
                        <span className="mt-2 h-full w-px bg-[var(--c-border)]" />
                      </div>
                      <div className="pb-6">
                        <span className="badge badge-orange">Day {item.day}</span>
                        <p className="mt-2 font-semibold">{item.title}</p>
                        <p className="text-sm text-[var(--c-text-secondary)]">Estimated arrival {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="card card-bordered p-6">
                  <h3>Cost breakdown</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-[var(--c-text-secondary)]">Transport</span><span>₹4,800</span></div>
                    <div className="flex justify-between"><span className="text-[var(--c-text-secondary)]">Experiences</span><span>₹2,400</span></div>
                    <div className="flex justify-between"><span className="text-[var(--c-text-secondary)]">Food estimate</span><span>₹1,800</span></div>
                    <hr className="divider my-3" />
                    <div className="flex justify-between font-semibold"><span>Total</span><span>₹9,000</span></div>
                  </div>
                </div>

                <div className="card card-bordered p-6">
                  <h3>Plan details</h3>
                  <div className="mt-4 space-y-3 text-sm text-[var(--c-text-secondary)]">
                    <p>Destinations: {form.destinations.join(', ')}</p>
                    <p>Date preference: {form.dates}</p>
                    <p>Transport: {TRANSPORT_OPTIONS.find((item) => item.id === form.transportMode)?.title}</p>
                    <p>Group size: {totalTravelers} travelers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
