import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchProfile(token);
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/auth/me`);
      setState({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('token');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Login successful');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.patch(`${API_URL}/api/v1/auth/me`, data);
      setState((prev) => ({
        ...prev,
        user: response.data.user,
      }));
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};