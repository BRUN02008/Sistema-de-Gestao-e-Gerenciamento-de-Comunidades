import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react';

import {
  type Morador,
  type Familia,
  type Atividade,
  type Documento,
  type Dependente,
  type EventoAgenda,
  type RelatorioAtividade,
  type Oficio,

  mockDependentes,
} from '../../data/mockData';

import { api } from '../../../services/api';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`sisgest_${key}`);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(
      `sisgest_${key}`,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

const DOCUMENTOS_DEMONSTRACAO = [
  ['1', 'Declaração de Residência - Francisco Silva', 'declaracao', 'Francisco Ribeiro da Silva', '1', '2024-04-15', 'declaracao_001.pdf'],
  ['2', 'Certidão de Nascimento - Maria Souza', 'certidao', 'Maria das Graças Souza', '2', '2024-04-20', 'certidao_001.pdf'],
  ['3', 'Relatório de Atendimento Comunitário', 'relatorio', 'Vários', undefined, '2024-04-30', 'relatorio_abril_2024.pdf'],
  ['4', 'Declaração de Atividade Pesqueira', 'declaracao', 'Francisco Ribeiro da Silva', '1', '2024-04-25', 'declaracao_pesca_001.pdf'],
  ['5', 'Declaração de Residência - Sebastiana Costa', 'declaracao', 'Sebastiana Costa', '6', '2024-03-10', 'declaracao_costa_001.pdf'],
  ['6', 'Certidão de Benefício Social - Sebastiana Costa', 'certidao', 'Sebastiana Costa', '6', '2024-04-05', 'certidao_beneficio_costa.pdf'],
] as const;

function removerDocumentosDeDemonstracao(documentos: Documento[]): Documento[] {
  return documentos.filter((documento) => !DOCUMENTOS_DEMONSTRACAO.some((demo) =>
    String(documento.id) === demo[0] &&
    documento.titulo === demo[1] &&
    documento.tipo === demo[2] &&
    documento.morador === demo[3] &&
    String(documento.moradorId ?? '') === String(demo[4] ?? '') &&
    documento.dataEmissao === demo[5] &&
    documento.arquivo === demo[6]
  ));
}

function carregarDocumentosLocais(): Documento[] {
  const documentos = load<Documento[]>('documentos', []);
  if (!Array.isArray(documentos)) return [];

  const documentosReais = removerDocumentosDeDemonstracao(documentos);
  if (documentosReais.length !== documentos.length) {
    save('documentos', documentosReais);
  }
  return documentosReais;
}

function normalizarIdentidadeFamilia(valor: string): string {
  return valor
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

function familiaDuplicada(
  familiasAtuais: Familia[],
  familia: Pick<Familia, 'nome' | 'responsavel'>,
  ignorarId?: string
): boolean {
  const nome = normalizarIdentidadeFamilia(familia.nome);
  const responsavel = normalizarIdentidadeFamilia(familia.responsavel);
  return familiasAtuais.some((existente) =>
    String(existente.id) !== String(ignorarId ?? '') &&
    normalizarIdentidadeFamilia(existente.nome) === nome &&
    normalizarIdentidadeFamilia(existente.responsavel) === responsavel
  );
}

interface DataContextType {
  // Moradores
  moradores: Morador[];
  addMorador: (
    
    m: Omit<Morador, 'id' | 'dataCadastro'>

  ) => Promise<Morador>;
  updateMorador: (m: Morador) => Promise<void>;
  deleteMorador: (id: string) => Promise<void>;

// Famílias
familias: Familia[];
addFamilia: (
  f: Omit<Familia, 'id'>
) => Promise<Familia>;
updateFamilia: (f: Familia) => Promise<void>;
deleteFamilia: (id: string) => Promise<void>;

  // Atividades
  atividades: Atividade[];
  atividadesCarregando: boolean;
  atividadesErro: boolean;

  // Documentos
  documentos: Documento[];

addDocumento: (
  d: Omit<Documento, 'id' | 'arquivo'> & {
    arquivo: File;
  }
) => Promise<Documento>;

updateDocumento: (
  d: Omit<Documento, 'arquivo'> & {
    arquivo?: File;
  }
) => Promise<Documento>;

deleteDocumento: (
  id: string
) => Promise<void>;

  // Dependentes
  dependentes: Dependente[];

  // Eventos
  eventos: EventoAgenda[];
  atividadesRegistradas: AtividadeRegistrada[];

addEvento: (
  e: Omit<EventoAgenda, 'id'>
) => Promise<EventoAgenda>;

updateEvento: (
  e: EventoAgenda
) => Promise<void>;

deleteEvento: (
  id: string
) => Promise<void>;

  // Relatórios
  relatorios: RelatorioAtividade[];
  addRelatorio: (
  r: Omit<RelatorioAtividade, 'id'>
) => Promise<RelatorioAtividade>;

updateRelatorio: (
  r: RelatorioAtividade
) => Promise<void>;

deleteRelatorio: (
  id: string
) => Promise<void>;

  // Ofícios
oficios: Oficio[];

addOficio: (
  o: Omit<Oficio, 'id'>
) => Promise<Oficio>;

updateOficio: (
  o: Oficio
) => Promise<void>;

deleteOficio: (
  id: string
) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(
  undefined
);

interface OficioAPI {
  id: number | string;
  numero: string;
  titulo: string;
  destinatario: string;
  assunto: string;
  data_emissao: string;
  data_protocolo?: string | null;
  numero_protocolo: string;
  status: Oficio['status'];
  observacoes: string;
  criado_em?: string;
  atualizado_em?: string;
}

interface DocumentoAPI {
  id: number | string;
  morador: number | string;
  morador_detalhes?: Morador;
  titulo: string;
  tipo: Documento['tipo'];
  data_emissao: string;
  arquivo: string;
  criado_em?: string;
}

interface RelatorioAPI {
  id: number | string;
  titulo: string;
  descricao: string;
  data: string;
  responsavel: string;
  categoria: string;
  status: RelatorioAtividade['status'];
  imagens: string[];
  criado_em?: string;
  atualizado_em?: string;
}

interface EventoAgendaAPI {
  id: number | string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  responsavel: string;
  tipo: EventoAgenda['tipo'];
  status?: EventoAgenda['status'];
  criado_em?: string;
}

interface AtividadeRegistradaAPI {
  id: number | string;
  titulo: string;
  descricao: string;
  data: string;
  responsavel: string;
  local: string;
  status: 'andamento' | 'concluida' | 'pendente';
  criado_em?: string;
}

interface AtividadeRegistrada {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  responsavel: string;
  local: string;
  status: EventoAgenda['status'];
}

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * ============================================================
   * MORADORES
   * ============================================================
   *
   * Agora os moradores vêm do Django.
   */

  const [moradores, setMoradores] = useState<Morador[]>([]);
  

  useEffect(() => {
    async function carregarMoradores() {
      try {
       const data = (await api.get('/moradores/')) as Morador[];

        /*
         * Converte os IDs do Django para string,
         * mantendo compatibilidade com o frontend.
         */
        const moradoresApi: Morador[] = data.map((m) => ({
          ...m,
          id: String(m.id),
          familia: m.familia == null ? null : String(m.familia),
          dataCadastro:
            m.dataCadastro ||
            new Date().toISOString().split('T')[0],
        }));

        setMoradores(moradoresApi);

        /*
         * Mantemos uma cópia local apenas temporariamente
         * para não quebrar outras partes do sistema.
         */
        save('moradores', moradoresApi);
      } catch (error) {
        console.error(
          'Erro ao carregar moradores do Django:',
          error
        );

        /*
         * Se a API estiver indisponível, usamos os dados
         * antigos como fallback.
         */
        setMoradores(
          load('moradores', [])
        );
      }
    }

    carregarMoradores();
  }, []);

  /*
   * ============================================================
   * OUTROS DADOS
   * ============================================================
   *
   * Ainda permanecem no localStorage por enquanto.
   */

  const [familias, setFamilias] = useState<Familia[]>([]);

useEffect(() => {
  async function carregarFamilias() {
    try {
      const data = await api.get('/familias/');

      if (Array.isArray(data)) {
        setFamilias(data.map((f: Familia & { responsavel_morador_id?: number | string | null }) => ({
          ...f,
          id: String(f.id),
          responsavelMoradorId: f.responsavel_morador_id == null ? null : String(f.responsavel_morador_id),
        })));
      } else {
        setFamilias([]);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar famílias do Django:',
        error
      );

      setFamilias([]);
    }
  }

  carregarFamilias();
}, []);

  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadesCarregando, setAtividadesCarregando] = useState(true);
  const [atividadesErro, setAtividadesErro] = useState(false);
  useEffect(() => {
    async function carregarAtividades() {
      try {
        const data = await api.get('/atividades/');
        if (!Array.isArray(data)) throw new Error('Resposta inválida ao carregar atividades.');
        setAtividades((data as AtividadeRegistradaAPI[]).map((atividade) => ({
          id: String(atividade.id), tipo: atividade.titulo, descricao: atividade.descricao,
          responsavel: atividade.responsavel, data: atividade.data,
          status: atividade.status === 'andamento' ? 'em_andamento' : atividade.status,
        })));
        setAtividadesErro(false);
      } catch (error) {
        console.error('Erro ao carregar atividades do Django:', error);
        setAtividades([]);
        setAtividadesErro(true);
      } finally {
        setAtividadesCarregando(false);
      }
    }
    void carregarAtividades();
  }, []);

  const [documentos, setDocumentos] =
    useState<Documento[]>(() =>
      carregarDocumentosLocais()
    );

  useEffect(() => {
    async function carregarDocumentos() {
      try {
        const data = await api.get('/documentos/');
        if (!Array.isArray(data)) {
          throw new Error('Resposta inválida ao carregar documentos.');
        }

        const documentosApi: Documento[] = (data as DocumentoAPI[]).map((documento) => ({
          id: String(documento.id),
          titulo: documento.titulo,
          tipo: documento.tipo,
          morador: documento.morador_detalhes?.nome ?? '',
          moradorId: String(documento.morador),
          dataEmissao: documento.data_emissao,
          arquivo: documento.arquivo,
        }));

        setDocumentos(documentosApi);
        save('documentos', documentosApi);
      } catch (error) {
        console.error('Erro ao carregar documentos do Django; mantendo apenas o cache local sem registros de demonstração:', error);
      }
    }

    carregarDocumentos();
  }, []);

  const [dependentes] =
    useState<Dependente[]>(() =>
      load('dependentes', mockDependentes)
    );

  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  useEffect(() => {
  async function carregarEventos() {
    try {
      const data = await api.get('/agenda/');

      if (!Array.isArray(data)) {
        setEventos([]);
        return;
      }

      const eventosApi: EventoAgenda[] = (
        data as EventoAgendaAPI[]
      ).map((evento) => ({
        id: String(evento.id),
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: evento.data,
        hora: evento.hora,
        local: evento.local,
        responsavel: evento.responsavel,
        tipo: evento.tipo,
        status: evento.status,
      }));

      setEventos(eventosApi);
    } catch (error) {
      console.error(
        'Erro ao carregar eventos do Django:',
        error
      );

      setEventos([]);
    }
  }

  carregarEventos();
}, []);

  const [atividadesRegistradas, setAtividadesRegistradas] = useState<AtividadeRegistrada[]>([]);
  useEffect(() => {
    async function carregarAtividadesRegistradas() {
      try {
        const data = await api.get('/atividades/');
        if (!Array.isArray(data)) {
          console.error('A API de atividades retornou um formato inesperado.');
          return;
        }

        const atividadesApi = (data as AtividadeRegistradaAPI[]).map((atividade) => ({
          id: String(atividade.id),
          titulo: atividade.titulo,
          descricao: atividade.descricao,
          data: atividade.data,
          responsavel: atividade.responsavel,
          local: atividade.local,
          status: atividade.status === 'andamento' ? 'andamento' : atividade.status,
        } satisfies AtividadeRegistrada));

        setAtividadesRegistradas(atividadesApi);
      } catch (error) {
        console.error('Erro ao carregar atividades cadastradas do Django:', error);
      }
    }

    carregarAtividadesRegistradas();
  }, []);

  const [relatorios, setRelatorios] = useState<RelatorioAtividade[]>([]);
  useEffect(() => {
  async function carregarRelatorios() {
    try {
      const data = await api.get('/relatorios-atividade/');

      if (!Array.isArray(data)) {
        setRelatorios([]);
        return;
      }

      const relatoriosApi: RelatorioAtividade[] = (
        data as RelatorioAPI[]
      ).map((r) => ({
        id: String(r.id),
        titulo: r.titulo,
        descricao: r.descricao,
        data: r.data,
        responsavel: r.responsavel,
        categoria: r.categoria,
        status: r.status,
        imagens: r.imagens ?? [],
      }));

      setRelatorios(relatoriosApi);
      save('relatorios', relatoriosApi);
    } catch (error) {
      console.error('Erro ao carregar relatórios do Django:', error);
      setRelatorios(load('relatorios', []));
    }
  }

  carregarRelatorios();
}, []);

  const [oficios, setOficios] = useState<Oficio[]>([]);

useEffect(() => {
  async function carregarOficios() {
    try {
      const data = await api.get('/oficios/');

      if (!Array.isArray(data)) {
        setOficios([]);
        return;
      }

      const oficiosApi: Oficio[] = (
        data as OficioAPI[]
      ).map((o) => ({
        id: String(o.id),
        numero: o.numero,
        titulo: o.titulo,
        destinatario: o.destinatario,
        assunto: o.assunto,
        dataEmissao: o.data_emissao,
        dataProtocolo: o.data_protocolo ?? '',
        numeroProtocolo: o.numero_protocolo,
        status: o.status,
        observacoes: o.observacoes,
      }));

      setOficios(oficiosApi);

      // Mantém uma cópia local apenas como fallback
      save('oficios', oficiosApi);

    } catch (error) {
      console.error(
        'Erro ao carregar ofícios do Django:',
        error
      );

      setOficios(
        load('oficios', [])
      );
    }
  }

  carregarOficios();
}, []);


  /*
   * ============================================================
   * MORADORES
   * ============================================================
   */

  const addMorador = useCallback(
    async (
      m: Omit<Morador, 'id' | 'dataCadastro'>
    ): Promise<Morador> => {
      try {
        const data = (await api.post(
          '/moradores/',
          {
            nome: m.nome,
            data_nascimento: m.dataNascimento,
            cpf: m.cpf,
            rg: m.rg,
            familia: m.familia ? Number(m.familia) : null,
            telefone: m.telefone,
            ocupacao: m.ocupacao,
            escolaridade: m.escolaridade,
            endereco: m.endereco,
            status: m.status,
            comorbidade: m.comorbidade,
            veiculo: m.veiculo,
          }
        )) as Morador;

        const novo: Morador = {
          ...m,
          ...data,
          id: String(data.id),
          familia: data.familia == null ? null : String(data.familia),
          dataCadastro:
            data.dataCadastro ||
            new Date().toISOString().split('T')[0],
        };

        setMoradores((prev) => {
          const next = [...prev, novo];
          save('moradores', next);
          return next;
        });

        return novo;
      } catch (error) {
        console.error(
          'Erro ao cadastrar morador:',
          error
        );

        throw error;
      }
    },
    []
  );

  const updateMorador = useCallback(
    async (m: Morador): Promise<void> => {
      try {
        const data = (await api.put(
          `/moradores/${m.id}/`,
          {
            nome: m.nome,
            data_nascimento: m.dataNascimento,
            cpf: m.cpf,
            rg: m.rg,
            familia: m.familia ? Number(m.familia) : null,
            telefone: m.telefone,
            ocupacao: m.ocupacao,
            escolaridade: m.escolaridade,
            endereco: m.endereco,
            status: m.status,
            comorbidade: m.comorbidade,
            veiculo: m.veiculo,
          }
        )) as Morador;

        const atualizado: Morador = {
          ...m,
          ...data,
          id: String(data.id),
          familia: data.familia == null ? null : String(data.familia),
        };

        setMoradores((prev) => {
          const next = prev.map((x) =>
            x.id === atualizado.id
              ? atualizado
              : x
          );

          save('moradores', next);

          return next;
        });
      } catch (error) {
        console.error(
          'Erro ao atualizar morador:',
          error
        );

        throw error;
      }
    },
    []
  );

  const deleteMorador = useCallback(async (id: string): Promise<void> => {
  try {
    await api.delete(`/moradores/${id}/`);

    setMoradores(prev =>
      prev.filter(m => m.id !== id)
    );
  } catch (error) {
    console.error('Erro ao excluir morador:', error);
    throw error;
  }
}, []);
  /*
   * ============================================================
   * FAMÍLIAS
   * ============================================================
   */

  const addFamilia = useCallback(
  async (f: Omit<Familia, 'id'>): Promise<Familia> => {
    try {
      if (familiaDuplicada(familias, f)) {
        throw new Error('Já existe uma família com este nome e responsável.');
      }
      const data = (await api.post('/familias/', {
        nome: f.nome,
        responsavel: f.responsavel,
        responsavel_morador_id: f.responsavelMoradorId ? Number(f.responsavelMoradorId) : null,
        endereco: f.endereco,
        total_membros: f.total_membros,
      })) as Familia & { responsavel_morador_id?: number | string | null };

      const nova: Familia = {
        ...f,
        ...data,
        id: String(data.id),
        responsavelMoradorId: data.responsavel_morador_id == null ? null : String(data.responsavel_morador_id),
      };

      setFamilias((prev) => [...prev, nova]);
      if (f.responsavelMoradorId) {
        setMoradores((prev) => prev.map((morador) => String(morador.id) === String(f.responsavelMoradorId)
          ? { ...morador, familia: nova.id } : morador));
      }

      return nova;
    } catch (error) {
      console.error(
        'Erro ao cadastrar família:',
        error
      );

      throw error;
    }
  },
  [familias, moradores]
);

  const updateFamilia = useCallback(
  async (f: Familia): Promise<void> => {
    try {
      const atual = familias.find((familia) => String(familia.id) === String(f.id));
      const identidadeAlterada = !atual ||
        normalizarIdentidadeFamilia(atual.nome) !== normalizarIdentidadeFamilia(f.nome) ||
        normalizarIdentidadeFamilia(atual.responsavel) !== normalizarIdentidadeFamilia(f.responsavel);
      if (identidadeAlterada && familiaDuplicada(familias, f, f.id)) {
        throw new Error('Já existe uma família com este nome e responsável.');
      }
      const data = (await api.put(
        `/familias/${f.id}/`,
        {
          nome: f.nome,
          responsavel: f.responsavel,
        responsavel_morador_id: f.responsavelMoradorId ? Number(f.responsavelMoradorId) : null,
          endereco: f.endereco,
          total_membros: f.total_membros,
        }
      )) as Familia & { responsavel_morador_id?: number | string | null };

      const atualizada: Familia = {
        ...f,
        ...data,
        id: String(data.id),
        responsavelMoradorId: data.responsavel_morador_id == null ? null : String(data.responsavel_morador_id),
      };

      if (f.responsavelMoradorId) {
        setMoradores((prev) => prev.map((morador) => String(morador.id) === String(f.responsavelMoradorId)
          ? { ...morador, familia: atualizada.id } : morador));
      }

      setFamilias((prev) => {
        const next = prev.map((x) =>
          String(x.id) === String(atualizada.id)
            ? atualizada
            : x
        );

        save('familias', next);

        return next;
      });
    } catch (error) {
      console.error(
        'Erro ao atualizar família:',
        error
      );

      throw error;
    }
  },
  [familias, moradores]
);

  const deleteFamilia = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(`/familias/${id}/`);

      setFamilias((prev) =>
        prev.filter((f) => String(f.id) !== String(id))
      );
    } catch (error) {
      console.error('Erro ao excluir família:', error);
      throw error;
    }
  },
  []
);

  /*
   * ============================================================
   * DOCUMENTOS
   * ============================================================
   */

  const addDocumento = useCallback(
  async (
    d: Omit<Documento, 'id' | 'arquivo'> & {
      arquivo: File;
    }
  ): Promise<Documento> => {
    try {
      const formData = new FormData();

      formData.append('morador', String(d.moradorId));
      formData.append('titulo', d.titulo);
      formData.append('tipo', d.tipo);
      formData.append('data_emissao', d.dataEmissao);
      formData.append('arquivo', d.arquivo);

      const data = (await api.post(
        '/documentos/',
        formData
      )) as DocumentoAPI;

      const novo: Documento = {
        id: String(data.id),
        titulo: data.titulo,
        tipo: data.tipo,
        morador: data.morador_detalhes?.nome ?? d.morador,
        moradorId: String(data.morador),
        dataEmissao: data.data_emissao,
        arquivo: data.arquivo,
      };

      setDocumentos((prev) => {
        const next = [...prev, novo];
        save('documentos', next);
        return next;
      });

      return novo;
    } catch (error) {
      console.error('Erro ao cadastrar documento:', error);
      throw error;
    }
  },
  []
);

  const updateDocumento = useCallback(
  async (
    d: Omit<Documento, 'arquivo'> & {
      arquivo?: File;
    }
  ): Promise<Documento> => {
    try {
      const formData = new FormData();

      formData.append('morador', String(d.moradorId));
      formData.append('titulo', d.titulo);
      formData.append('tipo', d.tipo);
      formData.append('data_emissao', d.dataEmissao);

      if (d.arquivo) {
        formData.append('arquivo', d.arquivo);
      }

      const data = (await api.patch(
        `/documentos/${d.id}/`,
        formData
      )) as DocumentoAPI;

      const atualizado: Documento = {
        id: String(data.id),
        titulo: data.titulo,
        tipo: data.tipo,
        morador: data.morador_detalhes?.nome ?? d.morador,
        moradorId: String(data.morador),
        dataEmissao: data.data_emissao,
        arquivo: data.arquivo,
      };

      setDocumentos((prev) => {
        const next = prev.map((doc) =>
          String(doc.id) === String(d.id)
            ? atualizado
            : doc
        );

        save('documentos', next);

        return next;
      });

      return atualizado;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  },
  []
);


const deleteDocumento = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(`/documentos/${id}/`);

      setDocumentos((prev) => {
        const next = prev.filter(
          (documento) => String(documento.id) !== String(id)
        );

        save('documentos', next);

        return next;
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      throw error;
    }
  },
  []
);

  /*
   * ============================================================
   * EVENTOS
   * ============================================================
   */

  const addEvento = useCallback(
  async (e: Omit<EventoAgenda, 'id'>): Promise<EventoAgenda> => {
    try {
      const data = (await api.post('/agenda/', {
        titulo: e.titulo,
        descricao: e.descricao,
        data: e.data,
        hora: e.hora,
        local: e.local,
        responsavel: e.responsavel,
        tipo: e.tipo,
      })) as EventoAgendaAPI;

      const novo: EventoAgenda = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        hora: data.hora,
        local: data.local,
        responsavel: data.responsavel,
        tipo: data.tipo,
      };

      setEventos((prev) => [...prev, novo]);

      return novo;
    } catch (error) {
      console.error('Erro ao cadastrar evento:', error);
      throw error;
    }
  },
  []
);

  const updateEvento = useCallback(
  async (e: EventoAgenda): Promise<void> => {
    try {
      const data = (await api.put(`/agenda/${e.id}/`, {
        titulo: e.titulo,
        descricao: e.descricao,
        data: e.data,
        hora: e.hora,
        local: e.local,
        responsavel: e.responsavel,
        tipo: e.tipo,
      })) as EventoAgendaAPI;

      const atualizado: EventoAgenda = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        hora: data.hora,
        local: data.local,
        responsavel: data.responsavel,
        tipo: data.tipo,
      };

      setEventos((prev) =>
        prev.map((evento) =>
          String(evento.id) === String(atualizado.id)
            ? atualizado
            : evento
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },
  []
);

  const deleteEvento = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(`/agenda/${id}/`);

      setEventos((prev) =>
        prev.filter((evento) => String(evento.id) !== String(id))
      );
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  },
  []
);

  /*
   * ============================================================
   * RELATÓRIOS
   * ============================================================
   */

 const addRelatorio = useCallback(
  async (r: Omit<RelatorioAtividade, 'id'>): Promise<RelatorioAtividade> => {
    try {
      const data = (await api.post('/relatorios-atividade/', {
        titulo: r.titulo,
        descricao: r.descricao,
        data: r.data,
        responsavel: r.responsavel,
        categoria: r.categoria,
        status: r.status,
        imagens: r.imagens ?? [],
      })) as RelatorioAPI;

      const novo: RelatorioAtividade = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        responsavel: data.responsavel,
        categoria: data.categoria,
        status: data.status,
        imagens: data.imagens ?? [],
      };

      setRelatorios((prev) => {
        const next = [...prev, novo];
        save('relatorios', next);
        return next;
      });

      return novo;
    } catch (error) {
      console.error('Erro ao cadastrar relatório:', error);
      throw error;
    }
  },
  []
);

