import { useEffect, useRef, useState } from 'react';

/**
 * A hook that debounces a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Define an interface for our debounced function with a timeout property
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  timeout: ReturnType<typeof setTimeout> | null;
}

/**
 * A hook that returns a debounced function
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const callbackRef = useRef(callback);

  // Always update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Return a memoized version of the callback that only changes if the delay changes
  const debouncedCallback = useRef<DebouncedFunction<T>>(
    Object.assign(
      (...args: Parameters<T>) => {
        if (debouncedCallback.current.timeout) {
          clearTimeout(debouncedCallback.current.timeout);
        }
        
        debouncedCallback.current.timeout = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      },
      { timeout: null }
    )
  );

  // Clear the timeout when the component unmounts or delay changes
  useEffect(() => {
    return () => {
      if (debouncedCallback.current.timeout) {
        clearTimeout(debouncedCallback.current.timeout);
      }
    };
  }, [delay]);

  return debouncedCallback.current;
} 