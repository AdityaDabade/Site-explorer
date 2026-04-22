import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ID = 'tourvision-qr-reader';

export default function QRScanner({ isOpen = false, onClose, onDetected }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isActive = true;
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (!isActive) return;
          isActive = false;
          try {
            await scanner.stop();
            await scanner.clear();
          } catch (error) {
            console.warn('QR scanner cleanup warning:', error);
          }
          onDetected(decodedText);
        }
      )
      .catch((error) => {
        console.error('Failed to start QR scanner:', error);
      });

    return () => {
      isActive = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => undefined)
          .finally(() => scannerRef.current?.clear().catch(() => undefined));
      }
    };
  }, [isOpen, onDetected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="panel-strong w-full max-w-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl text-white">Scan QR Code</h2>
            <p className="text-sm text-slate-400">
              Point your camera at an on-site TourVision marker.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary px-3 py-2 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div
          id={SCANNER_ID}
          className="overflow-hidden rounded-[12px] bg-slate-900"
        />
      </div>
    </div>
  );
}

QRScanner.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onDetected: PropTypes.func.isRequired,
};