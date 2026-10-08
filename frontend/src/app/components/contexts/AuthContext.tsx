import {
  createContext,
  useContext,
  useEffect,
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
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;

  removeUser: (id: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  isAuthenticated: boolean;
}

const API_URL =
  'https://gestao-comunidades-api.onrender.com/api';

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser =
        localStorage.getItem('sisgest_user');

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] =
    useState<UserAccount[]>([]);


  /*
   * ==========================================
   * LISTAR USUÁRIOS DO BACKEND
   * ==========================================
   */

  const loadUsers = async () => {

    try {

      const token =
        localStorage.getItem('sisgest_access');

      if (!token) {
        setUsers([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/usuarios/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      console.log(
        'USUÁRIOS RECEBIDOS DA API:',
        data
      );

      if (!response.ok) {

        console.error(
          'Erro ao listar usuários:',
          data
        );

        return;
      }

      /*
       * Django REST Framework pode devolver:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * ou:
       *
       * {
       *   count: ...,
       *   results: [...]
       * }
       */

      const lista = Array.isArray(data)
        ? data
        : data.results || [];

      const usuariosFormatados: UserAccount[] =
        lista.map((item: any) => ({
          email: item.email || '',
          user: {
            id: String(item.id),
            nome: item.nome || '',
            email: item.email || '',
            role: item.role,
            moradorId: item.morador
              ? String(item.morador)
              : undefined,
            cpf: item.cpf || '',
            familia: item.familia || '',
          }
        }));

      setUsers(usuariosFormatados);

    } catch (error) {

      console.error(
        'Erro ao carregar usuários:',
        error
      );

    }
  };


  /*
   * Carrega usuários quando o usuário
   * estiver autenticado.
   */

  useEffect(() => {

    if (user) {
      loadUsers();
    } else {
      setUsers([]);
    }

  }, [user]);


  /*
   * ==========================================
   * CRIAR USUÁRIO
   * ==========================================
   */

  const addUser = async (data: {
    email: string;
    senha: string;
    user: Omit<User, 'id'>;
  }): Promise<{
    success: boolean;
    error?: string;
  }> => {

    try {

      const token =
        localStorage.getItem('sisgest_access');

      if (!token) {

        return {
          success: false,
          error: 'Usuário não autenticado.'
        };

      }

      const response = await fetch(
        `${API_URL}/usuarios/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: data.user.nome,
            email: data.email,
            senha: data.senha,
            role: data.user.role,
            morador: data.user.moradorId
              ? Number(data.user.moradorId)
              : null,
            cpf: data.user.cpf || '',
            familia: data.user.familia || '',
          }),
        }
      );

      const responseData =
        await response.json();

      console.log(
        'RESPOSTA CRIAR USUÁRIO:',
        responseData
      );

      if (!response.ok) {

        let mensagem =
          'Não foi possível criar o usuário.';

        if (responseData.email) {
          mensagem = responseData.email[0];

        } else if (responseData.senha) {
          mensagem = responseData.senha[0];

        } else if (responseData.detail) {
          mensagem = responseData.detail;
        }

        return {
          success: false,
          error: mensagem
        };
      }

      /*
       * Depois de criar, buscamos novamente
       * a lista diretamente do Django.
       */

      await loadUsers();

      return {
        success: true
      };

    } catch (error) {

      console.error(
        'Erro ao criar usuário:',
        error
      );

      return {
        success: false,
        error:
          'Não foi possível conectar ao servidor.'
      };

    }
  };


  /*
   * ==========================================
   * EXCLUIR USUÁRIO
   * ==========================================
   */

  const removeUser = async (
    id: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {

    if (id === user?.id) {

      return {
        success: false,
        error:
          'Você não pode remover o próprio usuário.'
      };

    }

    try {

      const token =
        localStorage.getItem('sisgest_access');

      if (!token) {

        return {
          success: false,
          error: 'Usuário não autenticado.'
        };

      }

      const response = await fetch(
        `${API_URL}/usuarios/${id}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {

        let mensagem =
          'Não foi possível excluir o usuário.';

        try {

          const data =
            await response.json();

          if (data.detail) {
            mensagem = data.detail;
          }

        } catch {
          // resposta sem JSON
        }

        return {
          success: false,
          error: mensagem
        };
      }

      /*
       * Atualiza a lista depois da exclusão.
       */

      setUsers((prev) =>
        prev.filter(
          (account) =>
            account.user.id !== id
        )
      );

      return {
        success: true
      };

    } catch (error) {

      console.error(
        'Erro ao excluir usuário:',
        error
      );

      return {
        success: false,
        error:
          'Não foi possível conectar ao servidor.'
      };

    }
  };


  /*
   * ==========================================
   * LOGIN
   * ==========================================
   */

  const login = async (
    email: string,
    senha: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {

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

      const data =
        await response.json();

      console.log(
        'RESPOSTA DO LOGIN:',
        data
      );

      if (!response.ok) {

        return {
          success: false,
          error:
            data.error ||
            'Email ou senha incorretos.'
        };

      }

      const loginData =
        data as LoginResponse;

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

      /*
       * Busca os usuários do backend
       * depois do login.
       */

      setTimeout(() => {
        loadUsers();
      }, 0);

      return {
        success: true
      };

    } catch (error) {

      console.error(
        'Erro ao realizar login:',
        error
      );

      return {
        success: false,
        error:
          'Não foi possível conectar ao servidor.'
      };

    }
  };


  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const logout = () => {

    localStorage.removeItem(
      'sisgest_access'
    );

    localStorage.removeItem(
      'sisgest_refresh'
    );

    localStorage.removeItem(
      'sisgest_user'
    );

    setUser(null);
    setUsers([]);
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

  const ctx =
    useContext(AuthContext);

  if (!ctx) {

    throw new Error(
      'useAuth must be used within AuthProvider'
    );

  }

  return ctx;
}