import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth, type UserRole } from './app/contexts/AuthContext';
import { DataProvider } from './app/contexts/DataContext';
import { Layout } from './app/components/Layout';
import { Login } from './app/pages/Login';
import { Dashboard } from './app/pages/Dashboard';
import { Moradores } from './app/pages/Moradores';
import { MoradorForm } from './app/pages/MoradorForm';
import { MoradorDetalhes } from './app/pages/MoradorDetalhes';
import { Financas } from './app/pages/Financas';
import { Mensalidades } from './app/pages/Mensalidades';
import { Investimentos } from './app/pages/Investimentos';
import { Documentos } from './app/pages/Documentos';
import { Relatorios } from './app/pages/Relatorios';
import { Agenda } from './app/pages/Agenda';
import { MinhaContaFinanceira } from './app/pages/MinhaContaFinanceira';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

function ProtectedRoute({ children, allowedRoles, redirectTo = '/dashboard' }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const isMorador = user?.role === 'visualizador';

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas exclusivas de admin e técnico */}
      <Route
        path="/moradores"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <Moradores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/novo"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <MoradorForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <MoradorDetalhes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/:id/editar"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <MoradorForm />
          </ProtectedRoute>
        }
      />

      {/* Finanças: admin/técnico vê painel completo; morador é redirecionado */}
      <Route
        path="/financas"
        element={
          isMorador
            ? <Navigate to="/financas/minha-conta" replace />
            : (
              <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
                <Financas />
              </ProtectedRoute>
            )
        }
      />
      <Route
        path="/financas/mensalidades"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <Mensalidades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financas/investimentos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <Investimentos />
          </ProtectedRoute>
        }
      />

      {/* Conta pessoal do morador */}
      <Route
        path="/financas/minha-conta"
        element={
          <ProtectedRoute allowedRoles={['visualizador']}>
            <MinhaContaFinanceira />
          </ProtectedRoute>
        }
      />

      {/* Documentos: todos acessam, mas com filtro por role */}
      <Route
        path="/documentos"
        element={
          <ProtectedRoute>
            <Documentos />
          </ProtectedRoute>
        }
      />

      {/* Relatórios: apenas admin e técnico */}
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute allowedRoles={['admin', 'tecnico']}>
            <Relatorios />
          </ProtectedRoute>
        }
      />

      {/* Agenda: todos acessam, mas com permissões diferentes */}
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
