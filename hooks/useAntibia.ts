import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  manager: string;
  hireDate: string;
}

interface LeaveBalance {
  paidLeave: number;
  rtt: number;
  sickLeave: number;
  lastUpdate: string;
}

interface Payslip {
  id: string;
  period: string;
  netSalary: number;
  grossSalary: number;
  downloadUrl: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  availableSpots: number;
  recommended: boolean;
}

interface UseAntibiaReturn {
  userProfile: UserProfile | null;
  leaveBalance: LeaveBalance | null;
  payslips: Payslip[];
  trainings: Training[];
  loading: boolean;
  error: string | null;
  refetchUserProfile: () => Promise<void>;
  refetchLeaveBalance: () => Promise<void>;
  refetchPayslips: () => Promise<void>;
  refetchTrainings: () => Promise<void>;
  submitLeaveRequest: (leaveData: any) => Promise<any>;
  enrollTraining: (trainingId: string) => Promise<any>;
}

export const useAntibia = (token: string | null): UseAntibiaReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration axios - useMemo pour éviter la recréation
  const apiClient: AxiosInstance = useMemo(() => {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
      timeout: 10000
    });
  }, []);

  // Intercepteur pour ajouter le token et gérer les erreurs
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message;
        setError(message);
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Récupération profil utilisateur
  const refetchUserProfile = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get('/api/auth/profile');
      if (response.data.success && response.data.data) {
        setUserProfile(response.data.data.user);
      }
      setError(null);
    } catch (err) {
      console.error('Erreur récupération profil:', err);
    } finally {
      setLoading(false);
    }
  }, [token, apiClient]);

  // Récupération solde congés
  const refetchLeaveBalance = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get('/api/leaves/balance');
      if (response.data.success && response.data.data) {
        setLeaveBalance(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Erreur solde congés:', err);
    } finally {
      setLoading(false);
    }
  }, [token, apiClient]);

  // Récupération bulletins de paie (simulation)
  const refetchPayslips = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Simulation des données de bulletins de paie
      const mockPayslips = [
        {
          id: '1',
          period: '2024-11',
          netSalary: 3245,
          grossSalary: 4380,
          downloadUrl: '#'
        },
        {
          id: '2',
          period: '2024-10',
          netSalary: 3245,
          grossSalary: 4380,
          downloadUrl: '#'
        }
      ];
      setPayslips(mockPayslips);
      setError(null);
    } catch (err) {
      console.error('Erreur bulletins paie:', err);
    } finally {
      setLoading(false);
    }
  }, [token, apiClient]);

  // Récupération formations (simulation)
  const refetchTrainings = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Simulation des données de formations
      const mockTrainings = [
        {
          id: '1',
          title: 'React Advanced',
          description: 'Formation React avancée',
          duration: '2 jours',
          availableSpots: 8,
          recommended: true
        },
        {
          id: '2',
          title: 'TypeScript Fundamentals',
          description: 'Bases de TypeScript',
          duration: '1 jour',
          availableSpots: 12,
          recommended: false
        }
      ];
      setTrainings(mockTrainings);
      setError(null);
    } catch (err) {
      console.error('Erreur formations:', err);
    } finally {
      setLoading(false);
    }
  }, [token, apiClient]);

  // Soumission demande de congés
  const submitLeaveRequest = useCallback(async (leaveData: any) => {
    if (!token) throw new Error('Non authentifié');
    
    setLoading(true);
    try {
      const response = await apiClient.post('/api/leaves/request', leaveData);
      setError(null);
      // Rafraîchir le solde après la demande
      await refetchLeaveBalance();
      return response.data;
    } catch (err) {
      console.error('Erreur demande congés:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, apiClient, refetchLeaveBalance]);

  // Inscription formation (simulation)
  const enrollTraining = useCallback(async (trainingId: string) => {
    if (!token) throw new Error('Non authentifié');
    
    setLoading(true);
    try {
      // Simulation de l'inscription à une formation
      console.log(`Inscription à la formation ${trainingId}`);
      setError(null);
      // Rafraîchir la liste des formations
      await refetchTrainings();
      return { success: true, message: 'Inscription réussie' };
    } catch (err) {
      console.error('Erreur inscription formation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, apiClient, refetchTrainings]);

  // Chargement initial des données
  useEffect(() => {
    if (token) {
      refetchUserProfile();
      refetchLeaveBalance();
      refetchPayslips();
      refetchTrainings();
    }
  }, [token, refetchUserProfile, refetchLeaveBalance, refetchPayslips, refetchTrainings]);

  return {
    userProfile,
    leaveBalance,
    payslips,
    trainings,
    loading,
    error,
    refetchUserProfile,
    refetchLeaveBalance,
    refetchPayslips,
    refetchTrainings,
    submitLeaveRequest,
    enrollTraining
  };
};