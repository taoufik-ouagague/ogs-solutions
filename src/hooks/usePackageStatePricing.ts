/**
 * Hook to fetch package state pricing data
 */

import { useEffect, useState } from 'react';

export interface PackageStatePrice {
  id: string;
  state: string;
  name: string;
  basic_price: number;
  epic_price: number;
  ultimate_price: number;
  [key: string]: any;
}

export function usePackageStatePricing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        console.log('📦 [usePackageStatePricing] Package pricing is now handled by state-specific packages');
        // No longer need to fetch package_state collection
        // Pricing is now built into each package document with a 'state' field
        setLoading(false);
      } catch (err: any) {
        console.error('❌ [usePackageStatePricing] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const getPriceForState = (state: string) => {
    console.log(`🔍 [getPriceForState] State-specific pricing is now embedded in package documents, state: ${state}`);
    return null;
  };

  return {
    pricing: {} as Record<string, PackageStatePrice>,
    loading,
    error,
    getPriceForState,
  };
}
