import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { socketUrl } from '../config/runtime';

/**
 * Shared socket hook for AI job progress and live narration events.
 */
export function useSocket({ onProgress, onNarration, enabled = true } = {}) {
  const socketRef = useRef(null);
  const progressHandlerRef = useRef(onProgress);
  const narrationHandlerRef = useRef(onNarration);

  progressHandlerRef.current = onProgress;
  narrationHandlerRef.current = onNarration;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const token = localStorage.getItem('tourvision_token');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined
    });

    socketRef.current = socket;

    socket.on('job:progress', (payload) => {
      progressHandlerRef.current?.(payload);
    });

    socket.on('guide:narration', (payload) => {
      narrationHandlerRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  return {
    socket: socketRef.current
  };
}
