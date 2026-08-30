import { useNavigate, useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';
import { ArrowLeft , Edit, Trash2 , Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText, User as UserIcon, HeartPulse, Car } from 'lucide-react';

export function MoradorDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { moradores, documentos, deleteMorador } = useData();
  const morador = moradores.find((m) => m.id === id);

  if (!morador) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/moradores')}>
          <ArrowLeft size={20} />
          Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Morador não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleExcluir = async () => {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir o morador "${morador.nome}"?`
  );

  if (!confirmar) return;

  try {
    await deleteMorador(morador.id);

    toast.success('Morador excluído com sucesso!');
    navigate('/moradores');
  } catch {
    toast.error('Não foi possível excluir o morador.');
  }
};

  const documentosMorador = documentos.filter(
    (d) => d.moradorId === morador.id || d.morador === morador.nome
  );

  return (
    <div className="space-y-6">
  <div className="flex items-start justify-between gap-3">

    <div className="flex items-center gap-3 min-w-0">
      <Button
        variant="ghost"
        onClick={() => navigate('/moradores')}
        size="sm"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Voltar</span>
      </Button>

      <div className="min-w-0">
        <h1 className="text-foreground text-lg md:text-2xl truncate">
          {morador.nome}
        </h1>

        <p className="text-muted-foreground text-xs md:text-sm">
          Perfil do Morador · {morador.familia}
        </p>
      </div>
    </div>

    {/* BOTÕES */}
    <div className="flex items-center gap-2 shrink-0">

      <Link to={`/moradores/${morador.id}/editar`}>
        <Button size="sm">
          <Edit size={16} />
          <span className="hidden sm:inline">Editar</span>
        </Button>
      </Link>

      <Button onClick={handleExcluir} size="sm">
        <Trash2 size={18} />
        <span className="hidden sm:inline">Excluir</span>
      </Button>

    </div>

  </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                <span
                  className={`
                    px-3 py-1 rounded-full text-sm
                    ${morador.status === 'ativo' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {morador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <UserIcon className="text-primary" size={24} />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="text-foreground">{morador.nome}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Data de Nascimento</p>
                    <p className="text-foreground">
                      {new Date(morador.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calcularIdade(morador.dataNascimento)} anos
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">CPF</p>
                    <p className="text-foreground">{morador.cpf}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">RG</p>
                    <p className="text-foreground">{morador.rg}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      <p className="text-foreground">{morador.telefone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Comunitárias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-primary" />
                    <p className="text-sm text-muted-foreground">Família</p>
                  </div>
                  <p className="text-foreground">{morador.familia}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                  <p className="text-foreground">{morador.endereco}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase size={16} className="text-primary" />
                    <p className="text-sm text-muted-foreground">Ocupação</p>
                  </div>
                  <p className="text-foreground">{morador.ocupacao}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap size={16} className="text-primary" />
                    <p className="text-sm text-muted-foreground">Escolaridade</p>
                  </div>
                  <p className="text-foreground">{morador.escolaridade}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-primary" />
                    <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                  </div>
                  <p className="text-foreground">
                    {new Date(morador.dataCadastro).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comorbidade */}
          {morador.comorbidade && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse size={18} className="text-destructive" />
                  Saúde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Comorbidade / Condição de Saúde</p>
                  <p className="text-foreground">{morador.comorbidade}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Veículo */}
          {morador.veiculo?.tipo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car size={18} className="text-accent" />
                  Acesso ao Balneário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Tipo</p>
                    <p className="text-foreground text-sm">{morador.veiculo.tipo}</p>
                  </div>
                  {morador.veiculo.modelo && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-0.5">Modelo</p>
                      <p className="text-foreground text-sm">{morador.veiculo.modelo}</p>
                    </div>
                  )}
                  {morador.veiculo.cor && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-0.5">Cor</p>
                      <p className="text-foreground text-sm">{morador.veiculo.cor}</p>
                    </div>
                  )}
                  {morador.veiculo.placa && (
                    <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Placa / Identificação</p>
                      <p className="text-foreground font-mono">{morador.veiculo.placa}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: documents */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Documentos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {documentosMorador.length > 0 ? (
                <div className="space-y-3">
                  {documentosMorador.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="text-primary mt-1" size={16} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">{doc.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-2 text-muted-foreground" size={32} />
                  <p className="text-sm text-muted-foreground">
                    Nenhum documento encontrado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
