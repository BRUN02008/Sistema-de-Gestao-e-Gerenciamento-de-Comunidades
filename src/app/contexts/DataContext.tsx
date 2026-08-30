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
  mockMensalidades,
  mockInvestimentos,
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
  updateMensalidade: (m: Mensalidade) => void;
  addMensalidade: (m: Omit<Mensalidade, 'id'>) => Mensalidade;
  deleteMensalidade: (id: string) => void;

  // Investimentos
  investimentos: Investimento[];
  addInvestimento: (i: Omit<Investimento, 'id'>) => Investimento;
  updateInvestimento: (i: Investimento) => void;

  // Despesas
  despesas: Despesa[];
  addDespesa: (d: Omit<Despesa, 'id'>) => Despesa;
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

  const [mensalidades, setMensalidades] =
    useState<Mensalidade[]>(() =>
      load('mensalidades', mockMensalidades)
    );

  const [investimentos, setInvestimentos] =
    useState<Investimento[]>(() =>
      load('investimentos', mockInvestimentos)
    );

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
    (m: Mensalidade) => {
      setMensalidades((prev) => {
        const next = prev.map((x) =>
          x.id === m.id ? m : x
        );

        save('mensalidades', next);

        return next;
      });
    },
    []
  );

  const addMensalidade = useCallback(
    (m: Omit<Mensalidade, 'id'>): Mensalidade => {
      const nova = {
        ...m,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setMensalidades((prev) => {
        const next = [...prev, nova];
        save('mensalidades', next);
        return next;
      });

      return nova;
    },
    []
  );

  const deleteMensalidade = useCallback(
    (id: string) => {
      setMensalidades((prev) => {
        const next = prev.filter(
          (x) => x.id !== id
        );

        save('mensalidades', next);

        return next;
      });
    },
    []
  );

  /*
   * ============================================================
   * INVESTIMENTOS
   * ============================================================
   */

  const addInvestimento = useCallback(
    (i: Omit<Investimento, 'id'>): Investimento => {
      const novo = {
        ...i,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      };

      setInvestimentos((prev) => {
        const next = [...prev, novo];
        save('investimentos', next);
        return next;
      });

      return novo;
    },
    []
  );

  const updateInvestimento = useCallback(
    (i: Investimento) => {
      setInvestimentos((prev) => {
        const next = prev.map((x) =>
          x.id === i.id ? i : x
        );

        save('investimentos', next);

        return next;
      });
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