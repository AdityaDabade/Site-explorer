import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendChatMessage } from '../api/chatApi';
import { checkPlaceGeofence, getPlaceAiContent, getPlaceById } from '../api/placeApi';
import { extractData, extractMessage } from '../api/responseUtils';
import ARViewer from '../components/ar/ARViewer';
import AROverlay from '../components/ar/AROverlay';
import AudioPlayer from '../components/common/AudioPlayer';
import PlaceCard from '../components/tour/PlaceCard';
import Loader from '../components/common/Loader';
import { useLocationContext } from '../context/LocationContext';
import { useGeofence } from '../hooks/useGeofence';

const TABS = ['Overview', 'AR Tour', 'AI Guide', 'Nearby'];

const FALLBACK_NEARBY = [
  {
    id: 'nearby-1',
    name: 'Local Museum',
    location_name: '5 min away',
    category: 'Culture',
    rating: 4.8,
    review_count: 834,
    score: 8.8,
    price: 0,
    distance: 0.8,
    has_ar: false,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'nearby-2',
    name: 'Sunset Viewpoint',
    location_name: '12 min away',
    category: 'Nature',
    rating: 4.7,
    review_count: 612,
    score: 8.9,
    price: 250,
    distance: 1.4,
    has_ar: true,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80'
  }
];

