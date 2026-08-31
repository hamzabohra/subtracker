import { PriceHikeAlert, FreeTrial, SubscriptionItem, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alex Morgan',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBB8cSMrzEhwY1glldjR4IUdUhsLg2jQPhb8VHua-RY3EEZB3SImAP538QIpMeVjHSR4VklxpwO7DCXtaKch4d36DGoKgfJkmKy2gHQGy3Z5GLIwnJaOoNtwdxZlTc2Pj3sVUrWdBjODMdLcGD8vDcOnvvl-J6ChoI5CXheV6Lr4UhyDG2dYAXzTFTlqnV6bkW2A2yEFuJiereUG_wy_EPRbWHVjCt7CqoTI-ibv8vutRDKJCd_UaQ',
  email: 'alex.morgan@example.com',
  monthlyBudget: 400,
  currency: 'USD',
  currencySymbol: '$',
  country: 'United States',
};

export const initialPriceHikeAlerts: PriceHikeAlert[] = [
  {
    id: 'hike-1',
    serviceName: 'StreamFlix Premium',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHbD0WHQ6Qaq0WfpG6cn6d5aRk8r_gmacBlHuQeveJz-DlB9hOcA3MC8IEGTG2T3gPnFEVUxOQ3-vgTD3TfBTmKyUGFyPDc75wUjYQDV1Ayk3TalAnIK4R5QuX2t_RR8ybOUF7hB4c4hfoqya51awoe_kntJDxAh2hGK1yV3d9Ce7SA65x2YFhWNx7zPng4Heof9Z0VSjWtssEEt0EquasOPqzAt0VbQ8I9ccOtSHYFpQuu5igxpMf',
    percentageHike: '+25% Hike',
    hikeType: 'error',
    notifiedText: 'Notified 2 days ago • Takes effect Oct 1',
    oldPrice: 15.99,
    newPrice: 19.99,
    currency: '$',
    status: 'pending'
  },
  {
    id: 'hike-2',
    serviceName: 'AudioStream Plus',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtlaehQfboVKAp71kZCaRiq7DoRcq5_33DcrcMRqcXjUWdWUsJxVgXHMxtqgtsqCSwS3DYm7KfNBFOEFcB8gyEn_g8k-ygEBEGRxwdKRxZPLvbHvBA4KS_9X5M52UAtMw5FPZ1aBuaXniRaCKk3WX-k0FYF9OXtUawhLbGlB9CFHItCKhNgpCLRUGd8VxB0ND7coWLdT50N9n3mesW11745hUZDvRjukZ-MsffldA8E11SzzAhKltp',
    percentageHike: '+10% Hike',
    hikeType: 'secondary',
    notifiedText: 'Notified 5 days ago • Takes effect Nov 15',
    oldPrice: 9.99,
    newPrice: 10.99,
    currency: '$',
    status: 'pending'
  },
  {
    id: 'hike-3',
    serviceName: 'FitApp Pro',
    materialIcon: 'fitness_center',
    percentageHike: '+5% Hike',
    hikeType: 'neutral',
    notifiedText: 'Effective since Aug 1',
    oldPrice: 19.00,
    newPrice: 19.95,
    currency: '$',
    status: 'kept'
  }
];

export const initialFreeTrials: FreeTrial[] = [
  {
    id: 'trial-1',
    serviceName: 'StreamFlix',
    planName: 'Premium Plan',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_RMl3qRJZklTXzSV3_dtKdr4Bjvz937v5Its0bjkRDSr80LSR5MNUZjcE_l4NfrOI1ZdhRVpcXBitvLw0BVuGu01x3ePSpmK9kzOcLeOoLv4KMgS9vgV-NFNPVNKjiM_a5Cn5Y8SrfgAGOnX04up7X2_OB5s9in75B7hadaU6AOrVXZYNopczTAh8QhZtXaKLscI_L9IpEUP-wu5PEEYi8wrj-TFU0XKYFRs2P43oIuqagLDoGE5k',
    daysLeft: 2,
    urgent: true,
    renewsAtPrice: 19.99,
    billingCycle: 'mo',
    alertStatus: 'set',
    alertTimeText: 'Notifying in 24h',
    status: 'active'
  },
  {
    id: 'trial-2',
    serviceName: 'DesignPro',
    planName: 'Team License',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVHjhrHtd9rQWuhKJ1cUHN4APQD9BSPuh3zXJH5Z3YiFMCN5oMnzOKBbtm88F4ZgFwHr8VK2mo0niJlf58VZyS6YurttehUOoYTnFI1CNsQXV5uc9BZrpLIdjjUzbjoMEkRFfssgaNbhk8uPw7AwWFNZtugi8FPlS80fvYSeYtw3LZB6tfBgth4MdB9VLwJmCcsvid23OVg_wcienKV8acWbE54gWVwZc-9BTeAUzAarZPU8ItWff4',
    daysLeft: 14,
    urgent: false,
    renewsAtPrice: 49.00,
    billingCycle: 'mo',
    alertStatus: 'set',
    alertTimeText: 'On Oct 24',
    status: 'active'
  }
];

export const initialSubscriptions: SubscriptionItem[] = [
  {
    id: 'sub-1',
    name: 'Netflix Premium',
    category: 'Entertainment',
    price: 19.99,
    billingCycle: 'mo',
    nextBillingDate: '2026-10-01',
    status: 'Active',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHbD0WHQ6Qaq0WfpG6cn6d5aRk8r_gmacBlHuQeveJz-DlB9hOcA3MC8IEGTG2T3gPnFEVUxOQ3-vgTD3TfBTmKyUGFyPDc75wUjYQDV1Ayk3TalAnIK4R5QuX2t_RR8ybOUF7hB4c4hfoqya51awoe_kntJDxAh2hGK1yV3d9Ce7SA65x2YFhWNx7zPng4Heof9Z0VSjWtssEEt0EquasOPqzAt0VbQ8I9ccOtSHYFpQuu5igxpMf',
    shared: true
  },
  {
    id: 'sub-2',
    name: 'Spotify Family',
    category: 'Entertainment',
    price: 16.99,
    billingCycle: 'mo',
    nextBillingDate: '2026-10-15',
    status: 'Active',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtlaehQfboVKAp71kZCaRiq7DoRcq5_33DcrcMRqcXjUWdWUsJxVgXHMxtqgtsqCSwS3DYm7KfNBFOEFcB8gyEn_g8k-ygEBEGRxwdKRxZPLvbHvBA4KS_9X5M52UAtMw5FPZ1aBuaXniRaCKk3WX-k0FYF9OXtUawhLbGlB9CFHItCKhNgpCLRUGd8VxB0ND7coWLdT50N9n3mesW11745hUZDvRjukZ-MsffldA8E11SzzAhKltp'
  },
  {
    id: 'sub-3',
    name: 'GitHub Copilot',
    category: 'Productivity',
    price: 10.00,
    billingCycle: 'mo',
    nextBillingDate: '2026-09-30',
    status: 'Active',
    materialIcon: 'code'
  }
];
