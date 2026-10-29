import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Torno, 
  OrdemServico, 
  PreventivaRotina, 
  Gasto, 
  User, 
  TornoReliabilityStats,
  OsStatus
} from '../types';
import { 
  SEED_USERS, 
  SEED_TORNOS, 
  SEED_ORDENS, 
  SEED_PREVENTIVAS, 
  SEED_GASTOS,
  DEFAULT_BUDGET_MENSUAL
} from '../data/seedData';

interface AppContextType {
  currentUser: User | null;
  login: (identifier: string, password: string, role?: string) => { success: boolean; message?: string };
  logout: () => void;
  quickLogin: (userId: string) => void;
  canAccessTab: (tab: string) => { allowed: boolean; reason?: string };
  tornos: Torno[];
  ordens: OrdemServico[];
  preventivas: PreventivaRotina[];
  gastos: Gasto[];
  budgetMensal: number;
  setBudgetMensal: (val: number) => void;
  getTorno: (id: string) => Torno;
  findTornoByQrCode: (code: string) => Torno | undefined;
  preSelectedTornoIdForOs: string | null;
  setPreSelectedTornoIdForOs: (id: string | null) => void;
  addOrdem: (os: Omit<OrdemServico, 'id'>) => string;
  updateOrdemStatus: (id: string, status: OsStatus) => void;
  concluirOrdem: (
    id: string, 
    fechamento: {
      dataFechamento: string;
      horasTrabalhadas: number;
      causaRaiz: string;
      pecasUtilizadas: string;
      tecnicoFechamento: string;
      observacoesFinais: string;
      custoTotal?: number;
    }
  ) => void;
  deleteOrdem: (id: string) => void;
  addTorno: (torno: Omit<Torno, 'id'>) => string;
  updateTorno: (torno: Torno) => void;
  deleteTorno: (id: string) => void;
  addGasto: (gasto: Omit<Gasto, 'id'>) => string;
  deleteGasto: (id: string) => void;
  executarPreventiva: (id: string) => void;
  addPreventiva: (rotina: Omit<PreventivaRotina, 'id'>) => string;
  deletePreventiva: (id: string) => void;
  globalReliability: {
    mtbf: number;
    mttr: number;
    disponibilidade: number;
    totalFalhas: number;
    totalHorasReparo: number;
    totalHorasOperadas: number;
    taxaAderenciaPreventiva: number;
  };
  tornosReliability: TornoReliabilityStats[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'tornomaint_auth_user_v2',
  TORNOS: 'tornomaint_tornos_v2',
  ORDENS: 'tornomaint_ordens_v2',
  PREVENTIVAS: 'tornomaint_preventivas_v2',
  GASTOS: 'tornomaint_gastos_v2',
  BUDGET: 'tornomaint_budget_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
      // Starts as null so user sees the initial Login Screen gate as required!
      return null;
    } catch {
      return null;
    }
  });

  const [preSelectedTornoIdForOs, setPreSelectedTornoIdForOs] = useState<string | null>(null);

  // Data states
  const [tornos, setTornos] = useState<Torno[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TORNOS);
      return saved ? JSON.parse(saved) : SEED_TORNOS;
    } catch {
      return SEED_TORNOS;
    }
  });

  const [ordens, setOrdens] = useState<OrdemServico[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDENS);
      return saved ? JSON.parse(saved) : SEED_ORDENS;
    } catch {
      return SEED_ORDENS;
    }
  });

  const [preventivas, setPreventivas] = useState<PreventivaRotina[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREVENTIVAS);
      return saved ? JSON.parse(saved) : SEED_PREVENTIVAS;
    } catch {
      return SEED_PREVENTIVAS;
    }
  });

  const [gastos, setGastos] = useState<Gasto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GASTOS);
      return saved ? JSON.parse(saved) : SEED_GASTOS;
    } catch {
      return SEED_GASTOS;
    }
  });

  const [budgetMensal, setBudgetMensalState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? parseFloat(saved) : DEFAULT_BUDGET_MENSUAL;
    } catch {
      return DEFAULT_BUDGET_MENSUAL;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TORNOS, JSON.stringify(tornos));
  }, [tornos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDENS, JSON.stringify(ordens));
  }, [ordens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREVENTIVAS, JSON.stringify(preventivas));
  }, [preventivas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GASTOS, JSON.stringify(gastos));
  }, [gastos]);

  const setBudgetMensal = (val: number) => {
    setBudgetMensalState(val);
    localStorage.setItem(STORAGE_KEYS.BUDGET, val.toString());
  };

  // Auth methods
  const login = (identifier: string, pass: string, role?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Check match against matricula, username or email in SEED_USERS
    const found = SEED_USERS.find(u => {
      const matchId = 
        u.user.username.toLowerCase() === cleanId ||
        u.user.matricula.toLowerCase() === cleanId ||
        u.user.email.toLowerCase() === cleanId;
      const matchPass = u.passwordHash === pass;
      return matchId && matchPass;
    });

    if (found) {
      let userToSet = { ...found.user };
      if (role && (role === 'Operador' || role === 'Técnico de Manutenção' || role === 'Administrador')) {
        userToSet.role = role as any;
      }
      setCurrentUser(userToSet);
      return { success: true };
    }

    // Support standard test IDs if typed
    if (cleanId && pass.length >= 3) {
      const defaultRole = (role as any) || 'Operador';
      const customUser: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: cleanId,
        nome: cleanId.toUpperCase(),
        cargo: defaultRole,
        role: defaultRole,
        email: `${cleanId}@tornomaint.ind.br`,
        matricula: cleanId.toUpperCase(),
        avatar: cleanId.slice(0, 2).toUpperCase()
      };
      setCurrentUser(customUser);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Matrícula, usuário ou senha inválidos. Verifique os dados ou utilize o Acesso Rápido.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const quickLogin = (userId: string) => {
    const found = SEED_USERS.find(u => u.user.id === userId);
    if (found) {
      setCurrentUser(found.user);
    }
  };

  const canAccessTab = (tab: string): { allowed: boolean; reason?: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'Faça login para acessar o sistema.' };
    }

    const role = currentUser.role;

    if (role === 'Administrador' || role === 'PCM Gestor') {
      return { allowed: true };
    }

    if (role === 'Técnico de Manutenção' || role === 'Mecânico Líder') {
      if (tab === 'gastos') {
        return { 
          allowed: false, 
          reason: 'Acesso restrito: O controle de Gastos e Orçamentos é restrito aos Administradores e Supervisão de PCM.' 
        };
      }
      return { allowed: true };
    }

    if (role === 'Operador' || role === 'Operador de Torno') {
      if (tab === 'gastos' || tab === 'mtbf' || tab === 'relatorios') {
        return { 
          allowed: false, 
          reason: 'Acesso restrito: Esta aba é restrita aos Técnicos de Manutenção e Administradores.' 
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  };

  const getTorno = (id: string): Torno => {
    const found = tornos.find(t => t.id === id);
    if (found) return found;
    return {
      id: id || 'TRN-ND',
      patrimonio: 'Torno Desconhecido',
      modelo: 'Não especificado',
      fabricante: 'Indefinido',
      setor: 'Geral',
      dataAquisicao: '2020-01-01',
      status: 'Operacional'
    };
  };

  const findTornoByQrCode = (code: string): Torno | undefined => {
    if (!code) return undefined;
    let clean = code.trim();

    // Check if code is a full URL containing '?id=...' or '?torno=...'
    try {
      if (clean.includes('?') && (clean.includes('id=') || clean.includes('torno='))) {
        const queryString = clean.split('?')[1];
        const params = new URLSearchParams(queryString);
        const paramId = params.get('id') || params.get('torno') || params.get('tag');
        if (paramId) {
          clean = paramId;
        }
      }
    } catch {
      // not a url
    }

    // Check if code is JSON (e.g. { id, tag, patrimonio })
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.tag) clean = parsed.tag;
        else if (parsed.id) clean = parsed.id;
        else if (parsed.patrimonio) clean = parsed.patrimonio;
      } catch {
        // ignore
      }
    }

    const lower = clean.toLowerCase();

    return tornos.find(t => {
      if (t.id.toLowerCase() === lower) return true;
      if (t.patrimonio.toLowerCase() === lower) return true;
      if (t.codigoQr && t.codigoQr.toLowerCase() === lower) return true;
      if (t.aliases && t.aliases.some(a => a.toLowerCase() === lower)) return true;
      if (lower.includes(t.patrimonio.toLowerCase())) return true;
      if (lower.includes(t.id.toLowerCase())) return true;
      if (t.aliases && t.aliases.some(a => lower.includes(a.toLowerCase()))) return true;
      return false;
    });
  };

  // Work Orders methods
  const addOrdem = (nova: Omit<OrdemServico, 'id'>) => {
    const novoId = `OS-2026-${String(ordens.length + 1).padStart(3, '0')}`;
    const item: OrdemServico = {
      ...nova,
      id: novoId
    };
    setOrdens(prev => [item, ...prev]);

    // If marked as stoppage, update Torno status
    if (nova.paradaMaquina && nova.tornoId) {
      setTornos(prev => prev.map(t => {
        if (t.id === nova.tornoId) {
          return { ...t, status: nova.tipo === 'Corretiva' ? 'Parado' : 'Em Manutenção' };
        }
        return t;
      }));
    }

    return novoId;
  };

  const updateOrdemStatus = (id: string, status: OsStatus) => {
    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status };
        if (status === 'Concluída' && !o.dataFechamento) {
          updated.dataFechamento = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return o;
    }));

    // Check if machine should be restored to operational
    const os = ordens.find(o => o.id === id);
    if (os && status === 'Concluída' && os.tornoId) {
      // Check if there are other open stoppage OS for this lathe
      const otherStoppages = ordens.filter(
        o => o.tornoId === os.tornoId && o.id !== id && o.paradaMaquina && o.status !== 'Concluída' && o.status !== 'Cancelada'
      );
      if (otherStoppages.length === 0) {
        setTornos(prev => prev.map(t => t.id === os.tornoId ? { ...t, status: 'Operacional' } : t));
      }
    }
  };

  const concluirOrdem = (
    id: string, 
    fechamento: {
      dataFechamento: string;
      horasTrabalhadas: number;
      causaRaiz: string;
      pecasUtilizadas: string;
      tecnicoFechamento: string;
      observacoesFinais: string;
      custoTotal?: number;
    }
  ) => {
    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'Concluída',
          dataFechamento: fechamento.dataFechamento,
          horasTrabalhadas: fechamento.horasTrabalhadas,
          causaRaiz: fechamento.causaRaiz,
          pecasUtilizadas: fechamento.pecasUtilizadas,
          tecnicoFechamento: fechamento.tecnicoFechamento,
          observacoesFinais: fechamento.observacoesFinais,
          custoTotal: fechamento.custoTotal ?? o.custoTotal
        };
      }
      return o;
    }));

    const os = ordens.find(o => o.id === id);
    if (os?.tornoId) {
      setTornos(prev => prev.map(t => t.id === os.tornoId ? { ...t, status: 'Operacional' } : t));
    }
  };

  const deleteOrdem = (id: string) => {
    setOrdens(prev => prev.filter(o => o.id !== id));
  };

  // Tornos methods
  const addTorno = (novo: Omit<Torno, 'id'>) => {
    const nextNum = tornos.length + 1;
    const novoId = `TRN-${String(nextNum).padStart(3, '0')}`;
    const item: Torno = {
      ...novo,
      id: novoId,
      horasOperadasEstimadas: novo.horasOperadasEstimadas || 1500
    };
    setTornos(prev => [...prev, item]);
    return novoId;
  };

  const updateTorno = (torno: Torno) => {
    setTornos(prev => prev.map(t => t.id === torno.id ? torno : t));
  };

  const deleteTorno = (id: string) => {
    setTornos(prev => prev.filter(t => t.id !== id));
  };

  // Gastos methods
  const addGasto = (novo: Omit<Gasto, 'id'>) => {
    const novoId = `GST-2026-${String(gastos.length + 1).padStart(3, '0')}`;
    const item: Gasto = {
      ...novo,
      id: novoId
    };
    setGastos(prev => [item, ...prev]);
    return novoId;
  };

  const deleteGasto = (id: string) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  // Preventivas methods
  const executarPreventiva = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPreventivas(prev => prev.map(p => {
      if (p.id === id) {
        const nextDate = new Date();
        const daysMap: Record<string, number> = {
          'Semanal': 7,
          'Quinzenal': 15,
          'Mensal': 30,
          'Trimestral': 90,
          'Semestral': 180,
          'Anual': 365
        };
        const increment = daysMap[p.frequencia] || 30;
        nextDate.setDate(nextDate.getDate() + increment);

        return {
          ...p,
          ultimaExecucao: todayStr,
          proximaExecucao: nextDate.toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  const addPreventiva = (nova: Omit<PreventivaRotina, 'id'>) => {
    const nextNum = preventivas.length + 1;
    const novoId = `PLN-${String(nextNum).padStart(3, '0')}`;
    const item: PreventivaRotina = {
      ...nova,
      id: novoId
    };
    setPreventivas(prev => [...prev, item]);
    return novoId;
  };

  const deletePreventiva = (id: string) => {
    setPreventivas(prev => prev.filter(p => p.id !== id));
  };

  // Reliability (MTBF, MTTR, Disponibilidade) calculations
  const tornosReliability: TornoReliabilityStats[] = useMemo(() => {
    return tornos.map(torno => {
      const corretivas = ordens.filter(o => o.tornoId === torno.id && o.tipo === 'Corretiva');
      const numFalhas = corretivas.length;
      
      // Calculate repair hours (either recorded or estimated based on priority)
      const horasReparo = corretivas.reduce((acc, curr) => {
        if (curr.horasTrabalhadas) return acc + curr.horasTrabalhadas;
        if (curr.prioridade === 'Urgente') return acc + 4.5;
        if (curr.prioridade === 'Alta') return acc + 3.0;
        return acc + 1.5;
      }, 0);

      // Estimated operating hours in current period (e.g. 30 days * 16h double shift) minus breakdown time
      const baseDisponivel = (30 * 16);
      const horasOperadas = Math.max(10, baseDisponivel - horasReparo);

      // MTBF = Horas Operadas / Número de Falhas
      const mtbf = numFalhas > 0 ? horasOperadas / numFalhas : horasOperadas;

      // MTTR = Horas de Reparo / Número de Falhas
      const mttr = numFalhas > 0 ? horasReparo / numFalhas : 0;

      // Disponibilidade = MTBF / (MTBF + MTTR)
      const disponibilidade = mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100;

      // Failure Rate Lambda = 1 / MTBF
      const taxaFalhas = mtbf > 0 ? 1 / mtbf : 0;

      // Custos específicos deste torno
      const custoManutencao = gastos
        .filter(g => g.tornoId === torno.id)
        .reduce((sum, g) => sum + g.valor, 0);

      // Criticidade
      let criticidade: 'Alta' | 'Média' | 'Baixa' = 'Baixa';
      if (disponibilidade < 85 || numFalhas >= 3 || mttr > 3.0) {
        criticidade = 'Alta';
      } else if (disponibilidade < 95 || numFalhas >= 1 || mttr > 2.0) {
        criticidade = 'Média';
      }

      return {
        torno,
        numFalhas,
        horasReparo: parseFloat(horasReparo.toFixed(1)),
        horasOperadas: parseFloat(horasOperadas.toFixed(1)),
        mtbf: parseFloat(mtbf.toFixed(1)),
        mttr: parseFloat(mttr.toFixed(1)),
        disponibilidade: parseFloat(disponibilidade.toFixed(1)),
        taxaFalhas: parseFloat(taxaFalhas.toFixed(4)),
        custoManutencao: parseFloat(custoManutencao.toFixed(2)),
        criticidade
      };
    });
  }, [tornos, ordens, gastos]);

  const globalReliability = useMemo(() => {
    const totalFalhas = tornosReliability.reduce((acc, curr) => acc + curr.numFalhas, 0);
    const totalHorasReparo = tornosReliability.reduce((acc, curr) => acc + curr.horasReparo, 0);
    const totalHorasOperadas = tornosReliability.reduce((acc, curr) => acc + curr.horasOperadas, 0);

    const mtbf = totalFalhas > 0 ? totalHorasOperadas / totalFalhas : totalHorasOperadas;
    const mttr = totalFalhas > 0 ? totalHorasReparo / totalFalhas : 0;
    const disponibilidade = mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100;

    // Compliance of preventive plan
    const preventivasRealizadas = ordens.filter(o => o.tipo === 'Preventiva' && o.status === 'Concluída').length +
      preventivas.filter(p => !!p.ultimaExecucao).length;
    const totalProgramadas = Math.max(1, ordens.filter(o => o.tipo === 'Preventiva').length + preventivas.length);
    const taxaAderenciaPreventiva = Math.min(100, (preventivasRealizadas / totalProgramadas) * 100);

    return {
      mtbf: parseFloat(mtbf.toFixed(1)),
      mttr: parseFloat(mttr.toFixed(1)),
      disponibilidade: parseFloat(disponibilidade.toFixed(1)),
      totalFalhas,
      totalHorasReparo: parseFloat(totalHorasReparo.toFixed(1)),
      totalHorasOperadas: parseFloat(totalHorasOperadas.toFixed(1)),
      taxaAderenciaPreventiva: parseFloat(taxaAderenciaPreventiva.toFixed(1))
    };
  }, [tornosReliability, ordens, preventivas]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        quickLogin,
        canAccessTab,
        tornos,
        ordens,
        preventivas,
        gastos,
        budgetMensal,
        setBudgetMensal,
        getTorno,
        findTornoByQrCode,
        preSelectedTornoIdForOs,
        setPreSelectedTornoIdForOs,
        addOrdem,
        updateOrdemStatus,
        concluirOrdem,
        deleteOrdem,
        addTorno,
        updateTorno,
        deleteTorno,
        addGasto,
        deleteGasto,
        executarPreventiva,
        addPreventiva,
        deletePreventiva,
        globalReliability,
        tornosReliability
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
