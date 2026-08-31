import React, { useState } from 'react';
import { SubscriptionItem, UserProfile } from '../types';
import { getCurrencySymbol } from '../data/countries';
import { AdBanner } from './AdBanner';

interface AnalysisViewProps {
  subscriptions: SubscriptionItem[];
  user?: UserProfile;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ subscriptions, user }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Entertainment: true,
  });

  const currSymbol = getCurrencySymbol(user);

  const toggleAccordion = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Group active & trial subscriptions by category
  const activeSubs = subscriptions.filter((s) => s.status !== 'Paused');
  const totalSpend = activeSubs.reduce(
    (acc, sub) => acc + (sub.billingCycle === 'yr' ? sub.price / 12 : sub.price),
    0
  );

  const categories = ['Entertainment', 'Productivity', 'Utilities', 'Health'] as const;

  const categoryColorMap: Record<string, { bg: string; bar: string; icon: string; dot: string }> = {
    Entertainment: {
      bg: 'bg-[#1a365d]',
      bar: '#1a365d',
      icon: 'movie',
      dot: 'bg-[#1a365d]',
    },
    Productivity: {
      bg: 'bg-[#5caf81]',
      bar: '#5caf81',
      icon: 'work',
      dot: 'bg-[#5caf81]',
    },
    Utilities: {
      bg: 'bg-[#d93537]',
      bar: '#d93537',
      icon: 'bolt',
      dot: 'bg-[#d93537]',
    },
    Health: {
      bg: 'bg-[#86a0cd]',
      bar: '#86a0cd',
      icon: 'fitness_center',
      dot: 'bg-[#86a0cd]',
    },
  };

  const categoryData = categories.map((catName) => {
    const items = activeSubs.filter((s) => s.category === catName);
    const catSpend = items.reduce(
      (sum, i) => sum + (i.billingCycle === 'yr' ? i.price / 12 : i.price),
      0
    );
    const percentage = totalSpend > 0 ? Math.round((catSpend / totalSpend) * 100) : 0;
    return {
      name: catName,
      spend: catSpend,
      percentage,
      items,
      color: categoryColorMap[catName],
    };
  });

  // Calculate conic gradient for the donut chart
  let cumulativePercent = 0;
  const gradientStops = categoryData.map((cat) => {
    const start = cumulativePercent;
    cumulativePercent += cat.percentage;
    const end = cumulativePercent;
    return `${cat.color.bar} ${start}% ${end}%`;
  }).join(', ');

  const conicStyle = {
    background: `conic-gradient(${gradientStops || '#1a365d 0% 100%'})`,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Chart Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Context & Total Card */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,54,93,0.05)] flex flex-col justify-between border border-[#c4c6cf]/30">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#002045] mb-2 tracking-tight">
              Category Analysis
            </h2>
            <p className="text-sm md:text-base text-[#43474e] mb-6">
              Monthly spending breakdown across your active subscription categories.
            </p>
          </div>

          <div className="bg-[#eff4ff] rounded-xl p-6 border border-[#ccdbf4]">
            <span className="text-xs font-semibold text-[#43474e] uppercase tracking-wider block mb-1">
              Total Monthly Spend
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold font-mono-val text-[#002045]">
                {currSymbol}{totalSpend.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-[#74777f]">/mo</span>
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,54,93,0.05)] border border-[#c4c6cf]/30 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Chart Visual */}
          <div className="donut-container shadow-md" style={conicStyle}>
            <div className="donut-hole">
              <span className="text-xs font-medium text-[#43474e]">Categories</span>
              <span className="text-2xl font-bold text-[#002045]">{categories.length}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between gap-4 p-1 hover:bg-[#f8f9ff] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${cat.color.dot}`} />
                  <span className="text-sm font-medium text-[#0d1c2e]">
                    {cat.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono-val text-[#002045]">
                    {cat.percentage}%
                  </span>
                  <span className="text-[11px] text-[#74777f] block font-mono-val">
                    {currSymbol}{cat.spend.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Drill-down List */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-[#002045] px-1">
          Category Details
        </h3>

        {categoryData.map((cat) => {
          const isExpanded = !!expandedCategories[cat.name];

          return (
            <div
              key={cat.name}
              className="bg-white rounded-xl shadow-[0_4px_20px_rgba(26,54,93,0.05)] border border-[#c4c6cf]/30 transition-colors overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(cat.name)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-[#eff4ff]/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${cat.color.bg} text-white flex items-center justify-center shadow-sm`}
                  >
                    <span className="material-symbols-outlined">{cat.color.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#002045] group-hover:text-[#1a365d] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-[#43474e]">
                      {cat.items.length} Subscription{cat.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-bold font-mono-val block text-[#002045]">
                      {currSymbol}{cat.spend.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#74777f]">/mo</span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[#74777f] transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="bg-[#eff4ff] border-t border-[#ccdbf4] p-4 flex flex-col gap-2 animate-fade-in">
                  {cat.items.length === 0 ? (
                    <p className="text-xs text-[#74777f] italic p-2">
                      No active subscriptions in this category.
                    </p>
                  ) : (
                    cat.items.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-[#c4c6cf]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden border border-[#c4c6cf]/20">
                            {sub.logoUrl ? (
                              <img
                                src={sub.logoUrl}
                                alt={sub.name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[18px] text-[#74777f]">
                                {sub.materialIcon || cat.color.icon}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#0d1c2e]">
                            {sub.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono-val text-[#1a365d] block">
                            {currSymbol}
                            {(sub.billingCycle === 'yr' ? sub.price / 12 : sub.price).toFixed(2)}
                            <span className="text-xs font-normal text-[#74777f]">/mo</span>
                          </span>
                          {sub.billingCycle === 'yr' && (
                            <span className="text-[10px] text-[#74777f] block">
                              ({currSymbol}{sub.price.toFixed(2)}/yr)
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* AdMob Banner Slot */}
      <AdBanner
        format="inline"
        user={user}
        adSlotId="ca-app-pub-3940256099942544/6300978111"
      />
    </div>
  );
};
