import PropTypes from 'prop-types';

/**
 * Structured voice guide. Content is predefined; voice only reads selected text.
 */
export default function PlaceAIGuideTab({
  activeSectionId,
  captions,
  guideData,
  isSpeaking,
  onPlayNarration,
  onReplayNarration,
  onSectionSelect,
  onStartTour,
  onStopNarration,
  speechSupported
}) {
  const activeSection = guideData.sections.find((section) => section.id === activeSectionId) || guideData.sections[0];
  const displayedContent = captions || activeSection?.content || 'Choose a guide section to begin.';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--c-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
              Guided AI Voice
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Choose a section</h3>
          </div>
          <button type="button" className="btn-primary btn-sm" onClick={onStartTour}>
            Start Guide
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
                className={`group overflow-hidden rounded-xl border bg-white text-left shadow-[var(--shadow-card)] transition ${
                  active
                    ? 'border-teal-400 shadow-md shadow-teal-500/10'
                    : 'border-[var(--c-border)] hover:border-teal-200'
                }`}
              >
                <span className="relative block h-36 overflow-hidden">
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

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onPlayNarration}
            disabled={!activeSection || !speechSupported}
          >
            Play
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onReplayNarration}
            disabled={!activeSection || !speechSupported}
          >
            Replay
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onStopNarration}
            disabled={!speechSupported}
          >
            Stop
          </button>

          {isSpeaking ? (
            <div className="ml-0 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 sm:ml-2">
              <p className="text-sm font-semibold text-green-500 animate-pulse">AI is speaking...</p>
              <div className="flex h-6 items-end gap-1">
                <span className="h-2 w-1 bg-green-500 animate-bounce" />
                <span className="h-4 w-1 bg-green-500 animate-bounce delay-100" />
                <span className="h-3 w-1 bg-green-500 animate-bounce delay-200" />
              </div>
            </div>
          ) : null}
        </div>

        {!speechSupported ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Voice is not supported in this browser.
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--c-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <h3>{activeSection?.title || 'Guide content'}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isSpeaking ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isSpeaking ? 'Speaking' : 'Ready'}
          </span>
        </div>
        {activeSection?.image ? (
          <div className="mt-4 overflow-hidden rounded-xl">
            <img alt={activeSection.title} className="h-64 w-full object-cover" src={activeSection.image} />
          </div>
        ) : null}
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-inset)] p-4">
          <p className="text-base leading-7 text-[var(--c-text-secondary)]">{displayedContent}</p>
        </div>
      </div>
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
  isSpeaking: PropTypes.bool.isRequired,
  onPlayNarration: PropTypes.func.isRequired,
  onReplayNarration: PropTypes.func.isRequired,
  onSectionSelect: PropTypes.func.isRequired,
  onStartTour: PropTypes.func.isRequired,
  onStopNarration: PropTypes.func.isRequired,
  speechSupported: PropTypes.bool.isRequired
};

PlaceAIGuideTab.defaultProps = {
  captions: ''
};
