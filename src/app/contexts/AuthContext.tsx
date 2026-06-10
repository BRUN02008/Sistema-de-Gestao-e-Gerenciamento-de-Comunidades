import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: { email: string; senha: string; user: User }[] = [
  {
    email: 'admin@cachoeira.com',
    senha: 'admin123',
    user: {
      id: '1',
      nome: 'Maria Silva',
      email: 'admin@cachoeira.com',
      role: 'admin'
    }
  },
  {
    email: 'tecnico@cachoeira.com',
    senha: 'tecnico123',
    user: {
      id: '2',
      nome: 'João Santos',
      email: 'tecnico@cachoeira.com',
      role: 'tecnico'
    }
  },
  {
    email: 'visualizador@cachoeira.com',
    senha: 'visualizador123',
    user: {
      id: '3',
      nome: 'Ana Costa',
      email: 'visualizador@cachoeira.com',
      role: 'visualizador'
    }
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, senha: string): boolean => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.senha === senha
    );

    if (foundUser) {
      setUser(foundUser.user);
      return true;
    }
    return false;
  };

  const logout = () => {
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
