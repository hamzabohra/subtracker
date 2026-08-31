import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { COUNTRIES_LIST, getCurrencyForCountry } from '../data/countries';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendLocalNotification,
  sendTestEmailAlert,
} from '../lib/notifications';

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

  // Notification testing states
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSendingDeviceTest, setIsSendingDeviceTest] = useState(false);
  const [deviceTestMsg, setDeviceTestMsg] = useState<string | null>(null);

  const [isSendingEmailTest, setIsSendingEmailTest] = useState(false);
  const [emailTestMsg, setEmailTestMsg] = useState<{ success: boolean; text: string; previewUrl?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getNotificationPermissionStatus().then(setPermissionStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCurrInfo = getCurrencyForCountry(country);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      setDeviceTestMsg('Device notification permission granted!');
      sendLocalNotification(
        '🔔 SubTracker Notifications Enabled',
        'You will now receive alerts 1 day before trials & subscriptions expire.'
      );
    } else {
      setDeviceTestMsg('Permission was not granted in browser/device settings.');
    }
  };

  const handleSendTestDeviceNotification = async () => {
    setIsSendingDeviceTest(true);
    setDeviceTestMsg(null);

    const success = await sendLocalNotification(
      '⚠️ Test Alert: Netflix Free Trial Ends Tomorrow',
      'This is a test notification from SubTracker. Your alert system is working properly!'
    );

    if (success) {
      setDeviceTestMsg('Test alert sent! Check your notification tray / screen.');
    } else {
      setDeviceTestMsg('Notification permission required or blocked. Click Enable below.');
    }
    setIsSendingDeviceTest(false);
  };

  const handleSendTestEmail = async () => {
    if (!user.email || !user.email.includes('@')) {
      setEmailTestMsg({ success: false, text: 'No valid user email found in profile.' });
      return;
    }

    setIsSendingEmailTest(true);
    setEmailTestMsg(null);

    const res = await sendTestEmailAlert(user.email, 'Netflix Trial');
    setEmailTestMsg({
      success: res.success,
      text: res.message,
      previewUrl: res.previewUrl,
    });
    setIsSendingEmailTest(false);
  };

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
      <div className="bg-white dark:bg-[#131d2e] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#c4c6cf]/30 dark:border-[#2a384e] relative max-h-[90vh] overflow-y-auto text-[#0d1c2e] dark:text-[#e2e8f0]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#74777f] hover:text-[#0d1c2e] dark:hover:text-white p-1 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#1a293f]"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        {/* Profile Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#c4c6cf]/30 dark:border-[#2a384e]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#002045] dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">person</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#002045] dark:text-white">Settings & Alerts</h3>
              <p className="text-xs text-[#43474e] dark:text-slate-400">Account details & notification center</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name - Display Only */}
          <div>
            <label className="block text-xs font-semibold text-[#74777f] dark:text-slate-400 mb-1">
              User Name
            </label>
            <input
              type="text"
              disabled
              value={user.name || 'User'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] dark:bg-[#1a273b] border border-[#c4c6cf]/50 dark:border-[#2b3c55] text-sm text-[#0d1c2e] dark:text-white font-semibold cursor-not-allowed"
            />
          </div>

          {/* Email Address - Display Only */}
          <div>
            <label className="block text-xs font-semibold text-[#74777f] dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email || 'No email provided'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] dark:bg-[#1a273b] border border-[#c4c6cf]/50 dark:border-[#2b3c55] text-sm text-[#0d1c2e] dark:text-white font-medium cursor-not-allowed"
            />
          </div>

          {/* Country of Residence -> Determines Currency */}
          <div>
            <label className="block text-xs font-semibold text-[#43474e] dark:text-slate-300 mb-1">
              Country of Residence
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] dark:border-[#2b3c55] dark:bg-[#182438] text-sm text-[#0d1c2e] dark:text-white font-medium focus:ring-2 focus:ring-[#002045] focus:outline-none"
            >
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.name} className="dark:bg-[#182438] dark:text-white">
                  {c.name} ({c.currencyCode} - {c.currencySymbol})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#74777f] dark:text-slate-400 mt-1">
              Subscription currency automatically set to: <strong>{currentCurrInfo.code} ({currentCurrInfo.symbol})</strong>
            </p>
          </div>

          {/* Monthly Target Budget */}
          <div>
            <label className="block text-xs font-semibold text-[#43474e] dark:text-slate-300 mb-1">
              Monthly Budget ({currentCurrInfo.symbol})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] dark:border-[#2b3c55] dark:bg-[#182438] text-sm text-[#0d1c2e] dark:text-white font-bold font-mono-val focus:ring-2 focus:ring-[#002045] focus:outline-none"
            />
            <p className="text-[11px] text-[#74777f] dark:text-slate-400 mt-1">
              Set your target monthly spending limit
            </p>
          </div>

          {/* Notification Diagnostics & Testing Center */}
          <div className="pt-3 border-t border-[#c4c6cf]/30 dark:border-[#2a384e] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#002045] dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                Notifications & Alert Center
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {permissionStatus === 'granted' ? '● Push Enabled' : '○ Needs Permission'}
              </span>
            </div>

            {/* Device / Mobile Notification Controls */}
            <div className="bg-[#eff4ff] dark:bg-[#182438] p-3 rounded-xl border border-[#002045]/15 dark:border-[#2a384e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#002045] dark:text-white">
                  📱 Mobile & Device Push Alerts
                </span>
                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    Grant Permission
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#43474e] dark:text-slate-400 leading-relaxed">
                Triggers alarms 1 day before any free trial or subscription renewal date.
              </p>

              <button
                type="button"
                onClick={handleSendTestDeviceNotification}
                disabled={isSendingDeviceTest}
                className="w-full mt-1.5 py-2 px-3 rounded-lg bg-white dark:bg-[#1f2e46] border border-[#c4c6cf] dark:border-[#2d405e] text-xs font-semibold text-[#002045] dark:text-white hover:bg-slate-50 dark:hover:bg-[#253652] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">
                  notifications_active
                </span>
                <span>{isSendingDeviceTest ? 'Testing Device...' : 'Send Test Push Alert Now'}</span>
              </button>

              {deviceTestMsg && (
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                  {deviceTestMsg}
                </p>
              )}
            </div>

            {/* Email Alert Controls */}
            <div className="bg-[#eff4ff] dark:bg-[#182438] p-3 rounded-xl border border-[#002045]/15 dark:border-[#2a384e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#002045] dark:text-white">
                  ✉️ Email Expiry Alerts
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.email || 'No email'}
                </span>
              </div>
              <p className="text-[11px] text-[#43474e] dark:text-slate-400 leading-relaxed">
                Sends automated cancellation reminders to your registered email address.
              </p>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingEmailTest}
                className="w-full mt-1.5 py-2 px-3 rounded-lg bg-white dark:bg-[#1f2e46] border border-[#c4c6cf] dark:border-[#2d405e] text-xs font-semibold text-[#002045] dark:text-white hover:bg-slate-50 dark:hover:bg-[#253652] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-600">
                  mail
                </span>
                <span>{isSendingEmailTest ? 'Sending Test Email...' : 'Send Test Email Alert Now'}</span>
              </button>

              {emailTestMsg && (
                <div
                  className={`text-[11px] p-2 rounded-lg mt-1 ${
                    emailTestMsg.success
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                  }`}
                >
                  <p className="font-semibold">{emailTestMsg.text}</p>
                  {emailTestMsg.previewUrl && (
                    <a
                      href={emailTestMsg.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 dark:text-blue-300 underline font-bold mt-1 block"
                    >
                      View Generated Email Preview ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Data Controls */}
          <div className="pt-3 border-t border-[#c4c6cf]/30 dark:border-[#2a384e]">
            <span className="text-xs font-semibold text-[#0d1c2e] dark:text-slate-300 block mb-2">
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
                  className="px-3 py-1.5 rounded-lg border border-[#002045]/30 dark:border-blue-500/40 text-xs font-semibold text-[#002045] dark:text-blue-300 hover:bg-[#eff4ff] dark:hover:bg-[#1a273b] transition-colors"
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
              className="px-4 py-2.5 rounded-lg border border-[#c4c6cf] dark:border-[#2a384e] text-sm font-medium text-[#43474e] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-[#1a273b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#002045] dark:bg-blue-600 text-white text-sm font-semibold hover:bg-[#1a365d] dark:hover:bg-blue-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
