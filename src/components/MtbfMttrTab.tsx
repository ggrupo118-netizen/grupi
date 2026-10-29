import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Gauge, 
  Calculator, 
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

export const MtbfMttrTab: React.FC = () => {
  const { 
    globalReliability, 
    tornosReliability, 
    ordens, 
    tornos 
  } = useApp();

  // What-If Simulator state
  const [simMttrReductionPct, setSimMttrReductionPct] = useState<number>(25); // 25% reduction in MTTR
  const [simFailureReductionCount, setSimFailureReductionCount] = useState<number>(1); // 1 less failure
  const [custoHoraParada, setCustoHoraParada] = useState<number>(350); // R$ 350 / hour of lathe stopped

  // Base values
  const baseFalhas = Math.max(1, globalReliability.totalFalhas);
  const baseHorasReparo = globalReliability.totalHorasReparo;
  const baseHorasOperadas = globalReliability.totalHorasOperadas;
  const baseMttr = globalReliability.mttr;
  const baseMtbf = globalReliability.mtbf;
  const baseDisp = globalReliability.disponibilidade;

  // Simulated values
  const simFalhas = Math.max(1, baseFalhas - simFailureReductionCount);
  const simNovoMttr = parseFloat((baseMttr * (1 - simMttrReductionPct / 100)).toFixed(1));
  const simNovoHorasReparo = parseFloat((simFalhas * simNovoMttr).toFixed(1));
  const simNovoHorasOperadas = baseHorasOperadas + (baseHorasReparo - simNovoHorasReparo);
  const simNovoMtbf = parseFloat((simNovoHorasOperadas / simFalhas).toFixed(1));
  const simNovaDisp = parseFloat(((simNovoMtbf / (simNovoMtbf + simNovoMttr)) * 100).toFixed(1));
  
  const horasGanhas = Math.max(0, parseFloat((baseHorasReparo - simNovoHorasReparo).toFixed(1)));
  const economiaProjetada = horasGanhas * custoHoraParada;

  // Subsystem failure distribution
  const subsistemas = [
    { nome: 'Sistema Elétrico/Motor', count: ordens.filter(o => o.categoriaComponente === 'Sistema Elétrico/Motor').length },
    { nome: 'Cabeçote Fixo & Engrenagens', count: ordens.filter(o => o.categoriaComponente === 'Cabeçote Fixo').length },
    { nome: 'Caixa Norton & Avanços', count: ordens.filter(o => o.categoriaComponente === 'Caixa Norton').length },
    { nome: 'Barramento & Guias Prismáticas', count: ordens.filter(o => o.categoriaComponente === 'Barramento/Guias').length },
    { nome: 'Placa de Castanhas & Fuso', count: ordens.filter(o => o.categoriaComponente === 'Placa e Fuso').length },
    { nome: 'Bomba de Refrigeração/Geral', count: ordens.filter(o => o.categoriaComponente === 'Refrigeração/Cavacos' || o.categoriaComponente === 'Geral').length },
  ].sort((a, b) => b.count - a.count);

  const totalComponentes = Math.max(1, ordens.length);

  return (
    <div className="space-y-6">
      {/* Header Banner in White */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Engenharia de Confiabilidade Industrial &bull; MTBF e MTTR
                </h2>
                <span className="text-[10px] font-mono bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded uppercase font-bold">
                  Norma NBR 5462
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Análise aprofundada de manutenibilidade, tempo médio entre falhas e disponibilidade física dos tornos mecânicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-medium">
              Parque: {tornos.length} Tornos Monitorados
            </span>
          </div>
        </div>

        {/* 4 Core Scientific Metrics in White */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MTBF */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  MTBF (Confiabilidade)
                </span>
                <span className="text-[10px] font-mono text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                  {globalReliability.totalFalhas} Falhas
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {globalReliability.mtbf} <span className="text-sm font-normal text-slate-500">horas</span>
              </p>
              <div className="text-[11px] font-mono text-sky-900 bg-sky-100/70 p-2 rounded mt-2 border border-sky-200 font-semibold">
                MTBF = Horas Operadas / N° Falhas
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200">
              Tempo médio em que o torno usina peças perfeitamente sem nenhuma interrupção mecânica ou elétrica.
            </p>
          </div>

          {/* MTTR */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  MTTR (Manutenibilidade)
                </span>
                <span className="text-[10px] font-mono text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                  {globalReliability.totalHorasReparo}h Total Reparo
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {globalReliability.mttr} <span className="text-sm font-normal text-slate-500">horas</span>
              </p>
              <div className="text-[11px] font-mono text-amber-900 bg-amber-100/70 p-2 rounded mt-2 border border-amber-200 font-semibold">
                MTTR = Horas de Reparo / N° Falhas
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200">
              Mede a rapidez do diagnóstico, substituição de rolamentos/correias e teste de rotação até liberação.
            </p>
          </div>

          {/* Disponibilidade Operacional */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Disponibilidade Física (A)
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  Meta &ge; 90%
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {globalReliability.disponibilidade}
                <span className="text-lg text-emerald-700 ml-0.5 font-bold">%</span>
              </p>
              <div className="text-[11px] font-mono text-emerald-900 bg-emerald-100/70 p-2 rounded mt-2 border border-emerald-200 font-semibold">
                A = MTBF / (MTBF + MTTR) &times; 100
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200">
              Probabilidade de o torno estar operando normalmente em qualquer instante de demanda produtiva.
            </p>
          </div>

          {/* Taxa de Falhas (Lambda) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Taxa de Falhas (&lambda; - Lambda)
                </span>
                <span className="text-[10px] font-mono text-purple-800 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                  Freq. Horária
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {(globalReliability.mtbf > 0 ? (1 / globalReliability.mtbf) : 0).toFixed(4)}
                <span className="text-xs text-slate-500 ml-1">falhas/h</span>
              </p>
              <div className="text-[11px] font-mono text-purple-900 bg-purple-100/70 p-2 rounded mt-2 border border-purple-200 font-semibold">
                &lambda; = 1 / MTBF
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200">
              Intensidade de ocorrência de falhas ao longo do tempo. Quanto menor, mais robusta a máquina.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Confiabilidade Máquina a Máquina */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" /> Matriz de Confiabilidade Individual por Torno Mecânico
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valores calculados com base no histórico de corretivas, horas de reparo e tempo em produção
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Baixa Criticidade (&gt;95%)
            </span>
            <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Atenção (85-95%)
            </span>
            <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Crítico (&lt;85%)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Patrimônio / Torno</th>
                <th className="p-3">Setor</th>
                <th className="p-3 text-center">N° Quebras</th>
                <th className="p-3 text-center">Horas Paradas</th>
                <th className="p-3 text-center">Horas Operando</th>
                <th className="p-3 text-center text-sky-700">MTBF (h)</th>
                <th className="p-3 text-center text-amber-800">MTTR (h)</th>
                <th className="p-3 text-center text-emerald-700">Disponibilidade</th>
                <th className="p-3 text-right">Custo Reparos</th>
                <th className="p-3 text-center">Criticidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tornosReliability.map((item) => {
                return (
                  <tr key={item.torno.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-amber-700">{item.torno.patrimonio}</span>
                        <span>{item.torno.modelo}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.torno.fabricante} &bull; {item.torno.potenciaCv || '5.0 CV'}</div>
                    </td>
                    <td className="p-3 text-slate-700">{item.torno.setor}</td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      {item.numFalhas}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">
                      {item.horasReparo}h
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">
                      {item.horasOperadas}h
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-sky-800 text-sm">
                      {item.mtbf}h
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-800 text-sm">
                      {item.mttr}h
                    </td>
                    <td className="p-3 text-center">
                      <div className="font-mono font-black text-sm text-slate-900">
                        {item.disponibilidade}%
                      </div>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.disponibilidade >= 95 ? 'bg-emerald-500' :
                            item.disponibilidade >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, item.disponibilidade)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-800">
                      R$ {item.custoManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.criticidade === 'Baixa' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.criticidade === 'Média' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.criticidade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator: Engenharia e Melhoria Contínua (What-If Analysis) */}
      <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Simulador de Eficiência Operacional & Confiabilidade (What-If)
              </h3>
              <p className="text-xs text-slate-500">
                Simule melhorias no tempo de reparo da equipe e na redução de quebras via preventiva para prever ganhos de produção
              </p>
            </div>
          </div>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Modelo Matemático Dinâmico
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700">
                <span>Redução no Tempo de Reparo (MTTR):</span>
                <span className="font-bold text-amber-700 font-mono text-sm">{simMttrReductionPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="75"
                step="5"
                value={simMttrReductionPct}
                onChange={(e) => setSimMttrReductionPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Obtido com treinamento mecânico, ferramentas ágeis e estoque de peças sobressalentes.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700">
                <span>Evitar Quebras via Preventiva:</span>
                <span className="font-bold text-sky-700 font-mono text-sm">-{simFailureReductionCount} falha(s)</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(1, baseFalhas - 1)}
                step="1"
                value={simFailureReductionCount}
                onChange={(e) => setSimFailureReductionCount(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Conquistado com lubrificação rigorosa de barramentos e trocas de correias no prazo.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700">
                <span>Custo Médio da Hora Parada de Torno:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">R$ {custoHoraParada}/h</span>
              </div>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={custoHoraParada}
                onChange={(e) => setCustoHoraParada(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono shadow-xs"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Inclui faturamento cessante de usinagem e custo da mão de obra ociosa.
              </p>
            </div>
          </div>

          {/* Results Comparison */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Disponibilidade Projetada */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Disponibilidade Operacional Projetada
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-3xl font-black text-emerald-700">{simNovaDisp}%</span>
                  <span className="text-xs text-slate-400 line-through">Atual: {baseDisp}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{(simNovaDisp - baseDisp).toFixed(1)}% de disponibilidade fabril</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                Novo MTTR: <strong className="text-amber-800">{simNovoMttr}h</strong> (antes {baseMttr}h) &bull; 
                Novo MTBF: <strong className="text-sky-800">{simNovoMtbf}h</strong>
              </div>
            </div>

            {/* Economia Projetada */}
            <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Economia Financeira Projetada
                </span>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  R$ {economiaProjetada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>{horasGanhas} horas de usinagem resgatadas no mês</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                Total de paradas reduzido de {baseHorasReparo}h para {simNovoHorasReparo}h.
              </div>
            </div>

            {/* Confiabilidade Teórica */}
            <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" /> Diagnóstico PCM para Tomada de Decisão:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ao reduzir o MTTR em <strong className="text-amber-800">{simMttrReductionPct}%</strong> (de {baseMttr}h para {simNovoMttr}h) através de estoque estratégico de correias e rolamentos e evitar <strong className="text-sky-800">{simFailureReductionCount} falha</strong> com rotinas preventivas quinzenais, a fábrica alcançará <strong className="text-emerald-700">{simNovaDisp}%</strong> de disponibilidade inerente, gerando um ganho produtivo de <strong className="text-slate-900 font-bold">{horasGanhas} horas de fuso girando</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystems Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" /> Histórico de Falhas por Subsistema do Torno
        </h3>
        <p className="text-xs text-slate-500">
          Identificação dos componentes que mais demandam intervenções mecânicas ou substituições de peças
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {subsistemas.map(sub => {
            const perc = ((sub.count / totalComponentes) * 100).toFixed(0);
            return (
              <div key={sub.nome} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{sub.nome}</span>
                  <span className="font-bold font-mono text-amber-700">{sub.count} OS</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${Math.max(5, Number(perc))}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">{perc}% de todas as ordens de serviço</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
