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
  auth,
  onAuthStateChanged,
  signOut,
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
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

  // Add Item Handlers
  const handleAddSubscription = (newSub: SubscriptionItem) => {
    setSubscriptions((prev) => [newSub, ...prev]);
    if (currentUserUid) {
      saveSubscriptionToCloud(currentUserUid, newSub);
    }
    // Show sponsored interstitial ad after adding subscription
    setInterstitialAdTitle(`Added "${newSub.name}" Successfully!`);
    setIsInterstitialAdOpen(true);
  };

  const handleAddTrial = (newTrial: FreeTrial) => {
    setTrials((prev) => [newTrial, ...prev]);
    if (currentUserUid) {
      saveTrialToCloud(currentUserUid, newTrial);
    }
    // Show sponsored interstitial ad after adding trial
    setInterstitialAdTitle(`Trial for "${newTrial.serviceName}" Created!`);
    setIsInterstitialAdOpen(true);
  };

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
