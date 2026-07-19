// Approximate STATIC conversion rates to KWD.
// NOT live — update manually if needed. Do not use for financial accuracy.
// Rate = 1 unit of currency in KWD.
export interface Currency {
  code: string;
  label: string;
  symbol: string;
  rateToKwd: number;
}

export const CURRENCIES: Currency[] = [
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "KD", rateToKwd: 1 },
  { code: "USD", label: "US Dollar", symbol: "$", rateToKwd: 0.307 },
  { code: "EUR", label: "Euro", symbol: "€", rateToKwd: 0.335 },
  { code: "GBP", label: "British Pound", symbol: "£", rateToKwd: 0.39 },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼", rateToKwd: 0.082 },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ", rateToKwd: 0.0836 },
];

export const DEFAULT_CURRENCY = "KWD";

export const convertToKwd = (amount: number, code: string): number => {
  const c = CURRENCIES.find((x) => x.code === code);
  if (!c) return amount;
  return amount * c.rateToKwd;
};

export const roundKwd = (v: number) => Math.round(v * 1000) / 1000;