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

export interface UserAccount {
  email: string;
  user: User;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface AuthContextType {
  user: User | null;

  users: UserAccount[];

  login: (
    email: string,
    senha: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => void;

  addUser: (data: {
    email: string;
    senha: string;
    user: Omit<User, 'id'>;
  }) => {
    success: boolean;
    error?: string;
  };

  removeUser: (id: string) => {
    success: boolean;
    error?: string;
  };

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

  const [users, setUsers] = useState<UserAccount[]>(() => {
  try {
    const savedUsers = localStorage.getItem('sisgest_users');

    if (savedUsers) {
      return JSON.parse(savedUsers);
    }

    return [];
  } catch {
    return [];
  }
});

const addUser = (data: {
  email: string;
  senha: string;
  user: Omit<User, 'id'>;
}) => {
  const emailExiste = users.some(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );

  if (emailExiste) {
    return {
      success: false,
      error: 'Este e-mail já está cadastrado.'
    };
  }

  const novoUsuario: User = {
    ...data.user,
    id: crypto.randomUUID(),
    email: data.email,
  };

  const novoAccount: UserAccount = {
    email: data.email,
    user: novoUsuario,
  };

  setUsers((prev) => {
    const next = [...prev, novoAccount];

    localStorage.setItem(
      'sisgest_users',
      JSON.stringify(next)
    );

    return next;
  });

  return {
    success: true
  };
};


const removeUser = (id: string) => {
  if (id === user?.id) {
    return {
      success: false,
      error: 'Você não pode remover o próprio usuário.'
    };
  }

  setUsers((prev) => {
    const next = prev.filter(
      (account) => account.user.id !== id
    );

    localStorage.setItem(
      'sisgest_users',
      JSON.stringify(next)
    );

    return next;
  });

  return {
    success: true
  };
};

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
      console.log('RESPOSTA DO LOGIN:', data);
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

      console.log('ACCESS RECEBIDO:', loginData.access);
console.log(
  'ACCESS SALVO:',
  localStorage.getItem('sisgest_access')
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
  users,
  login,
  logout,
  addUser,
  removeUser,
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