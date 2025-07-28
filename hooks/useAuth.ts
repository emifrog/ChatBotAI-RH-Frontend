import { useState, useEffect, useCallback } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  antibiaId: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérification du token au chargement
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('chatbot_token');
        const storedUser = localStorage.getItem('chatbot_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données auth:', error);
        localStorage.removeItem('chatbot_token');
        localStorage.removeItem('chatbot_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem('chatbot_token', data.token);
      localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('chatbot_token');
    localStorage.removeItem('chatbot_user');
  }, []);

  // Rafraîchissement du token
  const refreshToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('chatbot_token', data.token);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erreur refresh token:', error);
      logout();
    }
  }, [token, logout]);

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    refreshToken,
    error
  };
};