import React, { useState } from 'react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onTryDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onTryDemo,
}) => {
  // Interactive Savings Calculator state
  const [streamingCount, setStreamingCount] = useState(4);
  const [softwareCount, setSoftwareCount] = useState(3);
  const [trialCount, setTrialCount] = useState(2);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculate estimated annual waste
  const estimatedAnnualSpend = (streamingCount * 18 + softwareCount * 25) * 12;
  const estimatedPotentialSavings = Math.round(estimatedAnnualSpend * 0.22 + trialCount * 30);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0b1320]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/app-icon.svg" alt="SubTracker" className="w-9 h-9 rounded-xl shadow-md" />
            <span className="font-bold text-xl text-white tracking-tight">SubTracker</span>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('calculator')} className="hover:text-blue-400 transition-colors">
              Savings Calculator
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-400 transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-blue-400 transition-colors">
              FAQ
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onTryDemo && (
              <button
                onClick={onTryDemo}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Live Demo</span>
              </button>
            )}
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6">
              <span className="material-symbols-outlined text-[16px] text-blue-400">shield</span>
              <span>Never pay for an unwanted subscription again</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              Master Your Subscriptions. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                Catch Price Hikes. Save Hundreds.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
              SubTracker automatically tracks your recurring streaming, software, and membership costs, 
              reminds you before free trials auto-renew, and alerts you when services silently bump up prices.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              {onTryDemo && (
                <button
                  onClick={onTryDemo}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-blue-400">visibility</span>
                  <span>Try Interactive Demo</span>
                </button>
              )}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                <span>100% Free Account</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                <span>Cloud Sync & Multi-Currency</span>
              </div>
            </div>
          </div>

          {/* Product Preview Card Mockup */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 p-4 sm:p-6 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Top Mockup Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800">
                app.subtracker.io / dashboard
              </div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Preview
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Hike Alert */}
              <div className="rounded-xl bg-slate-900/90 border border-rose-500/30 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                      Rate Increase Detected
                    </span>
                    <span className="text-xs text-slate-400">Effective Sep 1</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Netflix Premium</h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xs text-slate-400 line-through">$19.99/mo</span>
                    <span className="text-base font-bold text-rose-400">$22.99/mo</span>
                    <span className="text-[11px] font-semibold text-rose-400">(+15%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors">
                    Flag Cancel
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                    Accept
                  </button>
                </div>
              </div>

              {/* Card 2: Trial Alert */}
              <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Trial Ending Soon
                    </span>
                    <span className="text-xs text-amber-400 font-bold">2 days left</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Adobe Creative Cloud</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Auto-renews at <span className="font-mono text-white font-bold">$54.99/mo</span>
                  </p>
                </div>
                <button className="w-full mt-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-colors">
                  Cancel Trial Reminder Set
                </button>
              </div>

              {/* Card 3: Monthly Spend Overview */}
              <div className="rounded-xl bg-slate-900/90 border border-blue-500/20 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Active Monthly Spend</span>
                  <div className="flex items-baseline justify-between mt-1 mb-2">
                    <span className="text-2xl font-black text-white font-mono">$184.50</span>
                    <span className="text-xs text-slate-400">Budget: $250.00</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '74%' }} />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ $65.50 remaining under budget
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <span>8 Active Subscriptions</span>
                  <span className="text-blue-400 font-semibold">View Analysis →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 bg-slate-950/60 border-t border-slate-800/60 relative">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Engineered for Peace of Mind</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Reclaim Your Monthly Cash Flow
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item 1 */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">trending_up</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Real-time Price Hike Detection</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Services continuously increase prices hoping you won't notice. SubTracker flags rate increases, highlights the exact price delta (+%), and helps you decide whether to keep or cancel.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
                <span>"Spotify bumped plan from $9.99 to $11.99/mo (+20%)"</span>
                <span className="text-rose-400 font-bold">Flagged Immediately</span>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">timer</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Free Trial Reminders</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Never forget to cancel a free trial again. Get clear countdown badges and reminders before your credit card gets charged.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                <span>Alert 48h before auto-renewal</span>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Category & Budget Tracking</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Set custom monthly spend caps. Group subscriptions by Entertainment, Software, Fitness, or Utilities to see where your money actually goes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                <span>Visual Category Donuts</span>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">currency_exchange</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Multi-Currency & Annual Normalization</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Whether you pay in USD ($), EUR (€), GBP (£), JPY (¥), or INR (₹), SubTracker formats prices instantly and normalizes annual plans down to monthly equivalents so your budget is always accurate.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <span className="px-2.5 py-1 rounded bg-slate-950 font-mono text-blue-300">$ USD</span>
                <span className="px-2.5 py-1 rounded bg-slate-950 font-mono text-blue-300">€ EUR</span>
                <span className="px-2.5 py-1 rounded bg-slate-950 font-mono text-blue-300">£ GBP</span>
                <span className="px-2.5 py-1 rounded bg-slate-950 font-mono text-blue-300">₹ INR</span>
                <span className="px-2.5 py-1 rounded bg-slate-950 font-mono text-blue-300">C$ CAD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator Section */}
      <section id="calculator" className="py-20 relative">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-[#0c182c] border border-blue-500/30 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
                  Interactive Estimator
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-4">
                  How Much Are Forgotten Subscriptions Costing You?
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  Adjust the sliders to estimate how much money you could save each year by catching unnoticed price increases and stopping accidental trial renewals.
                </p>

                {/* Slider 1 */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Streaming & Media (Netflix, Spotify, Hulu)</span>
                    <span className="text-blue-400 font-bold">{streamingCount} Services</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={streamingCount}
                    onChange={(e) => setStreamingCount(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Slider 2 */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Work & Software (ChatGPT, Adobe, Storage)</span>
                    <span className="text-blue-400 font-bold">{softwareCount} Apps</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={softwareCount}
                    onChange={(e) => setSoftwareCount(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Slider 3 */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Active / Upcoming Free Trials</span>
                    <span className="text-amber-400 font-bold">{trialCount} Trials</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={trialCount}
                    onChange={(e) => setTrialCount(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Calculator Results Display Card */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-8 text-center flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Estimated Total Annual Spend</span>
                  <div className="text-3xl font-black text-white font-mono mt-1 mb-6">
                    ${estimatedAnnualSpend.toLocaleString()}/yr
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 mb-6">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Potential Annual Savings</span>
                    <div className="text-4xl md:text-5xl font-black text-emerald-300 font-mono my-2">
                      ${estimatedPotentialSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-300">
                      Based on average price hike flags and cancelled trial renewals.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Start Saving Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-t border-slate-800/60">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Simple 3-Step Setup</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">How SubTracker Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Add Your Subscriptions</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Pick from standard templates (Netflix, ChatGPT, Spotify, iCloud) or quickly type custom services with billing cycles and amounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Set Renewal & Trial Dates</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Add free trial expiration dates or expected rate adjustments. SubTracker handles countdowns and time conversion automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 font-bold text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Sit Back & Save Money</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Get alerted before trials end or rate increases take effect. Review monthly analytics and keep your recurring expenses under control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-slate-800/60">
        <div className="max-w-[800px] mx-auto px-4 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Got Questions?</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is SubTracker completely free to use?',
                a: 'Yes! You can create a free account, track all your subscriptions, receive price hike alerts, and set up free trial countdowns at zero cost.',
              },
              {
                q: 'How does price hike detection work?',
                a: 'When you log your active plan prices or update notification alerts, SubTracker calculates percentage increases and effective dates so you can review and decide whether to cancel before the next charge.',
              },
              {
                q: 'Can I track annual subscriptions alongside monthly ones?',
                a: 'Absolutely. SubTracker normalizes annual plans into monthly equivalents in your total budget view while preserving the original billing cycle detail.',
              },
              {
                q: 'Does SubTracker support multiple currencies?',
                a: 'Yes! SubTracker supports USD ($), EUR (€), GBP (£), INR (₹), CAD (C$), AUD (A$), JPY (¥) and more based on your country settings.',
              },
              {
                q: 'Is my data synchronized across my devices?',
                a: 'Yes, SubTracker leverages secure cloud storage with Firebase Firestore. Your subscriptions sync in real time whenever you sign in.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-semibold text-sm text-white flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  <span>{item.q}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    {openFaq === idx ? 'remove' : 'add'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-[#080d17] border-t border-slate-800/80">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-10 md:p-14 text-center relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Stop Unwanted Subscription Charges Today
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8">
              Join thousands of users keeping full command of their monthly software and streaming budgets.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Free Account
              </button>
              {onTryDemo && (
                <button
                  onClick={onTryDemo}
                  className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
                >
                  Explore Demo
                </button>
              )}
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
            <div className="flex items-center gap-2">
              <img src="/app-icon.svg" alt="SubTracker" className="w-5 h-5 rounded" />
              <span className="font-bold text-slate-300">SubTracker © 2026</span>
            </div>
            <p>Smart Subscription Management, Price Hike Alerts & Trial Reminders.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
