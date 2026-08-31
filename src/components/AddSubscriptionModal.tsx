import React, { useState, useMemo } from 'react';
import { ViewTab, SubscriptionItem, FreeTrial, PriceHikeAlert, UserProfile } from '../types';
import { POPULAR_SUBSCRIPTIONS, PopularService } from '../data/popularSubscriptions';

interface AddModalProps {
  isOpen: boolean;
  activeTab: ViewTab;
  user: UserProfile;
  subscriptionsCount?: number;
  trialsCount?: number;
  onClose: () => void;
  onAddSubscription: (sub: SubscriptionItem) => void;
  onAddTrial: (trial: FreeTrial) => void;
  onAddHikeAlert?: (hike: PriceHikeAlert) => void;
}

export const AddSubscriptionModal: React.FC<AddModalProps> = ({
  isOpen,
  activeTab,
  user,
  subscriptionsCount = 0,
  trialsCount = 0,
  onClose,
  onAddSubscription,
  onAddTrial,
}) => {
  const [itemType, setItemType] = useState<'subscription' | 'trial'>(
    activeTab === 'trials' ? 'trial' : 'subscription'
  );

  const isSubLimitReached = itemType === 'subscription' && subscriptionsCount >= 5;
  const isTrialLimitReached = itemType === 'trial' && trialsCount >= 4;
  const isLimitReached = isSubLimitReached || isTrialLimitReached;

  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<PopularService | null>(null);
  const [isCustomService, setIsCustomService] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Entertainment' | 'Productivity' | 'Utilities' | 'Health' | 'Other'>('Entertainment');
  const [price, setPrice] = useState('14.99');
  const [billingCycle, setBillingCycle] = useState<'mo' | 'yr'>('mo');
  const [daysLeft, setDaysLeft] = useState('7');

  // End Date & Alerts State
  const defaultEndDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [endDate, setEndDate] = useState(defaultEndDate);
  const [alertMobile, setAlertMobile] = useState(true);
  const [alertEmail, setAlertEmail] = useState(true);

  // Calculate 1 day before alert date
  const calculatedAlertDate = useMemo(() => {
    if (!endDate) return '';
    const end = new Date(endDate);
    end.setDate(end.getDate() - 1);
    return end.toISOString().split('T')[0];
  }, [endDate]);

  // Filter popular subscriptions based on search query
  const filteredPopular = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_SUBSCRIPTIONS;
    const q = searchQuery.toLowerCase().trim();
    return POPULAR_SUBSCRIPTIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currSymbol = user.currencySymbol || user.currency || '$';

  const monthlyCalcText = useMemo(() => {
    const p = parseFloat(price) || 0;
    if (billingCycle === 'yr') {
      const perMonth = p / 12;
      return `Calculated monthly cost: ${currSymbol}${perMonth.toFixed(2)}/mo (${currSymbol}${p.toFixed(2)} billed yearly)`;
    }
    return `Calculated monthly cost: ${currSymbol}${p.toFixed(2)}/mo`;
  }, [price, billingCycle, currSymbol]);

  if (!isOpen) return null;

  const handleSelectPopular = (service: PopularService) => {
    setSelectedService(service);
    setIsCustomService(false);
    setName(service.name);
    setCategory(service.category);
    setSearchQuery(service.name);
    setIsDropdownOpen(false);
  };

  const handleSelectOther = () => {
    setSelectedService(null);
    setIsCustomService(true);
    setName('');
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleResetServiceSelection = () => {
    setSelectedService(null);
    setIsCustomService(false);
    setName('');
    setSearchQuery('');
    setIsDropdownOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLimitReached) {
      return;
    }

    const finalName = name.trim();
    if (!finalName) return;

    const numericPrice = parseFloat(price) || 0;
    const logoUrl = selectedService?.logoUrl;
    const materialIcon =
      selectedService?.materialIcon ||
      (category === 'Entertainment'
        ? 'movie'
        : category === 'Health'
        ? 'fitness_center'
        : category === 'Productivity'
        ? 'work'
        : 'subscriptions');

    if (itemType === 'subscription') {
      const newSub: SubscriptionItem = {
        id: `sub-${Date.now()}`,
        name: finalName,
        category,
        price: numericPrice,
        currency: currSymbol,
        billingCycle,
        nextBillingDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        endDate,
        alertMobile,
        alertEmail,
        alertDate: calculatedAlertDate,
        status: 'Active',
        logoUrl,
        materialIcon,
      };
      onAddSubscription(newSub);
    } else if (itemType === 'trial') {
      let parsedDays = parseInt(daysLeft, 10) || 7;
      if (endDate) {
        const targetTime = new Date(endDate).getTime();
        const todayTime = new Date().getTime();
        const diff = Math.ceil((targetTime - todayTime) / (1000 * 3600 * 24));
        if (!isNaN(diff) && diff >= 0) {
          parsedDays = diff;
        }
      }

      const newTrial: FreeTrial = {
        id: `trial-${Date.now()}`,
        serviceName: finalName,
        planName: 'Standard Trial',
        daysLeft: parsedDays,
        urgent: parsedDays <= 2,
        renewsAtPrice: numericPrice,
        currency: currSymbol,
        billingCycle,
        alertStatus: (alertMobile || alertEmail) ? 'set' : 'none',
        alertTimeText: `1 day before end (${calculatedAlertDate})`,
        endDate,
        alertMobile,
        alertEmail,
        alertDate: calculatedAlertDate,
        status: 'active',
        logoUrl,
        materialIcon: selectedService?.materialIcon || 'timer',
      };
      onAddTrial(newTrial);
    }

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

        <h3 className="text-xl font-bold text-[#002045] mb-4">Add New Item</h3>

        {/* Item Type Selector */}
        <div className="grid grid-cols-2 gap-1 bg-[#eff4ff] p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setItemType('subscription')}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              itemType === 'subscription'
                ? 'bg-[#002045] text-white shadow-xs'
                : 'text-[#43474e] hover:text-[#0d1c2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            <span>Subscription ({subscriptionsCount}/5)</span>
          </button>
          <button
            type="button"
            onClick={() => setItemType('trial')}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              itemType === 'trial'
                ? 'bg-[#002045] text-white shadow-xs'
                : 'text-[#43474e] hover:text-[#0d1c2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>Free Trial ({trialsCount}/4)</span>
          </button>
        </div>

        {/* Limit Warning Banner */}
        {isLimitReached && (
          <div className="mb-4 bg-amber-500/15 border border-amber-500/40 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <div className="flex-1">
              <span className="font-bold block text-[#002045]">
                {isSubLimitReached
                  ? 'Maximum Limit Reached (5/5 Subscriptions)'
                  : 'Maximum Limit Reached (4/4 Free Trials)'}
              </span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {isSubLimitReached
                  ? 'You have reached the maximum allowed limit of 5 active subscriptions. Remove or cancel an existing subscription to add a new one.'
                  : 'You have reached the maximum allowed limit of 4 active free trials. Complete or delete an existing trial to track a new one.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Popular Subscription Search Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold text-[#43474e] mb-1">
              Select Popular Service or Custom
            </label>

            {selectedService ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#eff4ff] border border-[#002045]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center border border-[#c4c6cf]/30 shrink-0">
                    {selectedService.logoUrl ? (
                      <img
                        src={selectedService.logoUrl}
                        alt={selectedService.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[#002045]">
                        {selectedService.materialIcon}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#002045]">{selectedService.name}</h4>
                    <span className="text-[11px] text-[#74777f] font-medium">{selectedService.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetServiceSelection}
                  className="text-xs font-semibold text-[#002045] hover:underline px-2 py-1 rounded bg-white border border-[#c4c6cf]/30"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (isCustomService) {
                        setName(e.target.value);
                      }
                    }}
                    placeholder="Search popular service (e.g. Netflix, Spotify)..."
                    className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:ring-2 focus:ring-[#002045] focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[20px] text-[#74777f]">
                    search
                  </span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsDropdownOpen(true);
                      }}
                      className="absolute right-2.5 top-2.5 text-[#74777f] hover:text-[#0d1c2e]"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#c4c6cf]/40 max-h-56 overflow-y-auto divide-y divide-[#c4c6cf]/10">
                    <button
                      type="button"
                      onClick={handleSelectOther}
                      className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-[#eff4ff] text-left transition-colors font-medium text-xs text-[#002045]"
                    >
                      <div className="w-7 h-7 rounded bg-[#dce9ff] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-[#002045]">add</span>
                      </div>
                      <div>
                        <span className="font-bold block">Other / Custom Service</span>
                        <span className="text-[10px] text-[#74777f]">Enter custom subscription name</span>
                      </div>
                    </button>

                    {filteredPopular.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#74777f]">
                        No matching popular services found. Select <strong>Other</strong> above to add custom.
                      </div>
                    ) : (
                      filteredPopular.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleSelectPopular(service)}
                          className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#eff4ff] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded bg-[#f0f4fc] p-1 flex items-center justify-center border border-[#c4c6cf]/20 shrink-0">
                              {service.logoUrl ? (
                                <img
                                  src={service.logoUrl}
                                  alt={service.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[16px] text-[#74777f]">
                                  {service.materialIcon}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#0d1c2e] truncate">
                              {service.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-[#74777f] px-2 py-0.5 rounded bg-[#f0f4fc] shrink-0 ml-2">
                            {service.category}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {(isCustomService || (!selectedService && !isDropdownOpen)) && (
            <div>
              <label className="block text-xs font-semibold text-[#43474e] mb-1">
                Custom Service Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Local Gym, Private VPN, Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:ring-2 focus:ring-[#002045] focus:outline-none"
              />
            </div>
          )}

          {itemType === 'subscription' && (
            <div>
              <label className="block text-xs font-semibold text-[#43474e] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as 'Entertainment' | 'Productivity' | 'Utilities' | 'Health' | 'Other'
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:ring-2 focus:ring-[#002045] focus:outline-none"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Productivity">Productivity</option>
                <option value="Utilities">Utilities</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Billing Cycle Option (Monthly vs Yearly) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#43474e] mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'mo' | 'yr')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] font-semibold focus:ring-2 focus:ring-[#002045] focus:outline-none"
              >
                <option value="mo">Monthly</option>
                <option value="yr">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#43474e] mb-1">
                {billingCycle === 'yr' ? `Price per Year (${currSymbol})` : `Price per Month (${currSymbol})`}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:ring-2 focus:ring-[#002045] focus:outline-none font-mono-val"
              />
            </div>
          </div>

          {/* Monthly Calculation Helper Badge */}
          <div className="bg-[#f0f4fc] px-3 py-2 rounded-lg text-xs font-medium text-[#002045] border border-[#c4c6cf]/30">
            {monthlyCalcText}
          </div>

          {itemType === 'trial' && (
            <div>
              <label className="block text-xs font-semibold text-[#43474e] mb-1">
                Days Remaining in Trial
              </label>
              <input
                type="number"
                min="1"
                required
                value={daysLeft}
                onChange={(e) => setDaysLeft(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#c4c6cf] text-sm text-[#0d1c2e] focus:ring-2 focus:ring-[#002045] focus:outline-none"
              />
            </div>
          )}

          {/* End Date & 1-Day Before Alert Section */}
          <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#002045]/15 space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#002045] mb-1 flex items-center justify-between">
                <span>Subscription / Service End Date</span>
                <span className="text-[10px] text-[#002045]/70 font-normal">Every service can have a unique end date</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#c4c6cf] text-sm text-[#0d1c2e] font-semibold focus:ring-2 focus:ring-[#002045] focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-[#c4c6cf]/30">
              <span className="block text-xs font-bold text-[#002045]">
                1-Day Before End Date Alerts
              </span>

              <label className="flex items-center gap-2 text-xs font-medium text-[#0d1c2e] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertMobile}
                  onChange={(e) => setAlertMobile(e.target.checked)}
                  className="w-4 h-4 rounded text-[#002045] focus:ring-[#002045]"
                />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#002045]">smartphone</span>
                  Send notification to mobile phone
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#0d1c2e] cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-[#002045] focus:ring-[#002045]"
                />
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#002045]">mail</span>
                  Send alert to email
                </span>
              </label>

              {(alertMobile || alertEmail) && calculatedAlertDate && (
                <div className="mt-2 text-[11px] bg-white/90 p-2 rounded-lg text-[#003f25] border border-[#9ff5c1] flex items-center gap-1.5 font-medium leading-tight">
                  <span className="material-symbols-outlined text-[16px] text-[#003f25] shrink-0">
                    notifications_active
                  </span>
                  <span>
                    Alert active: You will be notified on <strong>{calculatedAlertDate}</strong> (1 day before end date <strong>{endDate}</strong>).
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#c4c6cf] text-sm font-medium text-[#43474e] hover:bg-[#eff4ff]"
            >
              Cancel
            </button>
            {isLimitReached ? (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-not-allowed flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">block</span>
                <span>{itemType === 'subscription' ? 'Max 5 Subscriptions Reached' : 'Max 4 Trials Reached'}</span>
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#002045] text-white text-sm font-semibold hover:bg-[#1a365d] transition-colors shadow-sm"
              >
                Add {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
