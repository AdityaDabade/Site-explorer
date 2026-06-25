import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { sendMessage } from '../../api/chatApi';
import { extractData, extractMessage } from '../../api/responseUtils';
import Loader from '../common/Loader';

const QUICK_SUGGESTIONS = [
  'Tell me history',
  'Best time to visit',
  'Nearby hotels',
  'Nearby restaurants',
  'Route information',
  'Budget trip',
  'One day itinerary',
  'Photography spots',
  'Family friendly?',
  'Trek difficulty'
];

function getPlaceCoordinates(place) {
  const coordinates = place?.location?.coordinates || place?.coordinates;
  const latitude = place?.latitude ?? place?.lat ?? coordinates?.lat ?? coordinates?.[1];
  const longitude = place?.longitude ?? place?.lng ?? coordinates?.lng ?? coordinates?.[0];

  return { latitude, longitude };
}

function buildSelectedPlacePayload(place, weather) {
  if (!place) {
    return undefined;
  }

  const { latitude, longitude } = getPlaceCoordinates(place);

  return {
    ...place,
    id: place.place_id || place.id || place._id || place.slug,
    name: place.name,
    latitude,
    longitude,
    district: place.district || place.city || place.location_name || '',
    state: place.state || '',
    category: place.category || place.best_for || '',
    timings: place.timings || place.hours || '',
    entry_fee: place.entry_fee ?? place.price ?? 0,
    historical_summary:
      place.ai_content?.overview ||
      place.ai_content?.summary ||
      place.historical_importance_en ||
      place.historical_importance ||
      place.historical_importance_mr ||
      place.history ||
      place.ai_content?.history ||
      place.description_en ||
      place.description_mr ||
      place.description ||
      '',
    weather: weather || null
  };
}

function buildWelcomeMessage(place) {
  const placeName = place?.name || 'this place';

  return `Welcome to TourVision.\n\nYou are currently exploring ${placeName}.\n\nI can help you with its history, architecture, nearby attractions, hotels, restaurants, transport, weather, trekking information, photography spots and can even generate a personalized trip plan based on your budget.`;
}

export default function PlaceAIGuideTab({
  activeSectionId,
  captions,
  guideData,
  isPaused,
  isSpeaking,
  onListenEnglish,
  onListenMarathi,
  onPauseNarration,
  onPlayNarration,
  onResumeNarration,
  onSectionSelect,
  onStopNarration,
  place,
  speechSupported,
  weather
}) {
  const activeSection = guideData.sections.find((section) => section.id === activeSectionId) || guideData.sections[0];
  const displayedContent = captions || activeSection?.content || 'Choose a guide section to begin.';
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: buildWelcomeMessage(place)
    }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${place?.place_id || place?.id || place?.slug || place?.name || 'place'}`,
        role: 'assistant',
        content: buildWelcomeMessage(place)
      }
    ]);
  }, [place?.id, place?.name, place?.place_id, place?.slug]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendAiMessage = async (message) => {
    const outgoingMessage = String(message || '').trim();

    if (!outgoingMessage) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: outgoingMessage
      }
    ]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage({
        message: outgoingMessage,
        place_id: place?.place_id || place?.id || place?._id || place?.slug,
        selected_place: buildSelectedPlacePayload(place, weather),
        geofence_zone: 'general',
        current_page: 'Place'
      });
      const data = extractData(response);
      const replyText = data?.reply || data?.message || data?.text;

      if (!replyText) {
        throw new Error('Empty AI response');
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: extractMessage(error, 'AI Travel Assistant is temporarily unavailable.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendAiMessage(input);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-teal-100 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              🎤 Voice Guide
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">Heritage narration from MongoDB</h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPaused ? 'bg-amber-100 text-amber-700' : isSpeaking ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isPaused ? 'Paused' : isSpeaking ? 'Speaking' : 'Ready'}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onListenEnglish}
            disabled={!speechSupported}
          >
            Listen in English
          </button>
          <button
            type="button"
            className="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onListenMarathi}
            disabled={!speechSupported}
          >
            मराठीत ऐका
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onPlayNarration}
            disabled={!activeSection || !speechSupported}
          >
            Start Audio Guide
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onPauseNarration}
            disabled={!speechSupported || !isSpeaking || isPaused}
          >
            Pause
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onResumeNarration}
            disabled={!speechSupported || !isPaused}
          >
            Resume
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onStopNarration}
            disabled={!speechSupported || (!isSpeaking && !isPaused)}
          >
            Stop
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {guideData.sections.map((section) => {
            const active = section.id === activeSectionId;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionSelect(section)}
                className={`group overflow-hidden rounded-lg border bg-white text-left shadow-[var(--shadow-card)] transition ${
                  active
                    ? 'border-teal-400 shadow-md shadow-teal-500/10'
                    : 'border-[var(--c-border)] hover:border-teal-200'
                }`}
              >
                <span className="relative block h-32 overflow-hidden">
                  <img
                    alt={section.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    src={
                      section.image ||
                      guideData.image ||
                      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80'
                    }
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white">{section.title}</span>
                </span>
                <span className="block p-4">
                  <span className="block line-clamp-3 text-sm leading-6 text-[var(--c-text-secondary)]">
                    {section.content}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-inset)] p-4">
          <p className="whitespace-pre-line text-base leading-7 text-[var(--c-text-secondary)]">{displayedContent}</p>
        </div>

        {!speechSupported ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Voice is not supported in this browser.
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-[var(--shadow-card)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            💬 AI Travel Assistant
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Ask AI</h3>
        </div>

        <div ref={scrollRef} className="mt-5 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg px-4 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] bg-teal-600 text-white'
                  : 'mr-auto max-w-[92%] border border-slate-200 bg-white text-slate-700'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          ))}
          {loading ? <Loader label="Gemini is preparing context..." size="sm" /> : null}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-wait disabled:opacity-60"
              disabled={loading}
              onClick={() => sendAiMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
          <textarea
            className="field min-h-24 resize-none"
            placeholder="Ask about this place, nearby services, weather, budget, itinerary, trek, or photo spots..."
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" className="btn-primary self-end px-5 py-3" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  );
}

PlaceAIGuideTab.propTypes = {
  activeSectionId: PropTypes.string.isRequired,
  captions: PropTypes.string,
  guideData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    image: PropTypes.string,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        image: PropTypes.string
      })
    ).isRequired
  }).isRequired,
  isPaused: PropTypes.bool.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  onListenEnglish: PropTypes.func.isRequired,
  onListenMarathi: PropTypes.func.isRequired,
  onPauseNarration: PropTypes.func.isRequired,
  onPlayNarration: PropTypes.func.isRequired,
  onResumeNarration: PropTypes.func.isRequired,
  onSectionSelect: PropTypes.func.isRequired,
  onStopNarration: PropTypes.func.isRequired,
  place: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    ai_content: PropTypes.object,
    best_for: PropTypes.string,
    category: PropTypes.string,
    city: PropTypes.string,
    coordinates: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    description: PropTypes.string,
    description_en: PropTypes.string,
    description_mr: PropTypes.string,
    district: PropTypes.string,
    entry_fee: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    historical_importance: PropTypes.string,
    historical_importance_en: PropTypes.string,
    historical_importance_mr: PropTypes.string,
    history: PropTypes.string,
    hours: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    location_name: PropTypes.string,
    longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    place_id: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    slug: PropTypes.string,
    state: PropTypes.string,
    timings: PropTypes.string
  }),
  speechSupported: PropTypes.bool.isRequired,
  weather: PropTypes.object
};

PlaceAIGuideTab.defaultProps = {
  captions: '',
  place: null,
  weather: null
};
