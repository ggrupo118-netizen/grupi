import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Torno, OrdemServico, TornoStatus, OsStatus, OsTipo, OsPrioridade } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://vonwfpecbecyynzwdij.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_JA8KSyOfYtxw4EUj6XUCtg_rlI31QSN';

export function getSupabaseConfig() {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('tornomaint_custom_supabase_url')?.trim() : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('tornomaint_custom_supabase_key')?.trim() : null;

  return {
    url: localUrl || envUrl || DEFAULT_SUPABASE_URL,
    key: localKey || envKey || DEFAULT_SUPABASE_KEY
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const config = getSupabaseConfig();
    supabaseInstance = createClient(config.url, config.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseInstance;
}

export function resetSupabaseClient(newUrl?: string, newKey?: string) {
  if (typeof window !== 'undefined') {
    if (newUrl) localStorage.setItem('tornomaint_custom_supabase_url', newUrl);
    else localStorage.removeItem('tornomaint_custom_supabase_url');
    if (newKey) localStorage.setItem('tornomaint_custom_supabase_key', newKey);
    else localStorage.removeItem('tornomaint_custom_supabase_key');
  }
  supabaseInstance = null;
  return getSupabase();
}

// Data Mapping Utilities between Postgres (snake_case) and TornoMaint (camelCase)
export function dbToTorno(r: any): Torno {
  let aliasesArr: string[] = [];
  if (Array.isArray(r.aliases)) {
    aliasesArr = r.aliases;
  } else if (typeof r.aliases === 'string') {
    try {
      aliasesArr = JSON.parse(r.aliases);
    } catch {
      aliasesArr = [r.aliases];
    }
  }

  let normasArr: string[] = [];
  const rawNormas = r.normas_seguranca ?? r.normasSeguranca;
  if (Array.isArray(rawNormas)) {
    normasArr = rawNormas;
  } else if (typeof rawNormas === 'string') {
    try {
      normasArr = JSON.parse(rawNormas);
    } catch {
      normasArr = [rawNormas];
    }
  }

  return {
    id: String(r.id),
    patrimonio: r.patrimonio || r.patrimony || `TR-${r.id}`,
    modelo: r.modelo || r.model || 'Universal',
    fabricante: r.fabricante || r.manufacturer || 'Fabricante Industrial',
    setor: r.setor || r.sector || 'Usinagem',
    status: (r.status as TornoStatus) || 'Operacional',
    dataAquisicao: r.data_aquisicao || r.dataAquisicao || r.created_at?.split('T')[0] || '2020-01-01',
    potenciaCv: r.potencia_cv ?? r.potenciaCv ?? undefined,
    distanciaEntrePontas: r.distancia_entre_pontas ?? r.distanciaEntrePontas ?? undefined,
    barramentoLargura: r.barramento_largura ?? r.barramentoLargura ?? undefined,
    tensaoEletrica: r.tensao_eletrica ?? r.tensaoEletrica ?? undefined,
    anoFabricacao: r.ano_fabricacao ? Number(r.ano_fabricacao) : (r.anoFabricacao ? Number(r.anoFabricacao) : undefined),
    observacoes: r.observacoes ?? r.notes ?? undefined,
    horasOperadasEstimadas: r.horas_operadas_estimadas ? Number(r.horas_operadas_estimadas) : (r.horasOperadasEstimadas ? Number(r.horasOperadasEstimadas) : 1500),
    codigoQr: r.codigo_qr || r.codigoQr || r.patrimonio || r.id,
    aliases: aliasesArr,
    oleoRecomendado: r.oleo_recomendado ?? r.oleoRecomendado ?? undefined,
    ultimaLubrificacao: r.ultima_lubrificacao ?? r.ultimaLubrificacao ?? undefined,
    ultimaManutencao: r.ultima_manutencao ?? r.ultimaManutencao ?? undefined,
    proximaPreventiva: r.proxima_preventiva ?? r.proximaPreventiva ?? undefined,
    responsavel: r.responsavel ?? undefined,
    manualBasico: r.manual_basico ?? r.manualBasico ?? undefined,
    normasSeguranca: normasArr
  };
}

export function tornoToDb(t: Torno): Record<string, any> {
  return {
    id: t.id,
    patrimonio: t.patrimonio,
    modelo: t.modelo,
    fabricante: t.fabricante,
    setor: t.setor,
    status: t.status,
    data_aquisicao: t.dataAquisicao,
    potencia_cv: t.potenciaCv ?? null,
    distancia_entre_pontas: t.distanciaEntrePontas ?? null,
    barramento_largura: t.barramentoLargura ?? null,
    tensao_eletrica: t.tensaoEletrica ?? null,
    ano_fabricacao: t.anoFabricacao ?? null,
    observacoes: t.observacoes ?? null,
    horas_operadas_estimadas: t.horasOperadasEstimadas ?? null,
    codigo_qr: t.codigoQr ?? t.patrimonio,
    aliases: t.aliases ?? [],
    oleo_recomendado: t.oleoRecomendado ?? null,
    ultima_lubrificacao: t.ultimaLubrificacao ?? null,
    ultima_manutencao: t.ultimaManutencao ?? null,
    proxima_preventiva: t.proximaPreventiva ?? null,
    responsavel: t.responsavel ?? null,
    manual_basico: t.manualBasico ?? null,
    normas_seguranca: t.normasSeguranca ?? []
  };
}

export function dbToOrdem(r: any): OrdemServico {
  return {
    id: String(r.id),
    tornoId: r.torno_id || r.tornoId || '',
    tipo: (r.tipo as OsTipo) || 'Corretiva',
    prioridade: (r.prioridade as OsPrioridade) || 'Média',
    categoriaComponente: r.categoria_componente || r.categoriaComponente || 'Mecânica Geral',
    descricao: r.descricao || r.description || '',
    solicitante: r.solicitante || 'Operador',
    responsavel: r.responsavel || 'Equipe de Manutenção',
    dataAbertura: r.data_abertura || r.dataAbertura || r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    previsaoConclusao: r.previsao_conclusao || r.previsaoConclusao || '',
    status: (r.status as OsStatus) || 'Aberta',
    paradaMaquina: Boolean(r.parada_maquina ?? r.paradaMaquina ?? false),
    pecasNecessarias: r.pecas_necessarias ?? r.pecasNecessarias ?? undefined,
    dataFechamento: r.data_fechamento ?? r.dataFechamento ?? undefined,
    horasTrabalhadas: r.horas_trabalhadas ? Number(r.horas_trabalhadas) : (r.horasTrabalhadas ? Number(r.horasTrabalhadas) : undefined),
    causaRaiz: r.causa_raiz ?? r.causaRaiz ?? undefined,
    pecasUtilizadas: r.pecas_utilizadas ?? r.pecasUtilizadas ?? undefined,
    tecnicoFechamento: r.tecnico_fechamento ?? r.tecnicoFechamento ?? undefined,
    observacoesFinais: r.observacoes_finais ?? r.observacoesFinais ?? undefined,
    custoTotal: r.custo_total ? Number(r.custo_total) : (r.custoTotal ? Number(r.custoTotal) : undefined)
  };
}

export function ordemToDb(o: OrdemServico): Record<string, any> {
  return {
    id: o.id,
    torno_id: o.tornoId,
    tipo: o.tipo,
    prioridade: o.prioridade,
    categoria_componente: o.categoriaComponente,
    descricao: o.descricao,
    solicitante: o.solicitante,
    responsavel: o.responsavel,
    data_abertura: o.dataAbertura,
    previsao_conclusao: o.previsaoConclusao,
    status: o.status,
    parada_maquina: o.paradaMaquina ?? false,
    pecas_necessarias: o.pecasNecessarias ?? null,
    data_fechamento: o.dataFechamento ?? null,
    horas_trabalhadas: o.horasTrabalhadas ?? null,
    causa_raiz: o.causaRaiz ?? null,
    pecas_utilizadas: o.pecasUtilizadas ?? null,
    tecnico_fechamento: o.tecnicoFechamento ?? null,
    observacoes_finais: o.observacoesFinais ?? null,
    custo_total: o.custoTotal ?? null
  };
}

// Helper for fast, safe timeout on database queries that NEVER throws/rejects uncaught exceptions
async function safeQueryWithTimeout<T>(
  queryPromise: Promise<T>,
  fallbackValue: T,
  timeoutMs = 1500
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
  });
  return Promise.race([
    queryPromise
      .then((res) => {
        clearTimeout(timer);
        return res;
      })
      .catch(() => {
        clearTimeout(timer);
        return fallbackValue;
      }),
    timeoutPromise
  ]);
}

