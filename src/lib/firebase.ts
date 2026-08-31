import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, SubscriptionItem, PriceHikeAlert, FreeTrial } from '../types';
import { initialSubscriptions, initialPriceHikeAlerts, initialFreeTrials } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use in-memory cache to prevent IndexedDB "Database is closing/hidden" issues in iframe/preview environments
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  }, firebaseConfig.firestoreDatabaseId || '(default)');
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}
export const db = firestoreDb;

// Helper for Google Sign-In
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
export type { FirebaseUser };

// Standardized Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const msg = error instanceof Error ? error.message : String(error);
  // Gracefully log closing / hidden / network interruptions without crashing
  if (
    msg.includes('closing') ||
    msg.includes('hidden') ||
    msg.includes('offline') ||
    msg.includes('client is offline') ||
    msg.includes('aborted')
  ) {
    console.warn(`Firestore non-fatal event [${operationType} on ${path}]: ${msg}`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: msg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline.');
    }
  }
}
testConnection();

// Firestore Sync Utilities
export const getUserProfileDocRef = (uid: string) => doc(db, 'users', uid);

export const subscribeToUserData = (
  uid: string,
  callbacks: {
    onProfile: (profile: UserProfile) => void;
    onSubscriptions: (subs: SubscriptionItem[]) => void;
    onPriceHikes?: (hikes: PriceHikeAlert[]) => void;
    onTrials: (trials: FreeTrial[]) => void;
  }
) => {
  let isSubscribed = true;

  // 1. Profile Listener
  const profilePath = `users/${uid}`;
  const unsubscribeProfile = onSnapshot(
    doc(db, 'users', uid),
    (docSnap) => {
      if (!isSubscribed) return;
      if (docSnap.exists()) {
        callbacks.onProfile(docSnap.data() as UserProfile);
      }
    },
    (error) => {
      if (isSubscribed) {
        handleFirestoreError(error, OperationType.GET, profilePath);
      }
    }
  );

  // 2. Subscriptions Listener
  const subsPath = `users/${uid}/subscriptions`;
  const unsubscribeSubs = onSnapshot(
    collection(db, 'users', uid, 'subscriptions'),
    (snapshot) => {
      if (!isSubscribed) return;
      const items: SubscriptionItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as SubscriptionItem);
      });
      callbacks.onSubscriptions(items);
    },
    (error) => {
      if (isSubscribed) {
        handleFirestoreError(error, OperationType.LIST, subsPath);
      }
    }
  );

  // 3. Price Hikes Listener (if requested)
  let unsubscribeHikes = () => {};
  if (callbacks.onPriceHikes) {
    const hikesPath = `users/${uid}/priceHikes`;
    unsubscribeHikes = onSnapshot(
      collection(db, 'users', uid, 'priceHikes'),
      (snapshot) => {
        if (!isSubscribed) return;
        const items: PriceHikeAlert[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as PriceHikeAlert);
        });
        callbacks.onPriceHikes?.(items);
      },
      (error) => {
        if (isSubscribed) {
          handleFirestoreError(error, OperationType.LIST, hikesPath);
        }
      }
    );
  }

  // 4. Free Trials Listener
  const trialsPath = `users/${uid}/trials`;
  const unsubscribeTrials = onSnapshot(
    collection(db, 'users', uid, 'trials'),
    (snapshot) => {
      if (!isSubscribed) return;
      const items: FreeTrial[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as FreeTrial);
      });
      callbacks.onTrials(items);
    },
    (error) => {
      if (isSubscribed) {
        handleFirestoreError(error, OperationType.LIST, trialsPath);
      }
    }
  );

  return () => {
    isSubscribed = false;
    unsubscribeProfile();
    unsubscribeSubs();
    unsubscribeHikes();
    unsubscribeTrials();
  };
};

// Initialize User Cloud Storage on Signup
export const initializeUserInFirestore = async (
  uid: string,
  profile: UserProfile,
  withSampleData: boolean = false
) => {
  try {
    await setDoc(doc(db, 'users', uid), profile);

    if (withSampleData) {
      const batch = writeBatch(db);

      initialSubscriptions.forEach((sub) => {
        const ref = doc(db, 'users', uid, 'subscriptions', sub.id);
        batch.set(ref, sub);
      });

      initialPriceHikeAlerts.forEach((hike) => {
        const ref = doc(db, 'users', uid, 'priceHikes', hike.id);
        batch.set(ref, hike);
      });

      initialFreeTrials.forEach((trial) => {
        const ref = doc(db, 'users', uid, 'trials', trial.id);
        batch.set(ref, trial);
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

// Individual Firestore Mutators
export const saveSubscriptionToCloud = async (uid: string, sub: SubscriptionItem) => {
  try {
    await setDoc(doc(db, 'users', uid, 'subscriptions', sub.id), sub);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/subscriptions/${sub.id}`);
  }
};

export const deleteSubscriptionFromCloud = async (uid: string, subId: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'subscriptions', subId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/subscriptions/${subId}`);
  }
};

export const savePriceHikeToCloud = async (uid: string, hike: PriceHikeAlert) => {
  try {
    await setDoc(doc(db, 'users', uid, 'priceHikes', hike.id), hike);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/priceHikes/${hike.id}`);
  }
};

export const saveTrialToCloud = async (uid: string, trial: FreeTrial) => {
  try {
    await setDoc(doc(db, 'users', uid, 'trials', trial.id), trial);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/trials/${trial.id}`);
  }
};

export const saveUserProfileToCloud = async (uid: string, profile: UserProfile) => {
  try {
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

// Clear All User Cloud Data
export const clearAllUserDataFromCloud = async (uid: string) => {
  try {
    const batch = writeBatch(db);

    const subsSnap = await getDocs(collection(db, 'users', uid, 'subscriptions'));
    subsSnap.forEach((d) => batch.delete(d.ref));

    const hikesSnap = await getDocs(collection(db, 'users', uid, 'priceHikes'));
    hikesSnap.forEach((d) => batch.delete(d.ref));

    const trialsSnap = await getDocs(collection(db, 'users', uid, 'trials'));
    trialsSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

// Load Sample Demo Data to Cloud
export const seedDemoDataToCloud = async (uid: string) => {
  try {
    const batch = writeBatch(db);

    initialSubscriptions.forEach((sub) => {
      const ref = doc(db, 'users', uid, 'subscriptions', sub.id);
      batch.set(ref, sub);
    });

    initialPriceHikeAlerts.forEach((hike) => {
      const ref = doc(db, 'users', uid, 'priceHikes', hike.id);
      batch.set(ref, hike);
    });

    initialFreeTrials.forEach((trial) => {
      const ref = doc(db, 'users', uid, 'trials', trial.id);
      batch.set(ref, trial);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};
