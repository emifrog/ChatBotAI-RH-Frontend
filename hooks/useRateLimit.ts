// hooks/useRateLimit.ts
import { useRef } from 'react';

export const useRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = useRef<number[]>([]);

  const canMakeRequest = (): boolean => {
    const now = Date.now();
    requests.current = requests.current.filter(time => now - time < windowMs);
    
    if (requests.current.length >= maxRequests) {
      return false;
    }
    
    requests.current.push(now);
    return true;
  };

  return { canMakeRequest };
};