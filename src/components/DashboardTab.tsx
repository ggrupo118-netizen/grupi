import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  AlertTriangle, 
  Plus, 
  ShieldAlert,
  QrCode
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
    currentUser
  } = useApp();

  const osAbertas = ordens.filter(o => o.status === 'Aberta').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevVencidas = preventivas.filter(p => {
    const d = new Date(p.proximaExecucao);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  const recentOrdens = [...ordens].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Industrial Floor Action Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-white border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
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
              Aponte a câmera para a etiqueta física do torno para relatar paradas, consultar lubrificação ou abrir chamados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm cursor-pointer border border-amber-400"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Ler QR Code do Equipamento</span>
            </button>
          )}
          <button
            onClick={onOpenNewOs}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Abrir OS Manual</span>
          </button>
        </div>
      </div>

      {/* Linha de Ordens Recentes e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Últimas Ordens de Serviço Emitidas
            </h2>
            <button 
              onClick={() => onNavigate('gestao')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              Ver todas ({ordens.length}) &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
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
                    Aloque técnicos mecânicos para diminuir o tempo de indisponibilidade.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Módulos Novos Disponíveis:</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">&bull;</span> Aba Gastos: controle orçamentário e custos
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">&bull;</span> Aba Relatórios: exportação em PDF e CSV
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-600 font-bold">&bull;</span> Aba MTBF/MTTR: confiabilidade e simulador
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
            <button
              onClick={onOpenNewOs}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Nova OS Agora</span>
            </button>
            <button
              onClick={() => onNavigate('relatorios')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition border border-slate-200 cursor-pointer"
            >
              <span>Gerar Relatório Executivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
