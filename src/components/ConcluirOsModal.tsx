import React, { useState } from 'react';
import { OrdemServico, Torno } from '../types';
import { useApp } from '../context/AppContext';
import { CheckCircle2, X, Clock, DollarSign } from 'lucide-react';

interface ConcluirOsModalProps {
  os: OrdemServico | null;
  torno: Torno | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConcluirOsModal: React.FC<ConcluirOsModalProps> = ({ os, torno, isOpen, onClose }) => {
  const { concluirOrdem, currentUser, addGasto } = useApp();

  const [horasTrabalhadas, setHorasTrabalhadas] = useState<string>('2.0');
  const [causaRaiz, setCausaRaiz] = useState<string>('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState<string>('');
  const [observacoesFinais, setObservacoesFinais] = useState<string>('');
  const [custoTotal, setCustoTotal] = useState<string>('');
  const [gerarLancamentoGasto, setGerarLancamentoGasto] = useState<boolean>(true);

  if (!isOpen || !os) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const horas = parseFloat(horasTrabalhadas) || 1.0;
    const custo = custoTotal ? parseFloat(custoTotal) : undefined;
    const todayStr = new Date().toISOString().split('T')[0];

    concluirOrdem(os.id, {
      dataFechamento: todayStr,
      horasTrabalhadas: horas,
      causaRaiz: causaRaiz || 'Desgaste operacional normal dos componentes mecânicos.',
      pecasUtilizadas: pecasUtilizadas || 'Insumos de manutenção padrão.',
      tecnicoFechamento: currentUser ? currentUser.nome : os.responsavel,
      observacoesFinais: observacoesFinais || 'Equipamento ajustado, testado e liberado para a produção.',
      custoTotal: custo
    });

    // Optionally auto-register expense if cost is specified
    if (gerarLancamentoGasto && custo && custo > 0) {
      addGasto({
        tornoId: os.tornoId,
        osId: os.id,
        categoria: 'Peças de Reposição',
        descricao: `Custos de peças e reparo da ${os.id}: ${pecasUtilizadas || os.descricao.slice(0, 50)}`,
        valor: custo,
        data: todayStr,
        fornecedor: 'Almoxarifado Geral / Peças de Reposição',
        registradoPor: currentUser ? currentUser.nome : 'PCM Gestor'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Encerramento Técnico & Baixa da O.S.
              </h3>
              <p className="text-[11px] text-emerald-100">
                {os.id} &bull; {torno?.patrimonio} - {torno?.modelo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <span className="text-[11px] font-bold text-amber-800 block mb-0.5">Sintoma Inicial:</span>
            <p className="text-xs line-clamp-2">{os.descricao}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Horas Trabalhadas (MTTR) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                value={horasTrabalhadas}
                onChange={(e) => setHorasTrabalhadas(e.target.value)}
                placeholder="Ex: 2.5"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
              />
              <span className="text-[10px] text-slate-500">Alimenta o cálculo de MTTR da fábrica</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Custo Total do Reparo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={custoTotal}
                onChange={(e) => setCustoTotal(e.target.value)}
                placeholder="Ex: 450.00"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
              />
              <span className="text-[10px] text-slate-500">Valor de peças + insumos</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Causa Raiz Identificada *</label>
            <input
              type="text"
              required
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Ex: Rolamento com desgaste na pista interna por falta de graxa"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peças e Insumos Efetivamente Utilizados *</label>
            <textarea
              rows={2}
              required
              value={pecasUtilizadas}
              onChange={(e) => setPecasUtilizadas(e.target.value)}
              placeholder="Ex: 1x Rolamento SKF 30214, 1x Retentor Sabó 70x90x10, 500ml graxa..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observações Finais e Testes de Liberação</label>
            <input
              type="text"
              value={observacoesFinais}
              onChange={(e) => setObservacoesFinais(e.target.value)}
              placeholder="Ex: Torno girou por 30min em 1200 RPM sem ruído. Peça piloto aprovada no micrômetro."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {custoTotal && parseFloat(custoTotal) > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-gasto"
                checked={gerarLancamentoGasto}
                onChange={(e) => setGerarLancamentoGasto(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 cursor-pointer"
              />
              <label htmlFor="check-gasto" className="text-slate-700 text-xs cursor-pointer">
                Lançar automaticamente esse valor na <strong>Aba de Gastos</strong> vinculado a este torno
              </label>
            </div>
          )}

          <div className="pt-3 flex gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir e Liberar Torno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
