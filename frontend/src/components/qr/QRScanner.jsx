import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ID = 'tourvision-qr-reader';

export default function QRScanner({ isOpen = true, onClose, onDetected }) {
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn('QR scanner stop warning:', error);
    }

    try {
      await scanner.clear();
    } catch (error) {
      console.warn('QR scanner cleanup warning:', error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isActive = true;
    setCameraError('');
    setLoading(true);
    setScanned(false);
    scannedRef.current = false;

    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError('Camera access requires HTTPS or localhost.');
      setLoading(false);
      return () => {
        isActive = false;
      };
    }

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        async (decodedText) => {
          if (!isActive || scannedRef.current) return;
          console.log('QR:', decodedText);
          isActive = false;
          scannedRef.current = true;
          setScanned(true);
          setLoading(true);

          try {
            await stopScanner();
            await onDetected(decodedText);
          } finally {
            setLoading(false);
          }
        }
      )
      .then(() => {
        if (isActive) {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Failed to start QR scanner:', error);
        if (isActive) {
          setCameraError(
            error?.message ||
              'Camera access was blocked. Allow camera permission and try again.'
          );
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      stopScanner();
    };
  }, [isOpen, onDetected, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="panel-strong w-full max-w-xl p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl text-white">Scan QR Code</h2>
            <p className="text-sm text-slate-400">
              Align QR code within frame
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary px-3 py-2 text-sm"
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
          >
            Close scanner
          </button>
        </div>
        <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-slate-900">
          <div id={SCANNER_ID} className="min-h-[320px]" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[260px] w-[260px] rounded-[20px] border-2 border-white/80 shadow-[0_0_0_999px_rgba(2,6,23,0.42)]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-4 text-center">
            <p className="text-sm font-semibold text-white">
              {loading || scanned ? 'Scanning...' : 'Camera ready'}
            </p>
          </div>
        </div>
        {cameraError ? (
          <div className="mt-4 rounded-[12px] border border-rose-300/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-100">
            {cameraError}
          </div>
        ) : (
          <p className="mt-4 text-center text-xs text-slate-400">
            Works on HTTPS or localhost. If the camera is blocked, allow camera access in your browser settings.
          </p>
        )}
      </div>
    </div>
  );
}

QRScanner.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onDetected: PropTypes.func.isRequired,
};
