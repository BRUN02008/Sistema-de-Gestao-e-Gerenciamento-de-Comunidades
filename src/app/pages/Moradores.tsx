import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Eye, Edit, Phone, MapPin, Car } from 'lucide-react';

export function Moradores() {
  const [busca, setBusca] = useState('');
  const { moradores } = useData();

  const moradoresFiltrados = moradores.filter((morador) =>
    morador.nome.toLowerCase().includes(busca.toLowerCase()) ||
    morador.cpf.includes(busca) ||
    morador.familia.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
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
              placeholder="Buscar por nome, CPF ou família..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              fullWidth
            />
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
                  <MapPin size={16} />
                  <span>{morador.familia}</span>
                </div>
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
