/**
 * PTR MOTORSPORT - GLOBAL CURRENCY CONVERTER & FORMATTER
 * Supports VND (base), USD, EUR, JPY, GBP with instant conversion
 */

export const CURRENCIES = [
  { code: 'VND', symbol: '₫', label: 'VND (₫)', rate: 1, decimals: 0 },
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 25450, decimals: 0 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 27600, decimals: 0 },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', rate: 165, decimals: 0 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 32400, decimals: 0 },
];

export function getSavedCurrency() {
  try {
    return localStorage.getItem('ptr_currency') || 'VND';
  } catch (e) {
    return 'VND';
  }
}

export function saveCurrency(code) {
  try {
    localStorage.setItem('ptr_currency', code);
  } catch (e) {}
}

export function formatCurrency(amountVND, currencyCode = 'VND') {
  if (amountVND === undefined || amountVND === null || isNaN(amountVND)) {
    return currencyCode === 'VND' ? '0 ₫' : `$0`;
  }

  const numVND = Number(amountVND);
  const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  if (curr.code === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(numVND);
  }

  const converted = numVND / curr.rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr.code,
    maximumFractionDigits: converted >= 1000 ? 0 : (converted >= 100 ? 0 : 2)
  }).format(converted);
}
