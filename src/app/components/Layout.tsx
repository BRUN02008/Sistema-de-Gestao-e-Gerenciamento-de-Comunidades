import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { GerenciarUsuarios } from './GerenciarUsuarios';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, ChevronDown, Users, LogOut, Shield, Wrench, Eye } from 'lucide-react';

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

  const handleLogout = () => {
    logout();
    navigate('/');
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

            {/* Perfil dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="text-primary" size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-foreground">{user?.nome}</p>
                  {roleCfg && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${roleCfg.color}`}>
                      {roleCfg.icon}
                      {roleCfg.label}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm text-foreground">{user?.nome}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {user?.familia && (
                      <p className="text-xs text-muted-foreground">{user.familia}</p>
                    )}
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

        <div className="p-8">
          {children}
        </div>
      </main>

      {modalOpen && <GerenciarUsuarios onClose={() => setModalOpen(false)} />}
    </div>
  );
}
