import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../components/contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Waves, TreePine, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    const result = await login(email, senha);

if (result.success) {
  navigate('/dashboard');
} else {
  setErro(result.error || 'Email ou senha incorretos');
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

              <div>
                <label className="block mb-2 text-foreground">Senha</label>
                <div className="relative">
                  <Input type={mostrarSenha ? 'text' : 'password'} placeholder="Digite sua senha" value={senha}
                    onChange={(e) => setSenha(e.target.value)} fullWidth className="pr-12" />
                  <button type="button" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setMostrarSenha((visivel) => !visivel)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

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
              <p className="text-sm text-muted-foreground mb-3">Acesso de demonstração:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setEmail('admin@cachoeira.com'); setSenha('brun0m410'); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Administrador</p>
                      <p className="text-xs text-muted-foreground">Acesso completo ao sistema</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Admin</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('tecnico@cachoeira.com'); setSenha('admin123'); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Técnico</p>
                      <p className="text-xs text-muted-foreground">Gestão de moradores e dados</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">Técnico</span>
                  </div>
                </button> 
                <button
                  type="button"
                  onClick={() => { setEmail('brunoguilherme@cachoeira.com'); setSenha('bruno123'); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Morador</p>
                      <p className="text-xs text-muted-foreground">Gestão de moradores e dados</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">Morador</span>
                  </div>
                </button>  
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
