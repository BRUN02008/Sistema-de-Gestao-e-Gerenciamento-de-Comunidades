import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Users, Home as HomeIcon, FileText, Calendar, TrendingUp, Wallet, ArrowRight, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockMoradores, mockFamilias, mockAtividades, mockDocumentos, mockMensalidades, mockEventos, mockInvestimentos } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

function DashboardAdmin() {
  const totalMoradores = mockMoradores.length;
  const totalFamilias = mockFamilias.length;
  const totalDocumentos = mockDocumentos.length;
  const atividadesRecentes = mockAtividades.slice(0, 5);

  const totalMensalidadesPendentes = mockMensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .length;

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

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
                Ver Detalhes <ArrowRight size={16} />
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
              <p className="text-sm text-destructive mt-2">{formatarMoeda(valorPendente)} a receber</p>
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
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
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
                    className={`px-3 py-1 rounded-full text-xs
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

function DashboardMorador() {
  const { user } = useAuth();

  const minhasMensalidades = mockMensalidades.filter(m => m.moradorId === user?.moradorId);
  const pagas = minhasMensalidades.filter(m => m.status === 'pago');
  const pendentes = minhasMensalidades.filter(m => m.status === 'pendente' || m.status === 'atrasado');
  const meusMeusDocumentos = mockDocumentos.filter(d => d.moradorId === user?.moradorId);
  const familia = mockFamilias.find(f => f.nome === user?.familia);

  const hoje = new Date();
  const proximosEventos = [...mockEventos]
    .filter(e => new Date(e.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const investimentosRecentes = mockInvestimentos.slice(0, 3);

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getMesLabel = (mesRef: string) => {
    const [ano, mes] = mesRef.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="text-primary" size={32} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo(a) ao portal do morador</p>
            <h1 className="text-foreground">{user?.nome}</h1>
            {familia && (
              <p className="text-sm text-muted-foreground">{familia.nome} • {familia.totalMembros} membros • {familia.endereco}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CheckCircle className="text-primary" size={20} />
              </div>
              <p className="text-sm text-muted-foreground">Mensalidades Pagas</p>
            </div>
            <h2 className="text-foreground">{pagas.length}</h2>
            <p className="text-xs text-primary mt-1">{formatarMoeda(pagas.reduce((a, m) => a + m.valor, 0))} pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertCircle className="text-destructive" size={20} />
              </div>
              <p className="text-sm text-muted-foreground">Pendentes/Atrasadas</p>
            </div>
            <h2 className="text-foreground">{pendentes.length}</h2>
            <p className="text-xs text-destructive mt-1">{formatarMoeda(pendentes.reduce((a, m) => a + m.valor, 0))} em aberto</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-accent/10 p-2 rounded-lg">
                <FileText className="text-accent" size={20} />
              </div>
              <p className="text-sm text-muted-foreground">Meus Documentos</p>
            </div>
            <h2 className="text-foreground">{meusMeusDocumentos.length}</h2>
            <Link to="/documentos" className="text-xs text-accent hover:text-accent/80 mt-1 inline-block">
              Ver documentos →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Situação das Mensalidades</CardTitle>
              <Link to="/financas/minha-conta">
                <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                  Ver tudo <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {minhasMensalidades
                .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia))
                .slice(0, 5)
                .map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-foreground capitalize">{getMesLabel(m.mesReferencia)}</p>
                      {m.dataPagamento && (
                        <p className="text-xs text-muted-foreground">
                          Pago em {new Date(m.dataPagamento).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{formatarMoeda(m.valor)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        m.status === 'pago' ? 'bg-primary/20 text-primary' :
                        m.status === 'atrasado' ? 'bg-destructive/20 text-destructive' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {m.status === 'pago' ? 'Pago' : m.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximos Eventos</CardTitle>
              <Link to="/agenda">
                <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                  Ver agenda <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {proximosEventos.length > 0 ? (
              <div className="space-y-3">
                {proximosEventos.map((evento) => (
                  <div key={evento.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-lg text-center min-w-[50px]">
                      <p className="text-primary text-sm">{new Date(evento.data).toLocaleDateString('pt-BR', { day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground uppercase">{new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{evento.titulo}</p>
                      <p className="text-xs text-muted-foreground">{evento.horario} • {evento.local}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investimentos Recentes da Comunidade</CardTitle>
            <Link to="/financas/minha-conta">
              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                Ver todos <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {investimentosRecentes.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-foreground">{inv.titulo}</p>
                  <p className="text-xs text-muted-foreground">{formatarData(inv.data)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{formatarMoeda(inv.valor)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    inv.status === 'concluido' ? 'bg-primary/20 text-primary' :
                    inv.status === 'em_andamento' ? 'bg-secondary/20 text-secondary' :
                    'bg-accent/20 text-accent'
                  }`}>
                    {inv.status === 'concluido' ? 'Concluído' : inv.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
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

export function Dashboard() {
  const { user } = useAuth();
  const isMorador = user?.role === 'visualizador';

  return isMorador ? <DashboardMorador /> : <DashboardAdmin />;
}
