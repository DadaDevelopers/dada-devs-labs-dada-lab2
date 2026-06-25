export const SATS_PER_BTC = 100_000_000;

export const convertSatsToKes = (sats: number, exchangeRate?: number | null) => {
  if (!exchangeRate) return 0;
  return (sats / SATS_PER_BTC) * exchangeRate;
};

export const formatSats = (sats: number) => sats.toLocaleString();

export const formatKesFromSats = (sats: number, exchangeRate?: number | null) => {
  if (!exchangeRate) return 'KES --';
  return `KES ${convertSatsToKes(sats, exchangeRate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatBtcFromSats = (sats: number) => `${(sats / SATS_PER_BTC).toFixed(8)} BTC`;
