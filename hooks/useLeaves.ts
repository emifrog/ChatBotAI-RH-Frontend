import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../lib/api';

interface LeaveBalance {
  id: string;
  paidLeave: number;
  rtt: number;
  sickLeave: number;
  year: number;
  lastUpdate: string;
}

interface LeaveRequest {
  id: string;
  type: 'PAID' | 'RTT' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'SPECIAL' | 'UNPAID';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

interface LeaveStats {
  balance: LeaveBalance;
  requests: LeaveRequest[];
  stats: {
    totalRequests: number;
    usedDays: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
}

interface UseLeavesReturn {
  balance: LeaveBalance | null;
  requests: LeaveRequest[];
  stats: LeaveStats | null;
  loading: boolean;
  error: string | null;
  createRequest: (requestData: {
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) => Promise<LeaveRequest>;
  refreshBalance: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useLeaves = (): UseLeavesReturn => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le solde de congés
  const refreshBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getLeaveBalance();
      setBalance(response.balance);
      
      console.log('✅ Solde congés récupéré:', response.balance);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération du solde';
      setError(message);
      console.error('❌ Erreur solde congés:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les demandes de congés
  const refreshRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getLeaveRequests();
      setRequests(response.requests || []);
      
      console.log('✅ Demandes congés récupérées:', response.requests?.length || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des demandes';
      setError(message);
      console.error('❌ Erreur demandes congés:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les statistiques
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getLeaveStats();
      setStats(response.stats);
      
      console.log('✅ Stats congés récupérées:', response.stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(message);
      console.error('❌ Erreur stats congés:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une demande de congés
  const createRequest = useCallback(async (requestData: {
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<LeaveRequest> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.createLeaveRequest(requestData);
      
      // Rafraîchir les données après création
      await Promise.all([refreshBalance(), refreshRequests()]);
      
      console.log('✅ Demande congés créée:', response.request);
      return response.request;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la demande';
      setError(message);
      console.error('❌ Erreur création demande:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshBalance, refreshRequests]);

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        refreshBalance(),
        refreshRequests()
      ]);
    };

    loadInitialData();
  }, [refreshBalance, refreshRequests]);

  return {
    balance,
    requests,
    stats,
    loading,
    error,
    createRequest,
    refreshBalance,
    refreshRequests,
    refreshStats
  };
};