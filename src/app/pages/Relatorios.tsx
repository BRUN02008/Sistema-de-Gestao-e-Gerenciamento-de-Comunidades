import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { mockMoradores, mockFamilias, mockAtividades } from '../data/mockData';
import { BarChart3, Download, Users, Home as HomeIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from 'sonner';

export function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('moradores');

  const moradoresPorOcupacao = [
    { ocupacao: 'Pescador', total: mockMoradores.filter(m => m.ocupacao === 'Pescador').length },
    { ocupacao: 'Agricultor', total: mockMoradores.filter(m => m.ocupacao === 'Agricultor').length },
    { ocupacao: 'Artesã', total: mockMoradores.filter(m => m.ocupacao === 'Artesã').length },
    { ocupacao: 'Professor', total: mockMoradores.filter(m => m.ocupacao.includes('Professor')).length },
    { ocupacao: 'Barqueiro', total: mockMoradores.filter(m => m.ocupacao === 'Barqueiro').length },
    { ocupacao: 'Outros', total: mockMoradores.filter(m => !['Pescador', 'Agricultor', 'Artesã', 'Barqueiro'].includes(m.ocupacao) && !m.ocupacao.includes('Professor')).length }
  ].filter(item => item.total > 0);

  const atividadesPorMes = [
    { mes: 'Janeiro', total: 8 },
    { mes: 'Fevereiro', total: 12 },
    { mes: 'Março', total: 15 },
    { mes: 'Abril', total: 10 },
    { mes: 'Maio', total: mockAtividades.length }
  ];

  const handleExportarPDF = () => {
    toast.success('Relatório exportado em PDF com sucesso!');
  };

  const handleExportarExcel = () => {
    toast.success('Relatório exportado em Excel com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Visualize e exporte relatórios comunitários</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Tipo de Relatório"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              options={[
                { value: 'moradores', label: 'Moradores' },
                { value: 'familias', label: 'Famílias' },
                { value: 'atividades', label: 'Atividades' }
              ]}
              fullWidth
            />

            <div className="md:col-span-2 flex items-end gap-2">
              <Button onClick={handleExportarPDF} fullWidth>
                <Download size={20} />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={handleExportarExcel} fullWidth>
                <Download size={20} />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {tipoRelatorio === 'moradores' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Moradores</p>
                    <h2 className="text-foreground">{mockMoradores.length}</h2>
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
                    <p className="text-sm text-muted-foreground mb-1">Idade Média</p>
                    <h2 className="text-foreground">42 anos</h2>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Users className="text-secondary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Moradores Ativos</p>
                    <h2 className="text-foreground">
                      {mockMoradores.filter(m => m.status === 'ativo').length}
                    </h2>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Activity className="text-accent" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Moradores por Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={moradoresPorOcupacao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                  <XAxis dataKey="ocupacao" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#5c8a3e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista Completa de Moradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">CPF</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Ocupação</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMoradores.map((morador) => (
                      <tr key={morador.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 text-sm">{morador.nome}</td>
                        <td className="py-3 px-4 text-sm">{morador.cpf}</td>
                        <td className="py-3 px-4 text-sm">{morador.familia}</td>
                        <td className="py-3 px-4 text-sm">{morador.ocupacao}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${morador.status === 'ativo' ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                            {morador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tipoRelatorio === 'familias' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Famílias</p>
                    <h2 className="text-foreground">{mockFamilias.length}</h2>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <HomeIcon className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Média de Membros</p>
                    <h2 className="text-foreground">
                      {(mockFamilias.reduce((acc, f) => acc + f.totalMembros, 0) / mockFamilias.length).toFixed(1)}
                    </h2>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Users className="text-secondary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Famílias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Família</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Responsável</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Total de Membros</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground">Endereço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockFamilias.map((familia) => (
                      <tr key={familia.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 text-sm">{familia.nome}</td>
                        <td className="py-3 px-4 text-sm">{familia.responsavel}</td>
                        <td className="py-3 px-4 text-sm">{familia.totalMembros}</td>
                        <td className="py-3 px-4 text-sm">{familia.endereco}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tipoRelatorio === 'atividades' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Atividades</p>
                    <h2 className="text-foreground">{mockAtividades.length}</h2>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BarChart3 className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Concluídas</p>
                    <h2 className="text-foreground">
                      {mockAtividades.filter(a => a.status === 'concluida').length}
                    </h2>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Activity className="text-secondary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
                    <h2 className="text-foreground">
                      {mockAtividades.filter(a => a.status === 'pendente').length}
                    </h2>
                  </div>
                  <div className="bg-chart-4/20 p-3 rounded-lg">
                    <Activity style={{ color: '#d4a373' }} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividades por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={atividadesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#5c8a3e" strokeWidth={2} name="Total de Atividades" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
