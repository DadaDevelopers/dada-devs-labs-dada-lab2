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
        // CoinGecko doesn't support KES as a vs_currency, so BTC/KES has to be
        // derived from BTC/USD and a separate USD/KES FX rate.
        const [btcResponse, fxResponse] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
          fetch('https://open.er-api.com/v6/latest/USD'),
        ]);

        if (!btcResponse.ok) throw new Error(`CoinGecko API responded with status: ${btcResponse.status}`);
        if (!fxResponse.ok) throw new Error(`FX API responded with status: ${fxResponse.status}`);

        const btcData = await btcResponse.json();
        const fxData = await fxResponse.json();

        const btcUsd = btcData.bitcoin?.usd;
        const usdKes = fxData.rates?.KES;

        if (btcUsd && usdKes) {
          setExchangeRate(btcUsd * usdKes);
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
