/**
 * LocationBar
 * Shows the user's detected location, a loading state, an error,
 * or a prompt to enable location access.
 *
 * Props:
 *   location          {object|null}   { lat, lng, label? } from LocationContext
 *   isLocating        {boolean}       true while GPS is resolving
 *   error             {string|null}   error message if location failed
 *   onEnableLocation  {function}      called when user clicks "Enable location"
 */
export default function LocationBar({ location, isLocating, error, onEnableLocation }) {
  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLocating) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-white/75">
        <span className="animate-pulse">📍</span>
        <span>Detecting your location…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-white/75">
        <span>⚠️</span>
        <span>{error}</span>
        <button
          type="button"
          className="ml-1 underline underline-offset-2 hover:text-white"
          onClick={onEnableLocation}
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Location detected ─────────────────────────────────────────────────────
  if (location) {
    const label = location.label || `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-white/75">
        <span>📍</span>
        <span>Near {label}</span>
      </div>
    );
  }

  // ── Default — prompt to enable ────────────────────────────────────────────
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-white/75">
      <span>📍</span>
      <button
        type="button"
        className="underline underline-offset-2 hover:text-white"
        onClick={onEnableLocation}
      >
        Enable location for nearby places
      </button>
    </div>
  );
}
