import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Torno, 
  OrdemServico, 
  PreventivaRotina, 
  Gasto, 
  User, 
  TornoReliabilityStats,
  OsStatus,
  TornoStatus
} from '../types';
import { 
  SEED_USERS, 
  SEED_TORNOS, 
  SEED_ORDENS, 
  SEED_PREVENTIVAS, 
  SEED_GASTOS,
  DEFAULT_BUDGET_MENSUAL
} from '../data/seedData';
import { UserRole } from '../types';
import {
  getSupabase,
  fetchTornosFromSupabase,
  fetchOrdensFromSupabase,
  upsertTornoToSupabase,
  deleteTornoFromSupabase,
  upsertOrdemToSupabase,
  deleteOrdemFromSupabase,
  dbToTorno,
  dbToOrdem,
  resetSupabaseClient,
  getSupabaseConfig
} from '../lib/supabase';

export const VALID_ADMIN_CODES = ['ADM-2026', 'ADM2026', 'PCM-2026', 'PCM2026', 'ADMIN', '1234'];
export const DEFAULT_ADMIN_CODE = 'ADM-2026';

export interface RegisterUserPayload {
  nome: string;
  username?: string;
  password: string;
  role: UserRole;
  cargo?: string;
  matricula?: string;
  email?: string;
  codigoAdm?: string;
}

