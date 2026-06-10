import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from './AuthContext';

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