// Database Operations with Resilience
export async function fetchTornosFromSupabase(): Promise<{ data: Torno[] | null; error: Error | null }> {
  try {
    const supabase = getSupabase();
    const queryPromise = supabase.from('tornos').select('*').order('patrimonio', { ascending: true });
    const res = await safeQueryWithTimeout(
      queryPromise as any,
      { data: null, error: { message: 'Modo local/cache.' } },
      1500
    ) as any;

    if (res?.error) {
      return { data: null, error: new Error(res.error.message || 'Conexão offline') };
    }
    const mapped = (res?.data || []).map(dbToTorno);
    return { data: mapped, error: null };
  } catch {
    return { data: null, error: new Error('Modo local/cache.') };
  }
}

export async function fetchOrdensFromSupabase(): Promise<{ data: OrdemServico[] | null; error: Error | null }> {
  try {
    const supabase = getSupabase();
    const queryPromise = supabase.from('ordens_servico').select('*').order('data_abertura', { ascending: false });
    const res = await safeQueryWithTimeout(
      queryPromise as any,
      { data: null, error: { message: 'Modo local/cache.' } },
      1500
    ) as any;

    if (res?.error) {
      return { data: null, error: new Error(res.error.message || 'Conexão offline') };
    }
    const mapped = (res?.data || []).map(dbToOrdem);
    return { data: mapped, error: null };
  } catch {
    return { data: null, error: new Error('Modo local/cache.') };
  }
}

