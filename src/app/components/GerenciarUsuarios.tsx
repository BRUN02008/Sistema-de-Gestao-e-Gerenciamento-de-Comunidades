import { useState } from 'react';
import { X, Plus, Trash2, User, Shield, Wrench, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

interface GerenciarUsuariosProps {
  onClose: () => void;
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  admin: {
    label: 'Administrador',
    icon: <Shield size={14} />,
    color: 'bg-primary/20 text-primary',
    desc: 'Acesso total ao sistema'
  },
  tecnico: {
    label: 'Técnico',
    icon: <Wrench size={14} />,
    color: 'bg-secondary/20 text-secondary',
    desc: 'Gestão de moradores e dados'
  },
  visualizador: {
    label: 'Morador',
    icon: <Eye size={14} />,
    color: 'bg-accent/20 text-accent',
    desc: 'Portal pessoal do morador'
  }
};

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  role: 'tecnico' as UserRole,
  moradorId: '',
  cpf: '',
  familia: ''
};

export function GerenciarUsuarios({ onClose }: GerenciarUsuariosProps) {
  const { users, user: currentUser, addUser, removeUser } = useAuth();
  const [tab, setTab] = useState<'lista' | 'novo'>('lista');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { moradores, familias } = useData();
  const moradorSelecionado = moradores.find(m => m.id === form.moradorId);
  const familiaDoMorador = moradorSelecionado
    ? familias.find(f => f.responsavel === moradorSelecionado.nome)
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.senha) e.senha = 'Senha é obrigatória';
    else if (form.senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = 'Senhas não conferem';
    if (form.role === 'visualizador' && !form.moradorId) e.moradorId = 'Selecione o morador';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = addUser({
      email: form.email,
      senha: form.senha,
      user: {
        nome: form.nome,
        email: form.email,
        role: form.role,
        ...(form.role === 'visualizador' && {
          moradorId: form.moradorId,
          cpf: moradorSelecionado?.cpf,
          familia: familiaDoMorador?.nome || form.familia
        })
      }
    });

    if (result.success) {
      toast.success(`Usuário "${form.nome}" cadastrado com sucesso!`);
      setForm(emptyForm);
      setErrors({});
      setTab('lista');
    } else {
      setErrors({ email: result.error || 'Erro ao cadastrar' });
    }
  };

  const handleRemove = (id: string) => {
    const result = removeUser(id);
    if (result.success) {
      toast.success('Usuário removido');
      setConfirmDelete(null);
    } else {
      toast.error(result.error);
      setConfirmDelete(null);
    }
  };

  const field = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-foreground">Gerenciar Usuários</h2>
            <p className="text-sm text-muted-foreground">{users.length} usuário(s) cadastrado(s)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('lista')}
            className={`flex-1 px-6 py-3 text-sm transition-colors ${
              tab === 'lista'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lista de Usuários
          </button>
          <button
            onClick={() => setTab('novo')}
            className={`flex-1 px-6 py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
              tab === 'novo'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus size={16} />
            Novo Usuário
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Lista */}
          {tab === 'lista' && (
            <div className="p-6 space-y-3">
              {users.map((account) => {
                const cfg = ROLE_CONFIG[account.user.role];
                const isMe = account.user.id === currentUser?.id;
                return (
                  <div
                    key={account.user.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="text-muted-foreground" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-foreground">{account.user.nome}</p>
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">você</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                        {account.user.familia && (
                          <p className="text-xs text-muted-foreground">{account.user.familia}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {!isMe && (
                        confirmDelete === account.user.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confirmar?</span>
                            <button
                              onClick={() => handleRemove(account.user.id)}
                              className="text-xs px-2 py-1 bg-destructive text-white rounded-md hover:bg-destructive/80"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs px-2 py-1 bg-muted text-foreground rounded-md hover:bg-muted/80"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(account.user.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                          >
                            <Trash2 size={16} className="text-muted-foreground group-hover:text-destructive" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Novo usuário */}
          {tab === 'novo' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Tipo de acesso */}
              <div>
                <label className="block text-sm text-foreground mb-2">Tipo de acesso</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
                    const cfg = ROLE_CONFIG[role];
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => field('role', role)}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          form.role === role
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit mb-2 ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </div>
                        <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm text-foreground mb-1">Nome completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => field('nome', e.target.value)}
                  placeholder="Nome do usuário"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm text-foreground mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => field('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Senha */}
                <div>
                  <label className="block text-sm text-foreground mb-1">Senha</label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={e => field('senha', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha}</p>}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-sm text-foreground mb-1">Confirmar senha</label>
                  <input
                    type="password"
                    value={form.confirmarSenha}
                    onChange={e => field('confirmarSenha', e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.confirmarSenha && <p className="text-xs text-destructive mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>

              {/* Campos específicos de morador */}
              {form.role === 'visualizador' && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-accent" />
                    <p className="text-sm text-foreground">Vincular ao morador cadastrado</p>
                  </div>

                  <div>
                    <label className="block text-sm text-foreground mb-1">Morador</label>
                    <select
                      value={form.moradorId}
                      onChange={e => field('moradorId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Selecione um morador...</option>
                      {moradores.map(m => (
                        <option key={m.id} value={m.id}>{m.nome} — {m.cpf}</option>
                      ))}
                    </select>
                    {errors.moradorId && <p className="text-xs text-destructive mt-1">{errors.moradorId}</p>}
                  </div>

                  {moradorSelecionado && (
                    <div className="flex items-start gap-2 p-3 bg-background rounded-lg border border-border">
                      <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="text-foreground">CPF:</span> {moradorSelecionado.cpf}</p>
                        <p><span className="text-foreground">Endereço:</span> {moradorSelecionado.endereco}</p>
                        {familiaDoMorador && (
                          <p><span className="text-foreground">Família:</span> {familiaDoMorador.nome} ({familiaDoMorador.totalMembros} membros)</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertCircle size={14} className="text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  O usuário poderá acessar o sistema imediatamente após o cadastro com as credenciais informadas.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setTab('lista'); setForm(emptyForm); setErrors({}); }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
