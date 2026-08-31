import React from 'react';
import { ViewTab } from '../types';

interface NavigationProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  urgentTrialsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  urgentTrialsCount,
}) => {
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-[#f8f9ff] dark:bg-[#0b1320] border-t border-[#c4c6cf]/30 dark:border-slate-800 shadow-[0_-4px_20px_rgba(26,54,93,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:hidden">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'roster'
              ? 'text-[#002045] dark:text-blue-400 font-bold'
              : 'text-[#43474e] dark:text-slate-400 hover:bg-[#d4e4fc]/40 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5">list_alt</span>
          <span className="text-[11px] font-medium leading-none">Subscriptions</span>
        </button>

        {/* Center Plus Icon */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-500/30 transition-all active:scale-90 -mt-5 border-2 border-white dark:border-slate-900"
          title="Add New Subscription or Trial"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>

        <button
          onClick={() => setActiveTab('trials')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'trials'
              ? 'text-[#002045] dark:text-blue-400 font-bold'
              : 'text-[#43474e] dark:text-slate-400 hover:bg-[#d4e4fc]/40 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5">timer</span>
          <span className="text-[11px] font-medium leading-none">Free Trials</span>
          {urgentTrialsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ba1a1a]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'analysis'
              ? 'text-[#002045] dark:text-blue-400 font-bold'
              : 'text-[#43474e] dark:text-slate-400 hover:bg-[#d4e4fc]/40 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined mb-0.5">analytics</span>
          <span className="text-[11px] font-medium leading-none">Analysis</span>
        </button>
      </nav>
    </>
  );
};
