import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Save, Plus, X, User, Home, HeartPulse, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const emptyVeiculo = { tipo: '', modelo: '', cor: '', placa: '' };

const TIPO_VEICULO_OPTIONS = [
  'Canoa', 'Barco a Motor', 'Barco de Pesca', 'Voadeira', 'Motor-Rabeta',
  'Motocicleta', 'Bicicleta', 'Carro', 'Caminhonete', 'Outro'
];

type SectionHeaderProps = {
  title: string;
  icon: React.ReactNode;
  hasError?: boolean;
  isOpen: boolean;
  onToggle: () => void;
};



function SectionHeader({
  title,
  icon,
  isOpen,
  onToggle,
  hasError,
}: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left"
    >
      <div className="flex items-center gap-2">
        <span
          className={`p-1.5 rounded-lg ${
            hasError
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {icon}
        </span>

        <h3
          className={`text-sm font-medium ${
            hasError ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {title}
        </h3>

        {hasError && (
          <span className="text-xs text-destructive">
            · campos obrigatórios em falta
          </span>
        )}
      </div>

      {isOpen ? (
        <ChevronUp
          size={16}
          className="text-muted-foreground"
        />
      ) : (
        <ChevronDown
          size={16}
          className="text-muted-foreground"
        />
      )}
    </button>
  );
}

export function MoradorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { moradores, familias, addMorador, updateMorador, addFamilia } = useData();

  const moradorExistente = isEditing ? moradores.find((m) => m.id === id) : null;

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
    status: (moradorExistente?.status || 'ativo') as 'ativo' | 'inativo',
    comorbidade: moradorExistente?.comorbidade || '',
  });

const [temVeiculo, setTemVeiculo] = useState(
  Boolean(moradorExistente?.veiculo)
);

const [veiculo, setVeiculo] = useState(
  moradorExistente?.veiculo ?? { ...emptyVeiculo }
);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [novaFamiliaMode, setNovaFamiliaMode] = useState(false);
  const [novaFamiliaForm, setNovaFamiliaForm] = useState({ nome: '', responsavel: '', endereco: '' });
  const [novaFamiliaErr, setNovaFamiliaErr] = useState('');

  // Section expand state (for mobile UX)
  const [openSections, setOpenSections] = useState({ pessoal: true, comunitario: true, saude: true, veiculo: true });
  const toggleSection = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!formData.dataNascimento) e.dataNascimento = 'Data de nascimento é obrigatória';
    if (!formData.cpf.trim()) e.cpf = 'CPF é obrigatório';
    if (!formData.familia) e.familia = 'Família é obrigatória';
    if (temVeiculo && !veiculo.tipo) e.veiculoTipo = 'Informe o tipo do veículo';
    return e;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Open sections that have errors
      if (errs.nome || errs.dataNascimento || errs.cpf) setOpenSections(p => ({ ...p, pessoal: true }));
      if (errs.familia) setOpenSections(p => ({ ...p, comunitario: true }));
      if (errs.veiculoTipo) setOpenSections(p => ({ ...p, veiculo: true }));
      return;
    }

    const payload = {
      ...formData,
      veiculo: temVeiculo && veiculo.tipo ? veiculo : undefined,
    };

    if (isEditing && moradorExistente) {
  await updateMorador({ ...moradorExistente, ...payload });

  toast.success('Morador atualizado com sucesso!');
} else {
  await addMorador(payload);

  toast.success('Morador cadastrado com sucesso!');
}

