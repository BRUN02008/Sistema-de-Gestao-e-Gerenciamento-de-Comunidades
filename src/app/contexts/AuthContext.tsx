import {
  createContext,
  useContext,
  useState,
  type ReactNode
} from 'react';

export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  moradorId?: string;
  cpf?: string;
  familia?: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const API_URL = 'http://127.0.0.1:8000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('sisgest_user');

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch {
      return null;
    }
  });

  const login = async (
    email: string,
    senha: string
  ): Promise<{ success: boolean; error?: string }> => {

    try {

      const response = await fetch(
        `${API_URL}/auth/login/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Email ou senha incorretos.'
        };
      }

      const loginData = data as LoginResponse;

      localStorage.setItem(
        'sisgest_access',
        loginData.access
      );

      localStorage.setItem(
        'sisgest_refresh',
        loginData.refresh
      );

      localStorage.setItem(
        'sisgest_user',
        JSON.stringify(loginData.user)
      );

      setUser(loginData.user);

      return {
        success: true
      };

    } catch (error) {

      console.error('Erro ao realizar login:', error);

      return {
        success: false,
        error: 'Não foi possível conectar ao servidor.'
      };
    }
  };

  const logout = () => {

    localStorage.removeItem('sisgest_access');
    localStorage.removeItem('sisgest_refresh');
    localStorage.removeItem('sisgest_user');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}