import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getPlaces } from "../api/placeApi";
import { extractArray as sharedExtractArray } from "../api/responseUtils";
import QRScanner from "../components/qr/QRScanner";
import { useLocationContext } from "../context/LocationContext";
import { parsePlaceIdFromQr } from "../utils/qr";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=90&w=3840";

const CATEGORY_PILLS = ["Monuments", "Nature", "Food", "Culture", "Beaches"];

const CATEGORIES = [
  {
    title: "Monuments",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Nature",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Food Tours",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "AR Experiences",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Cultural Sites",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Hidden Gems",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
  },
];

const COLLECTIONS = [
  {
    title: "Top UNESCO Sites",
    count: "28 experiences",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "AR-Ready Monuments",
    count: "14 immersive tours",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Hidden Gems",
    count: "36 local favorites",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Budget-Friendly Tours",
    count: "42 easy escapes",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Family Adventures",
    count: "19 all-ages routes",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
  },
];

const FEATURE_ROWS = [
  {
    badge: "AUGMENTED REALITY",
    title: "Step Inside History",
    body: "Bring ruins, plazas, forts, and galleries to life with scene-aware overlays that tell richer stories the moment you arrive.",
    cta: "Try AR Tour",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop",
    bullets: [
      "3D reconstructions over real landmarks",
      "Guided camera checkpoints",
      "Captions and narration in sync",
    ],
  },
  {
    badge: "AI GUIDE",
    title: "Your Personal Historian",
    body: "Ask follow-up questions, unlock place-specific narration, and get smart recommendations that adapt to where you are and what you like.",
    cta: "Meet Your AI Guide",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop",
    bullets: [
      "Location-aware storytelling",
      "Multilingual support",
      "Contextual nearby suggestions",
    ],
  },
  {
    badge: "SMART PLANNING",
    title: "One App, Entire Journey",
    body: "Plan routes, coordinate group travel, estimate costs, and keep every landmark, booking, and memory flowing together in one timeline.",
    cta: "Plan a Trip",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop",
    bullets: [
      "Collaborative itinerary planning",
      "Weather and road alerts",
      "Shared budgets and travel stories",
    ],
  },
];

const REVIEW_CARDS = [
  {
    name: "Aditi",
    region: "India",
    date: "March 2026",
    title: "Best city guide we used this year",
    text: "The AR layer at the fort completely changed the experience. We understood the place in minutes and the route suggestions were spot on.",
    place: "Amber Fort",
  },
  {
    name: "Luca",
    region: "Italy",
    date: "February 2026",
    title: "Felt like a local companion",
    text: "The app balanced maps, narration, and discovery really well. It was clean, fast, and surprisingly helpful when we changed plans.",
    place: "Jaipur Old City",
  },
  {
    name: "Maya",
    region: "United States",
    date: "January 2026",
    title: "Loved the stress-free planning",
    text: "We used TourVision for places, route planning, and trip splitting. Everything felt polished and easy to trust.",
    place: "Gateway of India",
  },
];

const FALLBACK_PLACES = [
  {
    id: "rajgad",
    name: "Rajgad Fort",
    location_name: "Pune, Maharashtra",
    category: "Historic Fort",
    distance: 18.5,
    rating: 4.7,
    review_count: 3200,
    price: 0,
    free_entry: true,
    has_ar: true,
    image: "/images/rajgad-fort.jpg",
    score: 9.2,
  },
  {
    id: 1,
    name: "Amber Fort",
    location_name: "Jaipur, India",
    category: "Historic Fort",
    distance: 2.1,
    rating: 4.9,
    review_count: 2341,
    price: 0,
    free_entry: true,
    has_ar: true,
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=900&auto=format&fit=crop&q=80",
    score: 9.1,
  },
  {
    id: 2,
    name: "Marine Drive",
    location_name: "Mumbai, India",
    category: "Waterfront",
    distance: 3.4,
    rating: 4.8,
    review_count: 1820,
    price: 250,
    free_entry: false,
    has_ar: false,
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=900&auto=format&fit=crop&q=80",
    score: 8.9,
  },
  {
    id: 3,
    name: "Humayun Tomb",
    location_name: "Delhi, India",
    category: "UNESCO Site",
    distance: 5.3,
    rating: 4.9,
    review_count: 3011,
    price: 300,
    free_entry: false,
    has_ar: true,
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&auto=format&fit=crop&q=80",
    score: 9.4,
  },
  {
    id: 4,
    name: "Sunset Cliffs",
    location_name: "Goa, India",
    category: "Nature Escape",
    distance: 1.8,
    rating: 4.7,
    review_count: 954,
    price: 0,
    free_entry: true,
    has_ar: false,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80",
    score: 8.8,
  },
];

