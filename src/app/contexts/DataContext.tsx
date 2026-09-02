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
  type Mensalidade,
  type Investimento,
  type Despesa,
  type RelatorioAtividade,
  type Oficio,

  mockAtividades,
  mockDocumentos,
  mockDependentes,
} from '../data/mockData';

import { api } from '../../services/api';

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

  // Documentos
  documentos: Documento[];
  addDocumento: (d: Omit<Documento, 'id'>) => Documento;
  deleteDocumento: (id: string) => void;

  // Dependentes
  dependentes: Dependente[];

  // Eventos
  eventos: EventoAgenda[];

addEvento: (
  e: Omit<EventoAgenda, 'id'>
) => Promise<EventoAgenda>;

updateEvento: (
  e: EventoAgenda
) => Promise<void>;

deleteEvento: (
  id: string
) => Promise<void>;

  // Mensalidades
  mensalidades: Mensalidade[];
  updateMensalidade: (m: Mensalidade) => Promise<void>;
  addMensalidade: (
  m: Omit<Mensalidade, 'id'>
) => Promise<Mensalidade>;
  deleteMensalidade: (id: string) => Promise<void>;

  // Investimentos
  investimentos: Investimento[];
  addInvestimento: (
  i: Omit<Investimento, 'id'>
) => Promise<Investimento>;

updateInvestimento: (
  i: Investimento
) => Promise<void>;

deleteInvestimento: (
  id: string
) => Promise<void>;

  // Despesas
  despesas: Despesa[];
addDespesa: (
  d: Omit<Despesa, 'id'>
) => Promise<Despesa>;
  updateDespesa: (d: Despesa) => Promise<void>;
  deleteDespesa: (id: string) => Promise<void>;

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

interface MensalidadeAPI {
  id: number | string;
  familia: number | string;
  mes_referencia: string;
  valor: number | string;
  status: 'pago' | 'pendente' | 'atrasado';
  data_vencimento: string;
  data_pagamento?: string | null;
  metodo_pagamento?: 'dinheiro' | 'pix' | 'transferencia' | null;
}

type InvestimentoAPI = {
  id: number | string;
  titulo: string;
  descricao: string;
  categoria: Investimento['categoria'];
  valor: number | string;
  data: string;
  status: Investimento['status'];
  responsavel: string;
  observacoes?: string | null;
};


interface DespesaAPI {
  id: number | string;
  categoria: Despesa['categoria'];
  valor: number | string;
  data: string;
  responsavel: string;
  descricao: string;
  criado_em?: string;
}

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
  tipo: 'reuniao' | 'evento' | 'assembleia' | 'outro';
  criado_em?: string;
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
          familia: String(m.familia),
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
        setFamilias(data);
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

  const [atividades] =
    useState<Atividade[]>(() =>
      load('atividades', mockAtividades)
    );

  const [documentos, setDocumentos] =
    useState<Documento[]>(() =>
      load('documentos', mockDocumentos)
    );

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

  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);

  useEffect(() => {
  async function carregarMensalidades() {
    try {
      const data = await api.get('/mensalidades/');

      if (!Array.isArray(data)) {
        setMensalidades([]);
        return;
      }

      const mensalidadesApi: Mensalidade[] = (
        data as MensalidadeAPI[]
      ).map((m) => {
        const morador = moradores.find(
          (morador) =>
            String(morador.familia) === String(m.familia)
        );

        return {
          id: String(m.id),
          moradorId: morador?.id ?? '',
          moradorNome: morador?.nome ?? '',
          familia: morador?.familia ?? String(m.familia),
          valor: Number(m.valor),
          mesReferencia: m.mes_referencia,
          dataVencimento: m.data_vencimento,
          dataPagamento: m.data_pagamento ?? undefined,
          status: m.status,
          metodoPagamento:
            m.metodo_pagamento ?? undefined,
        };
      });

      setMensalidades(mensalidadesApi);
      save('mensalidades', mensalidadesApi);
    } catch (error) {
      console.error(
        'Erro ao carregar mensalidades do Django:',
        error
      );

     setMensalidades([]);
    }
  }

  carregarMensalidades();
}, [moradores]);
   