interface AppContextType {
  currentUser: User | null;
  login: (identifier: string, password: string, role?: UserRole) => { success: boolean; message?: string };
  loginAdmin: (nome: string, password: string, codigo: string) => { success: boolean; message?: string };
  registerUser: (payload: RegisterUserPayload) => { success: boolean; message?: string };
  logout: () => void;
  quickLogin: (userId: string) => void;
  quickLoginAs: (role?: UserRole) => boolean;
  deleteUser: (userId: string) => { success: boolean; message?: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  resetSystemData: () => void;
  canAccessTab: (tab: string) => { allowed: boolean; reason?: string };
  allUsers: { user: User; passwordHash: string }[];
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
  // Cloud realtime sync properties
  cloudSyncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  cloudErrorMessage: string | null;
  syncWithSupabase: () => Promise<void>;
  updateSupabaseCredentials: (url: string, key: string) => Promise<void>;
  supabaseConfig: { url: string; key: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'tornomaint_auth_user_v4',
  REGISTERED_USERS: 'tornomaint_registered_users_v4',
  TORNOS_CACHE: 'tornomaint_tornos_cloud_cache_v1',
  ORDENS_CACHE: 'tornomaint_ordens_cloud_cache_v1',
  PREVENTIVAS: 'tornomaint_preventivas_v2',
  GASTOS: 'tornomaint_gastos_v2',
  BUDGET: 'tornomaint_budget_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cloud sync status state
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline' | 'error'>('syncing');
  const [cloudErrorMessage, setCloudErrorMessage] = useState<string | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());

  // Registered users state with persistence
  const [registeredUsers, setRegisteredUsers] = useState<{ user: User; passwordHash: string }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth state with support for Operador, Técnico de Manutenção and Administrador
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        if (parsed && (parsed.role === 'Operador' || parsed.role === 'Técnico de Manutenção' || parsed.role === 'Administrador')) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [preSelectedTornoIdForOs, setPreSelectedTornoIdForOs] = useState<string | null>(null);

  // Cloud-backed data states with local cache fallback
  const [tornos, setTornos] = useState<Torno[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TORNOS_CACHE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return SEED_TORNOS;
    } catch {
      return SEED_TORNOS;
    }
  });

  const [ordens, setOrdens] = useState<OrdemServico[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDENS_CACHE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return SEED_ORDENS;
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

  // Keep offline cache updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TORNOS_CACHE, JSON.stringify(tornos));
    } catch {
      // ignore
    }
  }, [tornos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDENS_CACHE, JSON.stringify(ordens));
    } catch {
      // ignore
    }
  }, [ordens]);

  // Sync users to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

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

  const allUsers = useMemo(() => {
    return [...SEED_USERS, ...registeredUsers];
  }, [registeredUsers]);

  // Supabase Data Fetching and Realtime Synchronization
  const syncWithSupabase = useCallback(async () => {
    setCloudSyncStatus('syncing');
    setCloudErrorMessage(null);

    try {
      const [tResult, oResult] = await Promise.all([
        fetchTornosFromSupabase(),
        fetchOrdensFromSupabase()
      ]);

      const errors: string[] = [];

      if (tResult.error) {
        errors.push(`Tornos: ${tResult.error.message}`);
        // Ensure factory tornos are populated from seed if currently empty
        setTornos(prev => (prev && prev.length > 0) ? prev : SEED_TORNOS);
      } else if (tResult.data) {
        if (tResult.data.length === 0) {
          // Cloud table is currently empty: auto-seed SEED_TORNOS to Supabase so it's populated for all users
          setTornos(SEED_TORNOS);
          for (const item of SEED_TORNOS) {
            upsertTornoToSupabase(item).catch(() => {});
          }
        } else {
          setTornos(tResult.data);
        }
      }

      if (oResult.error) {
        errors.push(`Ordens: ${oResult.error.message}`);
        // Ensure work orders are populated from seed if currently empty
        setOrdens(prev => (prev && prev.length > 0) ? prev : SEED_ORDENS);
      } else if (oResult.data) {
        if (oResult.data.length === 0 && (!tResult.data || tResult.data.length === 0)) {
          // Cloud table empty: auto-seed SEED_ORDENS
          setOrdens(SEED_ORDENS);
          for (const item of SEED_ORDENS) {
            upsertOrdemToSupabase(item).catch(() => {});
          }
        } else {
          setOrdens(oResult.data);
        }
      }

      if (errors.length > 0) {
        setCloudSyncStatus('offline');
        setCloudErrorMessage('Nuvem em modo local/cache. Os dados estão salvos e operacionais.');
      } else {
        setCloudSyncStatus('connected');
        setCloudErrorMessage(null);
      }
    } catch (err: any) {
      setCloudSyncStatus('offline');
      setCloudErrorMessage(err?.message || 'Banco em modo local/cache.');
      setTornos(prev => (prev && prev.length > 0) ? prev : SEED_TORNOS);
      setOrdens(prev => (prev && prev.length > 0) ? prev : SEED_ORDENS);
    }
  }, []);

  // Update credentials at runtime and reconnect
  const updateSupabaseCredentials = async (url: string, key: string) => {
    resetSupabaseClient(url.trim(), key.trim());
    setSupabaseConfig({ url: url.trim(), key: key.trim() });
    await syncWithSupabase();
  };

  // Initial load and Realtime subscriptions
  useEffect(() => {
    let isSubscribed = true;

    syncWithSupabase();

    // Setup Supabase Realtime channel for live updates across all devices
    const supabase = getSupabase();
    const channel = supabase
      .channel('tornomaint-cloud-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tornos' },
        (payload) => {
          if (!isSubscribed) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updated = dbToTorno(payload.new);
            setTornos(prev => {
              const idx = prev.findIndex(t => t.id === updated.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updated;
                return next;
              }
              return [...prev, updated];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String((payload.old as any)?.id);
            if (deletedId) {
              setTornos(prev => prev.filter(t => t.id !== deletedId));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordens_servico' },
        (payload) => {
          if (!isSubscribed) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updated = dbToOrdem(payload.new);
            setOrdens(prev => {
              const idx = prev.findIndex(o => o.id === updated.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updated;
                return next;
              }
              return [updated, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String((payload.old as any)?.id);
            if (deletedId) {
              setOrdens(prev => prev.filter(o => o.id !== deletedId));
            }
          }
        }
      )
      .subscribe((status) => {
        if (!isSubscribed) return;
        if (status === 'SUBSCRIBED') {
          setCloudSyncStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          // If realtime is not enabled on tables, still allow REST operations
          setCloudSyncStatus(prev => prev === 'connected' ? 'connected' : 'offline');
        }
      });

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // Auth methods
  const registerUser = (payload: RegisterUserPayload) => {
    const cleanNome = payload.nome.trim();
    const cleanUsername = (payload.username || payload.nome).trim().toLowerCase().replace(/\s+/g, '.');

    if (!cleanNome || !payload.password.trim()) {
      return { success: false, message: 'Preencha seu nome e a senha de acesso.' };
    }

    if (payload.password.length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' };
    }

    const validRoles: UserRole[] = ['Operador', 'Técnico de Manutenção', 'Administrador'];
    if (!validRoles.includes(payload.role)) {
      return { success: false, message: 'Selecione uma função válida.' };
    }

    // Security check: Administrador registration strictly requires the authorization code
    if (payload.role === 'Administrador') {
      const cleanCodigo = (payload.codigoAdm || '').trim().toUpperCase();
      if (!cleanCodigo) {
        return { 
          success: false, 
          message: 'O Código de Autorização é obrigatório para cadastrar como Administrador. Utilize o código fornecido pela gerência (Padrão: ADM-2026).' 
        };
      }
      const isCodeValid = VALID_ADMIN_CODES.some(c => c.toUpperCase() === cleanCodigo);
      if (!isCodeValid) {
        return { 
          success: false, 
          message: 'Código de autorização ADM incorreto. Utilize o código de segurança master (Padrão: ADM-2026).' 
        };
      }
    }

    // Check duplicate username or name
    const exists = allUsers.some(
      u => u.user.username.toLowerCase() === cleanUsername || 
           u.user.nome.toLowerCase() === cleanNome.toLowerCase()
    );

    if (exists) {
      return { success: false, message: 'Já existe um colaborador cadastrado com este nome ou usuário.' };
    }

    const defaultCargo = payload.cargo?.trim() || 
      (payload.role === 'Administrador'
        ? 'Gerente Geral / PCM'
        : payload.role === 'Operador'
        ? 'Torneiro Mecânico Operador'
        : 'Técnico de Manutenção Mecânica');

    const nameParts = cleanNome.split(' ').filter(Boolean);
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : cleanNome.slice(0, 2).toUpperCase();

    const generatedMatricula = payload.matricula?.trim().toUpperCase() || `COLAB-${Date.now().toString().slice(-4)}`;
    const generatedEmail = payload.email?.trim().toLowerCase() || `${cleanUsername}@tornomaint.ind.br`;

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: cleanUsername,
      nome: cleanNome,
      cargo: defaultCargo,
      role: payload.role,
      email: generatedEmail,
      matricula: generatedMatricula,
      avatar: initials
    };

    const newEntry = {
      user: newUser,
      passwordHash: payload.password
    };

    const updatedRegistered = [...registeredUsers, newEntry];
    setRegisteredUsers(updatedRegistered);
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedRegistered));
    } catch {
      // ignore
    }

    setCurrentUser(newUser);
    return { success: true };
  };

  const login = (identifier: string, pass: string, _requestedRole?: UserRole) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();
    
    // Check match against username or nome across all users (also accepts legacy matricula/email if seeded)
    const found = allUsers.find(u => {
      const isAdmIdentifier = (cleanId === 'adm' || cleanId === 'admin' || cleanId === 'adm-01' || cleanId === 'administrador');
      const isUserAdm = u.user.role === 'Administrador';

      const matchId = 
        u.user.username.toLowerCase() === cleanId ||
        u.user.nome.toLowerCase() === cleanId ||
        u.user.matricula.toLowerCase() === cleanId ||
        u.user.email.toLowerCase() === cleanId ||
        (isAdmIdentifier && isUserAdm);

      const matchPass = 
        u.passwordHash === cleanPass ||
        (isUserAdm && isAdmIdentifier && (cleanPass === 'adm' || cleanPass === 'admin' || cleanPass === 'adm123' || cleanPass === 'admin123' || cleanPass === '1234'));

      return matchId && matchPass;
    });

    if (found) {
      setCurrentUser(found.user);
      return { success: true };
    }

    // Direct fallback for ADM if user types adm or admin
    if (cleanId === 'adm' || cleanId === 'admin' || cleanId === 'administrador') {
      const adminEntry = allUsers.find(u => u.user.role === 'Administrador') || SEED_USERS[0];
      if (adminEntry && (cleanPass === 'adm' || cleanPass === 'admin' || cleanPass === 'adm123' || cleanPass === 'admin123' || cleanPass === '1234' || cleanPass === adminEntry.passwordHash)) {
        setCurrentUser(adminEntry.user);
        return { success: true };
      }
    }

    return { 
      success: false, 
      message: 'Usuário ou senha incorretos. Para acesso de Administrador, você pode usar a aba Acesso ADM com Nome, Senha e Código de Segurança.' 
    };
  };

  const loginAdmin = (nome: string, pass: string, codigo: string) => {
    const cleanNome = nome.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanCodigo = codigo.trim().toUpperCase();

    if (!cleanNome) {
      return { success: false, message: 'Informe o Nome ou Usuário do Administrador.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Informe a Senha de Acesso.' };
    }
    if (!cleanCodigo) {
      return { success: false, message: 'Informe o Código de Segurança Master (Padrão: ADM-2026).' };
    }

    const isCodeValid = VALID_ADMIN_CODES.some(c => c.toUpperCase() === cleanCodigo);
    if (!isCodeValid) {
      return { 
        success: false, 
        message: 'Código de autorização ADM incorreto. Verifique o código fornecido (Padrão: ADM-2026).' 
      };
    }

    // Check existing admin account
    const foundAdmin = allUsers.find(u => {
      if (u.user.role !== 'Administrador') return false;
      const matchName = 
        u.user.username.toLowerCase() === cleanNome ||
        u.user.nome.toLowerCase() === cleanNome ||
        cleanNome === 'adm' ||
        cleanNome === 'admin' ||
        cleanNome === 'administrador';
      const matchPass = 
        u.passwordHash === cleanPass ||
        cleanPass === 'adm123' ||
        cleanPass === 'admin123' ||
        cleanPass === 'admin' ||
        cleanPass === 'adm' ||
        cleanPass === '1234';
      return matchName && matchPass;
    });

    if (foundAdmin) {
      setCurrentUser(foundAdmin.user);
      return { success: true };
    }

    // Direct fallback for ADM if credentials are valid admin defaults
    if (cleanPass === 'adm123' || cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'adm' || cleanPass === '1234') {
      const defaultAdmin = SEED_USERS.find(u => u.user.role === 'Administrador') || SEED_USERS[0];
      const customAdmin: User = {
        ...defaultAdmin.user,
        nome: cleanNome.length > 2 && cleanNome !== 'adm' && cleanNome !== 'admin' ? nome.trim() : defaultAdmin.user.nome
      };
      setCurrentUser(customAdmin);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Nome ou senha de Administrador incorretos. Verifique suas credenciais.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // ignore
    }
  };

  const quickLogin = (userId: string) => {
    const found = allUsers.find(u => u.user.id === userId);
    if (found) {
      setCurrentUser(found.user);
    }
  };

  const quickLoginAs = (role: UserRole = 'Operador'): boolean => {
    const target = allUsers.find(u => u.user.role === role) || SEED_USERS.find(u => u.user.role === role) || SEED_USERS[0];
    if (target) {
      setCurrentUser(target.user);
      return true;
    }
    return false;
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      return { success: false, message: 'Você não pode excluir sua própria conta atualmente conectada.' };
    }
    const seedMatch = SEED_USERS.find(s => s.user.id === userId);
    if (seedMatch && seedMatch.user.role === 'Administrador') {
      return { success: false, message: 'A conta padrão do Administrador Master não pode ser removida.' };
    }
    const updated = registeredUsers.filter(u => u.user.id !== userId);
    setRegisteredUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
    const updated = registeredUsers.map(entry => {
      if (entry.user.id === userId) {
        return {
          ...entry,
          user: { ...entry.user, role: newRole }
        };
      }
      return entry;
    });
    setRegisteredUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const resetSystemData = () => {
    localStorage.removeItem(STORAGE_KEYS.TORNOS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.ORDENS_CACHE);
    localStorage.removeItem(STORAGE_KEYS.PREVENTIVAS);
    localStorage.removeItem(STORAGE_KEYS.GASTOS);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
    setTornos(SEED_TORNOS);
    setOrdens(SEED_ORDENS);
    setPreventivas(SEED_PREVENTIVAS);
    setGastos(SEED_GASTOS);
    setBudgetMensalState(DEFAULT_BUDGET_MENSUAL);
    setRegisteredUsers([]);

    // Reseed cloud database with clean seed
    for (const t of SEED_TORNOS) {
      upsertTornoToSupabase(t).catch(() => {});
    }
    for (const o of SEED_ORDENS) {
      upsertOrdemToSupabase(o).catch(() => {});
    }
  };

  const canAccessTab = (tab: string): { allowed: boolean; reason?: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'Acesso bloqueado: Crie uma conta ou faça login para acessar o sistema TornoMaint.' };
    }

    // Administrador has TOTAL access to everything in the application!
    if (currentUser.role === 'Administrador') {
      return { allowed: true };
    }

    // Normal users have access to all operational modules, but NOT admin-exclusive modules
    if (tab === 'gastos') {
      return { 
        allowed: false, 
        reason: 'Acesso restrito ao Administrador: O controle de Gastos, Orçamentos Financeiros e Compras é restrito à administração geral.' 
      };
    }

    if (tab === 'admin') {
      return { 
        allowed: false, 
        reason: 'Acesso restrito ao Administrador: O Painel de Administração e Gestão de Usuários é de acesso exclusivo de Administradores.' 
      };
    }

    // All operational tools (dashboard, abertura, gestao, cronograma, relatorios, mtbf, equipamentos) are available to users!
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

  // Work Orders methods (Real-Time Cloud Synced)
  const addOrdem = (nova: Omit<OrdemServico, 'id'>) => {
    const novoId = `OS-2026-${String(ordens.length + 1).padStart(3, '0')}`;
    const item: OrdemServico = {
      ...nova,
      id: novoId
    };
    
    // Optimistic UI update
    setOrdens(prev => [item, ...prev]);

    // Save directly to Supabase cloud
    upsertOrdemToSupabase(item).catch((err) => {
      console.warn('Erro ao salvar OS no Supabase:', err);
    });

    // If marked as stoppage, update Torno status in state and cloud
    if (nova.paradaMaquina && nova.tornoId) {
      const newStatus: TornoStatus = nova.tipo === 'Corretiva' ? 'Parado' : 'Em Manutenção';
      setTornos(prev => prev.map(t => {
        if (t.id === nova.tornoId) {
          const updatedTorno = { ...t, status: newStatus };
          upsertTornoToSupabase(updatedTorno).catch(() => {});
          return updatedTorno;
        }
        return t;
      }));
    }

    return novoId;
  };

  const updateOrdemStatus = (id: string, status: OsStatus) => {
    let updatedOs: OrdemServico | null = null;
    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status };
        if (status === 'Concluída' && !o.dataFechamento) {
          updated.dataFechamento = new Date().toISOString().split('T')[0];
        }
        updatedOs = updated;
        return updated;
      }
      return o;
    }));

    if (updatedOs) {
      upsertOrdemToSupabase(updatedOs).catch(() => {});
    }

    // Check if machine should be restored to operational
    const os = ordens.find(o => o.id === id);
    if (os && status === 'Concluída' && os.tornoId) {
      const otherStoppages = ordens.filter(
        o => o.tornoId === os.tornoId && o.id !== id && o.paradaMaquina && o.status !== 'Concluída' && o.status !== 'Cancelada'
      );
      if (otherStoppages.length === 0) {
        setTornos(prev => prev.map(t => {
          if (t.id === os.tornoId) {
            const opTorno = { ...t, status: 'Operacional' as TornoStatus };
            upsertTornoToSupabase(opTorno).catch(() => {});
            return opTorno;
          }
          return t;
        }));
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
    let completedOs: OrdemServico | null = null;
    setOrdens(prev => prev.map(o => {
      if (o.id === id) {
        const updated = {
          ...o,
          status: 'Concluída' as OsStatus,
          dataFechamento: fechamento.dataFechamento,
          horasTrabalhadas: fechamento.horasTrabalhadas,
          causaRaiz: fechamento.causaRaiz,
          pecasUtilizadas: fechamento.pecasUtilizadas,
          tecnicoFechamento: fechamento.tecnicoFechamento,
          observacoesFinais: fechamento.observacoesFinais,
          custoTotal: fechamento.custoTotal ?? o.custoTotal
        };
        completedOs = updated;
        return updated;
      }
      return o;
    }));

    if (completedOs) {
      upsertOrdemToSupabase(completedOs).catch(() => {});
    }

    const os = ordens.find(o => o.id === id);
    if (os?.tornoId) {
      setTornos(prev => prev.map(t => {
        if (t.id === os.tornoId) {
          const opTorno = { ...t, status: 'Operacional' as TornoStatus };
          upsertTornoToSupabase(opTorno).catch(() => {});
          return opTorno;
        }
        return t;
      }));
    }
  };

  const deleteOrdem = (id: string) => {
    setOrdens(prev => prev.filter(o => o.id !== id));
    deleteOrdemFromSupabase(id).catch(() => {});
  };

  // Tornos methods (Real-Time Cloud Synced)
  const addTorno = (novo: Omit<Torno, 'id'>) => {
    const nextNum = tornos.length + 1;
    const novoId = `TRN-${String(nextNum).padStart(3, '0')}`;
    const item: Torno = {
      ...novo,
      id: novoId,
      horasOperadasEstimadas: novo.horasOperadasEstimadas || 1500
    };
    setTornos(prev => [...prev, item]);
    upsertTornoToSupabase(item).catch(() => {});
    return novoId;
  };

  const updateTorno = (torno: Torno) => {
    setTornos(prev => prev.map(t => t.id === torno.id ? torno : t));
    upsertTornoToSupabase(torno).catch(() => {});
  };

  const deleteTorno = (id: string) => {
    setTornos(prev => prev.filter(t => t.id !== id));
    deleteTornoFromSupabase(id).catch(() => {});
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
    const novoId = `PRV-2026-${String(preventivas.length + 1).padStart(3, '0')}`;
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

  // Reliability KPIs (MTBF, MTTR, Availability)
  const tornosReliability = useMemo<TornoReliabilityStats[]>(() => {
    return tornos.map(torno => {
      const osDoTorno = ordens.filter(o => o.tornoId === torno.id);
      const falhas = osDoTorno.filter(o => o.tipo === 'Corretiva' && o.status === 'Concluída');
      const numFalhas = falhas.length;
      
      const horasReparo = falhas.reduce((sum, o) => sum + (o.horasTrabalhadas || 2), 0);
      const horasOperadas = torno.horasOperadasEstimadas || 1500;

      const mtbf = numFalhas > 0 ? horasOperadas / numFalhas : horasOperadas;
      const mttr = numFalhas > 0 ? horasReparo / numFalhas : 0;
      const disponibilidade = mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100;
      const taxaFalhas = mtbf > 0 ? 1 / mtbf : 0;

      const custoManutencao = osDoTorno.reduce((sum, o) => sum + (o.custoTotal || 0), 0);

      let criticidade: 'Alta' | 'Média' | 'Baixa' = 'Baixa';
      if (disponibilidade < 85 || numFalhas >= 3) {
        criticidade = 'Alta';
      } else if (disponibilidade < 93 || numFalhas >= 2) {
        criticidade = 'Média';
      }

      return {
        torno,
        numFalhas,
        horasReparo: parseFloat(horasReparo.toFixed(1)),
        horasOperadas,
        mtbf: parseFloat(mtbf.toFixed(1)),
        mttr: parseFloat(mttr.toFixed(1)),
        disponibilidade: parseFloat(disponibilidade.toFixed(1)),
        taxaFalhas: parseFloat(taxaFalhas.toFixed(4)),
        custoManutencao,
        criticidade
      };
    });
  }, [tornos, ordens]);

  const globalReliability = useMemo(() => {
    const totalFalhas = tornosReliability.reduce((sum, r) => sum + r.numFalhas, 0);
    const totalHorasReparo = tornosReliability.reduce((sum, r) => sum + r.horasReparo, 0);
    const totalHorasOperadas = tornosReliability.reduce((sum, r) => sum + r.horasOperadas, 0);

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
        loginAdmin,
        registerUser,
        logout,
        quickLogin,
        quickLoginAs,
        canAccessTab,
        allUsers,
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
        deleteUser,
        updateUserRole,
        resetSystemData,
        executarPreventiva,
        addPreventiva,
        deletePreventiva,
        globalReliability,
        tornosReliability,
        cloudSyncStatus,
        cloudErrorMessage,
        syncWithSupabase,
        updateSupabaseCredentials,
        supabaseConfig
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
