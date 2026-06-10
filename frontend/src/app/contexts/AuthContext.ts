import { createContext } from 'react';

export type UserRole = 'admin' | 'tecnico' | 'visualizador';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
