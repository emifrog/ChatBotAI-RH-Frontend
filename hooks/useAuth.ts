import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { apiService, User, LoginResponse } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialisation au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Vérifier que le token est toujours valide
          try {
            const profile = await apiService.getProfile();
            setUser(profile);
          } catch (error) {
            // Token invalide, nettoyer
            await logout();
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: LoginResponse = await apiService.login(email, password);
      
      setToken(response.accessToken);
      setUser(response.user);
      
      console.log('✅ Connexion réussie:', response.user.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(message);
      console.error('❌ Erreur connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.register(userData);
      console.log('✅ Inscription réussie');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setError(message);
      console.error('❌ Erreur inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await apiService.logout();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await apiService.refreshToken();
      setToken(newToken);
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};