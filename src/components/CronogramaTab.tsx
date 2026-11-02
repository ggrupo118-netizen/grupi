import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PreventivaRotina } from '../types';
import { 
  CalendarClock, 
  CheckCircle2, 
  Plus, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  CheckSquare, 
  X
} from 'lucide-react';

export const CronogramaTab: React.FC = () => {
  const { preventivas, tornos, executarPreventiva, addPreventiva, deletePreventiva, getTorno } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formTornoId, setFormTornoId] = useState(tornos[0]?.id || '');
  const [formTitulo, setFormTitulo] = useState('');
  const [formFrequencia, setFormFrequencia] = useState<PreventivaRotina['frequencia']>('Mensal');
  const [formSistemaAlvo, setFormSistemaAlvo] = useState('Barramento/Guias');
  const [formResponsavel, setFormResponsavel] = useState('Carlos Mecânico');
  const [formDuracao, setFormDuracao] = useState('45');
  const [formItens, setFormItens] = useState('Inspeção visual e limpeza de cavacos\nLubrificação com óleo recomendado\nTeste operacional');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRotinas = preventivas.length;
  const vencidas = preventivas.filter(p => {
    const d = new Date(p.proximaExecucao);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  const aVencer = preventivas.filter(p => {
    const d = new Date(p.proximaExecucao);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  const handleSalvarRotina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

    const itensArray = formItens
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);

    addPreventiva({
      tornoId: formTornoId,
      titulo: formTitulo,
      frequencia: formFrequencia,
      sistemaAlvo: formSistemaAlvo,
      ultimaExecucao: todayStr,
      proximaExecucao: nextDate.toISOString().split('T')[0],
      itensChecklist: itensArray.length > 0 ? itensArray : ['Inspeção padrão de rotina'],
      responsavelPadrao: formResponsavel,
      duracaoEstimadaMinutos: parseInt(formDuracao) || 45
    });

    setIsModalOpen(false);
    setFormTitulo('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Cards: 1 or 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 w-full">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">Planos Cadastrados</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalRotinas}</p>
            <p className="text-[11px] text-emerald-700 font-medium">Rotinas Preventivas</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-lg border border-sky-200 shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">Rotinas Vencidas</span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">{vencidas}</p>
            <p className="text-[11px] text-rose-700 font-medium">Requer intervenção</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-lg border border-rose-200 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">A Vencer (7 Dias)</span>
            <p className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">{aVencer}</p>
            <p className="text-[11px] text-slate-500">Programação da semana</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg border border-amber-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Routine Cards Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 w-full">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Plano de Manutenções Preventivas Periódicas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Checklists técnicos e rotinas de lubrificação para prevenir quebras e elevar o MTBF.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Rotina Preventiva</span>
          </button>
        </div>

        {/* Routine Cards Grid: Um cartão por atividade do plano mostrando campos em linhas de "rótulo: valor" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 w-full">
          {preventivas.map((p) => {
            const torno = getTorno(p.tornoId);
            const target = new Date(p.proximaExecucao);
            target.setHours(0, 0, 0, 0);
            const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isVencida = diff < 0;
            const isProxima = diff >= 0 && diff <= 7;

            return (
              <div
                key={p.id}
                className={`bg-white border ${
                  isVencida 
                    ? 'border-rose-300 bg-rose-50/15' 
                    : isProxima 
                    ? 'border-amber-300 bg-amber-50/15' 
                    : 'border-slate-200 hover:border-slate-300'
                } rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xs transition w-full`}
              >
                <div className="space-y-2.5 w-full">
                  {/* Status & Frequência */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        isVencida
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isProxima
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isVencida
                        ? `VENCIDA (${Math.abs(diff)}d)`
                        : isProxima
                        ? `A VENCER (${diff}d)`
                        : 'ROTINA EM DIA'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {p.frequencia}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{p.titulo}</h3>
                  </div>

                  {/* Linhas de "rótulo: valor" */}
                  <div className="space-y-1 text-xs text-slate-700 w-full bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Torno Alvo:</span>
                      <span className="font-semibold text-slate-900">{torno.patrimonio} - {torno.modelo}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Sistema / Componente:</span>
                      <span className="text-slate-800">{p.sistemaAlvo}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Mecânico Responsável:</span>
                      <span className="text-slate-800">{p.responsavelPadrao}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Duração Estimada:</span>
                      <span className="text-slate-800 font-medium">{p.duracaoEstimadaMinutos} minutos</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Próxima Execução:</span>
                      <span className="font-mono font-bold text-slate-900">{p.proximaExecucao}</span>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs w-full">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-600" /> Tarefas da Rotina:
                    </span>
                    <ul className="space-y-1 text-slate-700 text-xs">
                      {p.itensChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ações da Rotina - min-h-[44px] */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 w-full">
                  <button
                    onClick={() => {
                      if (confirm(`Remover rotina ${p.titulo}?`)) {
                        deletePreventiva(p.id);
                      }
                    }}
                    className="min-h-[44px] px-3.5 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-xl hover:bg-rose-50"
                    aria-label="Excluir rotina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      executarPreventiva(p.id);
                      alert(`Rotina preventiva registrada! Próxima data agendada conforme a frequência (${p.frequencia}).`);
                    }}
                    className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registrar Execução</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Nova Rotina - Formulário em uma coluna só */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                <span>Nova Atividade Preventiva</span>
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
            <form onSubmit={handleSalvarRotina} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-3.5 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Torno Mecânico *</label>
                <select
                  value={formTornoId}
                  onChange={(e) => setFormTornoId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-xs"
                >
                  {tornos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.patrimonio} - {t.modelo} ({t.setor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Lubrificação do Barramento e Ajuste de Folgas"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Frequência da Rotina *</label>
                <select
                  value={formFrequencia}
                  onChange={(e) => setFormFrequencia(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Sistema / Componente Alvo</label>
                <input
                  type="text"
                  value={formSistemaAlvo}
                  onChange={(e) => setFormSistemaAlvo(e.target.value)}
                  placeholder="Ex: Barramento/Guias, Cabeçote Fixo..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Mecânico Responsável</label>
                <input
                  type="text"
                  value={formResponsavel}
                  onChange={(e) => setFormResponsavel(e.target.value)}
                  placeholder="Ex: Carlos Mecânico"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Duração Estimada (minutos)</label>
                <input
                  type="number"
                  value={formDuracao}
                  onChange={(e) => setFormDuracao(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Itens do Checklist (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={formItens}
                  onChange={(e) => setFormItens(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
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
                  <span>Cadastrar Atividade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
