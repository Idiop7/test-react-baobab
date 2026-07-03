import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { isForeground, useOnAppStateChange } from '../../../lib/appLifecycle';
import { startStatsTicker, stopStatsTicker } from '../../../state/statsStore';

/**
 * Drives the 500ms stress-test ticker only while this screen is focused AND
 * the app is in the foreground — backgrounding the app or navigating away
 * (AppState / react-navigation focus) tears the interval down so no timers
 * or async flux run while nothing is visible.
 */
export function useStatsTicker(intervalMs = 500): void {
  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      startStatsTicker(intervalMs);
      return () => {
        isFocusedRef.current = false;
        stopStatsTicker();
      };
    }, [intervalMs]),
  );

  useOnAppStateChange((status) => {
    if (!isFocusedRef.current) return;
    if (isForeground(status)) {
      startStatsTicker(intervalMs);
    } else {
      stopStatsTicker();
    }
  });
}
