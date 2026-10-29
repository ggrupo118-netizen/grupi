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
    <div className="space-y-4">
      {/* Top summary badges in white */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* Filter and action toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-2 items-center flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, torno, solicitante, mecânico..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-xs"
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
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-xs"
          >
            <option value="">Tipo: Todos</option>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </select>

          <select
            value={filterTorno}
            onChange={(e) => setFilterTorno(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-xs"
          >
            <option value="">Todos os Tornos</option>
            {tornos.map(t => (
              <option key={t.id} value={t.id}>{t.patrimonio} - {t.modelo}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenNewOs}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova OS</span>
        </button>
      </div>

      {/* OS Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
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
                            className="p-1.5 rounded hover:bg-slate-100 text-sky-700 transition cursor-pointer"
                            title="Ver Ficha / Imprimir OS"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja excluir permanentemente a OS ${os.id}?`)) {
                                deleteOrdem(os.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Excluir OS"
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

      {/* Conclude OS Modal */}
      {concludeOs && (
        <ConcluirOsModal
          os={concludeOs}
          torno={getTorno(concludeOs.tornoId)}
          isOpen={true}
          onClose={() => setConcludeOs(null)}
        />
      )}
    </div>
  );
};
