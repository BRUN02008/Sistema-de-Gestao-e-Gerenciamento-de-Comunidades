import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Calendar,
  LogOut,
  Waves,
  TreePine,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-1">
            <Waves className="text-accent" size={28} />
            <TreePine className="text-secondary" size={28} />
          </div>
          <div>
            <h2 className="text-sidebar-foreground">SisGest</h2>
            <p className="text-xs text-sidebar-foreground/70">Comunidade Ribeirinha</p>
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/60 mt-2">Cachoeira do Castanho - AM</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem to="/dashboard" icon={<Home size={20} />} label="Início" />
        <NavItem to="/moradores" icon={<Users size={20} />} label="Moradores" />
        <NavItem to="/financas" icon={<Wallet size={20} />} label="Finanças" />
        <NavItem to="/documentos" icon={<FileText size={20} />} label="Documentos" />
        <NavItem to="/relatorios" icon={<BarChart3 size={20} />} label="Relatórios" />
        <NavItem to="/agenda" icon={<Calendar size={20} />} label="Agenda" />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
