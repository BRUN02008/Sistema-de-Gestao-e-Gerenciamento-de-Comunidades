import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Users, Home as HomeIcon, FileText, Calendar, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockMoradores, mockFamilias, mockAtividades, mockDocumentos, mockMensalidades } from '../data/mockData';

export function Dashboard() {
  const totalMoradores = mockMoradores.length;
  const totalFamilias = mockFamilias.length;
  const totalDocumentos = mockDocumentos.length;
  const atividadesRecentes = mockAtividades.slice(0, 5);

  const totalMensalidadesPendentes = mockMensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .length;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const valorPendente = mockMensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  const atividadesPorStatus = [
    { name: 'Concluídas', value: mockAtividades.filter(a => a.status === 'concluida').length, color: '#5c8a3e' },
    { name: 'Em Andamento', value: mockAtividades.filter(a => a.status === 'em_andamento').length, color: '#3b7fa4' },
    { name: 'Pendentes', value: mockAtividades.filter(a => a.status === 'pendente').length, color: '#d4a373' }
  ];

  const moradoresPorEscolaridade = [
    { name: 'Sem Escolaridade', total: mockMoradores.filter(m => m.escolaridade === 'Sem Escolaridade').length },
    { name: 'Fund. Incompleto', total: mockMoradores.filter(m => m.escolaridade === 'Fundamental Incompleto').length },
    { name: 'Fund. Completo', total: mockMoradores.filter(m => m.escolaridade === 'Fundamental Completo').length },
    { name: 'Médio Completo', total: mockMoradores.filter(m => m.escolaridade === 'Médio Completo').length },
    { name: 'Superior', total: mockMoradores.filter(m => m.escolaridade === 'Superior Completo').length }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da comunidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Moradores</p>
                <h2 className="text-foreground">{totalMoradores}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Famílias Cadastradas</p>
                <h2 className="text-foreground">{totalFamilias}</h2>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <HomeIcon className="text-secondary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Documentos Emitidos</p>
                <h2 className="text-foreground">{totalDocumentos}</h2>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <FileText className="text-accent" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Atividades Ativas</p>
                <h2 className="text-foreground">{mockAtividades.filter(a => a.status !== 'concluida').length}</h2>
              </div>
              <div className="bg-chart-4/20 p-3 rounded-lg">
                <TrendingUp style={{ color: '#d4a373' }} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Situação Financeira</CardTitle>
            <Link to="/financas">
              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                Ver Detalhes
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="text-primary" size={24} />
                <h4 className="text-foreground">Mensalidades</h4>
              </div>
              <p className="text-2xl text-foreground mb-1">{totalMensalidadesPendentes}</p>
              <p className="text-sm text-muted-foreground">Pendentes/Atrasadas</p>
              <p className="text-sm text-destructive mt-2">
                {formatarMoeda(valorPendente)} a receber
              </p>
            </div>

            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-accent" size={24} />
                <h4 className="text-foreground">Arrecadação</h4>
              </div>
              <p className="text-2xl text-foreground mb-1">
                {mockMensalidades.filter(m => m.status === 'pago').length}
              </p>
              <p className="text-sm text-muted-foreground">Pagamentos recebidos</p>
              <Link to="/financas/mensalidades" className="text-sm text-accent hover:text-accent/80 mt-2 inline-block">
                Gerenciar mensalidades →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Moradores por Escolaridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moradoresPorEscolaridade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#5c8a3e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={atividadesPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {atividadesPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atividades Recentes</CardTitle>
            <Calendar className="text-muted-foreground" size={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atividadesRecentes.map((atividade) => (
              <div
                key={atividade.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-foreground mb-1">{atividade.tipo}</h4>
                  <p className="text-sm text-muted-foreground">{atividade.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Responsável: {atividade.responsavel} • {new Date(atividade.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs
                      ${atividade.status === 'concluida' ? 'bg-primary/20 text-primary' : ''}
                      ${atividade.status === 'em_andamento' ? 'bg-accent/20 text-accent' : ''}
                      ${atividade.status === 'pendente' ? 'bg-chart-4/20' : ''}
                    `}
                    style={atividade.status === 'pendente' ? { color: '#d4a373' } : {}}
                  >
                    {atividade.status === 'concluida' ? 'Concluída' : ''}
                    {atividade.status === 'em_andamento' ? 'Em Andamento' : ''}
                    {atividade.status === 'pendente' ? 'Pendente' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
