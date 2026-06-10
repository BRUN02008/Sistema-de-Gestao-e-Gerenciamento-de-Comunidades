import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { mockMensalidades, VALOR_MENSALIDADE } from '../data/mockData';
import type { Mensalidade } from '../data/mockData';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle, DollarSign, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Mensalidades() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>(mockMensalidades);

  const mensalidadesFiltradas = mensalidades.filter((m) => {
    const matchBusca =
      m.moradorNome.toLowerCase().includes(busca.toLowerCase()) ||
      m.familia.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === 'todos' || m.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  const totalPago = mensalidades
    .filter(m => m.status === 'pago')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalPendente = mensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="text-primary" size={20} />;
      case 'pendente':
        return <Clock className="text-accent" size={20} />;
      case 'atrasado':
        return <AlertCircle className="text-destructive" size={20} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pago: 'Pago',
      pendente: 'Pendente',
      atrasado: 'Atrasado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pago: 'bg-primary/20 text-primary',
      pendente: 'bg-accent/20 text-accent',
      atrasado: 'bg-destructive/20 text-destructive'
    };
    return colors[status] || '';
  };

  const handleRegistrarPagamento = (mensalidadeId: string) => {
    setMensalidades(prev =>
      prev.map(m =>
        m.id === mensalidadeId
          ? { ...m, status: 'pago', dataPagamento: new Date().toISOString().split('T')[0], metodoPagamento: 'dinheiro' }
          : m
      )
    );
    toast.success('Pagamento registrado com sucesso!');
  };

  const handleExportar = () => {
    toast.success('Relatório de mensalidades exportado!');
  };

  const mensalidadesOrdenadas = [...mensalidadesFiltradas].sort((a, b) => {
    if (a.status === 'atrasado' && b.status !== 'atrasado') return -1;
    if (a.status !== 'atrasado' && b.status === 'atrasado') return 1;
    if (a.status === 'pendente' && b.status === 'pago') return -1;
    if (a.status === 'pago' && b.status === 'pendente') return 1;
    return new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime();
  });

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
            <h1 className="text-foreground mb-2">Mensalidades</h1>
            <p className="text-muted-foreground">Controle de pagamentos mensais dos moradores</p>
          </div>
        </div>
        <Button onClick={handleExportar}>
          <Download size={20} />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Mensalidade</p>
                <h2 className="text-foreground">{formatarMoeda(VALOR_MENSALIDADE)}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <DollarSign className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                <h2 className="text-foreground">{formatarMoeda(totalPago)}</h2>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <CheckCircle className="text-secondary" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mensalidades.filter(m => m.status === 'pago').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">A Receber</p>
                <h2 className="text-foreground">{formatarMoeda(totalPendente)}</h2>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <Clock className="text-accent" size={24} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mensalidades.filter(m => m.status !== 'pago').length} pendências
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex items-center gap-2">
              <Search className="text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar por morador ou família..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                fullWidth
              />
            </div>

            <Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos os Status' },
                { value: 'pago', label: 'Pagos' },
                { value: 'pendente', label: 'Pendentes' },
                { value: 'atrasado', label: 'Atrasados' }
              ]}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mensalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Morador</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Mês Ref.</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Vencimento</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Valor</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mensalidadesOrdenadas.map((mensalidade) => (
                  <tr key={mensalidade.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <p className="text-sm text-foreground">{mensalidade.moradorNome}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-muted-foreground">{mensalidade.familia}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-foreground">
                        {new Date(mensalidade.mesReferencia + '-01').toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-foreground">
                        {new Date(mensalidade.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-foreground">{formatarMoeda(mensalidade.valor)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(mensalidade.status)}
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(mensalidade.status)}`}>
                          {getStatusLabel(mensalidade.status)}
                        </span>
                      </div>
                      {mensalidade.dataPagamento && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pago em: {new Date(mensalidade.dataPagamento).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {mensalidade.status !== 'pago' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRegistrarPagamento(mensalidade.id)}
                        >
                          Registrar Pagamento
                        </Button>
                      )}
                      {mensalidade.status === 'pago' && mensalidade.metodoPagamento && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {mensalidade.metodoPagamento}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {mensalidadesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma mensalidade encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
