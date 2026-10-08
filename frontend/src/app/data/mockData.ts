export interface Veiculo {
  tipo: string;
  modelo: string;
  cor: string;
  placa: string;
}

export interface Morador {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  familia: string;
  telefone: string;
  ocupacao: string;
  escolaridade: string;
  endereco: string;
  dataCadastro: string;
  status: 'ativo' | 'inativo';
  comorbidade?: string;
  veiculo?: Veiculo;
}

export interface Familia {
  id: string;
  nome: string; 
  responsavel: string;
  total_membros: number;
  endereco: string;
}

export interface Atividade {
  id: string;
  tipo: string;
  descricao: string;
  responsavel: string;
  data: string;
  status: 'concluida' | 'em_andamento' | 'pendente';
}

export interface Documento {
  id: string;
  titulo: string;
  tipo: 'certidao' | 'declaracao' | 'relatorio' | 'outro';
  morador: string;
  moradorId?: string;
  dataEmissao: string;
  arquivo: string;
}

export interface Dependente {
  id: string;
  nome: string;
  parentesco: string;
  dataNascimento: string;
  moradorResponsavelId: string;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  responsavel: string;
  status?: 'pendente' | 'andamento' | 'concluida' | 'cancelada';
  tipo: 'reuniao' | 'evento' | 'assembleia' | 'outro' | 'atividade';
}

export const mockMoradores: Morador[] = [
  {
    id: '1',
    nome: 'Francisco Ribeiro da Silva',
    dataNascimento: '1965-03-15',
    cpf: '123.456.789-00',
    rg: '1234567',
    familia: 'Família Silva',
    telefone: '(92) 99123-4567',
    ocupacao: 'Pescador',
    escolaridade: 'Fundamental Incompleto',
    endereco: 'Rua das Palmeiras, s/n',
    dataCadastro: '2024-01-15',
    status: 'ativo'
  },
  {
    id: '2',
    nome: 'Maria das Graças Souza',
    dataNascimento: '1970-07-22',
    cpf: '234.567.890-11',
    rg: '2345678',
    familia: 'Família Souza',
    telefone: '(92) 99234-5678',
    ocupacao: 'Artesã',
    escolaridade: 'Fundamental Completo',
    endereco: 'Rua do Rio, s/n',
    dataCadastro: '2024-01-20',
    status: 'ativo'
  },
  {
    id: '3',
    nome: 'João Pedro Santos',
    dataNascimento: '1985-11-08',
    cpf: '345.678.901-22',
    rg: '3456789',
    familia: 'Família Santos',
    telefone: '(92) 99345-6789',
    ocupacao: 'Agricultor',
    escolaridade: 'Médio Completo',
    endereco: 'Travessa da Mata, s/n',
    dataCadastro: '2024-02-01',
    status: 'ativo'
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    dataNascimento: '1990-05-14',
    cpf: '456.789.012-33',
    rg: '4567890',
    familia: 'Família Ferreira',
    telefone: '(92) 99456-7890',
    ocupacao: 'Professora Comunitária',
    escolaridade: 'Superior Completo',
    endereco: 'Rua da Escola, s/n',
    dataCadastro: '2024-02-10',
    status: 'ativo'
  },
  {
    id: '5',
    nome: 'Carlos Alberto Lima',
    dataNascimento: '1978-09-30',
    cpf: '567.890.123-44',
    rg: '5678901',
    familia: 'Família Lima',
    telefone: '(92) 99567-8901',
    ocupacao: 'Barqueiro',
    escolaridade: 'Fundamental Incompleto',
    endereco: 'Beira do Rio, s/n',
    dataCadastro: '2024-02-15',
    status: 'ativo'
  },
  {
    id: '6',
    nome: 'Sebastiana Costa',
    dataNascimento: '1955-12-25',
    cpf: '678.901.234-55',
    rg: '6789012',
    familia: 'Família Costa',
    telefone: '(92) 99678-9012',
    ocupacao: 'Aposentada',
    escolaridade: 'Sem Escolaridade',
    endereco: 'Rua Central, s/n',
    dataCadastro: '2024-03-01',
    status: 'ativo'
  }
];

export const mockFamilias: Familia[] = [
  {
    id: '1',
    nome: 'Família Silva',
    responsavel: 'Francisco Ribeiro da Silva',
    total_membros: 5,
    endereco: 'Rua das Palmeiras, s/n'
  },
  {
    id: '2',
    nome: 'Família Souza',
    responsavel: 'Maria das Graças Souza',
    total_membros: 4,
    endereco: 'Rua do Rio, s/n'
  },
  {
    id: '3',
    nome: 'Família Santos',
    responsavel: 'João Pedro Santos',
    total_membros: 6,
    endereco: 'Travessa da Mata, s/n'
  },
  {
    id: '4',
    nome: 'Família Ferreira',
    responsavel: 'Ana Paula Ferreira',
    total_membros: 3,
    endereco: 'Rua da Escola, s/n'
  },
  {
    id: '5',
    nome: 'Família Lima',
    responsavel: 'Carlos Alberto Lima',
    total_membros: 7,
    endereco: 'Beira do Rio, s/n'
  },
  {
    id: '6',
    nome: 'Família Costa',
    responsavel: 'Sebastiana Costa',
    total_membros: 2,
    endereco: 'Rua Central, s/n'
  }
];

