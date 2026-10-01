'use client';

import { useState, useEffect } from 'react';

/**
 * Custom React hook that debounces a value by a specified delay in milliseconds.
 * Useful for search inputs, form autosaves, and forward geocoding.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait after value stops changing before updating
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
