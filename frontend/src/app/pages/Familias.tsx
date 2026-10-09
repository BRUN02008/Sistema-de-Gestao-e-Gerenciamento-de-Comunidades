import { useState } from 'react';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../components/contexts/DataContext';
import { Home, Plus, Search, Pencil, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { type Familia } from '../data/mockData';

type FormFamilia = Pick<Familia, 'nome' | 'responsavel' | 'endereco'> & { responsavelMoradorId: string };

const formVazio: FormFamilia = { nome: '', responsavel: '', responsavelMoradorId: '', endereco: '' };

function normalizarIdentidade(valor: string) {
  return valor.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

function mensagemDoErro(error: unknown): string {
  if (!(error instanceof Error)) return 'Não foi possível concluir a operação.';
  try {
    const detalhes = JSON.parse(error.message) as Record<string, unknown>;
    const primeiro = Object.values(detalhes)[0];
    if (Array.isArray(primeiro)) return String(primeiro[0]);
    if (typeof primeiro === 'string') return primeiro;
  } catch {
    return error.message;
  }
  return error.message;
}

export function Familias() {
  const { familias, moradores, addFamilia, updateFamilia, deleteFamilia } = useData();
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState<FormFamilia>(formVazio);
  const [familiaEditando, setFamiliaEditando] = useState<Familia | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroNome, setErroNome] = useState('');

  const familiasFiltradas = familias.filter((familia) =>
    [familia.nome, familia.responsavel, String(familia.id)]
      .some((campo) => campo.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')))
  );

  const abrirCadastro = () => {
    setFamiliaEditando(null);
    setForm(formVazio);
    setErroNome('');
    setModalAberto(true);
  };

  const abrirEdicao = (familia: Familia) => {
    setFamiliaEditando(familia);
    const responsavel = moradores.find((morador) => morador.nome === familia.responsavel && String(morador.familia) === String(familia.id));
    setForm({ nome: familia.nome, responsavel: familia.responsavel, responsavelMoradorId: familia.responsavelMoradorId ?? responsavel?.id ?? '', endereco: familia.endereco });
    setErroNome('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFamiliaEditando(null);
    setErroNome('');
  };

  const salvarFamilia = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nome = form.nome.trim();
    const responsavel = form.responsavel.trim();
    const moradorResponsavel = moradores.find((morador) => String(morador.id) === form.responsavelMoradorId);
    if (!nome) {
      setErroNome('O nome da família é obrigatório.');
      return;
    }
    if (!moradorResponsavel) {
      toast.error('Selecione um morador cadastrado como responsável.');
      return;
    }

    const identidadeMudou = !familiaEditando ||
      normalizarIdentidade(nome) !== normalizarIdentidade(familiaEditando.nome) ||
      form.responsavelMoradorId !== (familiaEditando.responsavelMoradorId ?? '');
    const duplicada = identidadeMudou && familias.some((familia) =>
      String(familia.id) !== String(familiaEditando?.id ?? '') &&
      normalizarIdentidade(familia.nome) === normalizarIdentidade(nome) &&
      normalizarIdentidade(familia.responsavel) === normalizarIdentidade(responsavel)
    );
    if (duplicada) {
      setErroNome('Já existe uma família com este nome e responsável.');
      return;
    }

    const moradoresVinculados = familiaEditando
      ? moradores.filter((morador) => String(morador.familia) === String(familiaEditando.id)).length
      : 0;
    setSalvando(true);
    try {
      if (familiaEditando) {
        await updateFamilia({
          ...familiaEditando,
          ...form,
          nome,
          responsavel: moradorResponsavel.nome,
          endereco: form.endereco.trim(),
          total_membros: moradoresVinculados,
        });
        toast.success('Família atualizada com sucesso!');
      } else {
        await addFamilia({
          ...form,
          nome,
          responsavel: moradorResponsavel.nome,
          endereco: form.endereco.trim(),
          total_membros: 0,
        });
        toast.success('Família cadastrada com sucesso!');
      }
      fecharModal();
    } catch (error) {
      setErroNome(mensagemDoErro(error));
      toast.error(mensagemDoErro(error));
    } finally {
      setSalvando(false);
    }
  };

  const excluirFamilia = async (familia: Familia) => {
    const quantidadeMoradores = moradores.filter(
      (morador) => String(morador.familia) === String(familia.id)
    ).length;
    if (quantidadeMoradores > 0) {
      toast.error(`Não é possível excluir "${familia.nome}": há ${quantidadeMoradores} morador(es) vinculado(s). Transfira-os para outra família primeiro.`);
      setConfirmarExclusaoId(null);
      return;
    }

    try {
      await deleteFamilia(String(familia.id));
      toast.success('Família excluída com sucesso!');
    } catch (error) {
      toast.error(mensagemDoErro(error));
    } finally {
      setConfirmarExclusaoId(null);
    }
  };

  const solicitarExclusao = (familia: Familia) => {
    const quantidadeMoradores = moradores.filter(
      (morador) => String(morador.familia) === String(familia.id)
    ).length;
    if (quantidadeMoradores > 0) {
      toast.error(`Não é possível excluir "${familia.nome}": há ${quantidadeMoradores} morador(es) vinculado(s). Transfira-os para outra família primeiro.`);
      return;
    }
    setConfirmarExclusaoId(String(familia.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl md:text-3xl">Gerenciar Famílias</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {familias.length} família{familias.length !== 1 ? 's' : ''} cadastrada{familias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={abrirCadastro}>
          <Plus size={18} /><span className="hidden sm:inline">Nova Família</span><span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Search className="text-muted-foreground shrink-0" size={20} />
            <Input
              type="search"
              placeholder="Buscar por nome, identificação ou responsável"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      {familiasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familiasFiltradas.map((familia) => {
            const moradoresDaFamilia = moradores.filter(
              (morador) => String(morador.familia) === String(familia.id)
            );
            return (
              <Card key={familia.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="bg-primary/10 text-primary p-2.5 rounded-xl shrink-0"><Home size={20} /></span>
                      <h2 className="text-foreground truncate">{familia.nome}</h2>
                    </div>
                    <span className="text-xs bg-secondary/10 text-secondary rounded-full px-2 py-1 shrink-0 flex items-center gap-1">
                      <Users size={13} />{moradoresDaFamilia.length}
                    </span>
                  </div>

                  <dl className="space-y-2 text-sm mb-4">
                    <div><dt className="text-xs text-muted-foreground">Responsável familiar</dt><dd className="text-foreground">{familia.responsavel || 'Não informado'}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Endereço</dt><dd className="text-foreground">{familia.endereco || 'Não informado'}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Identificação</dt><dd className="text-foreground">{familia.id}</dd></div>
                  </dl>

                  <div className="border-t border-border pt-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Moradores vinculados</p>
                    {moradoresDaFamilia.length > 0 ? (
                      <ul className="space-y-1">
                        {moradoresDaFamilia.map((morador) => <li key={morador.id} className="text-sm text-foreground truncate">{morador.nome}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">Nenhum morador vinculado</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(familia)}>
                      <Pencil size={15} /> Editar
                    </Button>
                    {confirmarExclusaoId === String(familia.id) ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => void excluirFamilia(familia)}>Confirmar exclusão</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmarExclusaoId(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => solicitarExclusao(familia)}>
                        <Trash2 size={15} /> Excluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="p-12 text-center">
          <p className="text-muted-foreground">{busca ? 'Nenhuma família encontrada para essa pesquisa.' : 'Nenhuma família cadastrada.'}</p>
        </CardContent></Card>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Fechar formulário" className="absolute inset-0 bg-black/50" onClick={fecharModal} />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-foreground">{familiaEditando ? 'Editar Família' : 'Cadastrar Família'}</h2>
              <button type="button" onClick={fecharModal} className="p-2 hover:bg-muted rounded-lg" aria-label="Fechar"><X size={20} /></button>
            </div>
            <form onSubmit={(event) => void salvarFamilia(event)} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-1">Nome ou identificação da família *</label>
                <Input value={form.nome} onChange={(event) => { setForm((atual) => ({ ...atual, nome: event.target.value })); setErroNome(''); }} maxLength={150} required fullWidth />
                {erroNome && <p className="text-xs text-destructive mt-1">{erroNome}</p>}
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Responsável familiar *</label>
                <select required value={form.responsavelMoradorId} onChange={(event) => {
                  const selecionado = moradores.find((morador) => String(morador.id) === event.target.value);
                  setForm((atual) => ({ ...atual, responsavelMoradorId: event.target.value, responsavel: selecionado?.nome ?? '' }));
                }} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">Selecione um morador cadastrado</option>
                  {moradores.filter((morador) => !morador.familia || String(morador.familia) === String(familiaEditando?.id ?? '')).map((morador) => (
                    <option key={morador.id} value={morador.id}>{morador.nome} · {morador.dataNascimento}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1">Endereço</label>
                <Input value={form.endereco} onChange={(event) => setForm((atual) => ({ ...atual, endereco: event.target.value }))} maxLength={255} fullWidth />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={fecharModal}>Cancelar</Button>
                <Button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar família'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
