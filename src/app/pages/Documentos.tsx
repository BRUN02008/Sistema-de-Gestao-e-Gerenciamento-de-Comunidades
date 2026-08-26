import { useState, useRef } from 'react';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { type Documento } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Download, Eye, FileText, File, Lock, X, Trash2, PenLine, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const TIPO_LABELS: Record<string, string> = {
  certidao: 'Certidão', declaracao: 'Declaração', relatorio: 'Relatório', outro: 'Outro'
};

const emptyForm = {
  titulo: '', tipo: 'declaracao' as Documento['tipo'],
  morador: '', moradorId: '', dataEmissao: '', arquivo: ''
};


export function Documentos() {
  const { user } = useAuth();
  const { documentos, addDocumento, deleteDocumento, moradores } = useData();
  const isMorador = user?.role === 'visualizador';

  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<Documento | null>(null);
  const [signMode, setSignMode] = useState(false);
  const [signedDocs, setSignedDocs] = useState<Record<string, { assinatura: string; assinadoPor: string; dataAssinatura: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('sisgest_assinaturas') || '{}'); } catch { return {}; }
  });

  // Canvas signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const saveAssinaturas = (updated: typeof signedDocs) => {
    setSignedDocs(updated);
    try { localStorage.setItem('sisgest_assinaturas', JSON.stringify(updated)); } catch {}
  };

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getCanvasPos(e, canvasRef.current);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPoint.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const point = getCanvasPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#1a4a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPoint.current = point;
    setHasDrawn(true);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const handleAssinar = () => {
    if (!canvasRef.current || !viewDoc || !hasDrawn) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const updated = {
      ...signedDocs,
      [viewDoc.id]: {
        assinatura: dataUrl,
        assinadoPor: user?.nome || 'Usuário',
        dataAssinatura: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    };
    saveAssinaturas(updated);
    setSignMode(false);
    toast.success('Documento assinado digitalmente!');
  };

  const documentosBase = isMorador
    ? documentos.filter(d => d.moradorId === user?.moradorId)
    : documentos;

  const documentosFiltrados = documentosBase.filter(doc =>
    doc.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    doc.morador.toLowerCase().includes(busca.toLowerCase()) ||
    doc.tipo.includes(busca.toLowerCase())
  );

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'certidao': return <FileText className="text-primary" size={24} />;
      case 'declaracao': return <File className="text-accent" size={24} />;
      case 'relatorio': return <FileText className="text-secondary" size={24} />;
      default: return <File className="text-muted-foreground" size={24} />;
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!form.morador.trim()) e.morador = 'Morador é obrigatório';
    if (!form.dataEmissao) e.dataEmissao = 'Data de emissão é obrigatória';
    if (!form.arquivo.trim()) e.arquivo = 'Nome do arquivo é obrigatório';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    addDocumento({ ...form });
    toast.success(`Documento "${form.titulo}" cadastrado!`);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDocumento(id);
    toast.success('Documento removido');
    setConfirmDelete(null);
  };

  const field = (key: keyof typeof form, value: string) => {
    if (key === 'moradorId') {
      const m = moradores.find(mr => mr.id === value);
      setForm(prev => ({ ...prev, moradorId: value, morador: m?.nome || prev.morador }));
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const openView = (doc: Documento) => {
    setViewDoc(doc);
    setSignMode(false);
    setHasDrawn(false);
  };

  const closeView = () => {
    setViewDoc(null);
    setSignMode(false);
    setHasDrawn(false);
  };

  const getTipoLabel = (tipo: string) => TIPO_LABELS[tipo] || tipo;

  const getDocumentContent = (doc: Documento) => {
    const morador = moradores.find(m => m.id === doc.moradorId);
    const dataEmissao = new Date(doc.dataEmissao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    if (doc.tipo === 'declaracao') {
      return `DECLARAÇÃO

Cachoeira do Castanho, Amazonas, ${dataEmissao}

Declaro, para os devidos fins, que ${doc.morador}${morador?.cpf ? ', portador do CPF nº ' + morador.cpf + ',' : ''} é morador regularmente cadastrado na comunidade Cachoeira do Castanho, município de Amazonas.

${morador?.endereco ? 'Endereço: ' + morador.endereco + '.' : ''}
${morador?.ocupacao ? 'Ocupação: ' + morador.ocupacao + '.' : ''}

Esta declaração é expedida a pedido do(a) interessado(a), para fins que se fizerem necessários.

Documento: ${doc.arquivo}`;
    }

    if (doc.tipo === 'certidao') {
      return `CERTIDÃO

Comunidade Cachoeira do Castanho — Amazonas
Data de Emissão: ${dataEmissao}

CERTIFICA-SE que ${doc.morador}${morador?.cpf ? ' (CPF: ' + morador.cpf + ')' : ''} possui registro ativo na comunidade Cachoeira do Castanho, conforme cadastro comunitário vigente.

${morador?.dataNascimento ? 'Data de Nascimento: ' + new Date(morador.dataNascimento).toLocaleDateString('pt-BR') : ''}
${morador?.rg ? 'RG: ' + morador.rg : ''}

Esta certidão é válida como documento comprobatório de residência e vínculo comunitário.

Referência: ${doc.arquivo}`;
    }

    return `${doc.tipo.toUpperCase()}

Comunidade Cachoeira do Castanho — Amazonas
Data: ${dataEmissao}

Morador: ${doc.morador}
Arquivo: ${doc.arquivo}

Documento gerado pelo Sistema SisGest — Gerenciamento Comunitário.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl md:text-3xl">{isMorador ? 'Meus Documentos' : 'Documentos'}</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {isMorador ? 'Documentos emitidos pela comunidade' : 'Gestão de documentos comunitários'}
          </p>
        </div>
        {!isMorador && (
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Documento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </div>

      {isMorador && (
        <div className="flex items-start gap-3 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
          <Lock className="text-secondary mt-0.5" size={18} />
          <div>
            <p className="text-sm text-foreground">Acesso restrito aos seus documentos</p>
            <p className="text-xs text-muted-foreground">
              Você está visualizando apenas os documentos emitidos em seu nome (CPF: {user?.cpf}).
              Para solicitar novos documentos, entre em contato com a administração.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Search className="text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder={isMorador ? 'Buscar meus documentos...' : 'Buscar documentos por título, morador ou tipo...'}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {documentosFiltrados.map((documento) => {
          const assinatura = signedDocs[documento.id];
          return (
            <Card key={documento.id} hover>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted/50 p-2.5 rounded-xl shrink-0">{getIcon(documento.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-foreground text-sm leading-tight truncate">{documento.titulo}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary whitespace-nowrap">
                          {TIPO_LABELS[documento.tipo]}
                        </span>
                        {assinatura && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                            <CheckCircle2 size={10} />
                            <span className="hidden sm:inline">Assinado</span>
                          </span>
                        )}
                        {!isMorador && (
                          confirmDelete === documento.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(documento.id)} className="text-xs px-2 py-1 bg-destructive text-white rounded-lg">Sim</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 bg-muted text-foreground rounded-lg">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(documento.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors group">
                              <Trash2 size={13} className="text-muted-foreground group-hover:text-destructive" />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    {!isMorador && (
                      <p className="text-xs text-muted-foreground mb-1">Morador: {documento.morador}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-3">
                      <span>{new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="truncate max-w-[160px]">{documento.arquivo}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openView(documento)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <Eye size={13} /> Visualizar
                      </button>
                      <button
                        onClick={() => toast.success(`Download iniciado: ${documento.titulo}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Download size={13} /> Baixar
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {documentosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">
              {isMorador ? 'Nenhum documento encontrado em seu nome' : 'Nenhum documento encontrado'}
            </p>
            {isMorador && <p className="text-xs text-muted-foreground mt-2">Para solicitar documentos, entre em contato com a administração da comunidade.</p>}
          </CardContent>
        </Card>
      )}

      {/* Modal Novo Documento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-foreground">Novo Documento</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Título *</label>
                <input type="text" value={form.titulo} onChange={e => field('titulo', e.target.value)}
                  placeholder="Ex: Declaração de Residência - Nome" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => field('tipo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1">Data de Emissão *</label>
                  <input type="date" value={form.dataEmissao} onChange={e => field('dataEmissao', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.dataEmissao && <p className="text-xs text-destructive mt-1">{errors.dataEmissao}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1">Morador *</label>
                <select value={form.moradorId} onChange={e => field('moradorId', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Selecione o morador...</option>
                  {moradores.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                {!form.moradorId && (
                  <div className="mt-2">
                    <input type="text" value={form.morador} onChange={e => field('morador', e.target.value)}
                      placeholder="Ou digite o nome manualmente" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                )}
                {errors.morador && <p className="text-xs text-destructive mt-1">{errors.morador}</p>}
              </div>

              <div>
                <label className="block text-sm text-foreground mb-1">Nome do Arquivo *</label>
                <input type="text" value={form.arquivo} onChange={e => field('arquivo', e.target.value)}
                  placeholder="Ex: declaracao_001.pdf" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {errors.arquivo && <p className="text-xs text-destructive mt-1">{errors.arquivo}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> Cadastrar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Documento */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeView} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
              <div className="bg-muted/50 p-2 rounded-lg shrink-0">{getIcon(viewDoc.tipo)}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-foreground text-sm truncate">{viewDoc.titulo}</h2>
                <p className="text-xs text-muted-foreground">{getTipoLabel(viewDoc.tipo)} · {new Date(viewDoc.dataEmissao).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!signMode && (
                  <button
                    onClick={() => { setSignMode(true); setHasDrawn(false); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-primary text-primary rounded-lg text-xs hover:bg-primary/5 transition-colors"
                  >
                    <PenLine size={13} />
                    <span className="hidden sm:inline">Assinar</span>
                  </button>
                )}
                <button
                  onClick={() => toast.success(`Download: ${viewDoc.arquivo}`)}
                  className="p-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                  title="Baixar"
                >
                  <Download size={15} className="text-foreground" />
                </button>
                <button onClick={closeView} className="p-2 hover:bg-muted rounded-lg">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Document content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Paper */}
              <div className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto">
                {/* Letterhead */}
                <div className="text-center mb-6 pb-4 border-b-2 border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
                      <FileText className="text-white" size={16} />
                    </div>
                    <span className="text-green-800 font-semibold text-sm tracking-wide">SisGest Comunitário</span>
                  </div>
                  <p className="text-green-700 text-xs">Comunidade Cachoeira do Castanho · Amazonas</p>
                </div>

                {/* Body */}
                <pre className="text-gray-800 text-sm font-sans leading-relaxed whitespace-pre-wrap mb-6">
                  {getDocumentContent(viewDoc)}
                </pre>

                {/* Signature area */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  {signedDocs[viewDoc.id] ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-gray-500">Assinatura Digital</p>
                      <img
                        src={signedDocs[viewDoc.id].assinatura}
                        alt="Assinatura digital"
                        className="h-16 border border-gray-200 rounded px-3"
                        style={{ background: 'white' }}
                      />
                      <div className="text-center">
                        <p className="text-xs text-green-700 flex items-center gap-1 justify-center">
                          <CheckCircle2 size={12} /> Assinado digitalmente por {signedDocs[viewDoc.id].assinadoPor}
                        </p>
                        <p className="text-xs text-gray-400">{signedDocs[viewDoc.id].dataAssinatura}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-12 border-b border-gray-400 mx-8 mb-1" />
                      <p className="text-xs text-gray-400">Assinatura</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature pad */}
              {signMode && (
                <div className="mt-4 max-w-xl mx-auto">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-foreground">Assine no campo abaixo</p>
                      <button onClick={() => { setSignMode(false); setHasDrawn(false); }} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
                    </div>
                    <div className="relative border-2 border-dashed border-primary/40 rounded-lg bg-white overflow-hidden" style={{ touchAction: 'none' }}>
                      <canvas
                        ref={canvasRef}
                        width={560}
                        height={140}
                        className="w-full cursor-crosshair block"
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-muted-foreground text-sm">Desenhe sua assinatura aqui...</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors">
                        <RotateCcw size={13} /> Limpar
                      </button>
                      <button
                        onClick={handleAssinar}
                        disabled={!hasDrawn}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle2 size={14} /> Confirmar Assinatura
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
