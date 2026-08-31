import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface InterstitialAdModalProps {
  isOpen: boolean;
  user?: UserProfile;
  title?: string;
  subtitle?: string;
  adUnitId?: string;
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  title = 'Subscription Added Successfully!',
  subtitle = 'Sponsored Ad &bull; Helps keep SubTracker free for everyone',
  adUnitId = 'ca-app-pub-3940256099942544/1033173712', // Official Google AdMob Test Interstitial ID
  onClose,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown when modal opens
    setCountdown(5);
    setCanSkip(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        id="admob-interstitial-card"
        className="bg-[#0b1329] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-100 flex flex-col"
      >
        {/* Top bar with Ad label, Countdown / Close button */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Ad
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Google AdMob Interstitial</span>
          </div>

          <div className="flex items-center gap-2">
            {!canSkip ? (
              <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                Skip in {countdown}s
              </span>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Ad Body / Media Showcase */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[36px]">verified_user</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 mt-1" dangerouslySetInnerHTML={{ __html: subtitle }} />
          </div>

          {/* Interactive Sponsored Offer Card */}
          <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-left space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Featured Partner Offer
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Save $120/yr
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Bundle your AI, VPN & Cloud Storage into one unified billing plan with 50% cash-back on annual renewal.
            </p>

            <a
              href="https://vibedevs.online"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg text-center shadow transition-all"
            >
              Explore Deal &rarr;
            </a>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Unit ID: {adUnitId}
          </div>
        </div>
      </div>
    </div>
  );
};