function OverviewTab({ aiContent, place }) {
  return (
    <div className="space-y-6">
      <div>
        <h3>About this place</h3>
        <p className="mt-3 text-[var(--c-text-secondary)]">
          {aiContent?.description || place?.description || 'Detailed place information is being prepared.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Best for</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{place?.best_for || 'History walks and immersive storytelling'}</p>
        </div>
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Opening hours</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">{place?.hours || 'Check local timings before visiting'}</p>
        </div>
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Entry type</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">
            {Number(place?.price || place?.entry_fee || 0) === 0 ? 'Free entry' : `Rs ${place?.price || place?.entry_fee} / person`}
          </p>
        </div>
      </div>
    </div>
  );
}

OverviewTab.propTypes = {
  aiContent: PropTypes.shape({
    description: PropTypes.string
  }),
  place: PropTypes.shape({
    best_for: PropTypes.string,
    description: PropTypes.string,
    entry_fee: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hours: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })
};

OverviewTab.defaultProps = {
  aiContent: null,
  place: null
};

function PlaceTabs({ activeTab, setActiveTab }) {
  return (
    <div className="overflow-x-auto border-b border-[var(--c-border)]">
      <div className="flex min-w-max gap-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 pb-4 pt-2 font-semibold transition ${
              activeTab === tab ? 'border-[var(--c-text-primary)] text-[var(--c-text-primary)]' : 'border-transparent text-[var(--c-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

PlaceTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};

/**
 * Airbnb-inspired place detail page with gallery, tabs, and sticky action card.
 */
export default function PlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { location } = useLocationContext();
  const [place, setPlace] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);
  const [error, setError] = useState('');
  const [insideFromServer, setInsideFromServer] = useState(null);
  const [audioSource, setAudioSource] = useState('');
  const [captions, setCaptions] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [visitDate, setVisitDate] = useState('');
  const [travelers, setTravelers] = useState('2 travelers');
  const [saved, setSaved] = useState(false);

  const isInsideLocal = useGeofence(place?.geofence_polygon, location);
  const isInsideGeofence = useMemo(() => insideFromServer ?? isInsideLocal, [insideFromServer, isInsideLocal]);
  const gallery = useMemo(() => aiContent?.images || place?.images || [], [aiContent?.images, place?.images]);
  const nearbyPlaces = useMemo(() => place?.nearby_places || FALLBACK_NEARBY, [place?.nearby_places]);
  const score = Number(place?.score || place?.rating || 9.4).toFixed(1);
  const price = Number(place?.price || place?.entry_fee || 0);

  useEffect(() => {
    let isMounted = true;

    const fetchPlace = async () => {
      setLoading(true);
      setError('');

      try {
        const placeResponse = await getPlaceById(id);
        const placeData = extractData(placeResponse);
        const nextPlace = placeData?.place || placeData;

        if (!isMounted) {
          return;
        }

        setPlace(nextPlace);

        if (nextPlace?.has_ai_content || nextPlace?.ai_content_available) {
          try {
            const aiResponse = await getPlaceAiContent(id);
            if (!isMounted) {
              return;
            }
            const aiData = extractData(aiResponse);
            const nextAiContent = aiData?.content || aiData;
            setAiContent(nextAiContent);
            setAudioSource(nextAiContent?.tts_audio_url || nextAiContent?.tts_audio || '');
          } catch (aiError) {
            if (isMounted) {
              console.warn('AI place content unavailable, falling back to static metadata.', aiError);
            }
          }
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(extractMessage(fetchError, 'Unable to load this place.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlace();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const syncGeofence = async () => {
      if (!place || !location) {
        return;
      }

      try {
        const response = await checkPlaceGeofence(id, {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy
        });
        const data = extractData(response);

        if (isMounted) {
          setInsideFromServer(Boolean(data?.isInside ?? data?.inside));
        }
      } catch (geofenceError) {
        if (isMounted) {
          console.warn('Geofence sync failed:', geofenceError);
        }
      }
    };

    syncGeofence();
    return () => {
      isMounted = false;
    };
  }, [id, location, place]);

  useEffect(() => {
    const handleNarration = (event) => {
      const payload = event.detail || {};
      const payloadPlaceId = payload.placeId || payload.place_id;
      if (payloadPlaceId && String(payloadPlaceId) !== String(id)) {
        return;
      }
      if (payload.audioUrl || payload.audio_url) {
        setAudioSource(payload.audioUrl || payload.audio_url);
      }
      if (payload.caption || payload.text) {
        setCaptions(payload.caption || payload.text);
      }
    };

    window.addEventListener('tourvision:narration', handleNarration);
    return () => window.removeEventListener('tourvision:narration', handleNarration);
  }, [id]);

  const handleStartTour = async (zone = 'outside') => {
    setGuideLoading(true);

    try {
      const response = await sendChatMessage({
        place_id: id,
        geofence_zone: zone,
        message: `Start the immersive guide for ${place?.name || 'this place'}.`
      });
      const payload = extractData(response) || {};
      setCaptions(payload.caption || payload.reply || payload.message || captions);
      setAudioSource(payload.tts_audio_url || payload.tts_audio || audioSource || aiContent?.tts_audio_url || aiContent?.tts_audio || '');
      setActiveTab('AI Guide');
      toast.success(zone === 'inside' ? 'AI guide started automatically.' : 'AI tour started.');
    } catch (guideError) {
      toast.error(extractMessage(guideError, 'Unable to start the AI guide.'));
    } finally {
      setGuideLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader label="Loading place details..." size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <div className="card card-bordered p-8">
          <h1 className="text-[2rem]">Place unavailable</h1>
          <p className="mt-3 text-[var(--c-text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  const mobileGallery = gallery.length
    ? gallery
    : [place?.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80'];

  return (
    <>
      <div className="container py-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-[var(--c-text-secondary)]">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/nearby">Explore</Link>
          <span>/</span>
          <span className="text-[var(--c-text-primary)]">{place?.name}</span>
        </div>

        <section className="overflow-hidden rounded-[var(--r-xl)]">
          <div className="hidden gap-2 lg:grid lg:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-[var(--r-xl)]">
              <img
                alt={place?.name}
                className="h-full min-h-[420px] w-full object-cover"
                src={gallery[0] || place?.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80'}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(gallery.slice(1, 5).length ? gallery.slice(1, 5) : [place?.image, place?.image, place?.image, place?.image]).map((image, index) => (
                <div key={`gallery-${index}`} className="relative overflow-hidden rounded-[var(--r-lg)]">
                  <img
                    alt={`${place?.name} ${index + 2}`}
                    className="h-full min-h-[204px] w-full object-cover"
                    src={image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'}
                  />
                  {index === 3 ? <button type="button" className="btn-ghost btn-sm absolute bottom-4 right-4">Show all photos</button> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-row pb-3 lg:hidden">
            {mobileGallery.map((image, index) => (
              <div key={`mobile-gallery-${index}`} className="min-w-full overflow-hidden rounded-[var(--r-xl)]">
                <img alt={`${place?.name} ${index + 1}`} className="h-[320px] w-full object-cover" src={image} />
              </div>
            ))}
          </div>
          <div className="step-dots py-4 lg:hidden">
            {mobileGallery.slice(0, 4).map((_, index) => (
              <span key={`dot-${index}`} className={`step-dot ${index === 0 ? 'active' : ''}`} />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,0.65fr)_minmax(320px,0.35fr)]">
          <section className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge badge-teal">AI Guide Available</span>
                <span className="badge badge-orange">AR Experience</span>
                <span className="badge badge-green">{price === 0 ? 'Free Entry' : `Rs ${price} / person`}</span>
              </div>

              <h1 className="mt-4">{place?.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--c-text-secondary)]">
                <span>{place?.location_name || place?.location || place?.city || 'TourVision destination'}</span>
                <span>•</span>
                <span>{'\u2605'} {Number(place?.rating || 4.8).toFixed(1)}</span>
                <span>•</span>
                <span>{Number(place?.review_count || 2341).toLocaleString()} reviews</span>
              </div>
            </div>

            <hr className="divider" />

            <PlaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'Overview' ? <OverviewTab aiContent={aiContent} place={place} /> : null}

            {activeTab === 'AR Tour' ? (
              <div className="space-y-5">
                <ARViewer alt={`${place?.name || 'Place'} AR model`} poster={gallery[0]} src={aiContent?.ar_model_url || place?.ar_model_url} />
                <AROverlay caption={captions || aiContent?.summary || 'Point your camera and follow the guide overlays.'} title="AR Caption Layer" />
              </div>
            ) : null}

            {activeTab === 'AI Guide' ? (
              <div className="space-y-5">
                <div className="card card-bordered p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">AI Narration</p>
                      <p className="mt-1 text-sm text-[var(--c-text-secondary)]">Context-aware narration for this landmark and the surrounding zone.</p>
                    </div>
                    <button type="button" className="btn-primary btn-sm" onClick={() => handleStartTour(isInsideGeofence ? 'inside' : 'outside')} disabled={guideLoading}>
                      {guideLoading ? 'Starting...' : 'Start AI Tour'}
                    </button>
                  </div>

                  <div className="mt-5">
                    <AudioPlayer autoPlay src={audioSource} title="Audio Guide" />
                  </div>
                </div>

                <div className="card card-bordered p-6">
                  <h3>Guide summary</h3>
                  <p className="mt-3 text-[var(--c-text-secondary)]">
                    {captions || aiContent?.summary || 'The AI guide summary will appear here once the experience starts.'}
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === 'Nearby' ? (
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h3>Nearby experiences</h3>
                  <span className="urgency-tag">42 people exploring this today</span>
                </div>
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
                  {nearbyPlaces.map((item) => (
                    <PlaceCard
                      key={item.id}
                      meta="Explore"
                      onSelect={(selected) => {
                        if (selected.id && String(selected.id).startsWith('nearby-')) {
                          toast('Sample nearby experience preview.');
                          return;
                        }
                        navigate(`/place/${selected.id}`);
                      }}
                      place={item}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="hide-mobile">
            <div className="sticky top-[110px] rounded-[var(--r-xl)] border border-[var(--c-border)] bg-white p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="score-bubble">{score}</span>
                  <p className="mt-2 text-sm font-semibold">Exceptional</p>
                </div>
                <button type="button" className="text-2xl text-[var(--c-primary)]" onClick={() => setSaved((current) => !current)} aria-label="Add to wishlist">
                  {saved ? '\u2665' : '\u2661'}
                </button>
              </div>

              <div className="mt-6">
                <p className="text-sm text-[var(--c-text-secondary)]">Price</p>
                <p className="mt-1 text-2xl font-bold">{price === 0 ? 'Free Entry' : `Rs ${price}/person`}</p>
              </div>

              <div className="mt-6 space-y-4">
                <label className="input-wrap">
                  <span className="input-label">When are you visiting?</span>
                  <input className="input" type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
                </label>

                <label className="input-wrap">
                  <span className="input-label">Travelers</span>
                  <select className="input" value={travelers} onChange={(event) => setTravelers(event.target.value)}>
                    <option>1 traveler</option>
                    <option>2 travelers</option>
                    <option>Family</option>
                    <option>Group</option>
                  </select>
                </label>
              </div>

              <button type="button" className="btn-primary btn-full btn-lg mt-6" onClick={() => handleStartTour(isInsideGeofence ? 'inside' : 'outside')} disabled={guideLoading}>
                {guideLoading ? 'Starting...' : 'Start AI Tour'}
              </button>
              <button type="button" className="btn-outline btn-full mt-3" onClick={() => setSaved((current) => !current)}>
                Add to Wishlist
              </button>

              <div className="my-5 flex items-center gap-3 text-sm text-[var(--c-text-secondary)]">
                <span className="h-px flex-1 bg-[var(--c-border)]" />
                or
                <span className="h-px flex-1 bg-[var(--c-border)]" />
              </div>

              <button type="button" className="btn-secondary btn-full" onClick={() => setActiveTab('AI Guide')}>
                Audio Guide
              </button>

              <p className="mt-4 text-sm text-[var(--c-text-secondary)]">Instant confirmation · No booking required</p>
              <div className="mt-4 urgency-tag">42 people exploring this today</div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--c-border)] bg-white px-4 py-4 shadow-[var(--shadow-card)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{price === 0 ? 'Free Entry' : `Rs ${price}/person`}</p>
            <p className="text-sm text-[var(--c-text-secondary)]">{score} · Exceptional</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => handleStartTour(isInsideGeofence ? 'inside' : 'outside')} disabled={guideLoading}>
            {guideLoading ? 'Starting...' : 'Start AI Tour'}
          </button>
        </div>
      </div>
    </>
  );
}
