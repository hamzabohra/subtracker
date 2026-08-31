export interface CountryOption {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
}

export const COUNTRIES_LIST: CountryOption[] = [
  { code: 'US', name: 'United States', currencyCode: 'USD', currencySymbol: '$' },
  { code: 'IN', name: 'India', currencyCode: 'INR', currencySymbol: '₹' },
  { code: 'GB', name: 'United Kingdom', currencyCode: 'GBP', currencySymbol: '£' },
  { code: 'CA', name: 'Canada', currencyCode: 'CAD', currencySymbol: 'CA$' },
  { code: 'AU', name: 'Australia', currencyCode: 'AUD', currencySymbol: 'A$' },
  { code: 'DE', name: 'Germany', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'FR', name: 'France', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'IT', name: 'Italy', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'ES', name: 'Spain', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'NL', name: 'Netherlands', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'BR', name: 'Brazil', currencyCode: 'BRL', currencySymbol: 'R$' },
  { code: 'JP', name: 'Japan', currencyCode: 'JPY', currencySymbol: '¥' },
  { code: 'CN', name: 'China', currencyCode: 'CNY', currencySymbol: 'CN¥' },
  { code: 'MX', name: 'Mexico', currencyCode: 'MXN', currencySymbol: 'MX$' },
  { code: 'AE', name: 'United Arab Emirates', currencyCode: 'AED', currencySymbol: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', currencyCode: 'SAR', currencySymbol: 'SAR' },
  { code: 'SG', name: 'Singapore', currencyCode: 'SGD', currencySymbol: 'SG$' },
  { code: 'KR', name: 'South Korea', currencyCode: 'KRW', currencySymbol: '₩' },
  { code: 'CH', name: 'Switzerland', currencyCode: 'CHF', currencySymbol: 'CHF' },
  { code: 'SE', name: 'Sweden', currencyCode: 'SEK', currencySymbol: 'kr' },
  { code: 'NO', name: 'Norway', currencyCode: 'NOK', currencySymbol: 'kr' },
  { code: 'DK', name: 'Denmark', currencyCode: 'DKK', currencySymbol: 'kr' },
  { code: 'ZA', name: 'South Africa', currencyCode: 'ZAR', currencySymbol: 'R' },
  { code: 'NG', name: 'Nigeria', currencyCode: 'NGN', currencySymbol: '₦' },
  { code: 'PK', name: 'Pakistan', currencyCode: 'PKR', currencySymbol: 'Rs' },
  { code: 'ID', name: 'Indonesia', currencyCode: 'IDR', currencySymbol: 'Rp' },
  { code: 'PH', name: 'Philippines', currencyCode: 'PHP', currencySymbol: '₱' },
  { code: 'MY', name: 'Malaysia', currencyCode: 'MYR', currencySymbol: 'RM' },
  { code: 'TH', name: 'Thailand', currencyCode: 'THB', currencySymbol: '฿' },
  { code: 'VN', name: 'Vietnam', currencyCode: 'VND', currencySymbol: '₫' },
  { code: 'NZ', name: 'New Zealand', currencyCode: 'NZD', currencySymbol: 'NZ$' },
  { code: 'IE', name: 'Ireland', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'AT', name: 'Austria', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'BE', name: 'Belgium', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'PL', name: 'Poland', currencyCode: 'PLN', currencySymbol: 'zł' },
  { code: 'TR', name: 'Turkey', currencyCode: 'TRY', currencySymbol: '₺' },
  { code: 'AR', name: 'Argentina', currencyCode: 'ARS', currencySymbol: 'AR$' },
  { code: 'CL', name: 'Chile', currencyCode: 'CLP', currencySymbol: 'CL$' },
  { code: 'CO', name: 'Colombia', currencyCode: 'COP', currencySymbol: 'CO$' },
  { code: 'EGP', name: 'Egypt', currencyCode: 'EGP', currencySymbol: 'EGP' },
  { code: 'IL', name: 'Israel', currencyCode: 'ILS', currencySymbol: '₪' },
  { code: 'KW', name: 'Kuwait', currencyCode: 'KWD', currencySymbol: 'KD' },
  { code: 'QA', name: 'Qatar', currencyCode: 'QAR', currencySymbol: 'QR' },
];

export function getCurrencyForCountry(countryName: string): { code: string; symbol: string } {
  const found = COUNTRIES_LIST.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
  if (found) {
    return { code: found.currencyCode, symbol: found.currencySymbol };
  }
  return { code: 'USD', symbol: '$' };
}

export function getCurrencySymbol(user?: { currencySymbol?: string; currency?: string; country?: string } | null): string {
  if (!user) return '$';
  if (user.currencySymbol) return user.currencySymbol;
  if (user.country) {
    const found = COUNTRIES_LIST.find((c) => c.name.toLowerCase() === user.country?.toLowerCase());
    if (found) return found.currencySymbol;
  }
  if (user.currency) {
    const found = COUNTRIES_LIST.find(
      (c) => c.currencyCode.toLowerCase() === user.currency?.toLowerCase() || c.currencySymbol === user.currency
    );
    if (found) return found.currencySymbol;
    return user.currency;
  }
  return '$';
}
