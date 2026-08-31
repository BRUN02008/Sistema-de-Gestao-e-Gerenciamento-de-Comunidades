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
  horario: string;
  local: string;
  responsavel: string;
  tipo: 'reuniao' | 'atividade' | 'evento' | 'outros';
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

export const mockDocumentos: Documento[] = [
  {
    id: '1',
    titulo: 'Declaração de Residência - Francisco Silva',
    tipo: 'declaracao',
    morador: 'Francisco Ribeiro da Silva',
    moradorId: '1',
    dataEmissao: '2024-04-15',
    arquivo: 'declaracao_001.pdf'
  },
  {
    id: '2',
    titulo: 'Certidão de Nascimento - Maria Souza',
    tipo: 'certidao',
    morador: 'Maria das Graças Souza',
    moradorId: '2',
    dataEmissao: '2024-04-20',
    arquivo: 'certidao_001.pdf'
  },
  {
    id: '3',
    titulo: 'Relatório de Atendimento Comunitário',
    tipo: 'relatorio',
    morador: 'Vários',
    dataEmissao: '2024-04-30',
    arquivo: 'relatorio_abril_2024.pdf'
  },
  {
    id: '4',
    titulo: 'Declaração de Atividade Pesqueira',
    tipo: 'declaracao',
    morador: 'Francisco Ribeiro da Silva',
    moradorId: '1',
    dataEmissao: '2024-04-25',
    arquivo: 'declaracao_pesca_001.pdf'
  },
  {
    id: '5',
    titulo: 'Declaração de Residência - Sebastiana Costa',
    tipo: 'declaracao',
    morador: 'Sebastiana Costa',
    moradorId: '6',
    dataEmissao: '2024-03-10',
    arquivo: 'declaracao_costa_001.pdf'
  },
  {
    id: '6',
    titulo: 'Certidão de Benefício Social - Sebastiana Costa',
    tipo: 'certidao',
    morador: 'Sebastiana Costa',
    moradorId: '6',
    dataEmissao: '2024-04-05',
    arquivo: 'certidao_beneficio_costa.pdf'
  }
];

export const mockEventos: EventoAgenda[] = [
  {
    id: '1',
    titulo: 'Reunião Comunitária Mensal',
    descricao: 'Discussão sobre melhorias na comunidade e planejamento de atividades',
    data: '2024-05-10',
    horario: '18:00',
    local: 'Centro Comunitário',
    responsavel: 'Maria Silva',
    tipo: 'reuniao'
  },
  {
    id: '2',
    titulo: 'Mutirão de Limpeza do Rio',
    descricao: 'Ação coletiva de limpeza das margens do rio',
    data: '2024-05-12',
    horario: '08:00',
    local: 'Margem do Rio Amazonas',
    responsavel: 'João Santos',
    tipo: 'atividade'
  },
  {
    id: '3',
    titulo: 'Festa de São João',
    descricao: 'Celebração tradicional com quadrilha e comidas típicas',
    data: '2024-06-24',
    horario: '19:00',
    local: 'Praça Central',
    responsavel: 'Ana Costa',
    tipo: 'evento'
  },
  {
    id: '4',
    titulo: 'Oficina de Artesanato',
    descricao: 'Capacitação em técnicas de cestaria com fibras naturais',
    data: '2024-05-15',
    horario: '14:00',
    local: 'Casa da Cultura',
    responsavel: 'Maria das Graças Souza',
    tipo: 'atividade'
  },
  {
    id: '5',
    titulo: 'Atendimento Médico',
    descricao: 'Atendimento médico itinerante da Secretaria de Saúde',
    data: '2024-05-18',
    horario: '09:00',
    local: 'Posto de Saúde Comunitário',
    responsavel: 'Equipe de Saúde',
    tipo: 'outros'
  }
];

export interface Mensalidade {
  id: string;
  moradorId: string;
  moradorNome: string;
  familia: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pago' | 'pendente' | 'atrasado';
  metodoPagamento?: 'dinheiro' | 'pix' | 'transferencia';
  comprovante?: string;
}

export interface Investimento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'infraestrutura' | 'educacao' | 'saude' | 'meio_ambiente' | 'outros';
  valor: number;
  data: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  responsavel: string;
  observacoes?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: 'manutencao' | 'energia' | 'agua' | 'material' | 'evento' | 'outros';
  valor: number;
  data: string;
  responsavel: string;
  comprovante?: string;
}

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

export const VALOR_MENSALIDADE = 50.00;

