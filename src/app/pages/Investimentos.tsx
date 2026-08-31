import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { type Investimento, type Despesa } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Plus, TrendingDown, PiggyBank, Wrench, Zap, Droplet, Package, X, Pencil, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const INV_CAT_LABELS: Record<string, string> = {
  infraestrutura: 'Infraestrutura', educacao: 'Educação', saude: 'Saúde',
  meio_ambiente: 'Meio Ambiente', outros: 'Outros'
};
const DESP_CAT_LABELS: Record<string, string> = {
  manutencao: 'Manutenção', energia: 'Energia', agua: 'Água',
  material: 'Material', evento: 'Evento', outros: 'Outros'
};
const STATUS_LABELS: Record<string, string> = {
  concluido: 'Concluído', em_andamento: 'Em Andamento', planejado: 'Planejado', cancelado: 'Cancelado'
};
const STATUS_COLORS: Record<string, string> = {
  concluido: 'bg-primary/20 text-primary', em_andamento: 'bg-accent/20 text-accent',
  planejado: 'bg-secondary/20 text-secondary', cancelado: 'bg-destructive/20 text-destructive'
};

import type { ReactElement } from 'react';

const invIcon = (cat: string): ReactElement => {
  const map: Record<string, ReactElement> = {
    infraestrutura: (
      <Wrench className="text-primary" size={24} />
    ),
    educacao: (
      <Package className="text-secondary" size={24} />
    ),
    saude: (
      <Package className="text-accent" size={24} />
    ),
    meio_ambiente: (
      <Package className="text-chart-5" size={24} />
    ),
    outros: (
      <Package
        className="text-muted-foreground"
        size={24}
      />
    ),
  };

  return map[cat] || map.outros;
};

const despIcon = (cat: string): ReactElement => {
  const map: Record<string, ReactElement> = {
    manutencao: <Wrench className="text-primary" size={24} />,
    energia: <Zap className="text-accent" size={24} />,
    agua: <Droplet className="text-chart-2" size={24} />,
    material: <Package className="text-secondary" size={24} />,
    evento: <Package className="text-chart-4" size={24} />,
    outros: <Package className="text-muted-foreground" size={24} />
  };
  return map[cat] || map.outros;
};

const emptyInv = { titulo: '', descricao: '', categoria: 'infraestrutura' as Investimento['categoria'],
  valor: '', data: '', status: 'planejado' as Investimento['status'], responsavel: '', observacoes: '' };

const emptyDesp = { descricao: '', categoria: 'manutencao' as Despesa['categoria'],
  valor: '', data: '', responsavel: '', comprovante: '' };