const RAJGAD_TRENDING_PLACE = FALLBACK_PLACES[0];

const REGION_FILTERS = [
  "All",
  "India",
  "Europe",
  "Asia",
  "Americas",
  "Middle East",
];

function normalizePlace(place, index) {
  return {
    id: place.id || index + 1,
    name: place.name || place.title || `Place ${index + 1}`,
    location_name:
      place.location_name || place.city || "TourVision destination",
    category: place.category || place.type || "Experience",
    distance: Number(place.distance || 0),
    rating: Number(place.rating || 4.8),
    review_count: place.review_count || place.reviews || 1200 + index * 117,
    price: Number(place.price || place.entry_fee || 0),
    free_entry: Number(place.price || place.entry_fee || 0) === 0,
    has_ar: Boolean(place.has_ar || place.ar_model_url),
    image:
      place.image ||
      place.images?.[0] ||
      FALLBACK_PLACES[index % FALLBACK_PLACES.length].image,
    score: Number(place.score || 8.7 + (index % 5) * 0.2).toFixed(1),
    region:
      place.region || place.country || (index % 2 === 0 ? "India" : "Asia"),
  };
}

function ensureRajgadPlace(places) {
  const hasRajgad = places.some((place) => String(place.id).toLowerCase() === "rajgad");
  return hasRajgad ? places : [RAJGAD_TRENDING_PLACE, ...places];
}

// Safe helper — handles every possible API response shape
function extractArray(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const d = response.data ?? response;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.places)) return d.places;
  if (d && Array.isArray(d.results)) return d.results;
  if (d && Array.isArray(d.items)) return d.items;
  if (d && Array.isArray(d.data)) return d.data;
  console.warn("extractArray: unexpected shape", response);
  return [];
}

function ListingCard({ onOpen, onToggleSave, place, saved = false }) {
  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/70 ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-slate-300/50"
      onClick={() => onOpen(place)}
    >
      <div className="relative aspect-[20/19] overflow-hidden bg-[var(--c-surface-inset)]">
        <img
          alt={place.name}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
          src={place.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(place.id);
          }}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl text-white shadow-lg backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 active:scale-95"
          aria-label="Save place"
        >
          {saved ? "♥" : "♡"}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] backdrop-blur-md">
              {place.category}
            </span>
            {place.has_ar && (
              <span className="rounded-full bg-teal-400/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-950">
                AR
              </span>
            )}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-extrabold leading-tight text-white">
                {place.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-white/80">
                {place.location_name}
              </p>
            </div>
            <span className="rounded-xl bg-white px-3 py-1.5 font-heading text-sm font-extrabold text-slate-950 shadow-lg">
              {place.score}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="badge badge-neutral">
            {place.distance ? `${place.distance.toFixed(1)} km` : "Nearby"}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
            {place.free_entry ? "Free entry" : "Premium"}
          </span>
        </div>
        <div className="hidden">
          <h3 className="font-heading text-[1rem] font-semibold leading-6">
            {place.name}
          </h3>
          <span className="score-bubble">{place.score}</span>
        </div>

        <div className="hidden">
          <span>{place.location_name}</span>
          <span className="badge badge-neutral">
            {place.distance ? `${place.distance.toFixed(1)} km` : "Nearby"}
          </span>
        </div>

        <div className="hidden">
          <span className="badge badge-neutral">{place.category}</span>
          {place.has_ar && (
            <span className="badge badge-teal">AR Available</span>
          )}
        </div>

        <div className="mt-0 flex items-center justify-between gap-3 text-[13px] text-[var(--c-text-secondary)]">
          ★ {place.rating.toFixed(1)} ·{" "}
          {Number(place.review_count).toLocaleString()} reviews
        </div>

        <div className="mt-2 font-semibold text-[var(--c-text-primary)]">
          {place.free_entry
            ? "From Rs 0 · Free Entry"
            : `Rs ${place.price} / person`}
        </div>
      </div>
    </article>
  );
}

