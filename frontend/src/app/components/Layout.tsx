import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/useAuth';
import { User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      tecnico: 'Técnico',
      visualizador: 'Visualizador'
    };
    return roles[role] || role;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bem-vindo,</p>
              <h2 className="text-foreground">{user?.nome}</h2>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
              <UserIcon className="text-primary" size={20} />
              <div>
                <p className="text-sm text-foreground">{user?.nome}</p>
                <p className="text-xs text-muted-foreground">{user && getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
