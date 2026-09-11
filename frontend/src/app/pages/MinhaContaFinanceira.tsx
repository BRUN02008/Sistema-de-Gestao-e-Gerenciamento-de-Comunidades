import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { VALOR_MENSALIDADE } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Leaf,
  BookOpen,
  Heart,
  TreePine,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  infraestrutura: <TrendingUp size={18} />,
  educacao: <BookOpen size={18} />,
  saude: <Heart size={18} />,
  meio_ambiente: <TreePine size={18} />,
  outros: <MoreHorizontal size={18} />
};

const CATEGORIA_COLORS: Record<string, string> = {
  infraestrutura: 'bg-secondary/20 text-secondary',
  educacao: 'bg-primary/20 text-primary',
  saude: 'bg-destructive/20 text-destructive',
  meio_ambiente: 'bg-primary/10 text-primary',
  outros: 'bg-muted text-muted-foreground'
};

const CATEGORIA_LABELS: Record<string, string> = {
  infraestrutura: 'Infraestrutura',
  educacao: 'Educação',
  saude: 'Saúde',
  meio_ambiente: 'Meio Ambiente',
  outros: 'Outros'
};

const STATUS_INV_LABELS: Record<string, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

const STATUS_INV_COLORS: Record<string, string> = {
  planejado: 'bg-accent/20 text-accent',
  em_andamento: 'bg-secondary/20 text-secondary',
  concluido: 'bg-primary/20 text-primary',
  cancelado: 'bg-muted text-muted-foreground'
};

export function MinhaContaFinanceira() {
  const { user } = useAuth();
  const { mensalidades, investimentos, familias, dependentes: allDependentes, moradores } = useData();
  const [mostrarTodasMensalidades, setMostrarTodasMensalidades] = useState(false);

 const minhasMensalidades = mensalidades
  .filter(
    m => String(m.moradorId) === String(user?.moradorId)
  )
  .sort((a, b) =>
    b.mesReferencia.localeCompare(a.mesReferencia)
  );

const pagas = minhasMensalidades.filter(
  m => m.status === 'pago'
);

const pendentes = minhasMensalidades.filter(
  m => m.status === 'pendente'
);

const atrasadas = minhasMensalidades.filter(
  m => m.status === 'atrasado'
);

const totalPago = pagas.reduce(
  (a, m) => a + m.valor,
  0
);

const totalDevido = [...pendentes, ...atrasadas].reduce(
  (a, m) => a + m.valor,
  0
);

const familia = familias.find(
  f => f.nome === user?.familia
);

const morador = moradores.find(
  m => String(m.id) === String(user?.moradorId)
);

const dependentes = allDependentes.filter(
  d =>
    String(d.moradorResponsavelId) ===
    String(user?.moradorId)
);

  const mensalidadesExibidas = mostrarTodasMensalidades
    ? minhasMensalidades
    : minhasMensalidades.slice(0, 5);

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const getMesLabel = (mesRef: string) => {
    const [ano, mes] = mesRef.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const investimentosAtivos = investimentos.filter(
  inv => inv.status !== 'cancelado'
);

const investimentosPorCategoria = investimentosAtivos.reduce(
  (acc, inv) => {
    acc[inv.categoria] =
      (acc[inv.categoria] || 0) + inv.valor;

    return acc;
  },
  {} as Record<string, number>
);

const totalInvestido = investimentosAtivos.reduce(
  (a, i) => a + i.valor,
  0
);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Minhas Finanças</h1>
        <p className="text-muted-foreground">Acompanhe suas mensalidades e veja onde o dinheiro da comunidade é investido</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CheckCircle className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <h3 className="text-foreground">{formatarMoeda(totalPago)}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{pagas.length} mensalidade(s) quitada(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertCircle className="text-destructive" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Aberto</p>
                <h3 className="text-foreground">{formatarMoeda(totalDevido)}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {pendentes.length} pendente(s) • {atrasadas.length} atrasada(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Wallet className="text-accent" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mensalidade Mensal</p>
                <h3 className="text-foreground">{formatarMoeda(VALOR_MENSALIDADE)}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">por família / mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da família */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Minha Família
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {morador && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{morador.nome}</p>
                    <p className="text-xs text-muted-foreground">Responsável pela família • CPF: {morador.cpf}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Ocupação: {morador.ocupacao}</span>
                  <span>Endereço: {morador.endereco}</span>
                </div>
              </div>
            )}

            {familia && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-secondary" />
                  <span className="text-sm text-foreground">{familia.nome}</span>
                </div>
                <span className="text-xs text-muted-foreground">
  {familia.total_membros} membros
</span>
              </div>
            )}

            {dependentes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Dependentes</p>
                {dependentes.map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                        <User className="text-secondary" size={14} />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{dep.nome}</p>
                        <p className="text-xs text-muted-foreground">{dep.parentesco}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(dep.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhum dependente cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de mensalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Histórico de Mensalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {minhasMensalidades.length > 0 ? (
              <div className="space-y-3">
                {mensalidadesExibidas.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm text-foreground capitalize">{getMesLabel(m.mesReferencia)}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.status === 'pago' && m.dataPagamento
                          ? `Pago em ${new Date(m.dataPagamento).toLocaleDateString('pt-BR')} via ${m.metodoPagamento || 'dinheiro'}`
                          : m.status === 'atrasado'
                          ? `Venceu em ${new Date(m.dataVencimento).toLocaleDateString('pt-BR')}`
                          : `Vence em ${new Date(m.dataVencimento).toLocaleDateString('pt-BR')}`}
                      </p>
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

                {minhasMensalidades.length > 5 && (
                  <button
                    onClick={() => setMostrarTodasMensalidades(!mostrarTodasMensalidades)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 w-full justify-center py-2"
                  >
                    {mostrarTodasMensalidades ? (
                      <>Ver menos <ChevronUp size={16} /></>
                    ) : (
                      <>Ver todos os {minhasMensalidades.length} meses <ChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">Nenhuma mensalidade registrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de investimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf size={20} />
            Onde sua mensalidade é investida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg mb-6">
            <Info className="text-primary mt-0.5 shrink-0" size={18} />
            <p className="text-sm text-muted-foreground">
              As mensalidades recolhidas de todas as famílias são usadas para melhorar a vida da comunidade.
              Total investido: <span className="text-foreground font-medium">{formatarMoeda(totalInvestido)}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {Object.entries(investimentosPorCategoria).map(([cat, valor]) => (
              <div key={cat} className={`p-3 rounded-lg text-center ${CATEGORIA_COLORS[cat]}`}>
                <div className="flex justify-center mb-1">
                  {CATEGORIA_ICONS[cat]}
                </div>
                <p className="text-xs">{CATEGORIA_LABELS[cat]}</p>
                <p className="text-sm mt-1">{formatarMoeda(valor)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm text-foreground">Projetos da Comunidade</h4>
            {investimentosAtivos.map((inv) => (
              <div key={inv.id} className="p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-md ${CATEGORIA_COLORS[inv.categoria]}`}>
                      {CATEGORIA_ICONS[inv.categoria]}
                    </span>
                    <div>
                      <p className="text-sm text-foreground">{inv.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.data).toLocaleDateString('pt-BR')} • {inv.responsavel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{formatarMoeda(inv.valor)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_INV_COLORS[inv.status]}`}>
                      {STATUS_INV_LABELS[inv.status]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{inv.descricao}</p>
                {inv.observacoes && (
                  <p className="text-xs text-muted-foreground ml-8 mt-1 italic">"{inv.observacoes}"</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
