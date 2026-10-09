import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useData } from '../components/contexts/DataContext';
import { Plus, Search, Eye, Edit, Phone, Car } from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function extrairAnoMes(dataCadastro: string): { ano: number; mes: number } | null {
  if (typeof dataCadastro !== 'string') return null;
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/.exec(dataCadastro);
  if (!correspondencia) return null;

  const ano = Number(correspondencia[1]);
  const mes = Number(correspondencia[2]);
  const dia = Number(correspondencia[3]);
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasNoMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes[mes - 1]) return null;
  return { ano, mes };
}

export function Moradores() {
  const [busca, setBusca] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('todos');
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const { moradores } = useData();

  const anosDisponiveis = Array.from(new Set(
    moradores
      .map((morador) => extrairAnoMes(morador.dataCadastro)?.ano)
      .filter((ano): ano is number => ano !== undefined)
  )).sort((a, b) => b - a);

  const moradoresFiltrados = moradores.filter((morador) => {
    const textoBusca = busca.toLowerCase();
    const correspondeBusca =
      morador.nome.toLowerCase().includes(textoBusca) ||
      morador.cpf.includes(busca) ||
      (morador.familia ?? '').toLowerCase().includes(textoBusca);
    const dataCadastro = extrairAnoMes(morador.dataCadastro);
    const correspondeAno = anoSelecionado === 'todos' || dataCadastro?.ano === Number(anoSelecionado);
    const correspondeMes = mesSelecionado === 'todos' || dataCadastro?.mes === Number(mesSelecionado);

    return correspondeBusca && correspondeAno && correspondeMes;
  });

  const limparFiltros = () => {
    setBusca('');
    setAnoSelecionado('todos');
    setMesSelecionado('todos');
  };

  const calcularIdade = (dataNascimento: string) => {
  if (!dataNascimento) return null;

  let nascimento: Date;

  // Data no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);
    nascimento = new Date(ano, mes - 1, dia);
  }
  // Data no formato DD/MM/YYYY
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)) {
    const [dia, mes, ano] = dataNascimento.split('/').map(Number);
    nascimento = new Date(ano, mes - 1, dia);
  }
  else {
    nascimento = new Date(dataNascimento);
  }

  if (isNaN(nascimento.getTime())) {
    return null;
  }

  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();

  if (
    mes < 0 ||
    (mes === 0 && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return idade;
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl md:text-3xl">Moradores</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {moradores.length} cadastrado{moradores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/moradores/novo" className="shrink-0">
          <Button size="sm">
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Morador</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Search className="text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Buscar por nome ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              fullWidth
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
            <div className="w-full sm:w-48">
              <label className="mb-1.5 block text-sm text-foreground">Ano</label>
              <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
                <SelectTrigger aria-label="Filtrar por ano">
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label className="mb-1.5 block text-sm text-foreground">Mês</label>
              <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                <SelectTrigger aria-label="Filtrar por mês">
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {MESES.map((mes, index) => (
                    <SelectItem key={mes} value={String(index + 1)}>{mes}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moradoresFiltrados.map((morador) => (
          <Card key={morador.id} hover>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-foreground mb-1">{morador.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {calcularIdade(morador.dataNascimento)} anos
                  </p>
                </div>
                <span
                  className={`
                    px-2 py-1 rounded text-xs
                    ${morador.status === 'ativo' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {morador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={16} />
                  <span>{morador.telefone}</span>
                </div>
              </div>

              <div className="bg-muted/50 px-3 py-2 rounded-lg mb-4">
                <p className="text-sm text-foreground">{morador.ocupacao}</p>
                <p className="text-xs text-muted-foreground mt-1">{morador.escolaridade}</p>
              </div>

              {morador.veiculo?.tipo && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg">
                  <Car size={14} className="text-accent shrink-0" />
                  <p className="text-xs text-accent truncate">
                    {[morador.veiculo.tipo, morador.veiculo.modelo, morador.veiculo.placa].filter(Boolean).join(' · ')}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Link to={`/moradores/${morador.id}`} className="flex-1">
                  <Button variant="outline" fullWidth size="sm">
                    <Eye size={16} />
                    Ver Mais
                  </Button>
                </Link>
                <Link to={`/moradores/${morador.id}/editar`} className="flex-1">
                  <Button variant="ghost" fullWidth size="sm">
                    <Edit size={16} />
                    Editar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {moradoresFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum morador encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
