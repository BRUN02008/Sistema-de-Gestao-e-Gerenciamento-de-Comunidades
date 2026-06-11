import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  mockMensalidades,
  mockInvestimentos,
  mockDespesas
} from '../data/mockData';

export function Financas() {
  const totalMensalidadesRecebidas = mockMensalidades
    .filter(m => m.status === 'pago')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalMensalidadesPendentes = mockMensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalInvestimentos = mockInvestimentos
    .filter(i => i.status === 'concluido' || i.status === 'em_andamento')
    .reduce((acc, i) => acc + i.valor, 0);

  const totalDespesas = mockDespesas.reduce((acc, d) => acc + d.valor, 0);

  const saldoAtual = totalMensalidadesRecebidas - totalInvestimentos - totalDespesas;

  const mensalidadesPorStatus = [
    {
      name: 'Pagas',
      value: mockMensalidades.filter(m => m.status === 'pago').length,
      color: '#5c8a3e'
    },
    {
      name: 'Pendentes',
      value: mockMensalidades.filter(m => m.status === 'pendente').length,
      color: '#3b7fa4'
    },
    {
      name: 'Atrasadas',
      value: mockMensalidades.filter(m => m.status === 'atrasado').length,
      color: '#c73e1d'
    }
  ];

  const investimentosPorCategoria = [
    {
      categoria: 'Infraestrutura',
      valor: mockInvestimentos.filter(i => i.categoria === 'infraestrutura').reduce((acc, i) => acc + i.valor, 0)
    },
    {
      categoria: 'Educação',
      valor: mockInvestimentos.filter(i => i.categoria === 'educacao').reduce((acc, i) => acc + i.valor, 0)
    },
    {
      categoria: 'Saúde',
      valor: mockInvestimentos.filter(i => i.categoria === 'saude').reduce((acc, i) => acc + i.valor, 0)
    },
    {
      categoria: 'Meio Ambiente',
      valor: mockInvestimentos.filter(i => i.categoria === 'meio_ambiente').reduce((acc, i) => acc + i.valor, 0)
    },
    {
      categoria: 'Outros',
      valor: mockInvestimentos.filter(i => i.categoria === 'outros').reduce((acc, i) => acc + i.valor, 0)
    }
  ].filter(item => item.valor > 0);

  const ultimosInvestimentos = mockInvestimentos
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Finanças</h1>
          <p className="text-muted-foreground">Gestão financeira da comunidade</p>
        </div>
        <div className="flex gap-2">
          <Link to="/financas/mensalidades">
            <Button variant="outline">Ver Mensalidades</Button>
          </Link>
          <Link to="/financas/investimentos">
            <Button>Ver Investimentos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                <h2 className="text-foreground">{formatarMoeda(saldoAtual)}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Wallet className="text-primary" size={24} />
              </div>
            </div>
            {saldoAtual > 0 ? (
              <div className="flex items-center gap-1 text-xs text-primary mt-2">
                <ArrowUpRight size={14} />
                <span>Saldo positivo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-destructive mt-2">
                <ArrowDownRight size={14} />
                <span>Atenção ao saldo</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recebido (Mês)</p>
                <h2 className="text-foreground">{formatarMoeda(totalMensalidadesRecebidas)}</h2>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <TrendingUp className="text-secondary" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockMensalidades.filter(m => m.status === 'pago').length} mensalidades pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">A Receber</p>
                <h2 className="text-foreground">{formatarMoeda(totalMensalidadesPendentes)}</h2>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <Users className="text-accent" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockMensalidades.filter(m => m.status !== 'pago').length} mensalidades pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Investido</p>
                <h2 className="text-foreground">{formatarMoeda(totalInvestimentos)}</h2>
              </div>
              <div className="bg-chart-4/20 p-3 rounded-lg">
                <PiggyBank style={{ color: '#d4a373' }} size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockInvestimentos.filter(i => i.status !== 'cancelado').length} projetos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Mensalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={mensalidadesPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mensalidadesPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimentos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={investimentosPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Bar dataKey="valor" fill="#5c8a3e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos Investimentos</CardTitle>
              <Link to="/financas/investimentos">
                <Button variant="ghost" size="sm">Ver Todos</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimosInvestimentos.map((investimento) => (
                <div
                  key={investimento.id}
                  className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm text-foreground mb-1">{investimento.titulo}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(investimento.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{formatarMoeda(investimento.valor)}</p>
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${investimento.status === 'concluido' ? 'bg-primary/20 text-primary' : ''}
                        ${investimento.status === 'em_andamento' ? 'bg-accent/20 text-accent' : ''}
                        ${investimento.status === 'planejado' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {investimento.status === 'concluido' ? 'Concluído' : ''}
                      {investimento.status === 'em_andamento' ? 'Em Andamento' : ''}
                      {investimento.status === 'planejado' ? 'Planejado' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <p className="text-lg text-foreground">{formatarMoeda(totalMensalidadesRecebidas)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-2 rounded-lg">
                    <TrendingDown className="text-destructive" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <p className="text-lg text-foreground">{formatarMoeda(totalDespesas)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <DollarSign className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Investimentos Realizados</p>
                    <p className="text-lg text-foreground">{formatarMoeda(totalInvestimentos)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Wallet className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Final</p>
                      <p className="text-xl text-foreground">{formatarMoeda(saldoAtual)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
