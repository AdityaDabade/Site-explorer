import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * TTS audio player that can auto-play freshly generated narration tracks.
 */
export default function AudioPlayer({ autoPlay, src, title }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (autoPlay && src && audioRef.current) {
      audioRef.current.play().catch(() => undefined);
    }
  }, [autoPlay, src]);

  if (!src) {
    return (
      <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
        Narration audio will appear here when the guide generates TTS output.
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <audio ref={audioRef} className="w-full" controls src={src}>
        <track kind="captions" />
      </audio>
    </div>
  );
}

AudioPlayer.propTypes = {
  autoPlay: PropTypes.bool,
  src: PropTypes.string,
  title: PropTypes.string
};

AudioPlayer.defaultProps = {
  autoPlay: false,
  src: '',
  title: 'Audio'
};
