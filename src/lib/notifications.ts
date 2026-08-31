import { LocalNotifications } from '@capacitor/local-notifications';
import { FreeTrial, SubscriptionItem } from '../types';

// Audio chime using Web Audio API for fallback/in-app alert sounds
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two-tone bell
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch (err) {
    console.warn('Audio chime playback not supported:', err);
  }
};

// Check if running inside Capacitor native container
export const isCapacitorNative = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined' && 
         typeof (window as any).Capacitor.isNativePlatform === 'function' && 
         (window as any).Capacitor.isNativePlatform();
};

// Request Notification Permission on Web & Mobile
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    // 1. Android Capacitor Native
    if (isCapacitorNative()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    }

    // 2. Standard Web Browser Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check current notification permission state
export const getNotificationPermissionStatus = async (): Promise<'granted' | 'denied' | 'default'> => {
  try {
    if (isCapacitorNative()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'default';
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  } catch {
    return 'default';
  }
};

// Dispatch immediate notification (Push / Local notification)
export const sendLocalNotification = async (
  title: string,
  body: string,
  id: number = Math.floor(Math.random() * 100000)
): Promise<boolean> => {
  playNotificationChime();

  try {
    // 1. Android Local Notifications
    if (isCapacitorNative()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_notification',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      return true;
    }

    // 2. Browser Notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        return true;
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
          return true;
        }
      }
    }
  } catch (error) {
    console.error('Failed to trigger local notification:', error);
  }

  return false;
};

// Schedule an alert for a specific trial or subscription
export const scheduleItemAlert = async (
  item: FreeTrial | SubscriptionItem,
  type: 'trial' | 'subscription'
): Promise<void> => {
  if (!item.endDate || !item.alertMobile) return;

  try {
    // Calculate alert date: 1 day before end date at 09:00 AM
    const end = new Date(item.endDate);
    const alertTime = new Date(end);
    alertTime.setDate(alertTime.getDate() - 1);
    alertTime.setHours(9, 0, 0, 0);

    const now = new Date();
    // Only schedule if alert date is in the future
    if (alertTime.getTime() > now.getTime() && isCapacitorNative()) {
      const name = type === 'trial' ? (item as FreeTrial).serviceName : (item as SubscriptionItem).name;
      const numId = Math.abs(hashCode(item.id));

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `⚠️ ${name} ${type === 'trial' ? 'Trial' : 'Subscription'} Ends Tomorrow!`,
            body: `Your ${name} ${type === 'trial' ? 'free trial' : 'subscription'} expires on ${item.endDate}. Cancel or review now to avoid unwanted charges.`,
            id: numId,
            schedule: { at: alertTime },
            sound: 'beep.wav',
          },
        ],
      });
    }
  } catch (err) {
    console.error('Error scheduling alert:', err);
  }
};

// Simple integer hash code for string IDs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Send test email notification via backend
export const sendTestEmailAlert = async (email: string, serviceName: string = 'Netflix'): Promise<{
  success: boolean;
  message: string;
  previewUrl?: string;
}> => {
  try {
    const res = await fetch('/api/notifications/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, serviceName }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to send test email.',
    };
  }
};

// Check for items needing immediate attention
export interface PendingAlertItem {
  id: string;
  name: string;
  type: 'trial' | 'subscription';
  endDate?: string;
  daysLeft?: number;
  message: string;
}

export const getPendingAlerts = (
  trials: FreeTrial[],
  subscriptions: SubscriptionItem[]
): PendingAlertItem[] => {
  const alerts: PendingAlertItem[] = [];

  // Check active trials
  trials.forEach((t) => {
    if (t.status === 'active') {
      if (t.daysLeft <= 1) {
        alerts.push({
          id: t.id,
          name: t.serviceName,
          type: 'trial',
          endDate: t.endDate,
          daysLeft: t.daysLeft,
          message: t.daysLeft === 0 ? 'Free trial ends today!' : 'Free trial ends tomorrow!',
        });
      }
    }
  });

  // Check subscriptions with upcoming end dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  subscriptions.forEach((s) => {
    if (s.endDate && (s.endDate === todayStr || s.endDate === tomorrowStr)) {
      alerts.push({
        id: s.id,
        name: s.name,
        type: 'subscription',
        endDate: s.endDate,
        message: s.endDate === todayStr ? 'Subscription renewal/end date is today!' : 'Subscription renewal/end date is tomorrow!',
      });
    }
  });

  return alerts;
};
