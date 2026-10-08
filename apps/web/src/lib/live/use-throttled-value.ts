'use client';

import { useEffect, useRef, useState } from 'react';

/** Follows `value`, changing at most once per interval and always settling on the latest value. */
export function useThrottledValue<Value>(value: Value, intervalMs: number): Value {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastChangedAt = useRef(0);

  useEffect(() => {
    const waitMs = Math.max(0, lastChangedAt.current + intervalMs - Date.now());
    const timer = setTimeout(() => {
      lastChangedAt.current = Date.now();
      setThrottledValue(value);
    }, waitMs);
    return () => clearTimeout(timer);
  }, [value, intervalMs]);

  return throttledValue;
}
