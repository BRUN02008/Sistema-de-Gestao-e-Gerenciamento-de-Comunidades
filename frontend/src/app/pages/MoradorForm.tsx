import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { mockMoradores, mockFamilias } from '../data/mockData';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export function MoradorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const moradorExistente = isEditing ? mockMoradores.find((m) => m.id === id) : null;

  const [formData, setFormData] = useState({
    nome: moradorExistente?.nome || '',
    dataNascimento: moradorExistente?.dataNascimento || '',
    cpf: moradorExistente?.cpf || '',
    rg: moradorExistente?.rg || '',
    familia: moradorExistente?.familia || '',
    telefone: moradorExistente?.telefone || '',
    ocupacao: moradorExistente?.ocupacao || '',
    escolaridade: moradorExistente?.escolaridade || '',
    endereco: moradorExistente?.endereco || '',
    status: moradorExistente?.status || 'ativo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      toast.success('Morador atualizado com sucesso!');
    } else {
      toast.success('Morador cadastrado com sucesso!');
    }

    setTimeout(() => {
      navigate('/moradores');
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/moradores')}>
          <ArrowLeft size={20} />
          Voltar
        </Button>
        <div>
          <h1 className="text-foreground mb-2">
            {isEditing ? 'Editar Morador' : 'Novo Morador'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do morador' : 'Cadastre um novo morador na comunidade'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo *"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                  fullWidth
                />
              </div>

              <Input
                label="Data de Nascimento *"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                required
                fullWidth
              />

              <Input
                label="CPF *"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
                fullWidth
              />

              <Input
                label="RG"
                value={formData.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
                placeholder="Digite o RG"
                fullWidth
              />

              <Input
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações Comunitárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Família *"
                value={formData.familia}
                onChange={(e) => handleChange('familia', e.target.value)}
                options={[
                  { value: '', label: 'Selecione uma família' },
                  ...mockFamilias.map((f) => ({ value: f.nome, label: f.nome }))
                ]}
                required
                fullWidth
              />

              <Input
                label="Endereço"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                placeholder="Rua, número"
                fullWidth
              />

              <Input
                label="Ocupação"
                value={formData.ocupacao}
                onChange={(e) => handleChange('ocupacao', e.target.value)}
                placeholder="Ex: Pescador, Agricultor"
                fullWidth
              />

              <Select
                label="Escolaridade"
                value={formData.escolaridade}
                onChange={(e) => handleChange('escolaridade', e.target.value)}
                options={[
                  { value: '', label: 'Selecione' },
                  { value: 'Sem Escolaridade', label: 'Sem Escolaridade' },
                  { value: 'Fundamental Incompleto', label: 'Fundamental Incompleto' },
                  { value: 'Fundamental Completo', label: 'Fundamental Completo' },
                  { value: 'Médio Incompleto', label: 'Médio Incompleto' },
                  { value: 'Médio Completo', label: 'Médio Completo' },
                  { value: 'Superior Completo', label: 'Superior Completo' }
                ]}
                fullWidth
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'ativo', label: 'Ativo' },
                  { value: 'inativo', label: 'Inativo' }
                ]}
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/moradores')}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save size={20} />
            {isEditing ? 'Atualizar Morador' : 'Cadastrar Morador'}
          </Button>
        </div>
      </form>
    </div>
  );
}