const updateRelatorio = useCallback(
  async (r: RelatorioAtividade): Promise<void> => {
    try {
      const data = (await api.put(`/relatorios-atividade/${r.id}/`, {
        titulo: r.titulo,
        descricao: r.descricao,
        data: r.data,
        responsavel: r.responsavel,
        categoria: r.categoria,
        status: r.status,
        imagens: r.imagens ?? [],
      })) as RelatorioAPI;

      const atualizado: RelatorioAtividade = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        responsavel: data.responsavel,
        categoria: data.categoria,
        status: data.status,
        imagens: data.imagens ?? [],
      };

      setRelatorios((prev) => {
        const next = prev.map((relatorio) =>
          String(relatorio.id) === String(atualizado.id)
            ? atualizado
            : relatorio
        );

        save('relatorios', next);
        return next;
      });
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      throw error;
    }
  },
  []
);

const deleteRelatorio = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(`/relatorios-atividade/${id}/`);

      setRelatorios((prev) => {
        const next = prev.filter(
          (relatorio) => String(relatorio.id) !== String(id)
        );

        save('relatorios', next);
        return next;
      });
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      throw error;
    }
  },
  []
);

  /*
 * ============================================================
 * OFÍCIOS
 * ============================================================
 */

const addOficio = useCallback(
  async (
    o: Omit<Oficio, 'id'>
  ): Promise<Oficio> => {
    try {
      const data = (await api.post(
        '/oficios/',
        {
          numero: o.numero,
          titulo: o.titulo,
          destinatario: o.destinatario,
          assunto: o.assunto,
          data_emissao: o.dataEmissao,
          data_protocolo: o.dataProtocolo || null,
          numero_protocolo: o.numeroProtocolo,
          status: o.status,
          observacoes: o.observacoes,
        }
      )) as OficioAPI;

      const novo: Oficio = {
        id: String(data.id),
        numero: data.numero,
        titulo: data.titulo,
        destinatario: data.destinatario,
        assunto: data.assunto,
        dataEmissao: data.data_emissao,
        dataProtocolo:
          data.data_protocolo ?? '',
        numeroProtocolo:
          data.numero_protocolo,
        status: data.status,
        observacoes: data.observacoes,
      };

      setOficios((prev) => {
        const next = [...prev, novo];

        save('oficios', next);

        return next;
      });

      return novo;

    } catch (error) {
      console.error(
        'Erro ao cadastrar ofício:',
        error
      );

      throw error;
    }
  },
  []
);

