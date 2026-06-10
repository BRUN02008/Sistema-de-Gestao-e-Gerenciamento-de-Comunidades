import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './app/contexts/AuthContext.tsx';
import { useAuth } from './app/contexts/useAuth';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

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
      <Route
        path="/moradores"
        element={
          <ProtectedRoute>
            <Moradores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/novo"
        element={
          <ProtectedRoute>
            <MoradorForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/:id"
        element={
          <ProtectedRoute>
            <MoradorDetalhes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moradores/:id/editar"
        element={
          <ProtectedRoute>
            <MoradorForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financas"
        element={
          <ProtectedRoute>
            <Financas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financas/mensalidades"
        element={
          <ProtectedRoute>
            <Mensalidades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financas/investimentos"
        element={
          <ProtectedRoute>
            <Investimentos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documentos"
        element={
          <ProtectedRoute>
            <Documentos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        }
      />
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
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}