export async function upsertTornoToSupabase(torno: Torno): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const payload = tornoToDb(torno);
    const res = await safeQueryWithTimeout(
      supabase.from('tornos').upsert(payload, { onConflict: 'id' }) as any,
      { error: { message: 'Timeout' } } as any,
      1500
    ) as any;

    if (res?.error) {
      // Fallback: try inserting minimal fields if schema has fewer columns
      const minimalPayload = {
        id: torno.id,
        patrimonio: torno.patrimonio,
        modelo: torno.modelo,
        fabricante: torno.fabricante,
        setor: torno.setor,
        status: torno.status,
        data_aquisicao: torno.dataAquisicao
      };
      await safeQueryWithTimeout(
        supabase.from('tornos').upsert(minimalPayload, { onConflict: 'id' }) as any,
        { error: { message: 'Timeout' } } as any,
        1500
      );
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteTornoFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    await safeQueryWithTimeout(
      supabase.from('tornos').delete().eq('id', id) as any,
      { error: null } as any,
      1500
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function upsertOrdemToSupabase(ordem: OrdemServico): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const payload = ordemToDb(ordem);
    const res = await safeQueryWithTimeout(
      supabase.from('ordens_servico').upsert(payload, { onConflict: 'id' }) as any,
      { error: { message: 'Timeout' } } as any,
      1500
    ) as any;

    if (res?.error) {
      // Fallback: try minimal payload if schema differs
      const minimalPayload = {
        id: ordem.id,
        torno_id: ordem.tornoId,
        tipo: ordem.tipo,
        prioridade: ordem.prioridade,
        categoria_componente: ordem.categoriaComponente,
        descricao: ordem.descricao,
        solicitante: ordem.solicitante,
        responsavel: ordem.responsavel,
        data_abertura: ordem.dataAbertura,
        status: ordem.status
      };
      await safeQueryWithTimeout(
        supabase.from('ordens_servico').upsert(minimalPayload, { onConflict: 'id' }) as any,
        { error: { message: 'Timeout' } } as any,
        1500
      );
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteOrdemFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    await safeQueryWithTimeout(
      supabase.from('ordens_servico').delete().eq('id', id) as any,
      { error: null } as any,
      1500
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// SQL Setup Script for the Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- SCRIPT DE CRIAÇÃO DAS TABELAS NO SUPABASE (TornoMaint)
-- Execute no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.tornos (
  id TEXT PRIMARY KEY,
  patrimonio TEXT NOT NULL,
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  setor TEXT NOT NULL,
  data_aquisicao TEXT,
  status TEXT NOT NULL DEFAULT 'Operacional',
  potencia_cv TEXT,
  distancia_entre_pontas TEXT,
  barramento_largura TEXT,
  tensao_eletrica TEXT,
  ano_fabricacao INTEGER,
  observacoes TEXT,
  horas_operadas_estimadas NUMERIC DEFAULT 1500,
  codigo_qr TEXT,
  aliases JSONB DEFAULT '[]'::jsonb,
  oleo_recomendado TEXT,
  ultima_lubrificacao TEXT,
  ultima_manutencao TEXT,
  proxima_preventiva TEXT,
  responsavel TEXT,
  manual_basico TEXT,
  normas_seguranca JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id TEXT PRIMARY KEY,
  torno_id TEXT,
  tipo TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  categoria_componente TEXT NOT NULL,
  descricao TEXT NOT NULL,
  solicitante TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  data_abertura TEXT NOT NULL,
  previsao_conclusao TEXT,
  status TEXT NOT NULL DEFAULT 'Aberta',
  parada_maquina BOOLEAN DEFAULT false,
  pecas_necessarias TEXT,
  data_fechamento TEXT,
  horas_trabalhadas NUMERIC,
  causa_raiz TEXT,
  pecas_utilizadas TEXT,
  tecnico_fechamento TEXT,
  observacoes_finais TEXT,
  custo_total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS com acesso irrestrito para anon key
ALTER TABLE public.tornos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total aos tornos" ON public.tornos;
CREATE POLICY "Acesso total aos tornos" ON public.tornos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total às ordens" ON public.ordens_servico;
CREATE POLICY "Acesso total às ordens" ON public.ordens_servico FOR ALL USING (true) WITH CHECK (true);

-- Habilitar replicação Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tornos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tornos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ordens_servico'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ordens_servico;
  END IF;
END $$;
`;