const updateOficio = useCallback(
  async (
    o: Oficio
  ): Promise<void> => {
    try {
      const data = (await api.put(
        `/oficios/${o.id}/`,
        {
          numero: o.numero,
          titulo: o.titulo,
          destinatario: o.destinatario,
          assunto: o.assunto,
          data_emissao: o.dataEmissao,
          data_protocolo:
            o.dataProtocolo || null,
          numero_protocolo:
            o.numeroProtocolo,
          status: o.status,
          observacoes: o.observacoes,
        }
      )) as OficioAPI;

      const atualizado: Oficio = {
        id: String(data.id),
        numero: data.numero,
        titulo: data.titulo,
        destinatario: data.destinatario,
        assunto: data.assunto,
        dataEmissao: data.data_emissao,
        dataProtocolo:
          data.data_protocolo ?? '',
        numeroProtocolo:
          data.numero_protocolo,
        status: data.status,
        observacoes: data.observacoes,
      };

      setOficios((prev) => {
        const next = prev.map((x) =>
          String(x.id) === String(atualizado.id)
            ? atualizado
            : x
        );

        save('oficios', next);

        return next;
      });

    } catch (error) {
      console.error(
        'Erro ao atualizar ofício:',
        error
      );

      throw error;
    }
  },
  []
);

const deleteOficio = useCallback(
  async (
    id: string
  ): Promise<void> => {
    try {
      await api.delete(
        `/oficios/${id}/`
      );

      setOficios((prev) => {
        const next = prev.filter(
          (o) => String(o.id) !== String(id)
        );

        save('oficios', next);

        return next;
      });

    } catch (error) {
      console.error(
        'Erro ao excluir ofício:',
        error
      );

      throw error;
    }
  },
  []
);

  return (
    <DataContext.Provider
      value={{
        moradores,
        addMorador,
        updateMorador,
        deleteMorador,

        familias,
        addFamilia,
        updateFamilia,
        deleteFamilia,

        atividades,
        atividadesCarregando,
        atividadesErro,

        documentos,
        addDocumento,
        updateDocumento,
        deleteDocumento,

        dependentes,

        eventos,
        atividadesRegistradas,
        addEvento,
        updateEvento,
        deleteEvento,

        relatorios,
        addRelatorio,
        updateRelatorio,
        deleteRelatorio,

        oficios,
        addOficio,
        updateOficio,
        deleteOficio,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);

  if (!ctx) {
    throw new Error(
      'useData must be used within DataProvider'
    );
  }

  return ctx;
}
