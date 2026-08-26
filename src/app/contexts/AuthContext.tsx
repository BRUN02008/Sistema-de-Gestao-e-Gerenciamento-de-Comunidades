import { createContext, useContext, useState, type ReactNode } from 'react';

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

export interface UserAccount {
  email: string;
  senha: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  users: UserAccount[];
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  addUser: (account: Omit<UserAccount, 'user'> & { user: Omit<User, 'id'> }) => { success: boolean; error?: string };
  removeUser: (id: string) => { success: boolean; error?: string };
}

const AUTH_KEY = 'sisgest_users';

const defaultUsers: UserAccount[] = [
  {
    email: 'admin@cachoeira.com',
    senha: 'admin123',
    user: { id: '1', nome: 'Maria Silva', email: 'admin@cachoeira.com', role: 'admin' }
  },
  {
    email: 'tecnico@cachoeira.com',
    senha: 'tecnico123',
    user: { id: '2', nome: 'João Santos', email: 'tecnico@cachoeira.com', role: 'tecnico' }
  },
  {
    email: 'visualizador@cachoeira.com',
    senha: 'visualizador123',
    user: {
      id: '3', nome: 'Sebastiana Costa', email: 'visualizador@cachoeira.com', role: 'visualizador',
      moradorId: '6', cpf: '678.901.234-55', familia: 'Família Costa'
    }
  },
  {
    email: 'francisco@cachoeira.com',
    senha: 'morador123',
    user: {
      id: '4', nome: 'Francisco Ribeiro da Silva', email: 'francisco@cachoeira.com', role: 'visualizador',
      moradorId: '1', cpf: '123.456.789-00', familia: 'Família Silva'
    }
  }
];

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function saveUsers(users: UserAccount[]) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); } catch {}
}

let nextId = 100;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserAccount[]>(loadUsers);

  const login = (email: string, senha: string): boolean => {
    const found = users.find(u => u.email === email && u.senha === senha);
    if (found) { setUser(found.user); return true; }
    return false;
  };

  const logout = () => setUser(null);

  const addUser = (account: Omit<UserAccount, 'user'> & { user: Omit<User, 'id'> }): { success: boolean; error?: string } => {
    if (users.some(u => u.email === account.email)) {
      return { success: false, error: 'Já existe um usuário com este e-mail.' };
    }
    const newUser: User = { ...account.user, id: String(nextId++) };
    const updated = [...users, { email: account.email, senha: account.senha, user: newUser }];
    setUsers(updated);
    saveUsers(updated);
    return { success: true };
  };

  const removeUser = (id: string): { success: boolean; error?: string } => {
    if (user?.id === id) return { success: false, error: 'Você não pode remover sua própria conta.' };
    const updated = users.filter(u => u.user.id !== id);
    setUsers(updated);
    saveUsers(updated);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, isAuthenticated: !!user, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