const [investimentos, setInvestimentos] =
  useState<Investimento[]>([]);

useEffect(() => {
  async function carregarInvestimentos() {
    try {
      const data = (await api.get(
        '/investimentos/'
      )) as InvestimentoAPI[];

      const investimentosApi: Investimento[] = data.map(
        (i) => ({
          id: String(i.id),
          titulo: i.titulo,
          descricao: i.descricao,
          categoria: i.categoria,
          valor: Number(i.valor),
          data: i.data,
          status: i.status,
          responsavel: i.responsavel,
          observacoes:
            i.observacoes ?? undefined,
        })
      );

      setInvestimentos(investimentosApi);

      save('investimentos', investimentosApi);
    } catch (error) {
      console.error(
        'Erro ao carregar investimentos do Django:',
        error
      );

      setInvestimentos(
        load('investimentos', [])
      );
    }
  }

  carregarInvestimentos();
}, []);

const [despesas, setDespesas] = useState<Despesa[]>([]);

useEffect(() => {
  async function carregarDespesas() {
    try {
      const data = await api.get('/despesas/');

      if (!Array.isArray(data)) {
        setDespesas([]);
        return;
      }

      const despesasApi: Despesa[] =
        (data as DespesaAPI[]).map((d) => ({
          id: String(d.id),
          categoria: d.categoria,
          valor: Number(d.valor),
          data: d.data,
          responsavel: d.responsavel,
          descricao: d.descricao,
        }));

      setDespesas(despesasApi);

      // Mantém cópia local apenas como fallback
      save('despesas', despesasApi);

    } catch (error) {
      console.error(
        'Erro ao carregar despesas do Django:',
        error
      );

      setDespesas(
        load('despesas', [])
      );
    }
  }

  carregarDespesas();
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
            familia: Number(m.familia),
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
          familia: String(data.familia),
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
            familia: Number(m.familia),
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
          familia: String(data.familia),
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
      const data = (await api.post('/familias/', {
        nome: f.nome,
        responsavel: f.responsavel,
        endereco: f.endereco,
        total_membros: f.total_membros,
      })) as Familia;

      const nova: Familia = {
        ...f,
        ...data,
        id: String(data.id),
      };

      setFamilias((prev) => [...prev, nova]);

      return nova;
    } catch (error) {
      console.error(
        'Erro ao cadastrar família:',
        error
      );

      throw error;
    }
  },
  []
);

  const updateFamilia = useCallback(
  async (f: Familia): Promise<void> => {
    try {
      const data = (await api.put(
        `/familias/${f.id}/`,
        {
          nome: f.nome,
          responsavel: f.responsavel,
          endereco: f.endereco,
          total_membros: f.total_membros,
        }
      )) as Familia;

      const atualizada: Familia = {
        ...f,
        ...data,
        id: String(data.id),
      };

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
  []
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
    (d: Omit<Documento, 'id'>): Documento => {
      const novo: Documento = {
        ...d,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setDocumentos((prev) => {
        const next = [...prev, novo];
        save('documentos', next);
        return next;
      });

      return novo;
    },
    []
  );

  const deleteDocumento = useCallback(
    (id: string) => {
      setDocumentos((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('documentos', next);

        return next;
      });
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
   * MENSALIDADES
   * ============================================================
   */

  const updateMensalidade = useCallback(
  async (m: Mensalidade): Promise<void> => {
    try {
      const data = await api.put(
        `/mensalidades/${m.id}/`,
        {
          familia: Number(m.familia),
          mes_referencia: m.mesReferencia,
          valor: m.valor,
          status: m.status,
          data_vencimento: m.dataVencimento,
          data_pagamento: m.dataPagamento ?? null,
          metodo_pagamento: m.metodoPagamento ?? null,
        }
      ) as MensalidadeAPI;

      const atualizada: Mensalidade = {
        ...m,
        id: String(data.id),
        familia: String(data.familia),
        mesReferencia:
          data.mes_referencia ?? m.mesReferencia,
        valor:
          Number(data.valor ?? m.valor),
        status:
          data.status ?? m.status,
        dataVencimento:
          data.data_vencimento ?? m.dataVencimento,
        dataPagamento:
          data.data_pagamento ?? m.dataPagamento,
        metodoPagamento:
          data.metodo_pagamento ??
          m.metodoPagamento,
      };

      setMensalidades((prev) =>
        prev.map((x) =>
          x.id === atualizada.id
            ? atualizada
            : x
        )
      );

    } catch (error) {
      console.error(
        'Erro ao atualizar mensalidade:',
        error
      );

      throw error;
    }
  },
  []
);

  

  const deleteMensalidade = useCallback(
  async (id: string) => {
    try {
      await api.delete(
        `/mensalidades/${id}/`
      );

      setMensalidades(prev =>
        prev.filter(x => x.id !== id)
      );
    } catch (error) {
      console.error(
        'Erro ao excluir mensalidade:',
        error
      );

      throw error;
    }
  },
  []
);const addMensalidade = useCallback(
  async (
    m: Omit<Mensalidade, 'id'>
  ): Promise<Mensalidade> => {
    try {
      const payload: Record<string, unknown> = {
  familia: Number(m.familia),
  mes_referencia: m.mesReferencia,
  data_vencimento: m.dataVencimento,
  valor: m.valor,
  status: m.status,
};

if (m.status === 'pago') {
  payload.data_pagamento = m.dataPagamento ?? null;
  payload.metodo_pagamento = m.metodoPagamento ?? 'dinheiro';
}

const data = (await api.post(
  '/mensalidades/',
  payload
)) as {
  id: number | string;
  familia?: number | string;
  morador?: string | number;
  mes_referencia?: string;
  data_vencimento?: string;
  valor?: number | string;
  status?: Mensalidade['status'];
  data_pagamento?: string | null;
  metodo_pagamento?: 'dinheiro' | 'pix' | 'transferencia' | null;
};

      const nova: Mensalidade = {
        ...m,

        id: String(data.id),

        moradorId: String(
          data.morador ?? m.moradorId
        ),

        moradorNome: m.moradorNome,

        familia: String(
          data.familia ?? m.familia
        ),

        mesReferencia:
          data.mes_referencia ?? m.mesReferencia,

        dataVencimento:
          data.data_vencimento ?? m.dataVencimento,

       valor: Number(data.valor ?? m.valor),

        status:
          data.status ?? m.status,

        dataPagamento:
          data.data_pagamento ?? m.dataPagamento,

        metodoPagamento:
          data.metodo_pagamento === 'dinheiro' ||
          data.metodo_pagamento === 'pix' ||
          data.metodo_pagamento === 'transferencia'
            ? data.metodo_pagamento
            : m.metodoPagamento,
      };

      setMensalidades(prev => {
        const next = [...prev, nova];
        save('mensalidades', next);
        return next;
      });

      return nova;

    } catch (error) {
      console.error(
        'Erro ao cadastrar mensalidade:',
        error
      );

      throw error;
    }
  },
  []
);

  /*
   * ============================================================
   * INVESTIMENTOS
   * ============================================================
   */

 const addInvestimento = useCallback(
  async (
    i: Omit<Investimento, 'id'>
  ): Promise<Investimento> => {
    try {
      const data = (await api.post(
        '/investimentos/',
        {
          titulo: i.titulo,
          descricao: i.descricao,
          categoria: i.categoria,
          valor: i.valor,
          data: i.data,
          responsavel: i.responsavel,
          status: i.status,
          observacoes: i.observacoes,
        }
      )) as InvestimentoAPI;

      const novo: Investimento = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        valor: Number(data.valor),
        data: data.data,
        status: data.status,
        responsavel: data.responsavel,
        observacoes:
          data.observacoes ?? undefined,
      };

      setInvestimentos((prev) => {
        const next = [...prev, novo];

        save('investimentos', next);

        return next;
      });

      return novo;
    } catch (error) {
      console.error(
        'Erro ao cadastrar investimento:',
        error
      );

      throw error;
    }
  },
  []
);


  const updateInvestimento = useCallback(
  async (i: Investimento): Promise<void> => {
    try {
      const data = (await api.put(
        `/investimentos/${i.id}/`,
        {
          titulo: i.titulo,
          descricao: i.descricao,
          categoria: i.categoria,
          valor: i.valor,
          data: i.data,
          responsavel: i.responsavel,
          status: i.status,
          observacoes: i.observacoes,
        }
      )) as InvestimentoAPI;

      const atualizada: Investimento = {
        id: String(data.id),
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        valor: Number(data.valor),
        data: data.data,
        status: data.status,
        responsavel: data.responsavel,
        observacoes:
          data.observacoes ?? undefined,
      };

      setInvestimentos((prev) => {
        const next = prev.map((x) =>
          x.id === atualizada.id
            ? atualizada
            : x
        );

        save('investimentos', next);

        return next;
      });
    } catch (error) {
      console.error(
        'Erro ao atualizar investimento:',
        error
      );

      throw error;
    }
  },
  []
);


const deleteInvestimento = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(
        `/investimentos/${id}/`
      );

      setInvestimentos((prev) => {
        const next = prev.filter(
          (i) => i.id !== id
        );

        save('investimentos', next);

        return next;
      });
    } catch (error) {
      console.error(
        'Erro ao excluir investimento:',
        error
      );

      throw error;
    }
  },
  []
);

  /*
   * ============================================================
   * DESPESAS
   * ============================================================
   */

 const addDespesa = useCallback(
  async (
    d: Omit<Despesa, 'id'>
  ): Promise<Despesa> => {
    try {
      const data = (await api.post(
        '/despesas/',
        {
          categoria: d.categoria,
          valor: d.valor,
          data: d.data,
          responsavel: d.responsavel,
          descricao: d.descricao,
        }
      )) as DespesaAPI;

      const nova: Despesa = {
        id: String(data.id),
        categoria: data.categoria,
        valor: Number(data.valor),
        data: data.data,
        responsavel: data.responsavel,
        descricao: data.descricao,
      };

      setDespesas((prev) => {
        const next = [...prev, nova];

        save('despesas', next);

        return next;
      });

      return nova;

    } catch (error) {
      console.error(
        'Erro ao cadastrar despesa:',
        error
      );

      throw error;
    }
  },
  []
);

  const updateDespesa = useCallback(
  async (d: Despesa): Promise<void> => {
    try {
      const data = (await api.put(
        `/despesas/${d.id}/`,
        {
          categoria: d.categoria,
          valor: d.valor,
          data: d.data,
          responsavel: d.responsavel,
          descricao: d.descricao,
        }
      )) as DespesaAPI;

      const atualizada: Despesa = {
        id: String(data.id),
        categoria: data.categoria,
        valor: Number(data.valor),
        data: data.data,
        responsavel: data.responsavel,
        descricao: data.descricao,
      };

      setDespesas((prev) => {
        const next = prev.map((x) =>
          x.id === atualizada.id
            ? atualizada
            : x
        );

        save('despesas', next);

        return next;
      });

    } catch (error) {
      console.error(
        'Erro ao atualizar despesa:',
        error
      );

      throw error;
    }
  },
  []
);

 const deleteDespesa = useCallback(
  async (id: string): Promise<void> => {
    try {
      await api.delete(
        `/despesas/${id}/`
      );

      setDespesas((prev) => {
        const next = prev.filter(
          (d) => d.id !== id
        );

        save('despesas', next);

        return next;
      });

    } catch (error) {
      console.error(
        'Erro ao excluir despesa:',
        error
      );

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

        documentos,
        addDocumento,
        deleteDocumento,

        dependentes,

        eventos,
        addEvento,
        updateEvento,
        deleteEvento,

        mensalidades,
        updateMensalidade,
        addMensalidade,
        deleteMensalidade,

        investimentos,
        addInvestimento,
        updateInvestimento,
        deleteInvestimento,

        despesas,
        addDespesa,
        updateDespesa,
        deleteDespesa,

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