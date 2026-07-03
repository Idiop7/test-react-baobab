import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Runs `onChange` whenever the OS-level app lifecycle transitions (active,
 * background, inactive). Used to tear down timers/async flux (stats ticker,
 * subscriptions) instead of leaving them running while the app is backgrounded.
 */
export function useOnAppStateChange(onChange: (status: AppStateStatus) => void): void {
  const callbackRef = useRef(onChange);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      callbackRef.current(status);
    });
    return () => subscription.remove();
  }, []);
}

export function isForeground(status: AppStateStatus): boolean {
  return status === 'active';
}