navigate('/moradores');
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleVeiculoChange = (field: string, value: string) => {
    setVeiculo(prev => ({ ...prev, [field]: value }));
    const errKey = `veiculo${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errKey]) setErrors(prev => { const e = { ...prev }; delete e[errKey]; return e; });
  };

 const handleCriarFamilia = async () => {
  if (!novaFamiliaForm.nome.trim()) {
    setNovaFamiliaErr('Nome da família é obrigatório');
    return;
  }

  const nova = await addFamilia({
    nome: novaFamiliaForm.nome.trim(),
    responsavel: novaFamiliaForm.responsavel || formData.nome || 'A definir',
    endereco: novaFamiliaForm.endereco || '',
    total_membros: 1,
  });

  handleChange('familia', nova.id);

  setNovaFamiliaMode(false);

  setNovaFamiliaForm({
    nome: '',
    responsavel: '',
    endereco: '',
  });

  setNovaFamiliaErr('');

  toast.success(`Família "${nova.nome}" criada!`);
};

  const fieldClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";
  const labelClass = "block text-sm text-foreground mb-1.5";
  const hasPessoalError = !!(errors.nome || errors.dataNascimento || errors.cpf);
  const hasComunitarioError = !!errors.familia;
  const hasVeiculoError = !!errors.veiculoTipo;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/moradores')} size="sm">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <div>
          <h1 className="text-foreground text-lg md:text-2xl">
            {isEditing ? 'Editar Morador' : 'Novo Morador'}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {isEditing ? 'Atualize as informações' : 'Preencha os dados do morador'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Informações Pessoais ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4 md:px-6">
            <SectionHeader
  title="Informações Pessoais"
  icon={<User size={15} />}
  isOpen={openSections.pessoal}
  onToggle={() => toggleSection('pessoal')}
  hasError={hasPessoalError}
/>
          </CardHeader>
          {openSections.pessoal && (
            <CardContent className="px-4 md:px-6 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome Completo *</label>
                  <input type="text" value={formData.nome} onChange={e => handleChange('nome', e.target.value)}
                    placeholder="Nome completo do morador" className={fieldClass} />
                  {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className={labelClass}>Data de Nascimento *</label>
                  <input type="date" value={formData.dataNascimento} onChange={e => handleChange('dataNascimento', e.target.value)}
                    className={fieldClass} />
                  {errors.dataNascimento && <p className="text-xs text-destructive mt-1">{errors.dataNascimento}</p>}
                </div>

                <div>
                  <label className={labelClass}>CPF *</label>
                  <input type="text" value={formData.cpf} onChange={e => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00" className={fieldClass} />
                  {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <label className={labelClass}>RG</label>
                  <input type="text" value={formData.rg} onChange={e => handleChange('rg', e.target.value)}
                    placeholder="Número do RG" className={fieldClass} />
                </div>

                <div>
                  <label className={labelClass}>Telefone</label>
                  <input type="tel" value={formData.telefone} onChange={e => handleChange('telefone', e.target.value)}
                    placeholder="(00) 00000-0000" className={fieldClass} />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Informações Comunitárias ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4 md:px-6">
            <SectionHeader
  title="Informações Comunitárias"
  icon={<Home size={15} />}
  isOpen={openSections.comunitario}
  onToggle={() => toggleSection('comunitario')}
  hasError={hasComunitarioError}
/>
          </CardHeader>
          {openSections.comunitario && (
            <CardContent className="px-4 md:px-6 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Família */}
                <div className="sm:col-span-2">
                  {!novaFamiliaMode ? (
                    <>
                      <label className={labelClass}>Família *</label>
                      <div className="flex gap-2">
                        <select value={formData.familia} onChange={e => handleChange('familia', e.target.value)} className={`${fieldClass} flex-1`}>
                          <option value="">Selecione uma família</option>
                          {familias.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                        <button type="button" onClick={() => setNovaFamiliaMode(true)}
                          className="px-3 py-2.5 text-xs border border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Plus size={13} /> Nova
                        </button>
                      </div>
                      {errors.familia && <p className="text-xs text-destructive mt-1">{errors.familia}</p>}
                    </>
                  ) : (
                    <div className="border border-primary/30 bg-primary/5 rounded-lg p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground">Criar nova família</p>
                        <button type="button" onClick={() => setNovaFamiliaMode(false)} className="p-1 hover:bg-muted rounded">
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                      <input type="text" placeholder="Nome da família *" value={novaFamiliaForm.nome}
                        onChange={e => { setNovaFamiliaForm(p => ({ ...p, nome: e.target.value })); setNovaFamiliaErr(''); }}
                        className={fieldClass} />
                      {novaFamiliaErr && <p className="text-xs text-destructive">{novaFamiliaErr}</p>}
                      <input type="text" placeholder="Responsável (opcional)" value={novaFamiliaForm.responsavel}
                        onChange={e => setNovaFamiliaForm(p => ({ ...p, responsavel: e.target.value }))}
                        className={fieldClass} />
                      <input type="text" placeholder="Endereço (opcional)" value={novaFamiliaForm.endereco}
                        onChange={e => setNovaFamiliaForm(p => ({ ...p, endereco: e.target.value }))}
                        className={fieldClass} />
                      <button type="button" onClick={handleCriarFamilia}
                        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 flex items-center justify-center gap-1">
                        <Plus size={14} /> Criar e selecionar
                      </button>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Endereço</label>
                  <input type="text" value={formData.endereco} onChange={e => handleChange('endereco', e.target.value)}
                    placeholder="Rua, número" className={fieldClass} />
                </div>

                <div>
                  <label className={labelClass}>Ocupação</label>
                  <input type="text" value={formData.ocupacao} onChange={e => handleChange('ocupacao', e.target.value)}
                    placeholder="Ex: Pescador, Agricultor" className={fieldClass} />
                </div>

                <div>
                  <label className={labelClass}>Escolaridade</label>
                  <select value={formData.escolaridade} onChange={e => handleChange('escolaridade', e.target.value)} className={fieldClass}>
                    <option value="">Selecione</option>
                    <option value="Sem Escolaridade">Sem Escolaridade</option>
                    <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                    <option value="Fundamental Completo">Fundamental Completo</option>
                    <option value="Médio Incompleto">Médio Incompleto</option>
                    <option value="Médio Completo">Médio Completo</option>
                    <option value="Superior Completo">Superior Completo</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={fieldClass}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Saúde ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4 md:px-6">
            <SectionHeader
  title="Saúde"
  icon={<HeartPulse size={15} />}
  isOpen={openSections.saude}
  onToggle={() => toggleSection('saude')}
/>
          </CardHeader>
          {openSections.saude && (
            <CardContent className="px-4 md:px-6 pb-5">
              <label className={labelClass}>Comorbidade / Condição de Saúde</label>
              <input type="text" value={formData.comorbidade} onChange={e => handleChange('comorbidade', e.target.value)}
                placeholder="Ex: Diabetes, Hipertensão — deixe vazio se nenhuma"
                className={fieldClass} />
              <p className="text-xs text-muted-foreground mt-1.5">Informação usada para atendimento prioritário e registros médicos comunitários.</p>
            </CardContent>
          )}
        </Card>

        {/* ── Veículo ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4 md:px-6">
           <SectionHeader
  title="Veículo — Acesso ao Balneário"
  icon={<Car size={15} />}
  isOpen={openSections.veiculo}
  onToggle={() => toggleSection('veiculo')}
  hasError={hasVeiculoError}
/>
          </CardHeader>
          {openSections.veiculo && (
            <CardContent className="px-4 md:px-6 pb-5 space-y-3">
              {/* Toggle */}
              <div className="flex items-center gap-3">
                <button
  type="button"
  onClick={() => {
    setTemVeiculo(prev => {
      const novoEstado = !prev;

      if (!novoEstado) {
        setVeiculo({ ...emptyVeiculo });
      }

      return novoEstado;
    });
  }}
  className={`relative w-11 h-6 rounded-full transition-colors ${
    temVeiculo ? 'bg-primary' : 'bg-muted-foreground/30'
  }`}
>
  <span
    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
      temVeiculo ? 'translate-x-5' : 'translate-x-0'
    }`}
  />
