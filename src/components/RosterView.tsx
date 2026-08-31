import React, { useState } from 'react';
import { SubscriptionItem, UserProfile } from '../types';
import { getCurrencySymbol } from '../data/countries';
import { AdBanner } from './AdBanner';

interface RosterViewProps {
  subscriptions: SubscriptionItem[];
  user: UserProfile;
  onToggleStatus: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
  onAddNewSubscription: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  subscriptions,
  user,
  onToggleStatus,
  onDeleteSubscription,
  onAddNewSubscription,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const currSymbol = getCurrencySymbol(user);

  const categories = ['All', 'Entertainment', 'Productivity', 'Utilities', 'Health'];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || sub.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalMonthlyActiveSpend = subscriptions
    .filter((s) => s.status !== 'Paused')
    .reduce((sum, s) => sum + (s.billingCycle === 'yr' ? s.price / 12 : s.price), 0);

  const budgetUsagePercent = Math.min(
    100,
    Math.round((totalMonthlyActiveSpend / user.monthlyBudget) * 100)
  );

  const isSubLimitReached = subscriptions.length >= 5;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Budget Progress Section */}
      <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,54,93,0.05)] border border-[#c4c6cf]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-[#002045] tracking-tight">
                Subscriptions Roster
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isSubLimitReached
                  ? 'bg-amber-500/15 text-amber-800 border-amber-500/40'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {subscriptions.length}/5 Subscriptions
              </span>
            </div>
            <p className="text-sm md:text-base text-[#43474e] mt-0.5">
              Track and manage up to 5 recurring bills in one place.
            </p>
          </div>

          <button
            onClick={onAddNewSubscription}
            disabled={isSubLimitReached}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto ${
              isSubLimitReached
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-[#002045] text-white hover:bg-[#1a365d] active:scale-95'
            }`}
            title={isSubLimitReached ? 'Maximum 5 subscriptions reached' : 'Add a subscription'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSubLimitReached ? 'lock' : 'add'}
            </span>
            <span>{isSubLimitReached ? 'Limit Reached (5/5)' : 'Add Subscription'}</span>
          </button>
        </div>

        {/* Monthly Budget Progress Meter */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs font-semibold text-[#43474e] mb-1.5">
            <span>Monthly Budget ({currSymbol}{user.monthlyBudget})</span>
            <span className="font-mono-val text-[#002045]">
              {currSymbol}{totalMonthlyActiveSpend.toFixed(2)} / {currSymbol}{user.monthlyBudget.toFixed(2)} ({budgetUsagePercent}%)
            </span>
          </div>
          <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden border border-[#ccdbf4]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                budgetUsagePercent > 90 ? 'bg-[#ba1a1a]' : 'bg-[#1a365d]'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:outline-none focus:ring-2 focus:ring-[#002045]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#0d1c2e]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#002045] text-white shadow-xs'
                  : 'bg-white text-[#43474e] border border-[#c4c6cf]/50 hover:bg-[#eff4ff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Subscription List */}
      <section className="space-y-3">
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#c4c6cf]/30">
            <span className="material-symbols-outlined text-[48px] text-[#74777f]">
              search_off
            </span>
            <p className="mt-2 text-[#43474e]">No subscriptions match your filter.</p>
          </div>
        ) : (
          filteredSubscriptions.map((sub, index) => {
            const isPaused = sub.status === 'Paused';
            const isTrial = sub.status === 'Trial';

            return (
              <React.Fragment key={sub.id}>
                <div
                  className={`bg-white ambient-shadow rounded-xl p-4 md:p-5 border border-[#c4c6cf]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#1a365d]/40 ${
                    isPaused ? 'opacity-65 grayscale' : ''
                  }`}
                >
                {/* Left: Icon, Name, Category */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#dce9ff] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#c4c6cf]/20">
                    {sub.logoUrl ? (
                      <img
                        src={sub.logoUrl}
                        alt={sub.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[#74777f]">
                        {sub.materialIcon || 'subscriptions'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-[#0d1c2e]">{sub.name}</h3>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isPaused
                            ? 'bg-[#d4e4fc] text-[#43474e]'
                            : isTrial
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#9ff5c1] text-[#003f25]'
                        }`}
                      >
                        {sub.status}
                      </span>
                      {sub.shared && (
                        <span className="bg-[#dce9ff] text-[#002045] text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">group</span>
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#43474e] mt-0.5">
                      {sub.category} • End Date: <strong className="text-[#0d1c2e]">{sub.endDate || sub.nextBillingDate}</strong>
                    </p>

                    {/* Alert Badges */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px]">
                      {(sub.alertMobile ?? true) && (
                        <span className="bg-[#eff4ff] text-[#002045] px-2 py-0.5 rounded border border-[#002045]/20 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">smartphone</span>
                          Mobile Alert ON
                        </span>
                      )}
                      {(sub.alertEmail ?? true) && (
                        <span className="bg-[#eff4ff] text-[#002045] px-2 py-0.5 rounded border border-[#002045]/20 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">mail</span>
                          Email Alert ON
                        </span>
                      )}
                      <span className="text-[10px] text-[#003f25] font-semibold bg-[#9ff5c1]/30 px-1.5 py-0.5 rounded">
                        1-day prior alert
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c4c6cf]/20">
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-bold font-mono-val text-[#002045]">
                      {currSymbol}{sub.price.toFixed(2)}
                      <span className="text-xs font-normal text-[#43474e]">
                        /{sub.billingCycle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border active:scale-95 ${
                        isPaused
                          ? 'border-[#002045] text-[#002045] hover:bg-[#eff4ff]'
                          : 'border-[#c4c6cf] text-[#43474e] hover:bg-[#eff4ff]'
                      }`}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>

                    <button
                      onClick={() => onDeleteSubscription(sub.id)}
                      className="p-1.5 rounded-lg text-[#74777f] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                      title="Delete subscription"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* In-feed Native Ad Slot */}
              {index === 1 && (
                <AdBanner
                  format="native"
                  user={user}
                  adSlotId="ca-app-pub-3940256099942544/2247696110"
                />
              )}
            </React.Fragment>
            );
          })
        )}
      </section>
    </div>
  );
};
