import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Waves, TreePine } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    const success = login(email, senha);
    if (success) {
      navigate('/dashboard');
    } else {
      setErro('Email ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="text-white" size={48} />
            <TreePine className="text-white" size={48} />
          </div>
          <h1 className="text-white mb-2">Sistema de Gestão Comunitária</h1>
          <p className="text-white/80">Cachoeira do Castanho - Amazonas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acessar Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                fullWidth
              />

              {erro && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                  {erro}
                </div>
              )}

              <Button type="submit" fullWidth size="lg">
                Entrar
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Usuários de teste:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <strong>Admin:</strong> admin@cachoeira.com / admin123
                </div>
                <div>
                  <strong>Técnico:</strong> tecnico@cachoeira.com / tecnico123
                </div>
                <div>
                  <strong>Visualizador:</strong> visualizador@cachoeira.com / visualizador123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