</button>
                <span className="text-sm text-foreground">
                  {temVeiculo ? 'Morador possui veículo' : 'Sem veículo cadastrado'}
                </span>
              </div>

              {temVeiculo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className={labelClass}>Tipo de Veículo *</label>
                    <select value={veiculo.tipo} onChange={e => handleVeiculoChange('tipo', e.target.value)} className={fieldClass}>
                      <option value="">Selecione o tipo</option>
                      {TIPO_VEICULO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.veiculoTipo && <p className="text-xs text-destructive mt-1">{errors.veiculoTipo}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Modelo</label>
                    <input type="text" value={veiculo.modelo} onChange={e => handleVeiculoChange('modelo', e.target.value)}
                      placeholder="Ex: Honda CG 160, Barco Alumínio 5m" className={fieldClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Cor</label>
                    <input type="text" value={veiculo.cor} onChange={e => handleVeiculoChange('cor', e.target.value)}
                      placeholder="Ex: Azul, Branco, Prata" className={fieldClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Placa / Identificação</label>
                    <input type="text" value={veiculo.placa} onChange={e => handleVeiculoChange('placa', e.target.value.toUpperCase())}
                      placeholder="Ex: ABC-1234 ou nº do barco" className={`${fieldClass} uppercase`} />
                  </div>

                  {(veiculo.tipo || veiculo.modelo || veiculo.cor) && (
                    <div className="sm:col-span-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <p className="text-xs text-accent mb-1">Prévia do cadastro de acesso:</p>
                      <p className="text-sm text-foreground">
                        {[veiculo.tipo, veiculo.modelo, veiculo.cor, veiculo.placa].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!temVeiculo && (
                <p className="text-xs text-muted-foreground">
                  Ative para registrar o veículo do morador e liberar acesso ao balneário comunitário.
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate('/moradores')} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            <Save size={18} />
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Morador'}
          </Button>
        </div>
      </form>
    </div>
  );
}
