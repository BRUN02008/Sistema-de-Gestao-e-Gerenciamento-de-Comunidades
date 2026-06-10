import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { mockInvestimentos, mockDespesas } from '../data/mockData';
import type { Investimento, Despesa } from '../data/mockData';
import { ArrowLeft, Plus, TrendingDown, PiggyBank, Wrench, Zap, Droplet, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Investimentos() {
  const [aba, setAba] = useState<'investimentos' | 'despesas'>('investimentos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [investimentos] = useState<Investimento[]>(mockInvestimentos);
  const [despesas] = useState<Despesa[]>(mockDespesas);

  const totalInvestimentos = investimentos
    .filter(i => i.status === 'concluido' || i.status === 'em_andamento')
    .reduce((acc, i) => acc + i.valor, 0);

  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);

  const investimentosFiltrados = filtroCategoria === 'todos'
    ? investimentos
    : investimentos.filter(i => i.categoria === filtroCategoria);

  const despesasFiltradas = filtroCategoria === 'todos'
    ? despesas
    : despesas.filter(d => d.categoria === filtroCategoria);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getCategoriaIconInvestimento = (categoria: string) => {
    const icons: Record<string, ReactNode> = {
      infraestrutura: <Wrench className="text-primary" size={24} />,
      educacao: <Package className="text-secondary" size={24} />,
      saude: <Package className="text-accent" size={24} />,
      meio_ambiente: <Package className="text-chart-5" size={24} />,
      outros: <Package className="text-muted-foreground" size={24} />
    };
    return icons[categoria] || icons.outros;
  };

  const getCategoriaIconDespesa = (categoria: string) => {
    const icons: Record<string, ReactNode> = {
      manutencao: <Wrench className="text-primary" size={24} />,
      energia: <Zap className="text-accent" size={24} />,
      agua: <Droplet className="text-chart-2" size={24} />,
      material: <Package className="text-secondary" size={24} />,
      evento: <Package className="text-chart-4" size={24} />,
      outros: <Package className="text-muted-foreground" size={24} />
    };
    return icons[categoria] || icons.outros;
  };

  const getCategoriaLabelInvestimento = (categoria: string) => {
    const labels: Record<string, string> = {
      infraestrutura: 'Infraestrutura',
      educacao: 'Educação',
      saude: 'Saúde',
      meio_ambiente: 'Meio Ambiente',
      outros: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaLabelDespesa = (categoria: string) => {
    const labels: Record<string, string> = {
      manutencao: 'Manutenção',
      energia: 'Energia',
      agua: 'Água',
      material: 'Material',
      evento: 'Evento',
      outros: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      concluido: 'bg-primary/20 text-primary',
      em_andamento: 'bg-accent/20 text-accent',
      planejado: 'bg-secondary/20 text-secondary',
      cancelado: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || '';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      concluido: 'Concluído',
      em_andamento: 'Em Andamento',
      planejado: 'Planejado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const despesasPorCategoria = [
    { categoria: 'Manutenção', valor: despesas.filter(d => d.categoria === 'manutencao').reduce((acc, d) => acc + d.valor, 0) },
    { categoria: 'Energia', valor: despesas.filter(d => d.categoria === 'energia').reduce((acc, d) => acc + d.valor, 0) },
    { categoria: 'Material', valor: despesas.filter(d => d.categoria === 'material').reduce((acc, d) => acc + d.valor, 0) },
    { categoria: 'Evento', valor: despesas.filter(d => d.categoria === 'evento').reduce((acc, d) => acc + d.valor, 0) },
    { categoria: 'Outros', valor: despesas.filter(d => d.categoria === 'outros').reduce((acc, d) => acc + d.valor, 0) }
  ].filter(item => item.valor > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/financas">
            <Button variant="ghost">
              <ArrowLeft size={20} />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-foreground mb-2">Investimentos & Despesas</h1>
            <p className="text-muted-foreground">Gestão de investimentos e despesas comunitárias</p>
          </div>
        </div>
        <Button>
          <Plus size={20} />
          {aba === 'investimentos' ? 'Novo Investimento' : 'Nova Despesa'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Investido</p>
                <h2 className="text-foreground">{formatarMoeda(totalInvestimentos)}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <PiggyBank className="text-primary" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {investimentos.filter(i => i.status !== 'cancelado').length} projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Despesas</p>
                <h2 className="text-foreground">{formatarMoeda(totalDespesas)}</h2>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg">
                <TrendingDown className="text-destructive" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {despesas.length} despesas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setAba('investimentos')}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${aba === 'investimentos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }
              `}
            >
              Investimentos
            </button>
            <button
              onClick={() => setAba('despesas')}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${aba === 'despesas'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }
              `}
            >
              Despesas
            </button>
          </div>

          <Select
            label="Filtrar por Categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            options={
              aba === 'investimentos'
                ? [
                    { value: 'todos', label: 'Todas as Categorias' },
                    { value: 'infraestrutura', label: 'Infraestrutura' },
                    { value: 'educacao', label: 'Educação' },
                    { value: 'saude', label: 'Saúde' },
                    { value: 'meio_ambiente', label: 'Meio Ambiente' },
                    { value: 'outros', label: 'Outros' }
                  ]
                : [
                    { value: 'todos', label: 'Todas as Categorias' },
                    { value: 'manutencao', label: 'Manutenção' },
                    { value: 'energia', label: 'Energia' },
                    { value: 'agua', label: 'Água' },
                    { value: 'material', label: 'Material' },
                    { value: 'evento', label: 'Evento' },
                    { value: 'outros', label: 'Outros' }
                  ]
            }
            fullWidth
          />
        </CardContent>
      </Card>

      {aba === 'investimentos' && (
        <>
          <div className="grid grid-cols-1 gap-4">
            {investimentosFiltrados.map((investimento) => (
              <Card key={investimento.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      {getCategoriaIconInvestimento(investimento.categoria)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-foreground mb-1">{investimento.titulo}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{investimento.descricao}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl text-foreground mb-1">{formatarMoeda(investimento.valor)}</p>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(investimento.status)}`}>
                            {getStatusLabel(investimento.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Categoria:</span> {getCategoriaLabelInvestimento(investimento.categoria)}
                        </div>
                        <div>
                          <span className="font-medium">Data:</span>{' '}
                          {new Date(investimento.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span> {investimento.responsavel}
                        </div>
                      </div>

                      {investimento.observacoes && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Observações:</span> {investimento.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {investimentosFiltrados.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <PiggyBank className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Nenhum investimento encontrado</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {aba === 'despesas' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={despesasPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Legend />
                  <Bar dataKey="valor" fill="#c73e1d" radius={[8, 8, 0, 0]} name="Valor (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {despesasFiltradas.map((despesa) => (
              <Card key={despesa.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-destructive/10 p-3 rounded-lg">
                      {getCategoriaIconDespesa(despesa.categoria)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-foreground mb-1">{despesa.descricao}</h3>
                          <span className="px-2 py-1 rounded text-xs bg-destructive/20 text-destructive">
                            {getCategoriaLabelDespesa(despesa.categoria)}
                          </span>
                        </div>
                        <p className="text-xl text-destructive ml-4">{formatarMoeda(despesa.valor)}</p>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Data:</span>{' '}
                          {new Date(despesa.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span> {despesa.responsavel}
                        </div>
                        {despesa.comprovante && (
                          <div>
                            <span className="font-medium">Comprovante:</span> {despesa.comprovante}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {despesasFiltradas.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingDown className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
