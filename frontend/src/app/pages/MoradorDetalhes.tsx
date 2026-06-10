import { useNavigate, useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { mockMoradores, mockDocumentos } from '../data/mockData';
import { ArrowLeft, Edit, Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText, User as UserIcon } from 'lucide-react';

export function MoradorDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const morador = mockMoradores.find((m) => m.id === id);

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

  const documentosMorador = mockDocumentos.filter(
    (d) => d.morador === morador.nome
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/moradores')}>
            <ArrowLeft size={20} />
            Voltar
          </Button>
          <div>
            <h1 className="text-foreground mb-2">Perfil do Morador</h1>
            <p className="text-muted-foreground">Informações detalhadas</p>
          </div>
        </div>
        <Link to={`/moradores/${morador.id}/editar`}>
          <Button>
            <Edit size={20} />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>

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
