import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  AlertTriangle, 
  Plus, 
  ShieldAlert,
  QrCode,
  Warehouse,
  ClipboardList,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { TabType } from './Navbar';

interface DashboardTabProps {
  onNavigate: (tab: TabType) => void;
  onOpenNewOs: () => void;
  onOpenQrScanner?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate, onOpenNewOs, onOpenQrScanner }) => {
  const { 
    ordens, 
    preventivas, 
    getTorno,
    tornos,
    currentUser,
    globalReliability
  } = useApp();

  const osAbertas = ordens.filter(o => o.status === 'Aberta').length;
  const tornosOperando = tornos.filter(t => t.status === 'Operacional').length;
  const tornosParados = tornos.filter(t => t.status !== 'Operacional').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevVencidas = preventivas.filter(p => {
    const d = new Date(p.proximaExecucao);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  const recentOrdens = [...ordens].slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Quick Industrial Floor Action Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-white border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">Chão de Fábrica & Operações</h2>
              {currentUser && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {currentUser.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Escaneie o QR Code do torno para abrir chamado de parada, consultar especificações e NR-12.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-col sm:flex-row">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="w-full sm:w-auto min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer border border-amber-400"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Ler QR Code do Torno</span>
            </button>
          )}
          <button
            onClick={onOpenNewOs}
            className="w-full sm:w-auto min-h-[44px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Abrir Nova O.S.</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Exactly 1 or 2 columns on small screens, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full">
        {/* Card 1: Operando */}
        <div 
          onClick={() => onNavigate('equipamentos')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold">Tornos Operando</span>
            <Warehouse className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{tornosOperando}</div>
          <span className="text-[10px] text-slate-500 font-medium">De {tornos.length} máquinas</span>
        </div>

        {/* Card 2: Parados */}
        <div 
          onClick={() => onNavigate('equipamentos')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-rose-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold">Tornos Parados</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">{tornosParados}</div>
          <span className="text-[10px] text-rose-600 font-medium">Manutenção / Crítico</span>
        </div>

        {/* Card 3: OS Abertas */}
        <div 
          onClick={() => onNavigate('gestao')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold">OS em Aberto</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{osAbertas}</div>
          <span className="text-[10px] text-amber-700 font-medium">Aguardando reparo</span>
        </div>

        {/* Card 4: Preventivas */}
        <div 
          onClick={() => onNavigate('cronograma')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-sky-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold">Aderência Plano</span>
            <Gauge className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{globalReliability.taxaAderenciaPreventiva}%</div>
          <span className="text-[10px] text-slate-500 font-medium">{prevVencidas} vencida(s)</span>
        </div>
      </div>

      {/* Linha de Ordens Recentes e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs w-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Últimas Ordens de Serviço
            </h2>
            {currentUser?.role === 'Operador' ? (
              <button 
                onClick={() => onNavigate('abertura')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                Abrir chamado &rarr;
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('gestao')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                Ver todas ({ordens.length}) &rarr;
              </button>
            )}
          </div>

          {/* MOBILE CARDS (< md): Um cartão por ordem de serviço com "rótulo: valor" */}
          <div className="md:hidden space-y-3 w-full">
            {recentOrdens.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Nenhuma ordem de serviço registrada.</p>
            ) : (
              recentOrdens.map((os) => {
                const torno = getTorno(os.tornoId);
                return (
                  <div key={os.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs w-full">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-mono font-bold text-amber-700 text-sm">{os.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        os.status === 'Concluída' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        os.status === 'Em Andamento' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {os.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Torno:</span>
                        <span className="font-semibold text-slate-900">{torno.patrimonio} - {torno.modelo}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Tipo:</span>
                        <span className="font-semibold">{os.tipo}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Prioridade:</span>
                        <span className={`font-bold ${os.prioridade === 'Urgente' ? 'text-rose-700' : 'text-slate-800'}`}>{os.prioridade}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-500 font-medium">Data de Abertura:</span>
                        <span className="font-mono">{os.dataAbertura}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP TABLE (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 border-b border-slate-200 bg-slate-50/70">
                <tr>
                  <th className="py-2.5 px-2 font-semibold">Código</th>
                  <th className="py-2.5 px-2 font-semibold">Torno</th>
                  <th className="py-2.5 px-2 font-semibold">Tipo</th>
                  <th className="py-2.5 px-2 font-semibold">Prioridade</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrdens.map((os) => {
                  const torno = getTorno(os.tornoId);
                  return (
                    <tr key={os.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-2 font-mono font-bold text-amber-700">{os.id}</td>
                      <td className="py-3 px-2 text-slate-800">
                        <span className="font-semibold">{torno.patrimonio}</span>
                        <span className="text-slate-500 text-[11px] block">{torno.modelo}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          os.tipo === 'Preventiva' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {os.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`font-semibold ${
                          os.prioridade === 'Urgente' ? 'text-rose-700 font-bold' :
                          os.prioridade === 'Alta' ? 'text-amber-700 font-bold' : 'text-slate-600'
                        }`}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          os.status === 'Concluída' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          os.status === 'Em Andamento' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          os.status === 'Aberta' ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{os.dataAbertura}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas e Ações Rápidas */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between w-full">
          <div className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Alertas da Fábrica
            </h2>

            {prevVencidas > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold text-rose-900">
                    {prevVencidas} Rotina(s) Preventiva(s) Vencida(s)
                  </strong>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Lubrificação e correias dos tornos precisam de inspeção imediata.
                  </p>
                </div>
              </div>
            )}

            {osAbertas > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold text-amber-900">
                    {osAbertas} Ordem(ns) em Aberto
                  </strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Aloque mecânicos para diminuir o tempo de indisponibilidade.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
              <span className="font-bold text-slate-900 block mb-1">
                {currentUser?.role === 'Operador' ? 'Recursos Chão de Fábrica:' : 'Recursos Técnicos de Manutenção:'}
              </span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                {currentUser?.role === 'Operador' ? (
                  <>
                    <li className="flex items-center gap-1.5">
                      <span className="text-amber-600 font-bold">&bull;</span> Leitura instantânea de QR Code da placa do torno
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span> Abertura ágil de chamado com parada de máquina
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-sky-600 font-bold">&bull;</span> Consulta de normas NR-12 e manual de lubrificação
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-1.5">
                      <span className="text-sky-600 font-bold">&bull;</span> Gestão, apontamento de horas e encerramento de O.S.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span> Cronograma preventivo e execução de checklists
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-amber-600 font-bold">&bull;</span> Monitoramento de confiabilidade MTBF e MTTR
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
            <button
              onClick={onOpenNewOs}
              className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Nova O.S. Agora</span>
            </button>
            {currentUser?.role === 'Operador' ? (
              <button
                onClick={() => onNavigate('equipamentos')}
                className="w-full min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition border border-slate-200 cursor-pointer"
              >
                <span>Consultar Especificações dos Tornos</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('relatorios')}
                className="w-full min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition border border-slate-200 cursor-pointer"
              >
                <span>Gerar Relatório Técnico</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
