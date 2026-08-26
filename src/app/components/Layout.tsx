import { type ReactNode, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { GerenciarUsuarios } from './GerenciarUsuarios';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, ChevronDown, Users, LogOut, Shield, Wrench, Eye, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: 'Administrador', icon: <Shield size={12} />, color: 'bg-primary/20 text-primary' },
  tecnico: { label: 'Técnico', icon: <Wrench size={12} />, color: 'bg-secondary/20 text-secondary' },
  visualizador: { label: 'Morador', icon: <Eye size={12} />, color: 'bg-accent/20 text-accent' }
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canManageUsers = user?.role === 'admin' || user?.role === 'tecnico';
  const roleCfg = user ? ROLE_CONFIG[user.role] : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 sticky top-0 z-20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={22} className="text-foreground" />
            </button>

            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Bem-vindo,</p>
              <h2 className="text-foreground text-base leading-tight">{user?.nome}</h2>
            </div>

            {/* Mobile title (center) */}
            <div className="md:hidden flex-1 text-center">
              <p className="text-sm text-foreground truncate">{user?.nome}</p>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-2 md:px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <UserIcon className="text-primary" size={16} />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm text-foreground leading-tight">{user?.nome}</p>
                  {roleCfg && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${roleCfg.color}`}>
                      {roleCfg.icon}
                      {roleCfg.label}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm text-foreground">{user?.nome}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {user?.familia && <p className="text-xs text-muted-foreground">{user.familia}</p>}
                  </div>
                  <div className="p-1">
                    {canManageUsers && (
                      <button
                        onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Users size={16} className="text-primary" />
                        Gerenciar Usuários
                      </button>
                    )}
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Sair do sistema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {modalOpen && <GerenciarUsuarios onClose={() => setModalOpen(false)} />}
    </div>
  );
}
