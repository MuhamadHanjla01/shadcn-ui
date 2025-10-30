import { useState, useEffect } from 'react';
import { RealtimeStorage } from '@/lib/realtime-storage';
import { loadFromStorage } from '@/lib/storage';

/**
 * Hook for real-time data that automatically updates across all devices
 * Falls back to localStorage if Firebase is not configured
 */
export function useRealtimeData<T>(
  key: string,
  defaultValue: T
): [T, boolean] {
  const [data, setData] = useState<T>(() => {
    // Load initial data from localStorage (immediate, synchronous)
    return loadFromStorage(key, defaultValue);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from Firebase (asynchronous, may be more up-to-date)
    RealtimeStorage.load(key, defaultValue).then(firebaseData => {
      setData(firebaseData);
      setIsLoading(false);
    });

    // Subscribe to real-time updates
    const unsubscribe = RealtimeStorage.subscribe(key, defaultValue, (updatedData) => {
      console.log(`✨ Real-time update received for ${key}`);
      setData(updatedData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [key]);

  return [data, isLoading];
}

