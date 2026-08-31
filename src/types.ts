export type ViewTab = 'roster' | 'trials' | 'analysis';

export interface PriceHikeAlert {
  id: string;
  serviceName: string;
  logoUrl?: string;
  materialIcon?: string;
  percentageHike: string;
  hikeType: 'error' | 'secondary' | 'neutral';
  notifiedText: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  status: 'pending' | 'kept' | 'canceled';
  decisionDate?: string;
  endDate?: string;
  alertMobile?: boolean;
  alertEmail?: boolean;
}

export interface FreeTrial {
  id: string;
  serviceName: string;
  planName: string;
  logoUrl?: string;
  materialIcon?: string;
  daysLeft: number;
  urgent?: boolean; // if daysLeft <= 2
  renewsAtPrice: number;
  currency?: string;
  billingCycle: 'mo' | 'yr';
  alertStatus: 'set' | 'none';
  alertTimeText?: string; // e.g. "Notifying in 24h", "On Oct 24"
  status: 'active' | 'expired';
  endedDateText?: string; // e.g. "Ended on Oct 10, 2023"
  endDate?: string;
  alertMobile?: boolean;
  alertEmail?: boolean;
  alertDate?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: 'Entertainment' | 'Productivity' | 'Utilities' | 'Health' | 'Other';
  price: number;
  currency?: string;
  billingCycle: 'mo' | 'yr';
  nextBillingDate: string;
  status: 'Active' | 'Paused' | 'Trial';
  logoUrl?: string;
  materialIcon?: string;
  shared?: boolean;
  endDate?: string;
  alertMobile?: boolean;
  alertEmail?: boolean;
  alertDate?: string;
}

export interface CategorySummary {
  name: string;
  color: string;
  percentage: number;
  totalSpend: number;
  count: number;
  items: {
    id: string;
    name: string;
    logoUrl?: string;
    materialIcon?: string;
    price: number;
  }[];
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  email: string;
  monthlyBudget: number;
  currency: string;
  currencySymbol?: string;
  country?: string;
  isPro?: boolean;
}
