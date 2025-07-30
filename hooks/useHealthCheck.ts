import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../lib/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database?: {
    status: string;
    timestamp: string;
  };
  redis?: {
    status: string;
    timestamp: string;
  };
}

export const useHealthCheck = (intervalMs: number = 30000) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const healthData = await apiService.healthCheck();
      setHealth(healthData);
      setIsHealthy(healthData.status === 'OK');
      setLastCheck(new Date());
      
      if (healthData.status !== 'OK') {
        console.warn('⚠️ Backend santé dégradée:', healthData);
      }
    } catch (error) {
      console.error('❌ Erreur health check:', error);
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  // Vérification initiale et périodique
  useEffect(() => {
    checkHealth();
    
    const interval = setInterval(checkHealth, intervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, intervalMs]);

  return {
    health,
    isHealthy,
    lastCheck,
    checkHealth
  };
};