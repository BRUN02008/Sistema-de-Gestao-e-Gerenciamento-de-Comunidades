import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import {
  type Morador, type Familia, type Atividade, type Documento, type Dependente,
  type EventoAgenda, type Mensalidade, type Investimento, type Despesa,
  type RelatorioAtividade, type Oficio,
  mockMoradores, mockFamilias, mockAtividades, mockDocumentos,
  mockDependentes, mockEventos, mockMensalidades, mockInvestimentos, mockDespesas,
  mockRelatorios, mockOficios
} from '../data/mockData';

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
    localStorage.setItem(`sisgest_${key}`, JSON.stringify(value));
  } catch {}
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface DataContextType {
  // Moradores
  moradores: Morador[];
  addMorador: (m: Omit<Morador, 'id' | 'dataCadastro'>) => Morador;
  updateMorador: (m: Morador) => void;
  deleteMorador: (id: string) => void;

  // Famílias
  familias: Familia[];
  addFamilia: (f: Omit<Familia, 'id'>) => Familia;
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

  // Relatórios de Atividade
  relatorios: RelatorioAtividade[];
  addRelatorio: (r: Omit<RelatorioAtividade, 'id'>) => RelatorioAtividade;
  updateRelatorio: (r: RelatorioAtividade) => void;
  deleteRelatorio: (id: string) => void;

  // Ofícios
  oficios: Oficio[];
  addOficio: (o: Omit<Oficio, 'id'>) => Oficio;
  updateOficio: (o: Oficio) => void;
  deleteOficio: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [moradores, setMoradores] = useState<Morador[]>(() => load('moradores', mockMoradores));
  const [familias, setFamilias] = useState<Familia[]>(() => load('familias', mockFamilias));
  const [atividades] = useState<Atividade[]>(() => load('atividades', mockAtividades));
  const [documentos, setDocumentos] = useState<Documento[]>(() => load('documentos', mockDocumentos));
  const [dependentes] = useState<Dependente[]>(() => load('dependentes', mockDependentes));
  const [eventos, setEventos] = useState<EventoAgenda[]>(() => load('eventos', mockEventos));
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>(() => load('mensalidades', mockMensalidades));
  const [investimentos, setInvestimentos] = useState<Investimento[]>(() => load('investimentos', mockInvestimentos));
  const [despesas, setDespesas] = useState<Despesa[]>(() => load('despesas', mockDespesas));
  const [relatorios, setRelatorios] = useState<RelatorioAtividade[]>(() => load('relatorios', mockRelatorios));
  const [oficios, setOficios] = useState<Oficio[]>(() => load('oficios', mockOficios));

  // ── Moradores ────────────────────────────────────────────────────
  const addMorador = useCallback((m: Omit<Morador, 'id' | 'dataCadastro'>): Morador => {
    const novo: Morador = { ...m, id: uid(), dataCadastro: new Date().toISOString().split('T')[0] };
    setMoradores(prev => { const next = [...prev, novo]; save('moradores', next); return next; });
    return novo;
  }, []);

  const updateMorador = useCallback((m: Morador) => {
    setMoradores(prev => { const next = prev.map(x => x.id === m.id ? m : x); save('moradores', next); return next; });
  }, []);

  const deleteMorador = useCallback((id: string) => {
    setMoradores(prev => { const next = prev.filter(x => x.id !== id); save('moradores', next); return next; });
  }, []);

  // ── Famílias ─────────────────────────────────────────────────────
  const addFamilia = useCallback((f: Omit<Familia, 'id'>): Familia => {
    const nova: Familia = { ...f, id: uid() };
    setFamilias(prev => { const next = [...prev, nova]; save('familias', next); return next; });
    return nova;
  }, []);

  const updateFamilia = useCallback((f: Familia) => {
    setFamilias(prev => { const next = prev.map(x => x.id === f.id ? f : x); save('familias', next); return next; });
  }, []);

  // ── Documentos ───────────────────────────────────────────────────
  const addDocumento = useCallback((d: Omit<Documento, 'id'>): Documento => {
    const novo: Documento = { ...d, id: uid() };
    setDocumentos(prev => { const next = [...prev, novo]; save('documentos', next); return next; });
    return novo;
  }, []);

  const deleteDocumento = useCallback((id: string) => {
    setDocumentos(prev => { const next = prev.filter(x => x.id !== id); save('documentos', next); return next; });
  }, []);

  // ── Eventos ──────────────────────────────────────────────────────
  const addEvento = useCallback((e: Omit<EventoAgenda, 'id'>): EventoAgenda => {
    const novo: EventoAgenda = { ...e, id: uid() };
    setEventos(prev => { const next = [...prev, novo]; save('eventos', next); return next; });
    return novo;
  }, []);

  const updateEvento = useCallback((e: EventoAgenda) => {
    setEventos(prev => { const next = prev.map(x => x.id === e.id ? e : x); save('eventos', next); return next; });
  }, []);

  const deleteEvento = useCallback((id: string) => {
    setEventos(prev => { const next = prev.filter(x => x.id !== id); save('eventos', next); return next; });
  }, []);

  // ── Mensalidades ─────────────────────────────────────────────────
  const updateMensalidade = useCallback((m: Mensalidade) => {
    setMensalidades(prev => { const next = prev.map(x => x.id === m.id ? m : x); save('mensalidades', next); return next; });
  }, []);

  const addMensalidade = useCallback((m: Omit<Mensalidade, 'id'>): Mensalidade => {
    const nova: Mensalidade = { ...m, id: uid() };
    setMensalidades(prev => { const next = [...prev, nova]; save('mensalidades', next); return next; });
    return nova;
  }, []);

  const deleteMensalidade = useCallback((id: string) => {
    setMensalidades(prev => { const next = prev.filter(x => x.id !== id); save('mensalidades', next); return next; });
  }, []);

  // ── Investimentos ────────────────────────────────────────────────
  const addInvestimento = useCallback((i: Omit<Investimento, 'id'>): Investimento => {
    const novo: Investimento = { ...i, id: uid() };
    setInvestimentos(prev => { const next = [...prev, novo]; save('investimentos', next); return next; });
    return novo;
  }, []);

  const updateInvestimento = useCallback((i: Investimento) => {
    setInvestimentos(prev => { const next = prev.map(x => x.id === i.id ? i : x); save('investimentos', next); return next; });
  }, []);

  // ── Despesas ─────────────────────────────────────────────────────
  const addDespesa = useCallback((d: Omit<Despesa, 'id'>): Despesa => {
    const nova: Despesa = { ...d, id: uid() };
    setDespesas(prev => { const next = [...prev, nova]; save('despesas', next); return next; });
    return nova;
  }, []);

  const updateDespesa = useCallback((d: Despesa) => {
    setDespesas(prev => { const next = prev.map(x => x.id === d.id ? d : x); save('despesas', next); return next; });
  }, []);

  const deleteDespesa = useCallback((id: string) => {
    setDespesas(prev => { const next = prev.filter(x => x.id !== id); save('despesas', next); return next; });
  }, []);

  // ── Relatórios de Atividade ──────────────────────────────────────
  const addRelatorio = useCallback((r: Omit<RelatorioAtividade, 'id'>): RelatorioAtividade => {
    const novo: RelatorioAtividade = { ...r, id: uid() };
    setRelatorios(prev => { const next = [...prev, novo]; save('relatorios', next); return next; });
    return novo;
  }, []);

  const updateRelatorio = useCallback((r: RelatorioAtividade) => {
    setRelatorios(prev => { const next = prev.map(x => x.id === r.id ? r : x); save('relatorios', next); return next; });
  }, []);

  const deleteRelatorio = useCallback((id: string) => {
    setRelatorios(prev => { const next = prev.filter(x => x.id !== id); save('relatorios', next); return next; });
  }, []);

  // ── Ofícios ──────────────────────────────────────────────────────
  const addOficio = useCallback((o: Omit<Oficio, 'id'>): Oficio => {
    const novo: Oficio = { ...o, id: uid() };
    setOficios(prev => { const next = [...prev, novo]; save('oficios', next); return next; });
    return novo;
  }, []);

  const updateOficio = useCallback((o: Oficio) => {
    setOficios(prev => { const next = prev.map(x => x.id === o.id ? o : x); save('oficios', next); return next; });
  }, []);

  const deleteOficio = useCallback((id: string) => {
    setOficios(prev => { const next = prev.filter(x => x.id !== id); save('oficios', next); return next; });
  }, []);

  return (
    <DataContext.Provider value={{
      moradores, addMorador, updateMorador, deleteMorador,
      familias, addFamilia, updateFamilia,
      atividades,
      documentos, addDocumento, deleteDocumento,
      dependentes,
      eventos, addEvento, updateEvento, deleteEvento,
      mensalidades, updateMensalidade, addMensalidade, deleteMensalidade,
      investimentos, addInvestimento, updateInvestimento,
      despesas, addDespesa, updateDespesa, deleteDespesa,
      relatorios, addRelatorio, updateRelatorio, deleteRelatorio,
      oficios, addOficio, updateOficio, deleteOficio,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
