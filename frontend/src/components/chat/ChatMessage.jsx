import PropTypes from 'prop-types';

/**
 * Individual chat bubble inside the floating AI assistant.
 */
export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={[
          'max-w-[85%] rounded-[12px] px-4 py-3 text-sm leading-6 shadow-soft',
          isAssistant
            ? 'bg-white/[0.08] text-slate-100'
            : 'bg-[linear-gradient(135deg,_rgba(96,165,250,0.92),_rgba(56,189,248,0.82))] text-white'
        ].join(' ')}
      >
        {message.content}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['assistant', 'user']).isRequired
  }).isRequired
};
