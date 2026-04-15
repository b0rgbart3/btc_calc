import { useState, useEffect } from 'react';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

const REFRESH_INTERVAL_MS = 60_000;

export interface UseBtcPriceResult {
  price: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useBtcPrice(): UseBtcPriceResult {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPrice() {
      try {
        const res = await fetch(COINGECKO_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { bitcoin: { usd: number } };
        if (isMounted) {
          setPrice(data.bitcoin.usd);
          setError(null);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
          setLoading(false);
          // Preserve last known price — don't reset to null
        }
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, loading, error, lastUpdated };
}
