import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home, Users, FileText, BarChart3, Calendar,
  LogOut, Waves, TreePine, Wallet, User as UserIcon, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
  open?: boolean;
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/dashboard' || location.pathname === '/dashboard');

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador', tecnico: 'Técnico', visualizador: 'Morador'
};
const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-primary/20 text-primary',
  tecnico: 'bg-secondary/20 text-secondary',
  visualizador: 'bg-accent/20 text-accent'
};

export function Sidebar({ onLogout, open = true, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isMorador = user?.role === 'visualizador';

  const handleNavClick = () => { if (onClose) onClose(); };

  return (
    <>
      {/* Mobile overlay */}
      {onClose && open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <Waves className="text-accent" size={24} />
                <TreePine className="text-secondary" size={24} />
              </div>
              <div>
                <h2 className="text-sidebar-foreground text-base">SisGest</h2>
                <p className="text-xs text-sidebar-foreground/70">Comunidade Ribeirinha</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground md:hidden">
                <X size={18} />
              </button>
            )}
          </div>
          <p className="text-xs text-sidebar-foreground/60">Cachoeira do Castanho · AM</p>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-sidebar-border/50 bg-sidebar-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <UserIcon className="text-primary" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sidebar-foreground truncate">{user.nome}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_BADGE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
            {isMorador && user.familia && (
              <p className="text-xs text-sidebar-foreground/60 mt-1 pl-10">{user.familia}</p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={<Home size={20} />} label="Início" onClick={handleNavClick} />
          {!isMorador && <NavItem to="/moradores" icon={<Users size={20} />} label="Moradores" onClick={handleNavClick} />}
          <NavItem
            to={isMorador ? '/financas/minha-conta' : '/financas'}
            icon={<Wallet size={20} />}
            label={isMorador ? 'Minhas Finanças' : 'Finanças'}
            onClick={handleNavClick}
          />
          <NavItem
            to="/documentos"
            icon={<FileText size={20} />}
            label={isMorador ? 'Meus Documentos' : 'Documentos'}
            onClick={handleNavClick}
          />
          {!isMorador && <NavItem to="/relatorios" icon={<BarChart3 size={20} />} label="Relatórios" onClick={handleNavClick} />}
          <NavItem to="/agenda" icon={<Calendar size={20} />} label="Agenda" onClick={handleNavClick} />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
