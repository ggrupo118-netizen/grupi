import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrdemServico, OsStatus } from '../types';
import { ConcluirOsModal } from './ConcluirOsModal';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Wrench,
  Printer
} from 'lucide-react';

interface GestaoOsTabProps {
  onOpenNewOs: () => void;
  onNavigateToReport: (osId: string) => void;
}

export const GestaoOsTab: React.FC<GestaoOsTabProps> = ({ onOpenNewOs, onNavigateToReport }) => {
  const { ordens, updateOrdemStatus, deleteOrdem, getTorno, tornos } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterTorno, setFilterTorno] = useState<string>('');

  // Conclude Modal
  const [concludeOs, setConcludeOs] = useState<OrdemServico | null>(null);

  const filtered = ordens.filter(os => {
    if (filterStatus && os.status !== filterStatus) return false;
    if (filterTipo && os.tipo !== filterTipo) return false;
    if (filterTorno && os.tornoId !== filterTorno) return false;
    if (searchTerm) {
      const t = getTorno(os.tornoId);
      const text = `${os.id} ${t.patrimonio} ${t.modelo} ${os.descricao} ${os.solicitante} ${os.responsavel}`.toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleStatusChange = (os: OrdemServico, newStatus: OsStatus) => {
    if (newStatus === 'Concluída') {
      setConcludeOs(os);
    } else {
      updateOrdemStatus(os.id, newStatus);
    }
  };

  const abertasCount = ordens.filter(o => o.status === 'Aberta').length;
  const andamentoCount = ordens.filter(o => o.status === 'Em Andamento').length;
  const concluidasCount = ordens.filter(o => o.status === 'Concluída').length;

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Top summary badges: 2 columns on small screens, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase">Total Emitidas</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{ordens.length}</p>
          </div>
          <ClipboardList className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-amber-700 font-bold uppercase">Aguardando Início</span>
            <p className="text-xl font-black text-amber-700 mt-0.5">{abertasCount}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-indigo-700 font-bold uppercase">Em Manutenção</span>
            <p className="text-xl font-black text-indigo-700 mt-0.5">{andamentoCount}</p>
          </div>
          <Wrench className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-emerald-700 font-bold uppercase">Finalizadas</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{concluidasCount}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Filter and action toolbar - 1 column on mobile */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xs w-full">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-1 w-full">
          {/* Search Input: text-base min-h-[44px] */}
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar OS, torno, mecânico..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 min-h-[44px] text-base sm:text-xs text-slate-800 shadow-xs"
            >
              <option value="">Status: Todos</option>
              <option value="Aberta">Aberta</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 min-h-[44px] text-base sm:text-xs text-slate-800 shadow-xs"
            >
              <option value="">Tipo: Todos</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Corretiva">Corretiva</option>
            </select>

            <select
              value={filterTorno}
              onChange={(e) => setFilterTorno(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 min-h-[44px] text-base sm:text-xs text-slate-800 shadow-xs"
            >
              <option value="">Todos os Tornos</option>
              {tornos.map(t => (
                <option key={t.id} value={t.id}>{t.patrimonio} - {t.modelo}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onOpenNewOs}
          className="w-full sm:w-auto min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova O.S.</span>
        </button>
      </div>

      {/* OS Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs w-full">
        {/* MOBILE VIEW (< md): Cartões individuais com linhas "rótulo: valor" */}
        <div className="md:hidden divide-y divide-slate-100 w-full">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-xs">Nenhuma ordem de serviço encontrada.</p>
          ) : (
            filtered.map((os) => {
              const torno = getTorno(os.tornoId);
              return (
                <div key={os.id} className="p-4 space-y-3 w-full">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-bold text-amber-700 text-base">{os.id}</span>
                      {os.paradaMaquina && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded ml-2">
                          MÁQUINA PARADA
                        </span>
                      )}
                    </div>
                    <select
                      value={os.status}
                      onChange={(e) => handleStatusChange(os, e.target.value as OsStatus)}
                      className="bg-white border border-slate-300 text-xs min-h-[44px] text-slate-800 rounded-xl px-2.5 font-bold focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Linhas de "rótulo: valor" */}
                  <div className="space-y-1.5 text-xs text-slate-700 w-full">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Torno Mecânico:</span>
                      <span className="font-semibold text-slate-900">{torno.patrimonio} - {torno.modelo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Tipo de OS:</span>
                      <span className="font-semibold">{os.tipo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Prioridade:</span>
                      <span className={`font-bold ${os.prioridade === 'Urgente' ? 'text-rose-700' : 'text-slate-800'}`}>{os.prioridade}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Responsável:</span>
                      <span className="text-slate-900">{os.responsavel}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Data de Abertura:</span>
                      <span className="font-mono text-slate-800">{os.dataAbertura}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 font-medium">Prazo Previsto:</span>
                      <span className="font-mono text-slate-800">{os.previsaoConclusao}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 font-medium block mb-1">Descrição do Chamado:</span>
                      <p className="text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{os.descricao}</p>
                    </div>
                    {os.horasTrabalhadas && (
                      <div className="flex justify-between py-1 text-emerald-700 font-bold">
                        <span className="text-slate-500 font-medium">Horas Trabalhadas:</span>
                        <span>{os.horasTrabalhadas}h</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions - min-h-[44px] */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {os.status !== 'Concluída' && (
                      <button
                        onClick={() => setConcludeOs(os)}
                        className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Concluir O.S.</span>
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateToReport(os.id)}
                      className="flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Relatório</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir ordem ${os.id}?`)) deleteOrdem(os.id);
                      }}
                      className="min-h-[44px] px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 flex items-center justify-center transition"
                      aria-label="Excluir OS"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP VIEW (>= md): Tabela completa */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Torno Mecânico</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Descrição Resumida</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">Abertura / Prazo</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    Nenhuma ordem de serviço encontrada com os critérios informados.
                  </td>
                </tr>
              ) : (
                filtered.map((os) => {
                  const torno = getTorno(os.tornoId);
                  return (
                    <tr key={os.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-amber-700">
                        {os.id}
                        {os.paradaMaquina && (
                          <span className="block text-[9px] text-rose-600 font-sans font-bold">
                            (Parada)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{torno.patrimonio}</div>
                        <div className="text-[11px] text-slate-500">{torno.modelo} ({torno.setor})</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          os.tipo === 'Preventiva' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {os.tipo}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${
                          os.prioridade === 'Urgente' ? 'text-rose-700 font-bold' :
                          os.prioridade === 'Alta' ? 'text-amber-700 font-bold' : 'text-slate-600'
                        }`}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs text-slate-700">
                        <div className="line-clamp-2" title={os.descricao}>
                          {os.descricao}
                        </div>
                        {os.horasTrabalhadas && (
                          <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block font-bold">
                            Executado: {os.horasTrabalhadas}h
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">{os.responsavel}</td>
                      <td className="p-3 text-slate-500">
                        <span className="text-slate-700 font-medium">{os.dataAbertura}</span>
                        <div className="text-[10px] text-slate-400">Prazo: {os.previsaoConclusao}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={os.status}
                          onChange={(e) => handleStatusChange(os, e.target.value as OsStatus)}
                          className="bg-white border border-slate-300 text-[11px] text-slate-800 rounded-lg p-1.5 focus:outline-none focus:border-amber-500 shadow-xs"
                        >
                          <option value="Aberta">Aberta</option>
                          <option value="Em Andamento">Em Andamento</option>
                          <option value="Concluída">Concluída</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {os.status !== 'Concluída' && (
                            <button
                              onClick={() => setConcludeOs(os)}
                              className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                              title="Concluir e Registrar Horas (MTTR)"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onNavigateToReport(os.id)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Ver Relatório Técnico da O.S."
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover a ordem ${os.id}?`)) {
                                deleteOrdem(os.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Remover O.S."
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Concluir OS Modal */}
      {concludeOs && (
        <ConcluirOsModal
          isOpen={!!concludeOs}
          os={concludeOs}
          torno={getTorno(concludeOs.tornoId)}
          onClose={() => setConcludeOs(null)}
        />
      )}
    </div>
  );
};
