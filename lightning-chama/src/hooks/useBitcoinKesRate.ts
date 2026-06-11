'use client';

import { useEffect, useState } from 'react';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const FALLBACK_BTC_KES_RATE = 11_500_000;

export const useBitcoinKesRate = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
        setLoadingRate(false);
        return;
      }

      try {
        setLoadingRate(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes'
        );

        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);

        const data = await response.json();
        if (data.bitcoin?.kes) {
          setExchangeRate(data.bitcoin.kes);
          setLastFetched(Date.now());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setExchangeRate((currentRate) => currentRate || FALLBACK_BTC_KES_RATE);
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, [lastFetched]);

  return { exchangeRate, loadingRate, lastFetched };
};
