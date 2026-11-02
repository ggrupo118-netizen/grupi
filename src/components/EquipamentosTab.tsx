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
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Parque de Tornos Mecânicos Cadastrados</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de ativos industriais, especificações técnicas de barramento e histórico de intervenções ({tornos.length} máquinas).
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Torno</span>
        </button>
      </div>

      {/* Lathes Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs w-full">
        {/* MOBILE VIEW (< md): Cartões individuais com linhas "rótulo: valor" */}
        <div className="md:hidden divide-y divide-slate-100 w-full">
          {tornos.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-xs">Nenhum torno mecânico cadastrado.</p>
          ) : (
            tornos.map((t) => (
              <div key={t.id} className="p-4 space-y-3 w-full">
                {/* Header do Cartão */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-mono font-bold text-amber-700 text-base">{t.patrimonio}</span>
                    <span className="text-xs text-slate-500 block font-medium">{t.modelo}</span>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value as TornoStatus)}
                    className={`text-xs min-h-[44px] px-2.5 rounded-xl font-bold border ${
                      t.status === 'Operacional'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : t.status === 'Em Manutenção'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Parado">Parado (Crítico)</option>
                  </select>
                </div>

                {/* Linhas de "rótulo: valor" */}
                <div className="space-y-1.5 text-xs text-slate-700 w-full">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Fabricante:</span>
                    <span className="font-semibold text-slate-900">{t.fabricante}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Setor / Galpão:</span>
                    <span className="text-slate-800">{t.setor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Potência do Motor:</span>
                    <span className="text-slate-800 font-mono">{t.potenciaCv || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Largura do Barramento:</span>
                    <span className="text-slate-800">{t.barramentoLargura || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Tensão Elétrica:</span>
                    <span className="text-slate-800">{t.tensaoEletrica || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Ano de Fabricação:</span>
                    <span className="text-slate-800 font-mono">{t.anoFabricacao || '-'}</span>
                  </div>
                </div>

                {/* Ações do Cartão - min-h-[44px] */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTornoHistory(t)}
                    className="flex-1 min-h-[44px] bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition"
                  >
                    <History className="w-4 h-4 text-sky-700" />
                    <span>Prontuário & Histórico</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja remover o torno ${t.patrimonio} (${t.modelo}) do inventário?`)) {
                        deleteTorno(t.id);
                      }
                    }}
                    className="min-h-[44px] px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 flex items-center justify-center transition"
                    aria-label="Excluir torno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP VIEW (>= md): Tabela completa */}
        <div className="hidden md:block overflow-x-auto w-full">
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
              {tornos.map((t) => (
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
                      className={`text-[11px] rounded-lg p-1.5 font-semibold border ${
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
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Remover Torno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro de Torno - Formulário em uma coluna só */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                <span>Cadastrar Torno Mecânico no Inventário</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form em 1 coluna só */}
            <form onSubmit={handleSalvarTorno} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3.5 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tag / Patrimônio *</label>
                <input
                  type="text"
                  required
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value.toUpperCase())}
                  placeholder="Ex: TR-06, TORNO-CNC-02"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Modelo da Máquina *</label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: Tormax 35, Mascote 220"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Fabricante</label>
                <input
                  type="text"
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                  placeholder="Ex: Romi, Nardini, Clever..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Setor / Galpão</label>
                <input
                  type="text"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  placeholder="Ex: Galpão 1 - Usinagem"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Potência do Motor</label>
                <input
                  type="text"
                  value={potenciaCv}
                  onChange={(e) => setPotenciaCv(e.target.value)}
                  placeholder="Ex: 7.5 CV"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Distância Entre Pontas</label>
                <input
                  type="text"
                  value={distanciaEntrePontas}
                  onChange={(e) => setDistanciaEntrePontas(e.target.value)}
                  placeholder="Ex: 1500 mm"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Largura das Guias / Barramento</label>
                <input
                  type="text"
                  value={barramentoLargura}
                  onChange={(e) => setBarramentoLargura(e.target.value)}
                  placeholder="Ex: 350 mm"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tensão Elétrica</label>
                <input
                  type="text"
                  value={tensaoEletrica}
                  onChange={(e) => setTensaoEletrica(e.target.value)}
                  placeholder="Ex: 380V Trifásico"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Ano de Fabricação</label>
                <input
                  type="number"
                  value={anoFabricacao}
                  onChange={(e) => setAnoFabricacao(parseInt(e.target.value) || 2020)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Observações Técnicas / Acessórios</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Placa universal 3 castanhas Ø250mm, luneta inclusa..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-200 w-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <History className="w-5 h-5" />
                  <span>Prontuário do Torno &bull; {selectedTornoHistory.patrimonio}</span>
                </h3>
                <p className="text-[11px] text-sky-100">{selectedTornoHistory.modelo} &bull; {selectedTornoHistory.setor}</p>
              </div>
              <button
                onClick={() => setSelectedTornoHistory(null)}
                className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Fabricante</span>
                  <strong className="text-slate-900 text-xs">{selectedTornoHistory.fabricante}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Potência</span>
                  <strong className="text-slate-900 text-xs">{selectedTornoHistory.potenciaCv || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Entre Pontas</span>
                  <strong className="text-slate-900 text-xs">{selectedTornoHistory.distanciaEntrePontas || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status Atual</span>
                  <strong className="text-emerald-700 text-xs">{selectedTornoHistory.status}</strong>
                </div>
              </div>

              {/* OS Linked */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Wrench className="w-4 h-4 text-amber-600" /> Ordens de Serviço Realizadas / Abertas
                </h4>
                <div className="space-y-2">
                  {ordens.filter(o => o.tornoId === selectedTornoHistory.id).length === 0 ? (
                    <p className="text-slate-500 italic p-3 bg-slate-50 rounded-lg">Nenhuma ordem de serviço registrada para este torno.</p>
                  ) : (
                    ordens.filter(o => o.tornoId === selectedTornoHistory.id).map(o => (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-amber-700">{o.id}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{o.tipo}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{o.dataAbertura}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{o.descricao}</p>
                          {o.pecasUtilizadas && (
                            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Peças: {o.pecasUtilizadas}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200 text-slate-700 shrink-0">
                          {o.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Expenses Linked */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Despesas & Insumos Registrados
                </h4>
                <div className="space-y-2">
                  {gastos.filter(g => g.tornoId === selectedTornoHistory.id).length === 0 ? (
                    <p className="text-slate-500 italic p-3 bg-slate-50 rounded-lg">Nenhum gasto financeiro vinculado a este torno.</p>
                  ) : (
                    gastos.filter(g => g.tornoId === selectedTornoHistory.id).map(g => (
                      <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">{g.descricao}</span>
                          <span className="text-[10px] text-slate-500">{g.categoria} &bull; {g.data}</span>
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
