import React from 'react';
import { PriceHikeAlert, UserProfile } from '../types';
import { getCurrencySymbol } from '../data/countries';

interface PriceHikesViewProps {
  alerts: PriceHikeAlert[];
  user?: UserProfile;
  onDecision: (id: string, decision: 'kept' | 'canceled' | 'pending') => void;
  onAddNewHikeAlert: () => void;
}

export const PriceHikesView: React.FC<PriceHikesViewProps> = ({
  alerts,
  user,
  onDecision,
  onAddNewHikeAlert,
}) => {
  const currSymbol = getCurrencySymbol(user);

  // Calculate statistics based on current state
  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  
  // Calculate total monthly increase across pending & kept active hikes
  const totalMonthlyIncrease = alerts
    .filter((a) => a.status !== 'canceled')
    .reduce((sum, a) => sum + (a.newPrice - a.oldPrice), 0);

  const totalYearlyImpact = totalMonthlyIncrease * 12;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d1c2e] tracking-tight">
            Price Hike Alerts
          </h2>
          <p className="text-base md:text-lg text-[#43474e] mt-1">
            Review recent increases and manage your commitments.
          </p>
        </div>
        <button
          onClick={onAddNewHikeAlert}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#002045] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a365d] transition-colors shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Hike Alert</span>
        </button>
      </section>

      {/* Price Trends Summary (Bento Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Increase */}
        <div className="bg-white ambient-shadow rounded-xl p-6 border border-[#c4c6cf]/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffdad6] rounded-full opacity-50 blur-2xl group-hover:bg-[#ba1a1a]/20 transition-colors duration-500" />
          <div>
            <h3 className="text-xs font-semibold text-[#43474e] uppercase tracking-wider mb-2">
              Total Monthly Increase
            </h3>
            <div className="text-4xl md:text-5xl font-bold text-[#ba1a1a] tracking-tight font-mono-val">
              +{currSymbol}{totalMonthlyIncrease.toFixed(2)}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#ba1a1a]">
            <span className="material-symbols-outlined fill text-[20px]">
              trending_up
            </span>
            <span className="text-sm font-medium">
              Across {alerts.filter((a) => a.status !== 'canceled').length} services this month
            </span>
          </div>
        </div>

        {/* Yearly Impact */}
        <div className="bg-white ambient-shadow rounded-xl p-6 border border-[#c4c6cf]/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1a365d]/10 rounded-full opacity-50 blur-2xl group-hover:bg-[#002045]/20 transition-colors duration-500" />
          <div>
            <h3 className="text-xs font-semibold text-[#43474e] uppercase tracking-wider mb-2">
              Yearly Impact
            </h3>
            <div className="text-4xl md:text-5xl font-bold text-[#0d1c2e] tracking-tight font-mono-val">
              +{currSymbol}{totalYearlyImpact.toFixed(2)}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#43474e]">
            <span className="material-symbols-outlined text-[20px]">
              calendar_month
            </span>
            <span className="text-sm font-medium">Projected extra cost</span>
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-gradient-to-br from-white to-[#e5eeff]/50 ambient-shadow rounded-xl p-6 border border-[#c4c6cf]/30 flex flex-col justify-between relative">
          <div>
            <h3 className="text-xs font-semibold text-[#43474e] uppercase tracking-wider mb-2">
              Action Required
            </h3>
            <div className="text-xl md:text-2xl font-bold text-[#0d1c2e] mt-1">
              {pendingAlerts.length} pending decision{pendingAlerts.length === 1 ? '' : 's'}
            </div>
            <p className="text-sm text-[#43474e] mt-2">
              Evaluate the worth of recent hikes below.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <span className="material-symbols-outlined text-[#002045] text-[32px]">
              fact_check
            </span>
          </div>
        </div>
      </section>

      {/* Recent Changes Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-[#0d1c2e]">Recent Changes</h3>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#c4c6cf]/30">
            <span className="material-symbols-outlined text-[48px] text-[#74777f]">
              notifications_off
            </span>
            <p className="mt-2 text-[#43474e] font-medium">No price hike alerts logged.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isPending = alert.status === 'pending';
            const isKept = alert.status === 'kept';
            const isCanceled = alert.status === 'canceled';

            return (
              <div
                key={alert.id}
                className={`bg-white ambient-shadow rounded-xl p-6 border border-[#c4c6cf]/30 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all ${
                  isPending
                    ? alert.hikeType === 'error'
                      ? 'border-l-4 border-l-[#ba1a1a]'
                      : 'border-l-4 border-l-[#b51822]'
                    : isKept
                    ? 'border-l-4 border-l-[#003f25] opacity-80'
                    : 'border-l-4 border-l-[#74777f] opacity-60'
                }`}
              >
                {/* Left Side: Logo & Price Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[#dce9ff] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#c4c6cf]/20">
                    {alert.logoUrl ? (
                      <img
                        src={alert.logoUrl}
                        alt={alert.serviceName}
                        className="w-8 h-8 object-contain rounded"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[#74777f]">
                        {alert.materialIcon || 'fitness_center'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-[#0d1c2e]">
                        {alert.serviceName}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          alert.hikeType === 'error'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : alert.hikeType === 'secondary'
                            ? 'bg-[#d93537] text-white'
                            : 'bg-[#d4e4fc] text-[#43474e]'
                        }`}
                      >
                        {alert.percentageHike}
                      </span>
                    </div>

                    <span className="text-sm text-[#43474e] mt-1">
                      {alert.notifiedText}
                    </span>

                    {/* Old Price vs New Price Pill */}
                    <div className="flex items-center gap-4 mt-3 bg-[#eff4ff] p-2 rounded-lg self-start">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#43474e]">Old Price</span>
                        <span className="text-sm font-mono-val text-[#0d1c2e] line-through opacity-70">
                          {currSymbol}{alert.oldPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[#74777f] text-[16px]">
                        arrow_forward
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs text-[#43474e]">New Price</span>
                        <span
                          className={`text-sm font-bold font-mono-val ${
                            isCanceled
                              ? 'text-[#74777f] line-through'
                              : 'text-[#ba1a1a]'
                          }`}
                        >
                          {currSymbol}{alert.newPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Decision Buttons or State Badge */}
                <div className="flex flex-col gap-3 md:min-w-[210px] border-t md:border-t-0 md:border-l border-[#c4c6cf]/30 pt-4 md:pt-0 md:pl-6">
                  {isPending ? (
                    <>
                      <span className="text-sm font-medium text-[#0d1c2e] text-center">
                        Worth it?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onDecision(alert.id, 'canceled')}
                          className="flex-1 h-11 rounded-lg border border-[#c4c6cf] text-[#43474e] hover:bg-[#dce9ff]/40 font-medium text-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            cancel
                          </span>
                          Cancel
                        </button>
                        <button
                          onClick={() => onDecision(alert.id, 'kept')}
                          className="flex-1 h-11 rounded-lg bg-[#002045] text-white hover:bg-[#1a365d] font-medium text-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            check_circle
                          </span>
                          Keep
                        </button>
                      </div>
                    </>
                  ) : isKept ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 text-[#005231] bg-[#9ff5c1] px-4 py-2 rounded-full text-xs font-semibold">
                        <span className="material-symbols-outlined fill text-[18px]">
                          check_circle
                        </span>
                        Decided to Keep
                      </div>
                      <button
                        onClick={() => onDecision(alert.id, 'pending')}
                        className="mt-2 text-[#002045] text-xs font-medium hover:underline"
                      >
                        Re-evaluate
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 text-[#ba1a1a] bg-[#ffdad6] px-4 py-2 rounded-full text-xs font-semibold">
                        <span className="material-symbols-outlined text-[18px]">
                          cancel
                        </span>
                        Canceled Service
                      </div>
                      <button
                        onClick={() => onDecision(alert.id, 'pending')}
                        className="mt-2 text-[#002045] text-xs font-medium hover:underline"
                      >
                        Re-evaluate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
