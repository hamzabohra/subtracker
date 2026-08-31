import React, { useState } from 'react';
import { UserProfile } from '../types';
import { COUNTRIES_LIST, getCurrencyForCountry } from '../data/countries';

interface SettingsModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (updated: UserProfile) => void;
  onLoadDemoData?: () => void;
  onClearData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onLoadDemoData,
  onClearData,
}) => {
  const [name, setName] = useState(user.name);
  const [country, setCountry] = useState(user.country || 'United States');
  const [monthlyBudget, setMonthlyBudget] = useState(user.monthlyBudget.toString());
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const currentCurrInfo = getCurrencyForCountry(country);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(monthlyBudget) || user.monthlyBudget || 300;
    const currInfo = getCurrencyForCountry(country);

    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      country,
      monthlyBudget: parsedBudget,
      currency: currInfo.code,
      currencySymbol: currInfo.symbol,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#c4c6cf]/30 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#74777f] hover:text-[#0d1c2e] p-1 rounded-full hover:bg-[#eff4ff]"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        {/* Profile Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#c4c6cf]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#002045] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">person</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#002045]">User Profile</h3>
              <p className="text-xs text-[#43474e]">Your account details & preferences</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name - Display Only */}
          <div>
            <label className="block text-xs font-semibold text-[#74777f] mb-1">
              User Name
            </label>
            <input
              type="text"
              disabled
              value={user.name || 'User'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] border border-[#c4c6cf]/50 text-sm text-[#0d1c2e] font-semibold cursor-not-allowed"
            />
          </div>

          {/* Email Address - Display Only */}
          <div>
            <label className="block text-xs font-semibold text-[#74777f] mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email || 'No email provided'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] border border-[#c4c6cf]/50 text-sm text-[#0d1c2e] font-medium cursor-not-allowed"
            />
          </div>

          {/* Country of Residence -> Determines Currency */}
          <div>
            <label className="block text-xs font-semibold text-[#43474e] mb-1">
              Country of Residence
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] font-medium focus:ring-2 focus:ring-[#002045] focus:outline-none"
            >
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name} ({c.currencyCode} - {c.currencySymbol})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#74777f] mt-1">
              Subscription currency automatically set to: <strong>{currentCurrInfo.code} ({currentCurrInfo.symbol})</strong>
            </p>
          </div>

          {/* Monthly Target Budget */}
          <div>
            <label className="block text-xs font-semibold text-[#43474e] mb-1">
              Monthly Budget ({currentCurrInfo.symbol})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] font-bold font-mono-val focus:ring-2 focus:ring-[#002045] focus:outline-none"
            />
            <p className="text-[11px] text-[#74777f] mt-1">
              Set your target monthly spending limit
            </p>
          </div>

          {/* Alert Preferences Toggle */}
          <div className="pt-3 border-t border-[#c4c6cf]/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0d1c2e] block">
                Price Hike & Trial Alerts
              </span>
              <span className="text-[11px] text-[#74777f]">
                Receive notifications when trials or price hikes occur
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                notifications ? 'bg-[#002045]' : 'bg-[#c4c6cf]'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  notifications ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Account Data Controls */}
          <div className="pt-3 border-t border-[#c4c6cf]/30">
            <span className="text-xs font-semibold text-[#0d1c2e] block mb-2">
              Account Data Management
            </span>
            <div className="flex flex-wrap gap-2">
              {onLoadDemoData && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadDemoData();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#002045]/30 text-xs font-semibold text-[#002045] hover:bg-[#eff4ff] transition-colors"
                >
                  Populate Sample Data
                </button>
              )}
              {onClearData && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all subscription data?')) {
                      onClearData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#ba1a1a]/30 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                >
                  Clear All Subscriptions
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#c4c6cf] text-sm font-medium text-[#43474e] hover:bg-[#eff4ff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#002045] text-white text-sm font-semibold hover:bg-[#1a365d] transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
