import { useState } from 'react';
import { Card, CardContent } from '../components/Card';
import { type EventoAgenda } from '../data/mockData';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Filter, X, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';

const TIPO_OPTIONS = [
  { value: 'reuniao', label: 'Reunião' },
  { value: 'evento', label: 'Evento' },
  { value: 'assembleia', label: 'Assembleia' },
  { value: 'atividade', label: 'Atividade' },
  { value: 'outro', label: 'Outro' }
];

const TIPO_COLORS: Record<string, string> = {
  reuniao: 'bg-primary/20 text-primary',
  evento: 'bg-accent/20 text-accent',
  atividade: 'bg-secondary/20 text-secondary',
  outro: 'bg-muted text-muted-foreground'
};

const TIPO_LABELS: Record<string, string> = {
  reuniao: 'Reunião', evento: 'Evento', assembleia: 'Assembleia', atividade: 'Atividade', outro: 'Outros'
};

const emptyForm = {
  titulo: '', descricao: '', data: '', hora: '', local: '',
  responsavel: '', tipo: 'reuniao' as EventoAgenda['tipo']
};

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";

export function Agenda() {
  const { user } = useAuth();
  const { eventos, addEvento, updateEvento, deleteEvento } = useData();
  const isMorador = user?.role === 'visualizador';

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const eventosFiltrados = filtroTipo === 'todos' ? eventos : eventos.filter(e => e.tipo === filtroTipo);
  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  const eventosPorMes = eventosOrdenados.reduce((acc, evento) => {
    const mesAno = new Date(evento.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!acc[mesAno]) acc[mesAno] = [];
    acc[mesAno].push(evento);
    return acc;
  }, {} as Record<string, EventoAgenda[]>);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!form.data) e.data = 'Data é obrigatória';
    if (!form.hora) e.hora = 'Horário é obrigatório';
    if (!form.local.trim()) e.local = 'Local é obrigatório';
    if (!form.responsavel.trim()) e.responsavel = 'Responsável é obrigatório';
    return e;
  };

  const openModal = (evento?: EventoAgenda) => {
    if (evento) {
      setForm({ titulo: evento.titulo, descricao: evento.descricao, data: evento.data, hora: evento.hora, local: evento.local, responsavel: evento.responsavel, tipo: evento.tipo });
      setEditId(evento.id);
    } else {
      setForm(emptyForm);
      setEditId(null);
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditId(null); setErrors({}); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (editId) {
      const existing = eventos.find(ev => ev.id === editId)!;
      updateEvento({ ...existing, ...form });
      toast.success(`Evento "${form.titulo}" atualizado!`);
    } else {
      addEvento(form);
      toast.success(`Evento "${form.titulo}" adicionado à agenda!`);
    }
    closeModal();
  };

  const handleDelete = (id: string) => { deleteEvento(id); toast.success('Evento removido'); setConfirmDelete(null); };
  const field = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl md:text-3xl">Agenda</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {isMorador ? 'Eventos da comunidade' : 'Eventos e atividades programadas'}
          </p>
        </div>
        {!isMorador && (
          <button
            onClick={() => openModal()}
            className="shrink-0 flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Evento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
        <Filter size={16} className="text-muted-foreground shrink-0" />
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="flex-1 bg-transparent text-foreground text-sm focus:outline-none"
        >
          <option value="todos">Todos os tipos</option>
          {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Eventos por mês */}
      <div className="space-y-6">
        {Object.entries(eventosPorMes).map(([mesAno, eventosDoMes]) => (
          <div key={mesAno}>
            <h2 className="text-foreground text-sm uppercase tracking-wider text-muted-foreground mb-3 capitalize">{mesAno}</h2>
            <div className="space-y-3">
              {eventosDoMes.map((evento) => (
                <Card key={evento.id}>
                  <CardContent className="p-4">
                    {/* Top row: date badge + title + badge + actions */}
                    <div className="flex items-start gap-3">
                      {/* Date badge */}
                      <div className="bg-primary/10 rounded-xl px-3 py-2 text-center shrink-0 min-w-[48px]">
                        <p className="text-primary text-base leading-none">{new Date(evento.data).toLocaleDateString('pt-BR', { day: 'numeric' })}</p>
                        <p className="text-xs text-muted-foreground uppercase mt-0.5">{new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}</p>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-foreground leading-tight">{evento.titulo}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${TIPO_COLORS[evento.tipo]}`}>
                              {TIPO_LABELS[evento.tipo]}
                            </span>
                            {!isMorador && (
                              <>
                                <button
                                  onClick={() => openModal(evento)}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Pencil size={13} className="text-primary" />
                                </button>
                                {confirmDelete === evento.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDelete(evento.id)} className="text-xs px-2 py-1 bg-destructive text-white rounded-lg">Sim</button>
                                    <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-muted text-foreground rounded-lg">Não</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDelete(evento.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors group">
                                    <Trash2 size={13} className="text-muted-foreground group-hover:text-destructive" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {evento.descricao && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{evento.descricao}</p>
                        )}

                        {/* Info chips — horizontal wrap */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />{evento.hora}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />{evento.local}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User size={12} />{evento.responsavel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {eventosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarIcon className="mb-3 text-muted-foreground" size={40} />
          <p className="text-muted-foreground text-sm">Nenhum evento encontrado</p>
          {!isMorador && (
            <button onClick={() => openModal()} className="mt-3 text-sm text-primary hover:text-primary/80">
              Adicionar primeiro evento
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground text-base">{editId ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5">Título *</label>
                <input type="text" value={form.titulo} onChange={e => field('titulo', e.target.value)}
                  placeholder="Nome do evento" className={inputCls} />
                {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo}</p>}
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1.5">Tipo</label>
                <select value={form.tipo} onChange={e => field('tipo', e.target.value)} className={inputCls}>
                  {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">Data *</label>
                  <input type="date" value={form.data} onChange={e => field('data', e.target.value)} className={inputCls} />
                  {errors.data && <p className="text-xs text-destructive mt-1">{errors.data}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">Horário *</label>
                  <input type="time" value={form.hora} onChange={e => field('hora', e.target.value)} className={inputCls} />
                  {errors.hora && <p className="text-xs text-destructive mt-1">{errors.hora}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1.5">Local *</label>
                <input type="text" value={form.local} onChange={e => field('local', e.target.value)}
                  placeholder="Ex: Centro Comunitário" className={inputCls} />
                {errors.local && <p className="text-xs text-destructive mt-1">{errors.local}</p>}
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1.5">Responsável *</label>
                <input type="text" value={form.responsavel} onChange={e => field('responsavel', e.target.value)}
                  placeholder="Nome do responsável" className={inputCls} />
                {errors.responsavel && <p className="text-xs text-destructive mt-1">{errors.responsavel}</p>}
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1.5">Descrição</label>
                <textarea value={form.descricao} onChange={e => field('descricao', e.target.value)}
                  placeholder="Descreva o evento..." rows={3}
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="flex gap-3 pt-1 pb-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  {editId ? <><Pencil size={15} /> Salvar</> : <><Plus size={15} /> Adicionar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
