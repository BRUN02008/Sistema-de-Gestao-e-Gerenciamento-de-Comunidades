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
  mockEventos,
  mockDespesas,
  mockRelatorios,
  mockOficios,
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
updateFamilia: (f: Familia) => void;
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
  addEvento: (e: Omit<EventoAgenda, 'id'>) => EventoAgenda;
  updateEvento: (e: EventoAgenda) => void;
  deleteEvento: (id: string) => void;

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
) => Despesa;
  updateDespesa: (d: Despesa) => void;
  deleteDespesa: (id: string) => void;

  // Relatórios
  relatorios: RelatorioAtividade[];
  addRelatorio: (
    r: Omit<RelatorioAtividade, 'id'>
  ) => RelatorioAtividade;
  updateRelatorio: (r: RelatorioAtividade) => void;
  deleteRelatorio: (id: string) => void;

  // Ofícios
  oficios: Oficio[];
  addOficio: (o: Omit<Oficio, 'id'>) => Oficio;
  updateOficio: (o: Oficio) => void;
  deleteOficio: (id: string) => void;
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

  const [eventos, setEventos] =
    useState<EventoAgenda[]>(() =>
      load('eventos', mockEventos)
    );

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

const [despesas, setDespesas] =
  useState<Despesa[]>(() =>
    load('despesas', mockDespesas)
  );

  const [relatorios, setRelatorios] =
    useState<RelatorioAtividade[]>(() =>
      load('relatorios', mockRelatorios)
    );

  const [oficios, setOficios] =
    useState<Oficio[]>(() =>
      load('oficios', mockOficios)
    );



    useEffect(() => {
  async function carregarMensalidades() {
    try {
      const data = await api.get('/mensalidades/');

      if (!Array.isArray(data)) {
        setMensalidades([]);
        return;
      }

      const mensalidadesApi: Mensalidade[] =
        (data as MensalidadeAPI[]).map((m) => ({
          id: String(m.id),

          moradorId: '',
          moradorNome: '',
          familia: String(m.familia),

          mesReferencia: m.mes_referencia,
          valor: Number(m.valor),

          status: m.status,

          dataVencimento: m.data_vencimento,

          dataPagamento:
            m.data_pagamento || undefined,

          metodoPagamento:
            m.metodo_pagamento || undefined,
        }));

      setMensalidades(mensalidadesApi);
    } catch (error) {
      console.error(
        'Erro ao carregar mensalidades do Django:',
        error
      );

      setMensalidades([]);
    }
  }

  carregarMensalidades();
}, []);





useEffect(() => {
  async function carregarInvestimentos() {
    try {
      const data = await api.get('/investimentos/');

      if (!Array.isArray(data)) {
        setInvestimentos([]);
        return;
      }

      const investimentosApi: Investimento[] =
        (data as InvestimentoAPI[]).map((i) => ({
          id: String(i.id),
          titulo: i.titulo,
          categoria: i.categoria,
          valor: Number(i.valor),
          data: i.data,
          responsavel: i.responsavel,
          status: i.status,
          descricao: i.descricao,
          observacoes: i.observacoes ?? undefined,
        }));

      setInvestimentos(investimentosApi);
    } catch (error) {
      console.error(
        'Erro ao carregar investimentos do Django:',
        error
      );

      setInvestimentos([]);
    }
  }

  carregarInvestimentos();
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
    (f: Familia) => {
      setFamilias((prev) => {
        const next = prev.map((x) =>
          x.id === f.id ? f : x
        );

        save('familias', next);

        return next;
      });
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
    (e: Omit<EventoAgenda, 'id'>): EventoAgenda => {
      const novo = {
        ...e,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setEventos((prev) => {
        const next = [...prev, novo];
        save('eventos', next);
        return next;
      });

      return novo;
    },
    []
  );

  const updateEvento = useCallback(
    (e: EventoAgenda) => {
      setEventos((prev) => {
        const next = prev.map((x) =>
          x.id === e.id ? e : x
        );

        save('eventos', next);

        return next;
      });
    },
    []
  );

  const deleteEvento = useCallback(
    (id: string) => {
      setEventos((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('eventos', next);

        return next;
      });
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
      const data = (await api.post(
        '/mensalidades/',
        {
          morador: Number(m.moradorId),
          mes_referencia: m.mesReferencia,
          data_vencimento: m.dataVencimento,
          valor: m.valor,
          status: m.status,
          data_pagamento: m.dataPagamento,
          metodo_pagamento: m.metodoPagamento,
        }
      )) as {
        id: number | string;
        morador?: number | string;
        familia?: number | string;
        mes_referencia?: string;
        data_vencimento?: string;
        valor?: number;
        status?: Mensalidade['status'];
        data_pagamento?: string;
        metodo_pagamento?: string;
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

        valor:
          data.valor ?? m.valor,

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
  (d: Omit<Despesa, 'id'>): Despesa => {
      const nova = {
        ...d,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setDespesas((prev) => {
        const next = [...prev, nova];
        save('despesas', next);
        return next;
      });

      return nova;
    },
    []
  );

  const updateDespesa = useCallback(
    (d: Despesa) => {
      setDespesas((prev) => {
        const next = prev.map((x) =>
          x.id === d.id ? d : x
        );

        save('despesas', next);

        return next;
      });
    },
    []
  );

  const deleteDespesa = useCallback(
    (id: string) => {
      setDespesas((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('despesas', next);

        return next;
      });
    },
    []
  );

  /*
   * ============================================================
   * RELATÓRIOS
   * ============================================================
   */

  const addRelatorio = useCallback(
    (
      r: Omit<RelatorioAtividade, 'id'>
    ): RelatorioAtividade => {
      const novo = {
        ...r,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setRelatorios((prev) => {
        const next = [...prev, novo];
        save('relatorios', next);
        return next;
      });

      return novo;
    },
    []
  );

  const updateRelatorio = useCallback(
    (r: RelatorioAtividade) => {
      setRelatorios((prev) => {
        const next = prev.map((x) =>
          x.id === r.id ? r : x
        );

        save('relatorios', next);

        return next;
      });
    },
    []
  );

  const deleteRelatorio = useCallback(
    (id: string) => {
      setRelatorios((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('relatorios', next);

        return next;
      });
    },
    []
  );

  /*
   * ============================================================
   * OFÍCIOS
   * ============================================================
   */

  const addOficio = useCallback(
    (o: Omit<Oficio, 'id'>): Oficio => {
      const novo = {
        ...o,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setOficios((prev) => {
        const next = [...prev, novo];
        save('oficios', next);
        return next;
      });

      return novo;
    },
    []
  );

  const updateOficio = useCallback(
    (o: Oficio) => {
      setOficios((prev) => {
        const next = prev.map((x) =>
          x.id === o.id ? o : x
        );

        save('oficios', next);

        return next;
      });
    },
    []
  );

  const deleteOficio = useCallback(
    (id: string) => {
      setOficios((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('oficios', next);

        return next;
      });
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