export const mockAtividades: Atividade[] = [
  {
    id: '1',
    tipo: 'Cadastro',
    descricao: 'Cadastro de novo morador - Francisco Silva',
    responsavel: 'João Santos',
    data: '2024-05-01',
    status: 'concluida'
  },
  {
    id: '2',
    tipo: 'Atendimento',
    descricao: 'Atendimento médico comunitário',
    responsavel: 'Maria Silva',
    data: '2024-05-02',
    status: 'concluida'
  },
  {
    id: '3',
    tipo: 'Reunião',
    descricao: 'Reunião sobre gestão de resíduos',
    responsavel: 'Ana Costa',
    data: '2024-05-03',
    status: 'em_andamento'
  },
  {
    id: '4',
    tipo: 'Capacitação',
    descricao: 'Oficina de artesanato sustentável',
    responsavel: 'Maria Silva',
    data: '2024-05-05',
    status: 'pendente'
  },
  {
    id: '5',
    tipo: 'Documentação',
    descricao: 'Emissão de declarações de residência',
    responsavel: 'João Santos',
    data: '2024-05-04',
    status: 'em_andamento'
  }
];



export const mockEventos: EventoAgenda[] = [
  {
    id: '1',
    titulo: 'Reunião Comunitária Mensal',
    descricao: 'Discussão sobre melhorias na comunidade e planejamento de atividades',
    data: '2024-05-10',
    hora: '18:00',
    local: 'Centro Comunitário',
    responsavel: 'Maria Silva',
    tipo: 'reuniao'
  },
  {
    id: '2',
    titulo: 'Mutirão de Limpeza do Rio',
    descricao: 'Ação coletiva de limpeza das margens do rio',
    data: '2024-05-12',
    hora: '08:00',
    local: 'Margem do Rio Amazonas',
    responsavel: 'João Santos',
    tipo: 'atividade'
  },
  {
    id: '3',
    titulo: 'Festa de São João',
    descricao: 'Celebração tradicional com quadrilha e comidas típicas',
    data: '2024-06-24',
    hora: '19:00',
    local: 'Praça Central',
    responsavel: 'Ana Costa',
    tipo: 'evento'
  },
  {
    id: '4',
    titulo: 'Oficina de Artesanato',
    descricao: 'Capacitação em técnicas de cestaria com fibras naturais',
    data: '2024-05-15',
    hora: '14:00',
    local: 'Casa da Cultura',
    responsavel: 'Maria das Graças Souza',
    tipo: 'atividade'
  },
  {
    id: '5',
    titulo: 'Atendimento Médico',
    descricao: 'Atendimento médico itinerante da Secretaria de Saúde',
    data: '2024-05-18',
    hora: '09:00',
    local: 'Posto de Saúde Comunitário',
    responsavel: 'Equipe de Saúde',
    tipo: 'outro'
  }
];

export interface RelatorioAtividade {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  responsavel: string;
  categoria: string;
  status: 'rascunho' | 'finalizado';
  imagens: string[];
}

export interface Oficio {
  id: string;
  numero: string;
  titulo: string;
  destinatario: string;
  assunto: string;
  dataEmissao: string;
  dataProtocolo?: string;
  numeroProtocolo?: string;
  status: 'rascunho' | 'enviado' | 'protocolado' | 'respondido';
  observacoes?: string;
}

export const mockRelatorios: RelatorioAtividade[] = [];
export const mockOficios: Oficio[] = [];

export const mockDependentes: Dependente[] = [
  {
    id: '1',
    nome: 'Rosa Maria da Silva',
    parentesco: 'Cônjuge',
    dataNascimento: '1968-05-20',
    moradorResponsavelId: '1'
  },
  {
    id: '2',
    nome: 'Pedro Luís da Silva',
    parentesco: 'Filho',
    dataNascimento: '1992-03-14',
    moradorResponsavelId: '1'
  },
  {
    id: '3',
    nome: 'Luana da Silva',
    parentesco: 'Filha',
    dataNascimento: '1995-08-30',
    moradorResponsavelId: '1'
  },
  {
    id: '4',
    nome: 'Miguel da Silva',
    parentesco: 'Filho',
    dataNascimento: '2005-11-02',
    moradorResponsavelId: '1'
  },
  {
    id: '5',
    nome: 'José Antônio Costa',
    parentesco: 'Filho',
    dataNascimento: '1980-07-15',
    moradorResponsavelId: '6'
  }
];