export function Investimentos() {
  const { investimentos, despesas, addInvestimento, addDespesa, updateDespesa, deleteDespesa } = useData();
  const { user } = useAuth();

  const [aba, setAba] = useState<'investimentos' | 'despesas'>('investimentos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [invForm, setInvForm] = useState(emptyInv);
  const [despForm, setDespForm] = useState(emptyDesp);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Edit/delete despesas
  const [editDesp, setEditDesp] = useState<Despesa | null>(null);
  const [confirmDeleteDesp, setConfirmDeleteDesp] = useState<string | null>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'tecnico';

  const totalInvestimentos = investimentos.filter(i => i.status !== 'cancelado').reduce((a, i) => a + i.valor, 0);
  const totalDespesas = despesas.reduce((a, d) => a + d.valor, 0);

  const invFiltrados = filtroCategoria === 'todos' ? investimentos : investimentos.filter(i => i.categoria === filtroCategoria);
  const despFiltradas = filtroCategoria === 'todos' ? despesas : despesas.filter(d => d.categoria === filtroCategoria);

  const despesasPorCategoria = Object.entries(DESP_CAT_LABELS).map(([key, label]) => ({
    categoria: label,
    valor: despesas.filter(d => d.categoria === key).reduce((a, d) => a + d.valor, 0)
  })).filter(x => x.valor > 0);

  const validateInv = () => {
    const e: Record<string, string> = {};
    if (!invForm.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!invForm.valor || Number(invForm.valor) <= 0) e.valor = 'Valor deve ser maior que zero';
    if (!invForm.data) e.data = 'Data é obrigatória';
    if (!invForm.responsavel.trim()) e.responsavel = 'Responsável é obrigatório';
    return e;
  };

  const validateDesp = () => {
    const e: Record<string, string> = {};
    if (!despForm.descricao.trim()) e.descricao = 'Descrição é obrigatória';
    if (!despForm.valor || Number(despForm.valor) <= 0) e.valor = 'Valor deve ser maior que zero';
    if (!despForm.data) e.data = 'Data é obrigatória';
    if (!despForm.responsavel.trim()) e.responsavel = 'Responsável é obrigatório';
    return e;
  };

  const handleSubmitInv = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateInv();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    addInvestimento({ ...invForm, valor: Number(invForm.valor), observacoes: invForm.observacoes || undefined });
    toast.success(`Investimento "${invForm.titulo}" registrado!`);
    setInvForm(emptyInv);
    setErrors({});
    setModalOpen(false);
  };

  const handleSubmitDesp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateDesp();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    addDespesa({ ...despForm, valor: Number(despForm.valor), comprovante: despForm.comprovante || undefined });
    toast.success('Despesa registrada!');
    setDespForm(emptyDesp);
    setErrors({});
    setModalOpen(false);
  };

  const handleSaveEditDesp = () => {
    if (!editDesp) return;
    updateDespesa(editDesp);
    toast.success('Despesa atualizada!');
    setEditDesp(null);
  };

  const handleDeleteDesp = (id: string) => {
    deleteDespesa(id);
    toast.success('Despesa removida');
    setConfirmDeleteDesp(null);
  };

  const fieldInv = (key: keyof typeof invForm, value: string) => {
    setInvForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const fieldDesp = (key: keyof typeof despForm, value: string) => {
    setDespForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const openModal = () => { setErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setErrors({}); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/financas">
            <button className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-foreground text-xl md:text-2xl">Investimentos & Despesas</h1>
            <p className="text-muted-foreground text-xs">Gestão financeira comunitária</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={openModal} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            <span className="hidden sm:inline">{aba === 'investimentos' ? 'Novo Investimento' : 'Nova Despesa'}</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Investido</p>
                <h2 className="text-foreground">{fmt(totalInvestimentos)}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg"><PiggyBank className="text-primary" size={24} /></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{investimentos.filter(i => i.status !== 'cancelado').length} projetos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Despesas</p>
                <p className="text-xl text-foreground">{fmt(totalDespesas)}</p>
              </div>
              <div className="bg-destructive/10 p-2 rounded-xl"><TrendingDown className="text-destructive" size={18} /></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{despesas.length} registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex bg-muted rounded-xl p-1">
          {(['investimentos', 'despesas'] as const).map(tab => (
            <button key={tab} onClick={() => { setAba(tab); setFiltroCategoria('todos'); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${aba === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'investimentos' ? 'Investimentos' : 'Despesas'}
            </button>
          ))}
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none sm:w-48">
          <option value="todos">Todas as Categorias</option>
          {aba === 'investimentos'
            ? Object.entries(INV_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)
            : Object.entries(DESP_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {aba === 'investimentos' && (
        <>
          <div className="space-y-3">
            {invFiltrados.map(inv => (
              <Card key={inv.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted/50 p-2.5 rounded-xl shrink-0">{invIcon(inv.categoria)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm text-foreground truncate">{inv.titulo}</p>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-sm text-foreground">{fmt(inv.valor)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}>{STATUS_LABELS[inv.status]}</span>
                        </div>
                      </div>
                      {inv.descricao && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{inv.descricao}</p>}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{INV_CAT_LABELS[inv.categoria]}</span>
                        <span>{new Date(inv.data).toLocaleDateString('pt-BR')}</span>
                        <span>{inv.responsavel}</span>
                      </div>
                      {inv.observacoes && (
                        <div className="mt-2 p-2.5 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">{inv.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {invFiltrados.length === 0 && (
            <Card><CardContent className="p-12 text-center">
              <PiggyBank className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Nenhum investimento encontrado</p>
            </CardContent></Card>
          )}
        </>
      )}

      {aba === 'despesas' && (
        <>
          {despesasPorCategoria.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={despesasPorCategoria} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="valor" fill="#c73e1d" radius={[6, 6, 0, 0]} name="Valor (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {despFiltradas.map(desp => (
              <Card key={desp.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-destructive/10 p-2.5 rounded-xl shrink-0">{despIcon(desp.categoria)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{desp.descricao}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{DESP_CAT_LABELS[desp.categoria]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <p className="text-sm text-destructive">{fmt(desp.valor)}</p>
                          {canEdit && (
                            <>
                              <button onClick={() => setEditDesp({ ...desp })} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                                <Pencil size={13} className="text-primary" />
                              </button>
                              {confirmDeleteDesp === desp.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteDesp(desp.id)} className="text-xs px-2 py-1 bg-destructive text-white rounded-lg">Sim</button>
                                  <button onClick={() => setConfirmDeleteDesp(null)} className="text-xs px-2 py-1 bg-muted rounded-lg">Não</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteDesp(desp.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
                                  <Trash2 size={13} className="text-muted-foreground" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                        <span>{new Date(desp.data).toLocaleDateString('pt-BR')}</span>
                        <span>{desp.responsavel}</span>
                        {desp.comprovante && <span className="truncate">{desp.comprovante}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {despFiltradas.length === 0 && (
            <Card><CardContent className="p-12 text-center">
              <TrendingDown className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
            </CardContent></Card>
          )}
        </>
      )}

      {/* Modal Novo Investimento / Nova Despesa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground text-base">{aba === 'investimentos' ? 'Novo Investimento' : 'Nova Despesa'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {aba === 'investimentos' ? (
              <form onSubmit={handleSubmitInv} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Título *</label>
                  <input type="text" value={invForm.titulo} onChange={e => fieldInv('titulo', e.target.value)}
                    placeholder="Nome do projeto" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Categoria</label>
                    <select value={invForm.categoria} onChange={e => fieldInv('categoria', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {Object.entries(INV_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Status</label>
                    <select value={invForm.status} onChange={e => fieldInv('status', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Valor (R$) *</label>
                    <input type="number" step="0.01" min="0" value={invForm.valor} onChange={e => fieldInv('valor', e.target.value)}
                      placeholder="0,00" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.valor && <p className="text-xs text-destructive mt-1">{errors.valor}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Data *</label>
                    <input type="date" value={invForm.data} onChange={e => fieldInv('data', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.data && <p className="text-xs text-destructive mt-1">{errors.data}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Responsável *</label>
                  <input type="text" value={invForm.responsavel} onChange={e => fieldInv('responsavel', e.target.value)}
                    placeholder="Nome do responsável" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.responsavel && <p className="text-xs text-destructive mt-1">{errors.responsavel}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Descrição</label>
                  <textarea value={invForm.descricao} onChange={e => fieldInv('descricao', e.target.value)}
                    placeholder="Descreva o investimento..." rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Observações</label>
                  <textarea value={invForm.observacoes} onChange={e => fieldInv('observacoes', e.target.value)}
                    placeholder="Observações adicionais..." rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} /> Registrar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitDesp} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Descrição *</label>
                  <input type="text" value={despForm.descricao} onChange={e => fieldDesp('descricao', e.target.value)}
                    placeholder="Descrição da despesa" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.descricao && <p className="text-xs text-destructive mt-1">{errors.descricao}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Categoria</label>
                    <select value={despForm.categoria} onChange={e => fieldDesp('categoria', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {Object.entries(DESP_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Valor (R$) *</label>
                    <input type="number" step="0.01" min="0" value={despForm.valor} onChange={e => fieldDesp('valor', e.target.value)}
                      placeholder="0,00" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.valor && <p className="text-xs text-destructive mt-1">{errors.valor}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Data *</label>
                    <input type="date" value={despForm.data} onChange={e => fieldDesp('data', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.data && <p className="text-xs text-destructive mt-1">{errors.data}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Responsável *</label>
                    <input type="text" value={despForm.responsavel} onChange={e => fieldDesp('responsavel', e.target.value)}
                      placeholder="Nome" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.responsavel && <p className="text-xs text-destructive mt-1">{errors.responsavel}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Comprovante</label>
                  <input type="text" value={despForm.comprovante} onChange={e => fieldDesp('comprovante', e.target.value)}
                    placeholder="Nome do arquivo (ex: nota_fiscal.pdf)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} /> Registrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Editar Despesa */}
      {editDesp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditDesp(null)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground text-base">Editar Despesa</h2>
              <button onClick={() => setEditDesp(null)} className="p-2 hover:bg-muted rounded-lg"><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Descrição *</label>
                <input type="text" value={editDesp.descricao}
                  onChange={e => setEditDesp(p => p ? { ...p, descricao: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Categoria</label>
                  <select value={editDesp.categoria}
                    onChange={e => setEditDesp(p => p ? { ...p, categoria: e.target.value as Despesa['categoria'] } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {Object.entries(DESP_CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0" value={editDesp.valor}
                    onChange={e => setEditDesp(p => p ? { ...p, valor: Number(e.target.value) } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Data</label>
                  <input type="date" value={editDesp.data}
                    onChange={e => setEditDesp(p => p ? { ...p, data: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Responsável</label>
                  <input type="text" value={editDesp.responsavel}
                    onChange={e => setEditDesp(p => p ? { ...p, responsavel: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Comprovante</label>
                <input type="text" value={editDesp.comprovante || ''}
                  onChange={e => setEditDesp(p => p ? { ...p, comprovante: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditDesp(null)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSaveEditDesp} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