export const mockMensalidades: Mensalidade[] = [
  {
    id: '1',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    dataPagamento: '2024-05-08',
    status: 'pago',
    metodoPagamento: 'dinheiro',
    comprovante: 'recibo_001.pdf'
  },
  {
    id: '2',
    moradorId: '2',
    moradorNome: 'Maria das Graças Souza',
    familia: 'Família Souza',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    dataPagamento: '2024-05-09',
    status: 'pago',
    metodoPagamento: 'pix'
  },
  {
    id: '3',
    moradorId: '3',
    moradorNome: 'João Pedro Santos',
    familia: 'Família Santos',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    status: 'pendente'
  },
  {
    id: '4',
    moradorId: '4',
    moradorNome: 'Ana Paula Ferreira',
    familia: 'Família Ferreira',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    dataPagamento: '2024-05-10',
    status: 'pago',
    metodoPagamento: 'transferencia'
  },
  {
    id: '5',
    moradorId: '5',
    moradorNome: 'Carlos Alberto Lima',
    familia: 'Família Lima',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    status: 'pendente'
  },
  {
    id: '6',
    moradorId: '6',
    moradorNome: 'Sebastiana Costa',
    familia: 'Família Costa',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-05',
    dataVencimento: '2024-05-10',
    status: 'atrasado'
  },
  {
    id: '7',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-04',
    dataVencimento: '2024-04-10',
    dataPagamento: '2024-04-09',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '8',
    moradorId: '2',
    moradorNome: 'Maria das Graças Souza',
    familia: 'Família Souza',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-04',
    dataVencimento: '2024-04-10',
    dataPagamento: '2024-04-10',
    status: 'pago',
    metodoPagamento: 'pix'
  },
  {
    id: '9',
    moradorId: '6',
    moradorNome: 'Sebastiana Costa',
    familia: 'Família Costa',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-01',
    dataVencimento: '2024-01-10',
    dataPagamento: '2024-01-09',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '10',
    moradorId: '6',
    moradorNome: 'Sebastiana Costa',
    familia: 'Família Costa',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-02',
    dataVencimento: '2024-02-10',
    dataPagamento: '2024-02-10',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '11',
    moradorId: '6',
    moradorNome: 'Sebastiana Costa',
    familia: 'Família Costa',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-03',
    dataVencimento: '2024-03-10',
    dataPagamento: '2024-03-08',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '12',
    moradorId: '6',
    moradorNome: 'Sebastiana Costa',
    familia: 'Família Costa',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-04',
    dataVencimento: '2024-04-10',
    status: 'pendente'
  },
  {
    id: '13',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-01',
    dataVencimento: '2024-01-10',
    dataPagamento: '2024-01-08',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '14',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-02',
    dataVencimento: '2024-02-10',
    dataPagamento: '2024-02-07',
    status: 'pago',
    metodoPagamento: 'dinheiro'
  },
  {
    id: '15',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-03',
    dataVencimento: '2024-03-10',
    dataPagamento: '2024-03-09',
    status: 'pago',
    metodoPagamento: 'pix'
  },
  {
    id: '16',
    moradorId: '1',
    moradorNome: 'Francisco Ribeiro da Silva',
    familia: 'Família Silva',
    valor: VALOR_MENSALIDADE,
    mesReferencia: '2024-06',
    dataVencimento: '2024-06-10',
    status: 'pendente'
  }
];

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

export const mockInvestimentos: Investimento[] = [
  {
    id: '1',
    titulo: 'Reforma do Pier Comunitário',
    descricao: 'Substituição de tábuas danificadas e reforço estrutural do pier',
    categoria: 'infraestrutura',
    valor: 2500.00,
    data: '2024-03-15',
    status: 'concluido',
    responsavel: 'João Santos',
    observacoes: 'Obra concluída com sucesso, pier está seguro para uso'
  },
  {
    id: '2',
    titulo: 'Compra de Material Escolar',
    descricao: 'Aquisição de cadernos, lápis e material didático para as crianças',
    categoria: 'educacao',
    valor: 800.00,
    data: '2024-02-01',
    status: 'concluido',
    responsavel: 'Ana Paula Ferreira'
  },
  {
    id: '3',
    titulo: 'Sistema de Captação de Água da Chuva',
    descricao: 'Instalação de cisternas e sistema de filtragem',
    categoria: 'infraestrutura',
    valor: 4500.00,
    data: '2024-04-20',
    status: 'em_andamento',
    responsavel: 'Maria Silva',
    observacoes: 'Aguardando conclusão da instalação das cisternas'
  },
  {
    id: '4',
    titulo: 'Mutirão de Reflorestamento',
    descricao: 'Plantio de 500 mudas nativas nas áreas degradadas',
    categoria: 'meio_ambiente',
    valor: 1200.00,
    data: '2024-05-01',
    status: 'planejado',
    responsavel: 'João Santos'
  },
  {
    id: '5',
    titulo: 'Kit de Primeiros Socorros',
    descricao: 'Reposição de medicamentos e materiais para o posto de saúde',
    categoria: 'saude',
    valor: 650.00,
    data: '2024-03-25',
    status: 'concluido',
    responsavel: 'Maria Silva'
  },
  {
    id: '6',
    titulo: 'Instalação de Placas Solares',
    descricao: 'Sistema fotovoltaico para o centro comunitário',
    categoria: 'infraestrutura',
    valor: 8000.00,
    data: '2024-06-15',
    status: 'planejado',
    responsavel: 'João Santos',
    observacoes: 'Aguardando orçamentos de fornecedores'
  }
];

export const mockDespesas: Despesa[] = [
  {
    id: '1',
    descricao: 'Manutenção do Gerador Elétrico',
    categoria: 'manutencao',
    valor: 350.00,
    data: '2024-04-15',
    responsavel: 'Carlos Alberto Lima',
    comprovante: 'nota_fiscal_001.pdf'
  },
  {
    id: '2',
    descricao: 'Conta de Energia - Centro Comunitário',
    categoria: 'energia',
    valor: 180.00,
    data: '2024-04-20',
    responsavel: 'Maria Silva'
  },
  {
    id: '3',
    descricao: 'Material de Limpeza',
    categoria: 'material',
    valor: 120.00,
    data: '2024-04-25',
    responsavel: 'Ana Costa',
    comprovante: 'recibo_limpeza.pdf'
  },
  {
    id: '4',
    descricao: 'Festa Junina - Decoração e Comidas',
    categoria: 'evento',
    valor: 450.00,
    data: '2024-05-05',
    responsavel: 'Ana Costa'
  },
  {
    id: '5',
    descricao: 'Combustível para Barco Comunitário',
    categoria: 'outros',
    valor: 280.00,
    data: '2024-05-02',
    responsavel: 'Carlos Alberto Lima'
  }
];
