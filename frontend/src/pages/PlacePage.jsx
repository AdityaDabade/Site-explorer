import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendMessage } from '../api/chatApi';
import { checkGeofence, getAiContent, getPlaceById } from '../api/placeApi';
import { extractData, extractMessage } from '../api/responseUtils';
import Loader from '../components/common/Loader';
import {
  PlaceGallery,
  PlaceHeader,
  PlaceOverviewTab,
  PlaceARTourTab,
  PlaceAIGuideTab,
  PlaceNearbyTab,
  PlaceTabs,
  PlaceActionCard,
  PlaceMobileActionBar
} from '../components/place';
import { useLocationContext } from '../context/LocationContext';
import { useGeofence } from '../hooks/useGeofence';

const TABS = ['Overview', 'AR Tour', 'AI Guide', 'Nearby'];

/**
 * PlacePage — Main place detail page orchestrating all place-related components.
 * Data-fetching, state management, and event handling logic.
 */
export default function PlacePage() {
  const { id } = useParams();
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

  // Derived state
  const isInsideLocal = useGeofence(place?.geofence_polygon, location);
  const isInsideGeofence = useMemo(() => insideFromServer ?? isInsideLocal, [insideFromServer, isInsideLocal]);
  const gallery = useMemo(() => aiContent?.images || place?.images || [], [aiContent?.images, place?.images]);
  const nearbyPlaces = useMemo(() => place?.nearby_places || [], [place?.nearby_places]);
  const score = Number(place?.score || place?.rating || 9.4).toFixed(1);
  const price = Number(place?.price || place?.entry_fee || 0);

  // Fetch place details
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
            const aiResponse = await getAiContent(id);
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

  // Sync geofence status with server
  useEffect(() => {
    let isMounted = true;

    const syncGeofence = async () => {
      if (!place || !location) {
        return;
      }

      try {
        const response = await checkGeofence(id, {
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

  // Listen for narration events
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

  // Handle starting AI tour
  const handleStartTour = async (zone = 'outside') => {
    setGuideLoading(true);

    try {
      const response = await sendMessage({
        place_id: id,
        geofence_zone: zone,
        message: `Start the immersive guide for ${place?.name || 'this place'}.`
      });
      const payload = extractData(response) || {};
      setCaptions(payload.caption || payload.reply || payload.message || captions);
      setAudioSource(
        payload.tts_audio_url ||
          payload.tts_audio ||
          audioSource ||
          aiContent?.tts_audio_url ||
          aiContent?.tts_audio ||
          ''
      );
      setActiveTab('AI Guide');
      toast.success(zone === 'inside' ? 'AI guide started automatically.' : 'AI tour started.');
    } catch (guideError) {
      toast.error(extractMessage(guideError, 'Unable to start the AI guide.'));
    } finally {
      setGuideLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader label="Loading place details..." size="lg" />
        </div>
      </div>
    );
  }

  // Error state
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

  // Badge elements
  const badges = (
    <>
      <span className="badge badge-teal">AI Guide Available</span>
      <span className="badge badge-orange">AR Experience</span>
    </>
  );

  return (
    <>
      <div className="container py-8">
        {/* Header and Gallery */}
        <PlaceHeader place={place} badges={badges} />

        <div className="mt-8">
          <PlaceGallery gallery={gallery} placeName={place?.name} mobileGallery={mobileGallery} />
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,0.65fr)_minmax(320px,0.35fr)]">
          {/* Left Section - Tabs and Content */}
          <section className="space-y-8">
            <hr className="divider" />

            <PlaceTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />

            {/* Tab Content */}
            {activeTab === 'Overview' && <PlaceOverviewTab aiContent={aiContent} place={place} />}

            {activeTab === 'AR Tour' && (
              <PlaceARTourTab aiContent={aiContent} captions={captions} gallery={gallery} place={place} />
            )}

            {activeTab === 'AI Guide' && (
              <PlaceAIGuideTab
                aiContent={aiContent}
                audioSource={audioSource}
                captions={captions}
                guideLoading={guideLoading}
                isInsideGeofence={isInsideGeofence}
                onStartTour={handleStartTour}
              />
            )}

            {activeTab === 'Nearby' && <PlaceNearbyTab nearbyPlaces={nearbyPlaces} />}
          </section>

          {/* Right Sidebar - Action Card */}
          <PlaceActionCard
            guideLoading={guideLoading}
            isInsideGeofence={isInsideGeofence}
            onAddToWishlist={() => setSaved((current) => !current)}
            onStartTour={handleStartTour}
            onViewGuide={() => setActiveTab('AI Guide')}
            onTravelersChange={setTravelers}
            onVisitDateChange={setVisitDate}
            price={price}
            saved={saved}
            score={score}
            travelers={travelers}
            visitDate={visitDate}
          />
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <PlaceMobileActionBar
        guideLoading={guideLoading}
        isInsideGeofence={isInsideGeofence}
        onStartTour={handleStartTour}
        price={price}
        score={score}
      />
    </>
  );
}
