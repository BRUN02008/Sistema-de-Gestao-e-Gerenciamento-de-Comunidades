import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { type Mensalidade, VALOR_MENSALIDADE } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle, DollarSign, Download, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function Mensalidades() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const { mensalidades, moradores, updateMensalidade, addMensalidade, deleteMensalidade } = useData();
  const { user } = useAuth();

  const canEdit = user?.role === 'admin' || user?.role === 'tecnico';

  // ─── Modais ───────────────────────────────────────────────
  const [editModal, setEditModal] = useState<Mensalidade | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const emptyAdd = { moradorId: '', moradorNome: '', familia: '', mesReferencia: '', dataVencimento: '', valor: String(VALOR_MENSALIDADE), status: 'pendente' as Mensalidade['status'], metodoPagamento: '', dataPagamento: '' };
  const [addForm, setAddForm] = useState(emptyAdd);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // ─── Filtros ──────────────────────────────────────────────
  const mensalidadesFiltradas = mensalidades.filter((m) => {
    const matchBusca =
      m.moradorNome.toLowerCase().includes(busca.toLowerCase()) ||
      m.familia.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || m.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalPago = mensalidades.filter(m => m.status === 'pago').reduce((acc, m) => acc + m.valor, 0);
  const totalPendente = mensalidades.filter(m => m.status === 'pendente' || m.status === 'atrasado').reduce((acc, m) => acc + m.valor, 0);

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const getStatusIcon = (status: string) => {
    if (status === 'pago') return <CheckCircle className="text-primary" size={20} />;
    if (status === 'pendente') return <Clock className="text-accent" size={20} />;
    return <AlertCircle className="text-destructive" size={20} />;
  };

  const getStatusLabel = (status: string) => ({ pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' }[status] || status);
  const getStatusColor = (status: string) => ({
    pago: 'bg-primary/20 text-primary', pendente: 'bg-accent/20 text-accent', atrasado: 'bg-destructive/20 text-destructive'
  }[status] || '');

  const handleRegistrarPagamento = (mensalidade: Mensalidade) => {
    updateMensalidade({ ...mensalidade, status: 'pago', dataPagamento: new Date().toISOString().split('T')[0], metodoPagamento: 'dinheiro' });
    toast.success('Pagamento registrado com sucesso!');
  };

  const mensalidadesOrdenadas = [...mensalidadesFiltradas].sort((a, b) => {
    if (a.status === 'atrasado' && b.status !== 'atrasado') return -1;
    if (a.status !== 'atrasado' && b.status === 'atrasado') return 1;
    if (a.status === 'pendente' && b.status === 'pago') return -1;
    if (a.status === 'pago' && b.status === 'pendente') return 1;
    return new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime();
  });

  // ─── Edição ───────────────────────────────────────────────
  const handleSaveEdit = () => {
    if (!editModal) return;
    updateMensalidade(editModal);
    toast.success('Mensalidade atualizada!');
    setEditModal(null);
  };

  // ─── Nova mensalidade ─────────────────────────────────────
  const validateAdd = () => {
    const e: Record<string, string> = {};
    if (!addForm.moradorId) e.moradorId = 'Selecione o morador';
    if (!addForm.mesReferencia) e.mesReferencia = 'Mês de referência é obrigatório';
    if (!addForm.dataVencimento) e.dataVencimento = 'Data de vencimento é obrigatória';
    if (!addForm.valor || isNaN(Number(addForm.valor))) e.valor = 'Valor inválido';
    return e;
  };

  const handleAdd = () => {
    const errs = validateAdd();
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    const morador = moradores.find(m => m.id === addForm.moradorId);
    addMensalidade({
      moradorId: addForm.moradorId,
      moradorNome: morador?.nome || addForm.moradorNome,
      familia: morador?.familia || '',
      mesReferencia: addForm.mesReferencia,
      dataVencimento: addForm.dataVencimento,
      valor: Number(addForm.valor),
      status: addForm.status,
      metodoPagamento: addForm.status === 'pago' ? (addForm.metodoPagamento || 'dinheiro') : undefined,
      dataPagamento: addForm.status === 'pago' ? (addForm.dataPagamento || new Date().toISOString().split('T')[0]) : undefined,
    });
    toast.success('Mensalidade registrada!');
    setAddForm(emptyAdd);
    setAddErrors({});
    setAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/financas">
            <button className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-foreground text-xl md:text-2xl">Mensalidades</h1>
            <p className="text-muted-foreground text-xs">Controle de pagamentos mensais</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {canEdit && (
            <button onClick={() => setAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">Nova</span>
            </button>
          )}
          <button onClick={() => toast.success('Exportado!')} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Stat cards 3-col → 2x2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mensalidade</p>
                <p className="text-xl text-foreground">{formatarMoeda(VALOR_MENSALIDADE)}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-xl"><DollarSign className="text-primary" size={18} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recebido</p>
                <p className="text-xl text-foreground">{formatarMoeda(totalPago)}</p>
              </div>
              <div className="bg-secondary/10 p-2 rounded-xl"><CheckCircle className="text-secondary" size={18} /></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{mensalidades.filter(m => m.status === 'pago').length} pagamentos</p>
          </CardContent>
        </Card>
        <div className="col-span-2 md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">A Receber</p>
                  <p className="text-xl text-foreground">{formatarMoeda(totalPendente)}</p>
                </div>
                <div className="bg-accent/10 p-2 rounded-xl"><Clock className="text-accent" size={18} /></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{mensalidades.filter(m => m.status !== 'pago').length} pendências</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-card border border-border rounded-xl">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input type="text" placeholder="Buscar morador ou família..." value={busca} onChange={e => setBusca(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" />
        </div>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none sm:w-44">
          <option value="todos">Todos</option>
          <option value="pago">Pagos</option>
          <option value="pendente">Pendentes</option>
          <option value="atrasado">Atrasados</option>
        </select>
      </div>

      {/* Mobile: card list — Desktop: table */}
      {mensalidadesFiltradas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma mensalidade encontrada</div>
      ) : (
        <>
          {/* Mobile cards (hidden on md+) */}
          <div className="space-y-3 md:hidden">
            {mensalidadesOrdenadas.map((mensalidade) => (
              <Card key={mensalidade.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{mensalidade.moradorNome}</p>
                      <p className="text-xs text-muted-foreground">{mensalidade.familia}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${getStatusColor(mensalidade.status)}`}>
                      {getStatusLabel(mensalidade.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                    <span>{new Date(mensalidade.mesReferencia + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                    <span className="text-foreground">{formatarMoeda(mensalidade.valor)}</span>
                    <span>Venc. {new Date(mensalidade.dataVencimento).toLocaleDateString('pt-BR')}</span>
                    {mensalidade.dataPagamento && <span>Pago {new Date(mensalidade.dataPagamento).toLocaleDateString('pt-BR')}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {mensalidade.status !== 'pago' && (
                      <button onClick={() => handleRegistrarPagamento(mensalidade)} className="flex-1 py-1.5 border border-primary text-primary rounded-lg text-xs hover:bg-primary/5 transition-colors">
                        Registrar Pagamento
                      </button>
                    )}
                    {canEdit && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button onClick={() => setEditModal({ ...mensalidade })} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                          <Pencil size={14} className="text-primary" />
                        </button>
                        {confirmDelete === mensalidade.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => { deleteMensalidade(mensalidade.id); toast.success('Removida'); setConfirmDelete(null); }} className="text-xs px-2 py-1 bg-destructive text-white rounded-lg">Sim</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-muted rounded-lg">Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(mensalidade.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 size={14} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table (hidden on mobile) */}
          <Card className="hidden md:block">
            <CardHeader><CardTitle>Lista de Mensalidades</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Morador</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Mês Ref.</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Vencimento</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Valor</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensalidadesOrdenadas.map((mensalidade) => (
                      <tr key={mensalidade.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4"><p className="text-sm text-foreground">{mensalidade.moradorNome}</p></td>
                        <td className="py-3 px-4"><p className="text-sm text-muted-foreground">{mensalidade.familia}</p></td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-foreground">
                            {new Date(mensalidade.mesReferencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-3 px-4"><p className="text-sm text-foreground">{new Date(mensalidade.dataVencimento).toLocaleDateString('pt-BR')}</p></td>
                        <td className="py-3 px-4"><p className="text-sm text-foreground">{formatarMoeda(mensalidade.valor)}</p></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(mensalidade.status)}
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(mensalidade.status)}`}>{getStatusLabel(mensalidade.status)}</span>
                          </div>
                          {mensalidade.dataPagamento && (
                            <p className="text-xs text-muted-foreground mt-1">Pago em: {new Date(mensalidade.dataPagamento).toLocaleDateString('pt-BR')}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {mensalidade.status !== 'pago' && (
                              <Button size="sm" variant="outline" onClick={() => handleRegistrarPagamento(mensalidade)}>Pagar</Button>
                            )}
                            {canEdit && (
                              <>
                                <button onClick={() => setEditModal({ ...mensalidade })} className="p-1.5 hover:bg-primary/10 rounded transition-colors">
                                  <Pencil size={14} className="text-primary" />
                                </button>
                                {confirmDelete === mensalidade.id ? (
                                  <div className="flex gap-1">
                                    <button onClick={() => { deleteMensalidade(mensalidade.id); toast.success('Removida'); setConfirmDelete(null); }} className="text-xs px-2 py-1 bg-destructive text-white rounded">Sim</button>
                                    <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-muted rounded">Não</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDelete(mensalidade.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
                                    <Trash2 size={14} className="text-muted-foreground" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Editar */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditModal(null)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground text-base">Editar Mensalidade</h2>
              <button onClick={() => setEditModal(null)} className="p-2 hover:bg-muted rounded-lg"><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Morador</label>
                <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/30 rounded-lg">{editModal.moradorNome}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Mês de Referência</label>
                  <input type="month" value={editModal.mesReferencia}
                    onChange={e => setEditModal(p => p ? { ...p, mesReferencia: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Vencimento</label>
                  <input type="date" value={editModal.dataVencimento}
                    onChange={e => setEditModal(p => p ? { ...p, dataVencimento: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" value={editModal.valor}
                    onChange={e => setEditModal(p => p ? { ...p, valor: Number(e.target.value) } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Status</label>
                  <select value={editModal.status}
                    onChange={e => setEditModal(p => p ? { ...p, status: e.target.value as Mensalidade['status'] } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>
              {editModal.status === 'pago' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Data de Pagamento</label>
                    <input type="date" value={editModal.dataPagamento || ''}
                      onChange={e => setEditModal(p => p ? { ...p, dataPagamento: e.target.value } : p)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Método</label>
                    <select value={editModal.metodoPagamento || 'dinheiro'}
                      onChange={e => setEditModal(p => p ? { ...p, metodoPagamento: e.target.value } : p)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="transferencia">Transferência</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal(null)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Mensalidade */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddModal(false)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground text-base">Nova Mensalidade</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Morador *</label>
                <select value={addForm.moradorId}
                  onChange={e => setAddForm(p => ({ ...p, moradorId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Selecione o morador</option>
                  {moradores.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                {addErrors.moradorId && <p className="text-xs text-destructive mt-1">{addErrors.moradorId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Mês Referência *</label>
                  <input type="month" value={addForm.mesReferencia}
                    onChange={e => setAddForm(p => ({ ...p, mesReferencia: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {addErrors.mesReferencia && <p className="text-xs text-destructive mt-1">{addErrors.mesReferencia}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Vencimento *</label>
                  <input type="date" value={addForm.dataVencimento}
                    onChange={e => setAddForm(p => ({ ...p, dataVencimento: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {addErrors.dataVencimento && <p className="text-xs text-destructive mt-1">{addErrors.dataVencimento}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" value={addForm.valor}
                    onChange={e => setAddForm(p => ({ ...p, valor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {addErrors.valor && <p className="text-xs text-destructive mt-1">{addErrors.valor}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Status</label>
                  <select value={addForm.status}
                    onChange={e => setAddForm(p => ({ ...p, status: e.target.value as Mensalidade['status'] }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
