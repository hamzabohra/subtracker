import React from 'react';
import { ViewTab, UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#f8f9ff] dark:bg-[#0b1320] shadow-[0_4px_20px_rgba(26,54,93,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-transparent dark:border-slate-800 h-16 transition-colors">
      <div className="max-w-[1200px] mx-auto h-full px-4 md:px-10 flex items-center justify-between">
        {/* Left: App Logo Icon + Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('roster')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <img src="/app-icon.svg" alt="SubTracker" className="w-9 h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" />
            <h1 className="font-bold text-xl md:text-2xl text-[#002045] dark:text-blue-200 tracking-tight group-hover:text-[#1a365d] dark:group-hover:text-blue-100 transition-colors">
              SubTracker
            </h1>
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'roster'
                ? 'bg-[#e5eeff] dark:bg-[#1e3250] text-[#002045] dark:text-blue-200 font-semibold'
                : 'text-[#43474e] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">list_alt</span>
            <span>Subscriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('trials')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'trials'
                ? 'bg-[#e5eeff] dark:bg-[#1e3250] text-[#002045] dark:text-blue-200 font-semibold'
                : 'text-[#43474e] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span>Free Trials</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'analysis'
                ? 'bg-[#e5eeff] dark:bg-[#1e3250] text-[#002045] dark:text-blue-200 font-semibold'
                : 'text-[#43474e] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span>Analysis</span>
          </button>
        </nav>

        {/* Right: User Profile & Logout */}
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              style={{ height: '36px' }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#43474e] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800 hover:text-[#002045] dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-[#c4c6cf]/30 dark:border-slate-700"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          )}

          {/* Profile button */}
          <button
            onClick={onOpenSettings}
            style={{ width: '110px', height: '36px' }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18273d] border border-[#c4c6cf]/40 dark:border-slate-700 hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-all shadow-2xs group focus:outline-none"
            title="User Profile"
          >
            <div className="w-6 h-6 rounded-full bg-[#002045] dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <span className="text-xs font-semibold text-[#002045] dark:text-slate-200 max-w-[120px] truncate">
              {user.name || 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
