import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { useData } from '../contexts/DataContext';
import { type RelatorioAtividade, type Oficio } from '../data/mockData';
import {
  BarChart3, Download, Users, Home as HomeIcon, Activity,
  Plus, X, Pencil, Trash2, Image, FileText, Send,
  Clock, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from 'sonner';

const OFICIO_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho', enviado: 'Enviado', protocolado: 'Protocolado', respondido: 'Respondido'
};
const OFICIO_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  enviado: 'bg-secondary/20 text-secondary',
  protocolado: 'bg-primary/20 text-primary',
  respondido: 'bg-accent/20 text-accent'
};

const REL_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  finalizado: 'bg-primary/20 text-primary'
};

const emptyRelatorio = {
  titulo: '', descricao: '', data: '', responsavel: '',
  categoria: '', status: 'rascunho' as RelatorioAtividade['status'], imagens: [] as string[]
};

const emptyOficio = {
  numero: '', titulo: '', destinatario: '', assunto: '',
  dataEmissao: '', dataProtocolo: '', numeroProtocolo: '',
  status: 'rascunho' as Oficio['status'], observacoes: ''
};

type Aba = 'moradores' | 'familias' | 'atividades' | 'relatorios_atividade' | 'oficios';

export function Relatorios() {
  const {
    moradores: mockMoradores,
    familias: mockFamilias,
    atividades: mockAtividades,
    relatorios,
    oficios,
    addRelatorio, updateRelatorio, deleteRelatorio,
    addOficio, updateOficio, deleteOficio
  } = useData();

  const [tipoRelatorio, setTipoRelatorio] = useState<Aba>('moradores');

  // Relatório de Atividade state
  const [relModal, setRelModal] = useState(false);
  const [relForm, setRelForm] = useState(emptyRelatorio);
  const [relEditId, setRelEditId] = useState<string | null>(null);
  const [relErrors, setRelErrors] = useState<Record<string, string>>({});
  const [relViewId, setRelViewId] = useState<string | null>(null);
  const [relDeleteId, setRelDeleteId] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // Ofício state
  const [ofModal, setOfModal] = useState(false);
  const [ofForm, setOfForm] = useState(emptyOficio);
  const [ofEditId, setOfEditId] = useState<string | null>(null);
  const [ofErrors, setOfErrors] = useState<Record<string, string>>({});
  const [ofDeleteId, setOfDeleteId] = useState<string | null>(null);

  const ocupacoes = [...new Set(mockMoradores.map(m => m.ocupacao).filter(Boolean))];
  const moradoresPorOcupacao = ocupacoes.map(oc => ({
    ocupacao: oc, total: mockMoradores.filter(m => m.ocupacao === oc).length
  })).filter(x => x.total > 0);

  const atividadesPorMes = [
    { mes: 'Jan', total: 8 }, { mes: 'Fev', total: 12 }, { mes: 'Mar', total: 15 },
    { mes: 'Abr', total: 10 }, { mes: 'Mai', total: mockAtividades.length }
  ];

  // Imagens (base64)
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) { toast.error(`"${file.name}" é muito grande (máx 2MB)`); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        setRelForm(prev => ({ ...prev, imagens: [...prev.imagens, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setRelForm(prev => ({ ...prev, imagens: prev.imagens.filter((_, i) => i !== idx) }));
  };

  // Relatório CRUD
  const validateRel = () => {
    const e: Record<string, string> = {};
    if (!relForm.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!relForm.data) e.data = 'Data é obrigatória';
    if (!relForm.responsavel.trim()) e.responsavel = 'Responsável é obrigatório';
    return e;
  };

  const openRelModal = (rel?: RelatorioAtividade) => {
    if (rel) {
      setRelForm({ titulo: rel.titulo, descricao: rel.descricao, data: rel.data, responsavel: rel.responsavel, categoria: rel.categoria, status: rel.status, imagens: [...rel.imagens] });
      setRelEditId(rel.id);
    } else {
      setRelForm(emptyRelatorio);
      setRelEditId(null);
    }
    setRelErrors({});
    setRelModal(true);
  };

  const handleRelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRel();
    if (Object.keys(errs).length) { setRelErrors(errs); return; }
    if (relEditId) {
      const existing = relatorios.find(r => r.id === relEditId)!;
      updateRelatorio({ ...existing, ...relForm });
      toast.success('Relatório atualizado!');
    } else {
      addRelatorio(relForm);
      toast.success('Relatório registrado!');
    }
    setRelModal(false);
  };

  // Ofício CRUD
  const validateOf = () => {
    const e: Record<string, string> = {};
    if (!ofForm.numero.trim()) e.numero = 'Número é obrigatório';
    if (!ofForm.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!ofForm.destinatario.trim()) e.destinatario = 'Destinatário é obrigatório';
    if (!ofForm.dataEmissao) e.dataEmissao = 'Data é obrigatória';
    return e;
  };

  const openOfModal = (of?: Oficio) => {
    if (of) {
      setOfForm({ numero: of.numero, titulo: of.titulo, destinatario: of.destinatario, assunto: of.assunto, dataEmissao: of.dataEmissao, dataProtocolo: of.dataProtocolo || '', numeroProtocolo: of.numeroProtocolo || '', status: of.status, observacoes: of.observacoes || '' });
      setOfEditId(of.id);
    } else {
      setOfForm(emptyOficio);
      setOfEditId(null);
    }
    setOfErrors({});
    setOfModal(true);
  };

  const handleOfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateOf();
    if (Object.keys(errs).length) { setOfErrors(errs); return; }
    const payload: Omit<Oficio, 'id'> = {
      ...ofForm,
      dataProtocolo: ofForm.dataProtocolo || undefined,
      numeroProtocolo: ofForm.numeroProtocolo || undefined,
      observacoes: ofForm.observacoes || undefined,
    };
    if (ofEditId) {
      updateOficio({ ...payload, id: ofEditId });
      toast.success('Ofício atualizado!');
    } else {
      addOficio(payload);
      toast.success('Ofício registrado!');
    }
    setOfModal(false);
  };

  const relView = relatorios.find(r => r.id === relViewId);

  const TABS: { key: Aba; label: string }[] = [
    { key: 'moradores', label: 'Moradores' },
    { key: 'familias', label: 'Famílias' },
    { key: 'atividades', label: 'Atividades' },
    { key: 'relatorios_atividade', label: 'Relatórios' },
    { key: 'oficios', label: 'Ofícios' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Visualize, registre e exporte relatórios comunitários</p>
        </div>
        {tipoRelatorio === 'relatorios_atividade' && (
          <Button onClick={() => openRelModal()}><Plus size={20} /> Novo Relatório</Button>
        )}
        {tipoRelatorio === 'oficios' && (
          <Button onClick={() => openOfModal()}><Plus size={20} /> Novo Ofício</Button>
        )}
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setTipoRelatorio(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${tipoRelatorio === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                {tab.label}
              </button>
            ))}
            {(['moradores', 'familias', 'atividades'] as Aba[]).includes(tipoRelatorio) && (
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={() => toast.success('Relatório exportado em PDF!')}><Download size={16} /> PDF</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success('Relatório exportado em Excel!')}><Download size={16} /> Excel</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Moradores ── */}
      {tipoRelatorio === 'moradores' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Total de Moradores</p><h2 className="text-foreground">{mockMoradores.length}</h2></div>
                <div className="bg-primary/10 p-3 rounded-lg"><Users className="text-primary" size={24} /></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Moradores Ativos</p><h2 className="text-foreground">{mockMoradores.filter(m => m.status === 'ativo').length}</h2></div>
                <div className="bg-secondary/10 p-3 rounded-lg"><Activity className="text-secondary" size={24} /></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Com Veículo</p><h2 className="text-foreground">{mockMoradores.filter(m => m.veiculo).length}</h2></div>
                <div className="bg-accent/10 p-3 rounded-lg"><Activity className="text-accent" size={24} /></div>
              </div>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Moradores por Ocupação</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={moradoresPorOcupacao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                  <XAxis dataKey="ocupacao" tick={{ fontSize: 12 }} /><YAxis /><Tooltip />
                  <Bar dataKey="total" fill="#5c8a3e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Lista Completa de Moradores</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">CPF</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Ocupação</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Veículo</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
                  </tr></thead>
                  <tbody>
                    {mockMoradores.map((morador) => (
                      <tr key={morador.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 text-sm">{morador.nome}</td>
                        <td className="py-3 px-4 text-sm">{morador.cpf}</td>
                        <td className="py-3 px-4 text-sm">{morador.familia}</td>
                        <td className="py-3 px-4 text-sm">{morador.ocupacao}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {morador.veiculo?.tipo
                            ? `${morador.veiculo.tipo}${morador.veiculo.placa ? ' · ' + morador.veiculo.placa : ''}`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${morador.status === 'ativo' ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                            {morador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
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

      {/* ── Famílias ── */}
      {tipoRelatorio === 'familias' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Total de Famílias</p><h2 className="text-foreground">{mockFamilias.length}</h2></div>
                <div className="bg-primary/10 p-3 rounded-lg"><HomeIcon className="text-primary" size={24} /></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Média de Membros</p><h2 className="text-foreground">{(mockFamilias.reduce((acc, f) => acc + f.total_membros, 0) / mockFamilias.length).toFixed(1)}</h2></div>
                <div className="bg-secondary/10 p-3 rounded-lg"><Users className="text-secondary" size={24} /></div>
              </div>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Lista de Famílias</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Responsável</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Membros</th>
                    <th className="text-left py-3 px-4 text-sm text-muted-foreground">Endereço</th>
                  </tr></thead>
                  <tbody>
                    {mockFamilias.map((familia) => (
                      <tr key={familia.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 text-sm">{familia.nome}</td>
                        <td className="py-3 px-4 text-sm">{familia.responsavel}</td>
                        <td className="py-3 px-4 text-sm">{familia.total_membros}</td>
                        <td className="py-3 px-4 text-sm">{familia.endereco}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Atividades ── */}
      {tipoRelatorio === 'atividades' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Total</p><h2 className="text-foreground">{mockAtividades.length}</h2></div>
                <div className="bg-primary/10 p-3 rounded-lg"><BarChart3 className="text-primary" size={24} /></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Concluídas</p><h2 className="text-foreground">{mockAtividades.filter(a => a.status === 'concluida').length}</h2></div>
                <div className="bg-secondary/10 p-3 rounded-lg"><Activity className="text-secondary" size={24} /></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">Pendentes</p><h2 className="text-foreground">{mockAtividades.filter(a => a.status === 'pendente').length}</h2></div>
                <div className="bg-accent/10 p-3 rounded-lg"><Clock className="text-accent" size={24} /></div>
              </div>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Atividades por Mês</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={atividadesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                  <XAxis dataKey="mes" /><YAxis /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="total" stroke="#5c8a3e" strokeWidth={2} name="Total de Atividades" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Relatórios de Atividade ── */}
      {tipoRelatorio === 'relatorios_atividade' && (
        relatorios.length === 0 ? (
          <Card><CardContent className="p-16 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-2">Nenhum relatório registrado ainda</p>
            <p className="text-xs text-muted-foreground mb-4">Registre as atividades realizadas com descrição e fotos</p>
            <Button onClick={() => openRelModal()}><Plus size={18} /> Registrar primeiro relatório</Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {[...relatorios].sort((a, b) => b.data.localeCompare(a.data)).map(rel => (
              <Card key={rel.id} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-foreground">{rel.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${REL_STATUS_COLORS[rel.status]}`}>
                          {rel.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                        {rel.categoria && <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{rel.categoria}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{rel.descricao}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>{new Date(rel.data).toLocaleDateString('pt-BR')}</span>
                        <span>Responsável: {rel.responsavel}</span>
                        {rel.imagens.length > 0 && <span className="flex items-center gap-1"><Image size={12} /> {rel.imagens.length} foto(s)</span>}
                      </div>
                      {rel.imagens.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {rel.imagens.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} alt={`foto-${i}`} className="w-16 h-16 object-cover rounded-lg border border-border" />
                          ))}
                          {rel.imagens.length > 4 && (
                            <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">+{rel.imagens.length - 4}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setRelViewId(rel.id)} className="p-1.5 hover:bg-secondary/10 rounded transition-colors" title="Visualizar">
                        <Eye size={15} className="text-secondary" />
                      </button>
                      <button onClick={() => openRelModal(rel)} className="p-1.5 hover:bg-primary/10 rounded transition-colors" title="Editar">
                        <Pencil size={15} className="text-primary" />
                      </button>
                      {relDeleteId === rel.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { deleteRelatorio(rel.id); toast.success('Relatório removido'); setRelDeleteId(null); }} className="text-xs px-2 py-1 bg-destructive text-white rounded">Sim</button>
                          <button onClick={() => setRelDeleteId(null)} className="text-xs px-2 py-1 bg-muted text-foreground rounded">Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setRelDeleteId(rel.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
                          <Trash2 size={15} className="text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── Ofícios ── */}
      {tipoRelatorio === 'oficios' && (
        oficios.length === 0 ? (
          <Card><CardContent className="p-16 text-center">
            <Send className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-2">Nenhum ofício registrado ainda</p>
            <p className="text-xs text-muted-foreground mb-4">Registre ofícios entregues e seus protocolos</p>
            <Button onClick={() => openOfModal()}><Plus size={18} /> Registrar primeiro ofício</Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {[...oficios].sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao)).map(of => (
              <Card key={of.id} hover>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">Nº {of.numero}</span>
                        <h3 className="text-foreground">{of.titulo}</h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${OFICIO_STATUS_COLORS[of.status]}`}>
                          {OFICIO_STATUS_LABELS[of.status]}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1"><b>Para:</b> {of.destinatario}</p>
                      {of.assunto && <p className="text-sm text-muted-foreground mb-2"><b>Assunto:</b> {of.assunto}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Emitido em: {new Date(of.dataEmissao).toLocaleDateString('pt-BR')}</span>
                        {of.dataProtocolo && <span>Protocolado em: {new Date(of.dataProtocolo).toLocaleDateString('pt-BR')}</span>}
                        {of.numeroProtocolo && <span className="font-mono">Protocolo: {of.numeroProtocolo}</span>}
                      </div>
                      {of.observacoes && <p className="text-xs text-muted-foreground mt-2 italic">"{of.observacoes}"</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openOfModal(of)} className="p-1.5 hover:bg-primary/10 rounded transition-colors">
                        <Pencil size={15} className="text-primary" />
                      </button>
                      {ofDeleteId === of.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { deleteOficio(of.id); toast.success('Ofício removido'); setOfDeleteId(null); }} className="text-xs px-2 py-1 bg-destructive text-white rounded">Sim</button>
                          <button onClick={() => setOfDeleteId(null)} className="text-xs px-2 py-1 bg-muted text-foreground rounded">Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setOfDeleteId(of.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
                          <Trash2 size={15} className="text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modal Relatório */}
      {relModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRelModal(false)} />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-foreground">{relEditId ? 'Editar Relatório' : 'Novo Relatório de Atividade'}</h2>
              <button onClick={() => setRelModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleRelSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Título *</label>
                <input type="text" value={relForm.titulo} onChange={e => setRelForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Mutirão de Limpeza do Rio - Maio/2024"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {relErrors.titulo && <p className="text-xs text-destructive mt-1">{relErrors.titulo}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Data *</label>
                  <input type="date" value={relForm.data} onChange={e => setRelForm(p => ({ ...p, data: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {relErrors.data && <p className="text-xs text-destructive mt-1">{relErrors.data}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Responsável *</label>
                  <input type="text" value={relForm.responsavel} onChange={e => setRelForm(p => ({ ...p, responsavel: e.target.value }))}
                    placeholder="Nome do responsável"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {relErrors.responsavel && <p className="text-xs text-destructive mt-1">{relErrors.responsavel}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Categoria</label>
                  <input type="text" value={relForm.categoria} onChange={e => setRelForm(p => ({ ...p, categoria: e.target.value }))}
                    placeholder="Ex: Saúde, Educação, Infraestrutura"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Status</label>
                  <select value={relForm.status} onChange={e => setRelForm(p => ({ ...p, status: e.target.value as RelatorioAtividade['status'] }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="rascunho">Rascunho</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Descrição da Atividade</label>
                <textarea value={relForm.descricao} onChange={e => setRelForm(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descreva o que foi realizado, quantas pessoas participaram, resultados obtidos..."
                  rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Fotos da Atividade</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {relForm.imagens.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`foto-${i}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => imgInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary">
                    <Image size={18} /><span className="text-xs">Adicionar</span>
                  </button>
                </div>
                <input ref={imgInputRef} type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
                <p className="text-xs text-muted-foreground">Máx. 2MB por foto. Formatos: JPG, PNG, WEBP</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRelModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> {relEditId ? 'Salvar Alterações' : 'Registrar Relatório'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Relatório */}
      {relView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRelViewId(null)} />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-foreground">{relView.titulo}</h2>
              <button onClick={() => setRelViewId(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span>{new Date(relView.data).toLocaleDateString('pt-BR')}</span>
                <span>·</span><span>{relView.responsavel}</span>
                {relView.categoria && <><span>·</span><span>{relView.categoria}</span></>}
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${REL_STATUS_COLORS[relView.status]}`}>
                  {relView.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                </span>
              </div>
              {relView.descricao && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{relView.descricao}</p>
                </div>
              )}
              {relView.imagens.length > 0 && (
                <div>
                  <p className="text-sm text-foreground mb-3">Fotos ({relView.imagens.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {relView.imagens.map((img, i) => (
                      <img key={i} src={img} alt={`foto-${i}`} className="w-full aspect-square object-cover rounded-lg border border-border" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ofício */}
      {ofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOfModal(false)} />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-foreground">{ofEditId ? 'Editar Ofício' : 'Novo Ofício'}</h2>
              <button onClick={() => setOfModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleOfSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Número do Ofício *</label>
                  <input type="text" value={ofForm.numero} onChange={e => setOfForm(p => ({ ...p, numero: e.target.value }))}
                    placeholder="Ex: 001/2024"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {ofErrors.numero && <p className="text-xs text-destructive mt-1">{ofErrors.numero}</p>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Data de Emissão *</label>
                  <input type="date" value={ofForm.dataEmissao} onChange={e => setOfForm(p => ({ ...p, dataEmissao: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {ofErrors.dataEmissao && <p className="text-xs text-destructive mt-1">{ofErrors.dataEmissao}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Título *</label>
                <input type="text" value={ofForm.titulo} onChange={e => setOfForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Ofício de Solicitação de Atendimento Médico"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {ofErrors.titulo && <p className="text-xs text-destructive mt-1">{ofErrors.titulo}</p>}
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Destinatário *</label>
                <input type="text" value={ofForm.destinatario} onChange={e => setOfForm(p => ({ ...p, destinatario: e.target.value }))}
                  placeholder="Ex: Secretaria Municipal de Saúde"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {ofErrors.destinatario && <p className="text-xs text-destructive mt-1">{ofErrors.destinatario}</p>}
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Assunto</label>
                <input type="text" value={ofForm.assunto} onChange={e => setOfForm(p => ({ ...p, assunto: e.target.value }))}
                  placeholder="Breve descrição do assunto"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Status</label>
                <select value={ofForm.status} onChange={e => setOfForm(p => ({ ...p, status: e.target.value as Oficio['status'] }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="protocolado">Protocolado</option>
                  <option value="respondido">Respondido</option>
                </select>
              </div>
              {(ofForm.status === 'protocolado' || ofForm.status === 'respondido') && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <label className="block text-sm text-foreground mb-1">Data do Protocolo</label>
                    <input type="date" value={ofForm.dataProtocolo} onChange={e => setOfForm(p => ({ ...p, dataProtocolo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Número do Protocolo</label>
                    <input type="text" value={ofForm.numeroProtocolo} onChange={e => setOfForm(p => ({ ...p, numeroProtocolo: e.target.value }))}
                      placeholder="Ex: 2024/00123"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-foreground mb-1">Observações</label>
                <textarea value={ofForm.observacoes} onChange={e => setOfForm(p => ({ ...p, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre o ofício..."
                  rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOfModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> {ofEditId ? 'Salvar Alterações' : 'Registrar Ofício'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
