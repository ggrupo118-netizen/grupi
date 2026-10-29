import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Torno, TornoStatus } from '../types';
import { 
  Warehouse, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  History, 
  Wrench,
  DollarSign
} from 'lucide-react';

export const EquipamentosTab: React.FC = () => {
  const { tornos, addTorno, updateTorno, deleteTorno, ordens, gastos } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTornoHistory, setSelectedTornoHistory] = useState<Torno | null>(null);

  // Form state
  const [patrimonio, setPatrimonio] = useState('');
  const [modelo, setModelo] = useState('');
  const [fabricante, setFabricante] = useState('Indústrias Romi');
  const [setor, setSetor] = useState('Galpão 1 - Usinagem');
  const [potenciaCv, setPotenciaCv] = useState('7.5 CV');
  const [distanciaEntrePontas, setDistanciaEntrePontas] = useState('1500 mm');
  const [barramentoLargura, setBarramentoLargura] = useState('350 mm');
  const [tensaoEletrica, setTensaoEletrica] = useState('380V Trifásico');
  const [anoFabricacao, setAnoFabricacao] = useState(2020);
  const [observacoes, setObservacoes] = useState('');

  const handleSalvarTorno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patrimonio.trim() || !modelo.trim()) return;

    addTorno({
      patrimonio,
      modelo,
      fabricante,
      setor,
      dataAquisicao: new Date().toISOString().split('T')[0],
      status: 'Operacional',
      potenciaCv,
      distanciaEntrePontas,
      barramentoLargura,
      tensaoEletrica,
      anoFabricacao,
      observacoes,
      horasOperadasEstimadas: 1600
    });

    setIsModalOpen(false);
    setPatrimonio('');
    setModelo('');
    setObservacoes('');
  };

  const handleStatusChange = (torno: Torno, newStatus: TornoStatus) => {
    updateTorno({ ...torno, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-600" />
            <span>Parque de Tornos Mecânicos Cadastrados</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de ativos industriais, especificações técnicas de barramento e histórico de intervenções
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Torno</span>
        </button>
      </div>

      {/* Lathes Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Patrimônio</th>
                <th className="p-3">Modelo</th>
                <th className="p-3">Fabricante</th>
                <th className="p-3">Setor / Galpão</th>
                <th className="p-3">Potência & Barramento</th>
                <th className="p-3">Tensão / Ano</th>
                <th className="p-3">Status Operacional</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tornos.map((t) => {
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-amber-700">
                      {t.patrimonio}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">{t.modelo}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.id}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{t.fabricante}</td>
                    <td className="p-3 text-slate-700">{t.setor}</td>
                    <td className="p-3 text-slate-600">
                      <span>{t.potenciaCv || '-'}</span>
                      <span className="text-[11px] text-slate-400 block">Guias: {t.barramentoLargura || '-'}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span>{t.tensaoEletrica || '-'}</span>
                      <span className="text-[11px] text-slate-400 block">Fab: {t.anoFabricacao || '-'}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value as TornoStatus)}
                        className={`text-[11px] rounded-lg p-1 font-semibold border ${
                          t.status === 'Operacional'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : t.status === 'Em Manutenção'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="Operacional">Operacional</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                        <option value="Parado">Parado (Crítico)</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTornoHistory(t)}
                          className="p-1.5 rounded hover:bg-slate-100 text-sky-700 transition cursor-pointer"
                          title="Ver Histórico & Custos do Torno"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o torno ${t.patrimonio} (${t.modelo}) do inventário?`)) {
                              deleteTorno(t.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Excluir Torno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Torno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                <span>Cadastrar Novo Torno Mecânico</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarTorno} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patrimônio / Tag *</label>
                  <input
                    type="text"
                    required
                    value={patrimonio}
                    onChange={(e) => setPatrimonio(e.target.value)}
                    placeholder="Ex: TR-06"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modelo da Máquina *</label>
                  <input
                    type="text"
                    required
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ex: Tormax 35, Mascote 220"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={fabricante}
                    onChange={(e) => setFabricante(e.target.value)}
                    placeholder="Ex: Romi, Nardini, Clever..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Setor / Galpão</label>
                  <input
                    type="text"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    placeholder="Ex: Galpão 1 - Usinagem"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potência Motor</label>
                  <input
                    type="text"
                    value={potenciaCv}
                    onChange={(e) => setPotenciaCv(e.target.value)}
                    placeholder="Ex: 7.5 CV"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entre Pontas</label>
                  <input
                    type="text"
                    value={distanciaEntrePontas}
                    onChange={(e) => setDistanciaEntrePontas(e.target.value)}
                    placeholder="Ex: 1500 mm"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Largura Guias</label>
                  <input
                    type="text"
                    value={barramentoLargura}
                    onChange={(e) => setBarramentoLargura(e.target.value)}
                    placeholder="Ex: 350 mm"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações Técnicas / Acessórios</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Placa universal 3 castanhas Ø250mm, luneta fixa e móvel inclusas..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar Torno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico do Torno */}
      {selectedTornoHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <History className="w-5 h-5" />
                  <span>Prontuário Técnico do Torno &bull; {selectedTornoHistory.patrimonio}</span>
                </h3>
                <p className="text-[11px] text-sky-100">{selectedTornoHistory.modelo} &bull; {selectedTornoHistory.setor}</p>
              </div>
              <button
                onClick={() => setSelectedTornoHistory(null)}
                className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Fabricante</span>
                  <strong className="text-slate-900">{selectedTornoHistory.fabricante}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Potência</span>
                  <strong className="text-slate-900">{selectedTornoHistory.potenciaCv || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Entre Pontas</span>
                  <strong className="text-slate-900">{selectedTornoHistory.distanciaEntrePontas || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status Atual</span>
                  <strong className="text-emerald-700">{selectedTornoHistory.status}</strong>
                </div>
              </div>

              {/* OS Linked */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                  <Wrench className="w-4 h-4 text-amber-600" /> Ordens de Serviço Realizadas / Abertas
                </h4>
                <div className="space-y-2">
                  {ordens.filter(o => o.tornoId === selectedTornoHistory.id).length === 0 ? (
                    <p className="text-slate-500 italic">Nenhuma ordem de serviço registrada para este torno.</p>
                  ) : (
                    ordens.filter(o => o.tornoId === selectedTornoHistory.id).map(o => (
                      <div key={o.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-700">{o.id}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">{o.tipo}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{o.dataAbertura}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{o.descricao}</p>
                          {o.pecasUtilizadas && (
                            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Peças: {o.pecasUtilizadas}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {o.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Expenses Linked */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Despesas & Insumos Registrados
                </h4>
                <div className="space-y-2">
                  {gastos.filter(g => g.tornoId === selectedTornoHistory.id).length === 0 ? (
                    <p className="text-slate-500 italic">Nenhum gasto financeiro vinculado a este torno.</p>
                  ) : (
                    gastos.filter(g => g.tornoId === selectedTornoHistory.id).map(g => (
                      <div key={g.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">{g.descricao}</span>
                          <span className="text-[10px] text-slate-500">{g.categoria} &bull; {g.fornecedor} &bull; {g.data}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700">
                          R$ {g.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