ListingCard.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onToggleSave: PropTypes.func.isRequired,
  place: PropTypes.shape({
    category: PropTypes.string,
    distance: PropTypes.number,
    free_entry: PropTypes.bool,
    has_ar: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    image: PropTypes.string.isRequired,
    location_name: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    rating: PropTypes.number.isRequired,
    review_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
  saved: PropTypes.bool,
};

export default function Home() {
  const navigate = useNavigate();
  const { location } = useLocationContext();

  const [trendingPlaces, setTrendingPlaces] = useState(FALLBACK_PLACES);
  const [loading, setLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState("All");
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState({
    destination: "",
    date: "",
    travelers: "Any travelers",
  });
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTrending = async () => {
      if (!location) return;
      setLoading(true);
      try {
        const response = await getPlaces({
          lat: location.lat,
          lng: location.lng,
          radius: 20,
        });
        const list = sharedExtractArray(response);
        const normalized = list.map(normalizePlace);
        if (isMounted && normalized.length) {
          setTrendingPlaces(ensureRajgadPlace(normalized));
        }
      } catch (error) {
        if (isMounted) {
          console.warn("Trending places fallback engaged.", error);
          // FALLBACK_PLACES already set as initial state — nothing else needed
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTrending();
    return () => {
      isMounted = false;
    };
  }, [location]);

  const filteredPlaces = useMemo(() => {
    if (activeRegion === "All") return trendingPlaces;
    return trendingPlaces.filter((p) =>
      `${p.region} ${p.location_name}`
        .toLowerCase()
        .includes(activeRegion.toLowerCase()),
    );
  }, [activeRegion, trendingPlaces]);

  const handleSearchSubmit = () => navigate("/nearby");

  const handleQrDetected = async (decodedText) => {
    const placeId = parsePlaceIdFromQr(decodedText);

    if (!placeId) {
      toast.error("Invalid QR");
      return;
    }

    setScannerOpen(false);
    toast.success("Opening your landmark experience.");
    navigate(`/place/${placeId}`);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-emerald-950">
        <img
          alt="Foggy monsoon mountains inspired by Rajgad Fort"
          className="absolute inset-0 h-full w-full scale-105 object-cover saturate-[1.12] contrast-[1.06] hue-rotate-[12deg] transition-transform duration-700"
          src={HERO_IMAGE}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.6)_60%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(34,197,94,0.28),transparent_28%),radial-gradient(circle_at_72%_12%,rgba(13,148,136,0.18),transparent_26%),linear-gradient(120deg,rgba(6,78,59,0.38),transparent_52%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-950/80 to-transparent" />
        <div className="container relative z-10 w-full pb-[96px] pt-24">
          <div className="max-w-[760px] animate-[fadeUp_0.7s_var(--ease-out)_both]">
            <div className="mb-5 inline-flex rounded-full border border-white/25 bg-white/20 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:bg-white/25 hover:shadow-xl">
              Hi Rahul 👋
            </div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300 drop-shadow">
              Explore near your location
            </p>
            {/* Category pills */}
            <div className="filter-chips mb-6">
              {CATEGORY_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-semibold text-white shadow-black/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-emerald-200/70 hover:bg-white/25 hover:shadow-xl hover:shadow-emerald-500/20"
                >
                  {pill}
                </span>
              ))}
            </div>

            <h1 className="max-w-[780px] animate-[fadeUp_0.8s_var(--ease-out)_0.08s_both] text-6xl font-extrabold leading-tight text-white drop-shadow-[0_10px_34px_rgba(0,0,0,0.65)] sm:text-7xl lg:text-8xl">
              Explore the World&apos;s Most
              <br />
              Incredible Places
            </h1>
            <p className="mt-5 max-w-[620px] text-lg font-medium text-white/85 drop-shadow md:text-xl">
              AI-powered tours, AR experiences, and smart trip planning
            </p>

            {/* Search bar */}
            <div className="mt-9 overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-2 shadow-xl shadow-black/35 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-emerald-200/60 hover:bg-white/25 hover:shadow-2xl hover:shadow-emerald-950/30">
              <div className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                <label className="input-wrap rounded-2xl border border-white/20 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-300/80">
                  <span className="input-label text-emerald-700">Destination</span>
                  <input
                    className="border-none bg-transparent p-0 text-[15px] text-slate-950 shadow-none outline-none placeholder:text-slate-400 focus:shadow-none"
                    placeholder="Search destinations"
                    value={search.destination}
                    onChange={(e) =>
                      setSearch((s) => ({ ...s, destination: e.target.value }))
                    }
                  />
                </label>

                <label className="input-wrap rounded-2xl border border-white/20 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-300/80">
                  <span className="input-label text-emerald-700">Date</span>
                  <input
                    type="date"
                    className="border-none bg-transparent p-0 text-[15px] text-slate-950 shadow-none outline-none focus:shadow-none"
                    value={search.date}
                    onChange={(e) =>
                      setSearch((s) => ({ ...s, date: e.target.value }))
                    }
                  />
                </label>

                <label className="input-wrap rounded-2xl border border-white/20 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-300/80">
                  <span className="input-label text-emerald-700">Travelers</span>
                  <select
                    className="border-none bg-transparent p-0 text-[15px] text-slate-950 shadow-none outline-none focus:shadow-none"
                    value={search.travelers}
                    onChange={(e) =>
                      setSearch((s) => ({ ...s, travelers: e.target.value }))
                    }
                  >
                    <option>Any travelers</option>
                    <option>Solo</option>
                    <option>Couple</option>
                    <option>Family</option>
                    <option>Group</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 px-8 py-4 font-heading text-base font-extrabold text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:shadow-xl hover:shadow-emerald-500/25 active:scale-95"
                  onClick={handleSearchSubmit}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 active:scale-95"
                onClick={() => setScannerOpen(true)}
              >
                Scan QR Code
              </button>
              <button
                type="button"
                className="rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 active:scale-95"
                onClick={() => navigate("/trip-planner")}
              >
                Start planning
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar shadow-sm">
        <div className="trust-item">
          <span className="trust-item-icon">✓</span>Free Cancellation
        </div>
        <div className="trust-item">
          <span className="trust-item-icon">📍</span>500+ Destinations
        </div>
        <div className="trust-item">
          <span className="trust-item-icon">★</span>4.9/5 Rating
        </div>
        <div className="trust-item">
          <span className="trust-item-icon">🤖</span>AI-Powered Guides
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="section-eyebrow">Things To Do</div>
          <h2 className="section-title">What do you want to explore?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <article
                key={cat.title}
                className="group relative h-44 cursor-pointer overflow-hidden rounded-2xl shadow-lg shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl"
              >
                <img
                  alt={cat.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  src={cat.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <p className="absolute bottom-4 left-4 font-heading text-lg font-bold text-white">
                  {cat.title}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING PLACES ── */}
      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-eyebrow">Discover</div>
              <h2 className="section-title">Trending right now</h2>
            </div>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-bold text-teal-700 transition-all duration-300 hover:bg-teal-50 hover:text-indigo-700 active:scale-95"
              onClick={() => navigate("/nearby")}
            >
              Show all →
            </button>
          </div>

          {/* Region filter chips */}
          <div className="filter-chips mt-5">
            {REGION_FILTERS.map((region) => (
              <button
                key={region}
                type="button"
                className={`chip ${activeRegion === region ? "active" : ""}`}
                onClick={() => setActiveRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {loading ? (
            <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-${i}`} className="space-y-3">
                  <div className="skeleton aspect-[20/19] rounded-[var(--r-lg)]" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton h-4 w-3/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
              {filteredPlaces.slice(0, 8).map((place) => (
                <ListingCard
                  key={place.id}
                  place={place}
                  saved={savedIds.includes(place.id)}
                  onOpen={(p) => navigate(`/place/${p.id}`)}
                  onToggleSave={(id) =>
                    setSavedIds((s) =>
                      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="section-eyebrow">Collections</div>
          <h2 className="section-title">Curated Experiences</h2>
          <div className="scroll-row mt-6">
            {COLLECTIONS.map((col) => (
              <article
                key={col.title}
                className="card card-bordered min-w-[260px] max-w-[260px] cursor-pointer p-4 shadow-md shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl"
              >
                <div className="flex gap-4">
                  <img
                    alt={col.title}
                    className="h-[120px] w-[120px] rounded-2xl object-cover"
                    src={col.image}
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-base">{col.title}</h3>
                      <p className="mt-2 text-sm text-[var(--c-text-secondary)]">
                        {col.count}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--c-primary)]">
                      Explore →
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE ROWS ── */}
      <section className="bg-slate-50 py-20">
        <div className="container space-y-12">
          {FEATURE_ROWS.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid items-center gap-8 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="overflow-hidden rounded-3xl shadow-xl shadow-slate-300/50">
                <img
                  alt={feature.title}
                  className="h-[420px] w-full object-cover transition-all duration-500 hover:scale-[1.03]"
                  src={feature.image}
                />
              </div>
              <div>
                <span className="badge badge-orange">{feature.badge}</span>
                <h2 className="mt-4">{feature.title}</h2>
                <p className="mt-4 max-w-[520px] text-[var(--c-text-secondary)]">
                  {feature.body}
                </p>
                <ul className="mt-5 space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm">
                      <span className="mt-1 text-[var(--c-success)]">✓</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-primary mt-6">
                  {feature.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-indigo-600 font-heading text-4xl font-extrabold text-white shadow-xl shadow-teal-500/25">
              9.2
            </div>
            <p className="mt-5 text-2xl font-bold">Exceptional</p>
            <p className="mt-2 text-[var(--c-text-secondary)]">
              based on 50,000+ traveler reviews
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {REVIEW_CARDS.map((review) => (
              <article
                key={review.name}
                className="card card-bordered p-6 shadow-md shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {review.name} · {review.region}
                    </p>
                    <p className="text-sm text-[var(--c-text-secondary)]">
                      {review.date}
                    </p>
                  </div>
                  <span className="score-bubble">9.0</span>
                </div>
                <h3 className="mt-5 text-lg">{review.title}</h3>
                <p className="mt-3 text-[var(--c-text-secondary)]">
                  {review.text}
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--c-primary)]">
                  Reviewed {review.place}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD CTA ── */}
      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-10 text-white shadow-2xl shadow-slate-300/60 md:px-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="badge badge-amber">App Download</span>
                <h2 className="mt-4 text-white">
                  Take TourVision with you everywhere
                </h2>
                <p className="mt-4 max-w-[520px] text-white/75">
                  Save places, start AI tours instantly, scan QR codes on the
                  go, and plan entire journeys right from your phone.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className="btn-ghost">
                    App Store
                  </button>
                  <button type="button" className="btn-ghost">
                    Google Play
                  </button>
                </div>
              </div>

              {/* Phone mockup */}
              <div className="mx-auto w-full max-w-[360px] rounded-[32px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mx-auto w-full max-w-[250px] rounded-[28px] bg-white p-4 text-[var(--c-text-primary)] shadow-[var(--shadow-modal)]">
                  <div className="rounded-[20px] bg-[var(--c-bg)] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">TourVision</span>
                      <span className="badge badge-orange">Live</span>
                    </div>
                    <div className="mt-4 rounded-[18px] bg-[var(--c-teal-light)] p-4">
                      <p className="text-sm font-semibold">Explore Nearby</p>
                      <p className="mt-1 text-xs text-[var(--c-text-secondary)]">
                        AR tours · audio guides · saved trips
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[16px] bg-white p-3 shadow-[var(--shadow-card)]">
                        <p className="text-sm font-semibold">Amber Fort</p>
                        <p className="text-xs text-[var(--c-text-secondary)]">
                          AR Ready · 2.1 km away
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-white p-3 shadow-[var(--shadow-card)]">
                        <p className="text-sm font-semibold">
                          Today&apos;s plan
                        </p>
                        <p className="text-xs text-[var(--c-text-secondary)]">
                          3 places · Rs 1,240 total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1A1A1A] py-14 text-white">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-heading text-2xl font-extrabold">TourVision</p>
              <p className="mt-4 max-w-[260px] text-white/65">
                Travel with AI-powered stories, AR experiences, and smart
                planning from discovery to arrival.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg font-bold">Discover</p>
              <ul className="mt-4 space-y-3 text-white/65">
                {[
                  "Trending places",
                  "Collections",
                  "AR experiences",
                  "Nearby guides",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-heading text-lg font-bold">Company</p>
              <ul className="mt-4 space-y-3 text-white/65">
                {["About", "Careers", "Partners", "Press"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-heading text-lg font-bold">Support</p>
              <ul className="mt-4 space-y-3 text-white/65">
                {[
                  "Help Center",
                  "Accessibility",
                  "Cancellation options",
                  "Contact us",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span>© 2026 TourVision</span>
              <span>Instagram</span>
              <span>X</span>
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-4">
              <span>English (IN)</span>
              <span>Rs INR</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── QR SCANNER MODAL ── */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleQrDetected}
      />
    </>
  );
}
