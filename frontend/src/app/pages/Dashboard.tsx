import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Users, Home as HomeIcon, FileText, TrendingUp, ArrowRight, Clock, User, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useData } from '../components/contexts/DataContext';
import { useAuth } from '../components/contexts/AuthContext';

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1 leading-tight">{label}</p>
            <p className="text-2xl text-foreground leading-none">{value}</p>
          </div>
          <div className={`${color} p-2.5 rounded-xl shrink-0 ml-2`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardAdmin() {
  const { moradores, familias, atividades, documentos, atividadesCarregando, atividadesErro } = useData();

  const atividadesPorStatus = [
    { name: 'Concluídas', value: atividades.filter(a => a.status === 'concluida').length, color: '#5c8a3e' },
    { name: 'Andamento', value: atividades.filter(a => a.status === 'em_andamento').length, color: '#3b7fa4' },
    { name: 'Pendentes', value: atividades.filter(a => a.status === 'pendente').length, color: '#d4a373' }
  ];

  const moradoresPorEscolaridade = [
    { name: 'Sem', total: moradores.filter(m => m.escolaridade === 'Sem Escolaridade').length },
    { name: 'Fund. Inc.', total: moradores.filter(m => m.escolaridade === 'Fundamental Incompleto').length },
    { name: 'Fund. Comp.', total: moradores.filter(m => m.escolaridade === 'Fundamental Completo').length },
    { name: 'Médio', total: moradores.filter(m => m.escolaridade === 'Médio Completo').length },
    { name: 'Superior', total: moradores.filter(m => m.escolaridade === 'Superior Completo').length }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground text-xl md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Visão geral da comunidade</p>
      </div>

      {/* Stat cards — 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Moradores" value={moradores.length} icon={<Users size={20} className="text-primary" />} color="bg-primary/10" />
        <StatCard label="Famílias" value={familias.length} icon={<HomeIcon size={20} className="text-secondary" />} color="bg-secondary/10" />
        <StatCard label="Documentos" value={documentos.length} icon={<FileText size={20} className="text-accent" />} color="bg-accent/10" />
        <StatCard label="Atividades" value={atividades.filter(a => a.status !== 'concluida').length} icon={<TrendingUp size={20} style={{ color: '#d4a373' }} />} color="bg-amber-100/60" />
      </div>

      {/* Charts — stacked on mobile, side by side on large */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Moradores por Escolaridade</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moradoresPorEscolaridade} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" fill="#5c8a3e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status das Atividades</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={atividadesPorStatus} cx="50%" cy="45%" labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={70} dataKey="value">
                  {atividadesPorStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Atividades recentes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Atividades Recentes</CardTitle>
            <Calendar size={18} className="text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {atividades.slice(0, 5).map((atividade) => (
              <div key={atividade.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{atividade.tipo}</p>
                  <p className="text-xs text-muted-foreground truncate">{atividade.responsavel} · {new Date(atividade.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs
                  ${atividade.status === 'concluida' ? 'bg-primary/20 text-primary' : ''}
                  ${atividade.status === 'em_andamento' ? 'bg-accent/20 text-accent' : ''}
                  ${atividade.status === 'pendente' ? 'bg-amber-100 text-amber-700' : ''}`}>
                  {atividade.status === 'concluida' ? 'Concluída' : atividade.status === 'em_andamento' ? 'Andamento' : 'Pendente'}
                </span>
              </div>
            ))}
            {atividadesCarregando && (
              <p className="text-center py-6 text-sm text-muted-foreground">Carregando atividades...</p>
            )}
            {!atividadesCarregando && atividadesErro && (
              <p className="text-center py-6 text-sm text-destructive">Não foi possível carregar as atividades.</p>
            )}
            {!atividadesCarregando && !atividadesErro && atividades.length === 0 && (
              <p className="text-center py-6 text-sm text-muted-foreground">Nenhuma atividade recente registrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardMorador() {
  const { user } = useAuth();
  const { documentos, familias, eventos } = useData();
  const meusDocumentos = documentos.filter(d => d.moradorId === user?.moradorId);
  const familia = familias.find(f => f.nome === user?.familia);

  const hoje = new Date();
  const proximosEventos = [...eventos]
    .filter(e => new Date(e.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="text-primary" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Portal do Morador</p>
            <h2 className="text-foreground text-base truncate">{user?.nome}</h2>
            {familia && <p className="text-xs text-muted-foreground truncate">{familia.nome} · {familia.totalMembros} membros</p>}
          </div>
        </div>
      </div>

      <StatCard label="Meus Documentos" value={meusDocumentos.length} icon={<FileText size={20} className="text-accent" />} color="bg-accent/10" />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Próximos Eventos</CardTitle>
            <Link to="/agenda" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">Agenda <ArrowRight size={14} /></Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {proximosEventos.length > 0 ? (
            <div className="space-y-2">
              {proximosEventos.map((evento) => (
                <div key={evento.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="bg-primary/10 p-2 rounded-lg text-center min-w-[44px] shrink-0">
                    <p className="text-primary text-sm leading-none">{new Date(evento.data).toLocaleDateString('pt-BR', { day: 'numeric' })}</p>
                    <p className="text-xs text-muted-foreground uppercase">{new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">{evento.horario} · {evento.local}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto mb-2 text-muted-foreground" size={28} />
              <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'visualizador' ? <DashboardMorador /> : <DashboardAdmin />;
}
