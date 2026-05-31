import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/map/MapView';
import {
  DEFAULT_ORIGIN,
  TRANSPORT_OPTIONS,
  estimateTripCosts,
  estimateWeather,
  fetchRoutePlan,
  formatCurrency,
  formatDistance,
  formatDuration,
  resolveDestinationPlace
} from '../utils/tripPlanning';
import { TRIP_STATUSES, createTrip, readTripsFromStorage, updateTripStatus, writeTripsToStorage } from '../utils/tripExpenses';

const QUICK_DESTINATIONS = ['Sinhagad', 'Rajgad', 'Torna', 'Lohagad', 'Mumbai', 'Goa', 'Jaipur', 'Delhi'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getTripDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Number.isFinite(diff) ? diff : 1);
}

function getDefaultTravelerNames(count) {
  return Array.from({ length: Math.max(Number(count || 1), 1) }, (_, index) => `Traveler ${index + 1}`);
}

function StepCard({ active, label, meta, value }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{meta}</p>
    </div>
  );
}

function DestinationPicker({ destinationInput, destinations, onAdd, onInputChange, onRemove }) {
  const filtered = QUICK_DESTINATIONS.filter((destination) => destination.toLowerCase().includes(destinationInput.toLowerCase()));

  return (
    <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Select destinations</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Build the route before the journey starts</h2>
        </div>
        <div className="flex min-w-0 gap-2 lg:w-[420px]">
          <input
            className="input"
            placeholder="Search or type a place"
            value={destinationInput}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAdd(destinationInput);
              }
            }}
          />
          <button type="button" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={() => onAdd(destinationInput)}>
            Add
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(destinationInput ? filtered : QUICK_DESTINATIONS).map((destination) => (
          <button
            key={destination}
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-teal-200 hover:bg-teal-50"
            onClick={() => onAdd(destination)}
          >
            {destination}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {destinations.length ? (
          destinations.map((destination, index) => {
            const place = resolveDestinationPlace(destination, index);
            return (
              <button
                key={destination}
                type="button"
                className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => onRemove(destination)}
              >
                <div className="h-24 bg-slate-200">
                  {place.image ? <img alt="" className="h-full w-full object-cover" src={place.image} /> : null}
                </div>
                <div className="p-4">
                  <p className="font-black text-slate-950">{index + 1}. {destination}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">{place.terrain}</p>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-rose-500">Tap to remove</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center font-bold text-slate-500 sm:col-span-2 xl:col-span-4">
            Add destinations to calculate distance, ETA, cost, and weather.
          </div>
        )}
      </div>
    </section>
  );
}

function DateTransportPanel({ duration, form, onChange, routePlan }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Select dates</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Trip window</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="input-wrap">
            <span className="input-label">Start date</span>
            <input className="input" type="date" value={form.startDate} onChange={(event) => onChange('startDate', event.target.value)} />
          </label>
          <label className="input-wrap">
            <span className="input-label">End date</span>
            <input className="input" min={form.startDate} type="date" value={form.endDate} onChange={(event) => onChange('endDate', event.target.value)} />
          </label>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px] sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Duration</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{duration} day{duration === 1 ? '' : 's'}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{form.durationManual ? 'Manual override active' : 'Auto-calculated from dates'}</p>
            </div>
            <label className="input-wrap">
              <span className="input-label">Override days</span>
              <input className="input" min="1" type="number" value={form.duration} onChange={(event) => onChange('duration', Number(event.target.value || 1))} />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Select transport</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Mode and route ETA</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {TRANSPORT_OPTIONS.map((transport) => {
            const active = form.transport === transport.id;
            return (
              <button
                key={transport.id}
                type="button"
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${active ? 'border-teal-300 bg-teal-50 shadow-lg shadow-teal-100' : 'border-slate-200 bg-slate-50'}`}
                onClick={() => onChange('transport', transport.id)}
              >
                <p className="font-black text-slate-950">{transport.label}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{formatCurrency(transport.ratePerKm)}/km estimate</p>
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <StepCard active label="Distance" meta={routePlan?.source === 'osrm' ? 'OSRM road route' : 'Direct fallback'} value={formatDistance(routePlan?.totalDistanceKm || 0)} />
          <StepCard active label="ETA" meta="Estimated travel time" value={formatDuration(routePlan?.totalDurationMin || 0)} />
        </div>
      </div>
    </section>
  );
}

function CostWeatherPanel({ costs, destinations, form, routePlan }) {
  const weather = destinations.map((destination, index) => ({
    ...resolveDestinationPlace(destination, index),
    ...estimateWeather(destination, form.startDate)
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Estimated cost</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Budget prediction</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Fuel / travel', costs.fuelCost + costs.travelCost],
            ['Entry fees', costs.entryFees],
            ['Food', costs.foodCost],
            ['Stay', costs.stayCost],
            ['Miscellaneous', costs.miscellaneous],
            ['Per person', costs.perPerson]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
              <p className="mt-2 text-xl font-black text-slate-950">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-emerald-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-black text-emerald-800">Estimated trip budget</p>
            <p className="text-3xl font-black text-emerald-700">{formatCurrency(costs.total)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Weather forecast</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Trekking readiness</h2>
        <div className="mt-5 space-y-3">
          {weather.length ? (
            weather.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">{item.trekking}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-950">{item.temperature} C</p>
                    <p className="text-sm font-bold text-sky-600">{item.rainChance}% rain</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center font-bold text-slate-500">
              Weather appears after you add destinations.
            </div>
          )}
        </div>
        <p className="mt-4 text-xs font-bold text-slate-400">Forecast is an in-app estimate for planning. Live weather API can replace this later.</p>
      </div>
    </section>
  );
}

function TravelerDetails({ form, onTravelerCountChange, onTravelerNameChange }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Traveler Details</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Names saved into the trip</h2>
        </div>
        <label className="input-wrap">
          <span className="input-label">Traveler count</span>
          <input className="input" min="1" type="number" value={form.travelerCount} onChange={(event) => onTravelerCountChange(Number(event.target.value || 1))} />
        </label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {form.travelerNames.map((name, index) => (
          <label key={`traveler-${index + 1}`} className="input-wrap">
            <span className="input-label">Traveler {index + 1}</span>
            <input className="input" value={name} onChange={(event) => onTravelerNameChange(index, event.target.value)} />
          </label>
        ))}
      </div>
    </section>
  );
}

function RoutePreview({ onLocateMe, origin, originStatus, routePlan, selectedPlaceId, setSelectedPlaceId }) {
  const places = routePlan?.stops || [];
  const center = places.find((place) => String(place.id) === String(selectedPlaceId)) || places[0] || origin || DEFAULT_ORIGIN;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Route preview map</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Markers, route lines, distance, and ETA</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Route starts from {origin.name || 'Current Location'}{originStatus ? ` - ${originStatus}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-500">
          <button type="button" className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white" onClick={onLocateMe}>
            Locate Me
          </button>
          <span>{formatDistance(routePlan?.totalDistanceKm || 0)} / {formatDuration(routePlan?.totalDurationMin || 0)}</span>
        </div>
      </div>
      <div className="h-[420px]">
        <MapView
          center={center}
          onMarkerClick={(place) => setSelectedPlaceId(place.id)}
          places={places}
          recenterOnCenterChange
          routeCoordinates={routePlan?.routeCoordinates || []}
          selectedPlaceId={selectedPlaceId}
          userLocation={origin}
          zoom={places.length ? 10 : 12}
        />
      </div>
    </section>
  );
}

export default function TripPlannerPage() {
  const navigate = useNavigate();
  const [destinationInput, setDestinationInput] = useState('');
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [originStatus, setOriginStatus] = useState('Using fallback until GPS is allowed');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);
  const [routePlan, setRoutePlan] = useState({
    routeCoordinates: [],
    segments: [],
    source: 'direct',
    stops: [],
    totalDistanceKm: 0,
    totalDurationMin: 0
  });
  const [form, setForm] = useState({
    destinations: [],
    duration: getTripDays(todayIso(), addDaysIso(2)),
    durationManual: false,
    endDate: addDaysIso(2),
    startDate: todayIso(),
    transport: 'car',
    travelerCount: 2,
    travelerNames: getDefaultTravelerNames(2)
  });

  const duration = Math.max(1, Number(form.duration || 1));
  const costs = useMemo(
    () =>
      estimateTripCosts({
        days: duration,
        destinations: form.destinations,
        routePlan,
        transport: form.transport,
        travelers: form.travelerCount
      }),
    [duration, form.destinations, form.transport, form.travelerCount, routePlan]
  );

  const requestPlanningLocation = () => {
    if (!navigator.geolocation) {
      setOriginStatus('Geolocation unavailable');
      return;
    }

    setOriginStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          accuracy: position.coords.accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location'
        });
        setOriginStatus(`Accuracy ${Math.round(position.coords.accuracy)} m`);
      },
      () => {
        setOrigin(DEFAULT_ORIGIN);
        setOriginStatus('Using Pune fallback');
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestPlanningLocation();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!form.destinations.length) {
        setRoutePlan({ routeCoordinates: [], segments: [], source: 'direct', stops: [], totalDistanceKm: 0, totalDurationMin: 0 });
        return;
      }

      setRouteLoading(true);
      const nextRoutePlan = await fetchRoutePlan(origin, form.destinations, form.transport);

      if (!cancelled) {
        setRoutePlan(nextRoutePlan);
        setSelectedPlaceId((current) => (nextRoutePlan.stops.some((stop) => String(stop.id) === String(current)) ? current : nextRoutePlan.stops[0]?.id || null));
        setRouteLoading(false);
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [form.destinations, form.transport, origin.lat, origin.lng]);

  const handleChange = (field, value) => {
    setSavedTripId(null);
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === 'startDate' || field === 'endDate') {
        const startDate = field === 'startDate' ? value : current.startDate;
        const endDate = field === 'endDate' ? value : current.endDate;
        if (!current.durationManual) {
          next.duration = getTripDays(startDate, endDate);
        }
      }

      if (field === 'duration') {
        next.duration = Math.max(1, Number(value || 1));
        next.durationManual = true;
      }

      return next;
    });
  };

  const handleAddDestination = (value) => {
    const trimmed = value.trim();

    if (!trimmed || form.destinations.includes(trimmed)) {
      return;
    }

    handleChange('destinations', [...form.destinations, trimmed]);
    setDestinationInput('');
  };

  const handleRemoveDestination = (destination) => {
    handleChange(
      'destinations',
      form.destinations.filter((item) => item !== destination)
    );
  };

  const handleTravelerCountChange = (count) => {
    const nextCount = Math.max(1, Number(count || 1));
    setSavedTripId(null);
    setForm((current) => {
      const names = [...current.travelerNames];
      while (names.length < nextCount) {
        names.push(`Traveler ${names.length + 1}`);
      }
      return {
        ...current,
        travelerCount: nextCount,
        travelerNames: names.slice(0, nextCount)
      };
    });
  };

  const handleTravelerNameChange = (index, value) => {
    setSavedTripId(null);
    setForm((current) => ({
      ...current,
      travelerNames: current.travelerNames.map((name, currentIndex) => (currentIndex === index ? value : name))
    }));
  };

  const handleSavePlan = () => {
    if (!form.destinations.length) {
      toast.error('Add at least one destination before saving.');
      return null;
    }

    const tripName = `${form.destinations[0]}${form.destinations.length > 1 ? ` + ${form.destinations.length - 1} stops` : ''}`;
    const travelerNames = form.travelerNames.map((name, index) => name.trim() || `Traveler ${index + 1}`);
    const trip = createTrip(tripName, travelerNames, {
      budget: costs.total,
      destinationDetails: routePlan.stops,
      destinations: form.destinations,
      duration,
      endDate: form.endDate,
      routeData: {
        completedStopIds: [],
        currentStopIndex: 0,
        distanceKm: routePlan.totalDistanceKm,
        etaMinutes: routePlan.totalDurationMin,
        progress: 0,
        routeCoordinates: routePlan.routeCoordinates,
        segments: routePlan.segments,
        source: routePlan.source
      },
      startDate: form.startDate,
      transport: form.transport
    });

    writeTripsToStorage([trip, ...readTripsFromStorage()]);
    setSavedTripId(trip.id);
    toast.success('Plan saved to My Trips.');
    return trip;
  };

  const handleStartTrip = () => {
    const savedTrips = readTripsFromStorage();
    const existingTrip = savedTripId ? savedTrips.find((trip) => trip.id === savedTripId) : null;
    const tripToStart = existingTrip || handleSavePlan();

    if (!tripToStart) {
      return;
    }

    const currentTrips = readTripsFromStorage();
    writeTripsToStorage(
      currentTrips.map((trip) => (trip.id === tripToStart.id ? updateTripStatus(trip, TRIP_STATUSES.ONGOING) : trip))
    );
    navigate(`/trips/${tripToStart.id}`);
  };

  return (
    <div className="section-sm bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)]">
      <div className="container space-y-6">
        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-600">Trip Planner</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Plan first. Manage live trips later.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                Choose destinations, dates, transport, route distance, ETA, weather, and budget. Live tracking and split expenses start only after the plan is saved and started from My Trips.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[440px]">
              <StepCard active label="Stops" meta="Selected" value={form.destinations.length} />
              <StepCard active label="Duration" meta="Calculated" value={`${duration} day${duration === 1 ? '' : 's'}`} />
              <StepCard active={!routeLoading} label="Route" meta={routeLoading ? 'Calculating' : routePlan.source.toUpperCase()} value={formatDistance(routePlan.totalDistanceKm)} />
            </div>
          </div>
        </section>

        <DestinationPicker
          destinationInput={destinationInput}
          destinations={form.destinations}
          onAdd={handleAddDestination}
          onInputChange={setDestinationInput}
          onRemove={handleRemoveDestination}
        />

        <DateTransportPanel duration={duration} form={form} onChange={handleChange} routePlan={routePlan} />

        <TravelerDetails form={form} onTravelerCountChange={handleTravelerCountChange} onTravelerNameChange={handleTravelerNameChange} />

        <CostWeatherPanel costs={costs} destinations={form.destinations} form={form} routePlan={routePlan} />

        <RoutePreview
          onLocateMe={requestPlanningLocation}
          origin={origin}
          originStatus={originStatus}
          routePlan={routePlan}
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
        />

        <section className="rounded-3xl border border-white/80 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">Save plan</p>
              <h2 className="mt-2 text-3xl font-black">Ready for My Trips</h2>
              <p className="mt-2 text-sm font-semibold text-slate-300">Save to My Trips, or start immediately and open Manage Trip.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded-2xl bg-teal-500 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5" onClick={handleSavePlan}>
                {savedTripId ? 'Trip Saved' : 'Save Trip'}
              </button>
              <button type="button" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5" onClick={handleStartTrip}>
                Start Trip
              </button>
              <Link to="/trips" className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5">
                Open My Trips
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
