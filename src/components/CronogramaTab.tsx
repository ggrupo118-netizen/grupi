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
    <div className="space-y-6">
      {/* Top Cards in White */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Planos Cadastrados</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalRotinas}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Rotinas de Manutenção Preventiva</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-lg border border-sky-200">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Rotinas Vencidas</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{vencidas}</p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">Requer intervenção imediata</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-lg border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">A Vencer nos Próx. 7 Dias</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{aVencer}</p>
            <p className="text-[11px] text-slate-500 mt-1">Programação da semana</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Routine Cards Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-600" />
              <span>Plano de Manutenções Preventivas Periódicas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Checklists técnicos e rotinas de lubrificação para prevenir quebras e prolongar o MTBF
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Rotina Preventiva</span>
          </button>
        </div>

        {/* Routine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ? 'border-rose-300 bg-rose-50/20' 
                    : isProxima 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                } rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isVencida
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isProxima
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isVencida
                        ? `VENCIDA HÁ ${Math.abs(diff)} DIA(S)`
                        : isProxima
                        ? `A VENCER EM ${diff} DIA(S)`
                        : 'ROTINA EM DIA'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {p.frequencia}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.titulo}</h3>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5">
                      {torno.patrimonio} - {torno.modelo} ({torno.setor})
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-600" /> Itens de Checklist Técnico:
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

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Mecânico: <strong className="text-slate-800">{p.responsavelPadrao}</strong></span>
                    <span>Duração: <strong className="text-slate-800">{p.duracaoEstimadaMinutos} min</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Próxima Execução:</span>
                    <strong className="text-slate-900 font-mono text-xs">{p.proximaExecucao}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Remover rotina ${p.titulo}?`)) {
                          deletePreventiva(p.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Excluir Rotina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        executarPreventiva(p.id);
                        alert(`Rotina preventiva registrada! Próxima data agendada conforme a frequência (${p.frequencia}).`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Execução</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Nova Rotina */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                <span>Nova Rotina de Manutenção Preventiva</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarRotina} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Torno Mecânico *</label>
                  <select
                    value={formTornoId}
                    onChange={(e) => setFormTornoId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  >
                    {tornos.map(t => (
                      <option key={t.id} value={t.id}>{t.patrimonio} - {t.modelo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequência Periódica *</label>
                  <select
                    value={formFrequencia}
                    onChange={(e) => setFormFrequencia(e.target.value as PreventivaRotina['frequencia'])}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  >
                    <option value="Semanal">Semanal (a cada 7 dias)</option>
                    <option value="Quinzenal">Quinzenal (a cada 15 dias)</option>
                    <option value="Mensal">Mensal (a cada 30 dias)</option>
                    <option value="Trimestral">Trimestral (a cada 90 dias)</option>
                    <option value="Semestral">Semestral (a cada 180 dias)</option>
                    <option value="Anual">Anual (a cada 365 dias)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Rotina *</label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Troca de Óleo do Barramento e Limpeza dos Raspadores"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subsistema Alvo</label>
                  <select
                    value={formSistemaAlvo}
                    onChange={(e) => setFormSistemaAlvo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  >
                    <option value="Barramento/Guias">Barramento e Guias</option>
                    <option value="Cabeçote Fixo">Cabeçote Fixo</option>
                    <option value="Caixa Norton">Caixa Norton</option>
                    <option value="Sistema Elétrico/Motor">Sistema Elétrico/Motor</option>
                    <option value="Refrigeração/Cavacos">Fluido de Refrigeração</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mecânico Padrão</label>
                  <input
                    type="text"
                    value={formResponsavel}
                    onChange={(e) => setFormResponsavel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Itens do Checklist (1 por linha) *
                </label>
                <textarea
                  rows={3}
                  value={formItens}
                  onChange={(e) => setFormItens(e.target.value)}
                  placeholder="Escreva cada passo da rotina em uma linha..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
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
                  <span>Salvar Nova Rotina</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
