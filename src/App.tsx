import React, { useState, useEffect } from 'react';
import { ViewTab, SubscriptionItem, FreeTrial, UserProfile } from './types';
import {
  initialUserProfile,
  initialFreeTrials,
  initialSubscriptions,
} from './data/initialData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { RosterView } from './components/RosterView';
import { TrialsView } from './components/TrialsView';
import { AnalysisView } from './components/AnalysisView';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { AuthView } from './components/AuthView';
import {
  scheduleItemAlert,
  getPendingAlerts,
  sendLocalNotification,
} from './lib/notifications';
import {
  auth,
  onAuthStateChanged,
  signOut,
  getRedirectResult,
  ensureUserProfileExists,
  subscribeToUserData,
  saveSubscriptionToCloud,
  deleteSubscriptionFromCloud,
  saveTrialToCloud,
  saveUserProfileToCloud,
  clearAllUserDataFromCloud,
  seedDemoDataToCloud,
} from './lib/firebase';

export default function App() {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('roster');

  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [trials, setTrials] = useState<FreeTrial[]>(initialFreeTrials);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialSubscriptions);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState(false);
  const [interstitialAdTitle, setInterstitialAdTitle] = useState('Subscription Added!');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Listen to Firebase Auth state & Catch Mobile Redirect Result
  useEffect(() => {
    // 1. Process any pending mobile redirect sign-ins
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const profile = await ensureUserProfileExists(result.user);
          setUser(profile);
          setCurrentUserUid(result.user.uid);
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        console.warn('getRedirectResult notice:', err);
      });

    // 2. Listen to active auth session
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await ensureUserProfileExists(fbUser);
          setUser(profile);
        } catch (err) {
          console.warn('ensureUserProfileExists notice:', err);
        }
        setCurrentUserUid(fbUser.uid);
        setIsAuthenticated(true);
      } else {
        setCurrentUserUid(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Cloud Sync from Firestore
  useEffect(() => {
    if (!currentUserUid) return;

    const unsubscribeData = subscribeToUserData(currentUserUid, {
      onProfile: (profile) => setUser(profile),
      onSubscriptions: (subs) => setSubscriptions(subs),
      onTrials: (trls) => setTrials(trls),
    });

    return () => unsubscribeData();
  }, [currentUserUid]);

  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsAuthenticated(true);
  };

  const handleUpdateUserProfile = (updated: UserProfile) => {
    setUser(updated);
    if (currentUserUid) {
      saveUserProfileToCloud(currentUserUid, updated);
    }
  };

  const handleLoadDemoData = async () => {
    setSubscriptions(initialSubscriptions);
    setTrials(initialFreeTrials);

    if (currentUserUid) {
      await seedDemoDataToCloud(currentUserUid);
    }
  };

  const handleClearData = async () => {
    setSubscriptions([]);
    setTrials([]);

    if (currentUserUid) {
      await clearAllUserDataFromCloud(currentUserUid);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  // Free Trial Actions
  const handleToggleTrialAlert = (id: string) => {
    setTrials((prev) => {
      const updated = prev.map((trial) => {
        if (trial.id === id) {
          const isSet = trial.alertStatus === 'set';
          return {
            ...trial,
            alertStatus: isSet ? ('none' as const) : ('set' as const),
            alertTimeText: isSet ? undefined : 'Notifying in 24h',
          };
        }
        return trial;
      });
      const target = updated.find((t) => t.id === id);
      if (currentUserUid && target) {
        saveTrialToCloud(currentUserUid, target);
      }
      return updated;
    });
  };

  const handleReactivateTrial = (id: string) => {
    setTrials((prev) => {
      const updated = prev.map((trial) => {
        if (trial.id === id) {
          return {
            ...trial,
            status: 'active' as const,
            daysLeft: 14,
            endedDateText: undefined,
          };
        }
        return trial;
      });
      const target = updated.find((t) => t.id === id);
      if (currentUserUid && target) {
        saveTrialToCloud(currentUserUid, target);
      }
      return updated;
    });
  };

  // Subscription Roster Actions
  const handleToggleSubscriptionStatus = (id: string) => {
    setSubscriptions((prev) => {
      const updated = prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            status: sub.status === 'Paused' ? ('Active' as const) : ('Paused' as const),
          };
        }
        return sub;
      });
      const target = updated.find((s) => s.id === id);
      if (currentUserUid && target) {
        saveSubscriptionToCloud(currentUserUid, target);
      }
      return updated;
    });
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    if (currentUserUid) {
      deleteSubscriptionFromCloud(currentUserUid, id);
    }
  };

  // Dismissed alert IDs in this session
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Add Item Handlers
  const handleAddSubscription = (newSub: SubscriptionItem) => {
    setSubscriptions((prev) => [newSub, ...prev]);
    if (currentUserUid) {
      saveSubscriptionToCloud(currentUserUid, newSub);
    }
    // Schedule native alarm if mobile alerts enabled
    scheduleItemAlert(newSub, 'subscription');

    // Show sponsored interstitial ad after adding subscription
    setInterstitialAdTitle(`Added "${newSub.name}" Successfully!`);
    setIsInterstitialAdOpen(true);
  };

  const handleAddTrial = (newTrial: FreeTrial) => {
    setTrials((prev) => [newTrial, ...prev]);
    if (currentUserUid) {
      saveTrialToCloud(currentUserUid, newTrial);
    }
    // Schedule native alarm if mobile alerts enabled
    scheduleItemAlert(newTrial, 'trial');

    // Show sponsored interstitial ad after adding trial
    setInterstitialAdTitle(`Trial for "${newTrial.serviceName}" Created!`);
    setIsInterstitialAdOpen(true);
  };

  // Pending urgent alerts
  const pendingAlerts = getPendingAlerts(trials, subscriptions).filter(
    (a) => !dismissedAlertIds.includes(a.id)
  );

  // Counts for notifications
  const urgentTrialsCount = trials.filter((t) => t.status === 'active' && t.daysLeft <= 2).length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0b1320] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-blue-200">Connecting to SubTracker Cloud...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthView
        initialMode="login"
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1320] text-[#0d1c2e] dark:text-[#e2e8f0] font-sans antialiased pb-24 md:pb-12 pt-16 transition-colors">
      {/* Top Bar Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-6">
        {/* Urgent Expiry Banner */}
        {pendingAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs animate-fade-in"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] shrink-0 animate-bounce">
                    warning
                  </span>
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Action Required: {alert.name} ({alert.message})
                    </span>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Review or cancel before automatic billing starts on {alert.endDate || 'soon'}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('trials')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    View Alert
                  </button>
                  <button
                    onClick={() => setDismissedAlertIds((prev) => [...prev, alert.id])}
                    className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-full"
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'roster' && (
          <RosterView
            subscriptions={subscriptions}
            user={user}
            onToggleStatus={handleToggleSubscriptionStatus}
            onDeleteSubscription={handleDeleteSubscription}
            onAddNewSubscription={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'trials' && (
          <TrialsView
            trials={trials}
            user={user}
            onToggleAlert={handleToggleTrialAlert}
            onReactivate={handleReactivateTrial}
            onAddNewTrial={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisView
            subscriptions={subscriptions}
            user={user}
          />
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        urgentTrialsCount={urgentTrialsCount}
      />

      {/* Modals */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        activeTab={activeTab}
        user={user}
        subscriptionsCount={subscriptions.length}
        trialsCount={trials.length}
        onClose={() => setIsAddModalOpen(false)}
        onAddSubscription={handleAddSubscription}
        onAddTrial={handleAddTrial}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        user={user}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateUser={handleUpdateUserProfile}
        onLoadDemoData={handleLoadDemoData}
        onClearData={handleClearData}
      />

      <InterstitialAdModal
        isOpen={isInterstitialAdOpen}
        user={user}
        title={interstitialAdTitle}
        onClose={() => setIsInterstitialAdOpen(false)}
      />
    </div>
  );
}
