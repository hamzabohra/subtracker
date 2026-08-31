import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AdBannerProps {
  format?: 'banner' | 'native' | 'inline' | 'sticky-bottom';
  adSlotId?: string;
  user?: UserProfile;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format = 'inline',
  adSlotId = 'ca-app-pub-3940256099942544/6300978111', // Official Google Test Banner Ad Unit ID
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  if (format === 'sticky-bottom') {
    return (
      <div
        id="admob-sticky-banner-container"
        className={`fixed bottom-0 left-0 right-0 z-30 bg-[#080e18]/95 backdrop-blur border-t border-slate-700/60 py-1.5 px-4 flex items-center justify-center gap-3 ${className}`}
      >
        <div className="max-w-[728px] w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-700/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Ad
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[400px]">
              Compare streaming deals & save up to $180/year on subscriptions
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded hover:bg-slate-800 transition-colors"
              title="Close Ad"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'native') {
    return (
      <div
        id="admob-native-card"
        className={`bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-900/40 border border-blue-500/20 rounded-xl p-4 sm:p-5 relative overflow-hidden transition-all shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Sponsored
            </span>
            <span className="text-xs text-slate-400">Google AdMob / Partner Deal</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
              <span className="material-symbols-outlined text-[24px]">savings</span>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100">
                Unlock 40% Off Cloud Storage & VPN Plans
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Exclusive subscriber discounts on annual software bundles.
              </p>
            </div>
          </div>

          <a
            href="https://vibedevs.online"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg text-center transition-colors shadow-sm shrink-0"
          >
            Claim Offer
          </a>
        </div>

        <div className="mt-2 text-[10px] text-slate-500 font-mono text-right">
          Ad Unit: {adSlotId}
        </div>
      </div>
    );
  }

  // Default Inline Banner
  return (
    <div
      id="admob-inline-banner"
      className={`w-full my-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Ad
        </span>
        <span className="text-xs text-slate-300">
          Google Mobile Ads Banner (Adaptive 320x50 / 728x90)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-300"
          title="Dismiss ad"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
