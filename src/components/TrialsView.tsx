import React from 'react';
import { FreeTrial, UserProfile } from '../types';
import { getCurrencySymbol } from '../data/countries';
import { AdBanner } from './AdBanner';

interface TrialsViewProps {
  trials: FreeTrial[];
  user?: UserProfile;
  onToggleAlert: (id: string) => void;
  onReactivate: (id: string) => void;
  onAddNewTrial: () => void;
}

export const TrialsView: React.FC<TrialsViewProps> = ({
  trials,
  user,
  onToggleAlert,
  onReactivate,
  onAddNewTrial,
}) => {
  const currSymbol = getCurrencySymbol(user);
  const activeTrials = trials.filter((t) => t.status === 'active');
  const expiredTrials = trials.filter((t) => t.status === 'expired');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Sponsored Ad Banner */}
      <AdBanner
        format="banner"
        user={user}
        adSlotId="ca-app-pub-3940256099942544/6300978111"
        className="mb-2"
      />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d1c2e] tracking-tight">
              Free Trial Tracker
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-800 border-blue-200">
              {trials.length} {trials.length === 1 ? 'Trial' : 'Trials'} ({activeTrials.length} Active)
            </span>
          </div>
          <p className="text-base md:text-lg text-[#43474e] mt-2">
            Monitor your active trials before they convert to paid subscriptions.
          </p>
        </div>

        <button
          onClick={onAddNewTrial}
          className="h-12 px-6 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto bg-[#002045] text-white hover:bg-[#1a365d] active:scale-95"
          title="Add a new trial"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Trial</span>
        </button>
      </header>

      {/* Active Trials Section */}
      <section>
        <h3 className="text-xl font-bold text-[#0d1c2e] mb-4 border-b border-[#c4c6cf]/40 pb-2">
          Active Trials
        </h3>

        {activeTrials.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#c4c6cf]/30">
            <span className="material-symbols-outlined text-[48px] text-[#74777f]">
              timer_off
            </span>
            <p className="mt-2 text-[#43474e]">No active trials running.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTrials.map((trial) => {
              const isUrgent = trial.urgent || trial.daysLeft <= 2;

              return (
                <article
                  key={trial.id}
                  className={`bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,54,93,0.05)] flex flex-col border relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(26,54,93,0.08)] ${
                    isUrgent ? 'border-[#ffdad6]' : 'border-[#c4c6cf]/40'
                  }`}
                >
                  {isUrgent && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ba1a1a]" />
                  )}

                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#d4e4fc] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#c4c6cf]/20">
                        {trial.logoUrl ? (
                          <img
                            src={trial.logoUrl}
                            alt={trial.serviceName}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[#74777f]">
                            {trial.materialIcon || 'cloud'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#0d1c2e]">
                          {trial.serviceName}
                        </h4>
                        <span className="text-sm text-[#43474e]">
                          {trial.planName}
                        </span>
                        {trial.endDate && (
                          <p className="text-xs text-[#002045] font-semibold mt-0.5">
                            End Date: {trial.endDate}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          {(trial.alertMobile ?? true) && (
                            <span className="bg-[#eff4ff] text-[#002045] px-1.5 py-0.5 rounded font-medium border border-[#002045]/10">
                              📱 Mobile Alert
                            </span>
                          )}
                          {(trial.alertEmail ?? true) && (
                            <span className="bg-[#eff4ff] text-[#002045] px-1.5 py-0.5 rounded font-medium border border-[#002045]/10">
                              ✉️ Email Alert
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${
                        isUrgent
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#dce9ff] text-[#0d1c2e]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isUrgent ? 'timer' : 'calendar_today'}
                      </span>{' '}
                      {trial.daysLeft} Days Left
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#c4c6cf]/40 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-[#43474e] uppercase tracking-wide">
                        Renews at
                      </p>
                      <p className="text-xl font-bold font-mono-val text-[#0d1c2e]">
                        {currSymbol}{trial.renewsAtPrice.toFixed(2)}
                        <span className="text-sm font-normal text-[#43474e]">
                          /{trial.billingCycle}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      {trial.alertStatus === 'set' ? (
                        <div>
                          <p className="text-xs text-[#43474e] flex items-center gap-1 justify-end font-medium">
                            <span className="material-symbols-outlined text-[14px] text-[#003f25]">
                              notifications_active
                            </span>
                            Alert Set
                          </p>
                          <p className="text-xs font-semibold text-[#b51822] mt-0.5">
                            {trial.alertTimeText || 'Alert configured'}
                          </p>
                          <button
                            onClick={() => onToggleAlert(trial.id)}
                            className="text-[11px] text-[#74777f] hover:underline block ml-auto mt-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-[#43474e] flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-[14px]">
                              notifications_off
                            </span>
                            No Alert
                          </p>
                          <button
                            onClick={() => onToggleAlert(trial.id)}
                            className="text-xs font-semibold text-[#002045] hover:underline mt-0.5"
                          >
                            Set Alert
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recently Expired Section */}
      <section>
        <h3 className="text-xl font-bold text-[#0d1c2e] mb-4 border-b border-[#c4c6cf]/40 pb-2">
          Recently Expired
        </h3>

        {expiredTrials.length === 0 ? (
          <p className="text-sm text-[#74777f] italic">No recently expired trials.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
            {expiredTrials.map((trial) => (
              <article
                key={trial.id}
                className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,54,93,0.05)] flex flex-col border border-[#c4c6cf]/40 grayscale hover:grayscale-0 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#d4e4fc] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {trial.logoUrl ? (
                        <img
                          src={trial.logoUrl}
                          alt={trial.serviceName}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[#74777f]">
                          book
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#0d1c2e] line-through">
                        {trial.serviceName}
                      </h4>
                      <span className="text-sm text-[#43474e]">{trial.planName}</span>
                    </div>
                  </div>

                  <span className="bg-[#d4e4fc] text-[#43474e] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    Expired
                  </span>
                </div>

                <div className="mt-auto pt-4 border-t border-[#c4c6cf]/40 flex justify-between items-center">
                  <p className="text-xs text-[#43474e]">
                    {trial.endedDateText || 'Expired recently'}
                  </p>
                  <button
                    onClick={() => onReactivate(trial.id)}
                    className="h-9 px-4 rounded-lg border border-[#c4c6cf] text-[#0d1c2e] font-medium text-xs hover:bg-[#eff4ff] transition-colors"
                  >
                    Reactivate
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Ad Banner for Trials View */}
      <AdBanner
        format="inline"
        user={user}
        adSlotId="ca-app-pub-3940256099942544/6300978111"
      />
    </div>
  );
};
