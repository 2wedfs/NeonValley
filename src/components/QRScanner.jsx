import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const divId = 'qr-scanner-div';

  useEffect(() => {
    const scanner = new Html5Qrcode(divId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {} // ignore scan errors
    ).catch(err => {
      setError('Camera access denied. Please allow camera permission and try again.');
      console.error(err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: ' rgba(0,0,0,0.92)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden mx-4"
        style={{ background: ' #0D0D0D', border: '1px solid  rgba(191,0,255,0.3)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Camera size={16} style={{ color: ' #BF00FF' }} />
            <p className="font-space font-bold text-white">Scan Code</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: ' rgba(255,255,255,0.06)' }}>
            <X size={15} color="white" />
          </button>
        </div>

        {/* Scanner */}
        <div className="px-5 pb-5">
          {error ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: ' rgba(255,60,60,0.06)', border: '1px solid  rgba(255,60,60,0.2)' }}>
              <p className="text-sm font-inter text-red-400">{error}</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid  rgba(191,0,255,0.2)' }}>
              <div id={divId} style={{ width: '100%' }} />
            </div>
          )}
          <p className="text-[10px] text-white/30 font-inter text-center mt-3">
            Point camera at a Member Pass, Ticket, or Reward barcode
          </p>
        </div>
      </div>
    </div>
  );
}
