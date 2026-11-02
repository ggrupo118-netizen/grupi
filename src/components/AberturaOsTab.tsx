import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OsTipo, OsPrioridade } from '../types';
import { FilePlus, CheckCircle2, ShieldAlert, QrCode } from 'lucide-react';
import { TabType } from './Navbar';

interface AberturaOsTabProps {
  onSuccess: (tab: TabType) => void;
  onOpenQrScanner?: () => void;
}

export const AberturaOsTab: React.FC<AberturaOsTabProps> = ({ onSuccess, onOpenQrScanner }) => {
  const { tornos, addOrdem, currentUser, preSelectedTornoIdForOs, setPreSelectedTornoIdForOs } = useApp();

  const [tornoId, setTornoId] = useState(preSelectedTornoIdForOs || tornos[0]?.id || '');
  const [tipo, setTipo] = useState<OsTipo>('Corretiva');
  const [prioridade, setPrioridade] = useState<OsPrioridade>('Média');
  const [categoriaComponente, setCategoriaComponente] = useState('Barramento/Guias');
  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState(
    currentUser ? `${currentUser.nome} (${currentUser.role})` : 'Operador de Torno'
  );
  const [responsavel, setResponsavel] = useState('Roberto Mecânico');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const [dataAbertura, setDataAbertura] = useState(todayStr);
  const [previsaoConclusao, setPrevisaoConclusao] = useState(nextDateStr);
  const [pecasNecessarias, setPecasNecessarias] = useState('');
  const [paradaMaquina, setParadaMaquina] = useState(false);

  useEffect(() => {
    if (preSelectedTornoIdForOs) {
      setTornoId(preSelectedTornoIdForOs);
    }
  }, [preSelectedTornoIdForOs]);

  const selectedTornoObj = tornos.find(t => t.id === tornoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !solicitante.trim() || !responsavel.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const novoId = addOrdem({
      tornoId,
      tipo,
      prioridade,
      categoriaComponente,
      descricao,
      solicitante,
      responsavel,
      dataAbertura,
      previsaoConclusao,
      status: 'Aberta',
      paradaMaquina,
      pecasNecessarias: pecasNecessarias.trim() || undefined
    });

    // Reset preselection
    setPreSelectedTornoIdForOs(null);
    alert(`Ordem de Serviço ${novoId} emitida com sucesso!`);
    onSuccess(currentUser?.role === 'Operador' ? 'dashboard' : 'gestao');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-xs w-full overflow-hidden">
      <div className="mb-5 border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Abertura de Ordem de Serviço (O.S.)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preencha os dados técnicos para relatar falha ou solicitar manutenção preventiva.
          </p>
        </div>

        {onOpenQrScanner && (
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="w-full sm:w-auto min-h-[44px] bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span>Identificar por QR Code</span>
          </button>
        )}
      </div>

      {/* Formulário em UMA COLUNA SÓ - campos ocupando largura toda, text-base e min-h-[44px] */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Torno selection */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Selecione o Torno Mecânico *</span>
          </label>
          <select
            value={tornoId}
            onChange={(e) => {
              setTornoId(e.target.value);
              setPreSelectedTornoIdForOs(null);
            }}
            required
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-xs"
          >
            {tornos.map(t => (
              <option key={t.id} value={t.id}>
                {t.patrimonio} - {t.modelo} ({t.setor}) &bull; [{t.status}]
              </option>
            ))}
          </select>

          {selectedTornoObj && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mt-2">
              <div>
                <span className="text-slate-500">Torno Selecionado: </span>
                <strong className="text-slate-900">{selectedTornoObj.patrimonio} - {selectedTornoObj.modelo}</strong>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                selectedTornoObj.status === 'Operacional'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {selectedTornoObj.status}
              </span>
            </div>
          )}
        </div>

        {/* Tipo de Manutenção */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Tipo de Manutenção *</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as OsTipo)}
            required
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          >
            <option value="Corretiva">Manutenção Corretiva (Reparo de Quebra ou Falha)</option>
            <option value="Preventiva">Manutenção Preventiva (Rotina Planejada)</option>
          </select>
        </div>

        {/* Prioridade */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Prioridade / Criticidade *</label>
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as OsPrioridade)}
            required
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          >
            <option value="Baixa">Baixa (Pode aguardar parada programada)</option>
            <option value="Média">Média (Rotina de trabalho normal)</option>
            <option value="Alta">Alta (Afeta qualidade ou tolerância)</option>
            <option value="Urgente">Urgente (Máquina parada ou risco grave)</option>
          </select>
        </div>

        {/* Subsistema Afetado */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Subsistema Afetado do Torno</label>
          <select
            value={categoriaComponente}
            onChange={(e) => setCategoriaComponente(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          >
            <option value="Barramento/Guias">Barramento e Guias Prismáticas</option>
            <option value="Cabeçote Fixo">Cabeçote Fixo e Engrenagens</option>
            <option value="Caixa Norton">Caixa Norton (Roscas e Avanços)</option>
            <option value="Placa e Fuso">Placa de Castanhas e Fuso Principal</option>
            <option value="Sistema Elétrico/Motor">Sistema Elétrico, Motor e Correias</option>
            <option value="Refrigeração/Cavacos">Bomba de Refrigeração e Lubrificação</option>
            <option value="Geral">Inspeção Geral / Outro</option>
          </select>
        </div>

        {/* Descrição Detalhada */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
            Descrição do Problema / Sintoma *
          </label>
          <textarea
            rows={3}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva sintomas, barulhos estranhos, folgas, aquecimento ou procedimento desejado..."
            className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          ></textarea>
        </div>

        {/* Solicitante */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Solicitante (Operador / Nome) *</label>
          <input
            type="text"
            required
            value={solicitante}
            onChange={(e) => setSolicitante(e.target.value)}
            placeholder="Ex: Carlos (Operador Usinagem)"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Responsável Mecânico */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Responsável pela Execução (Mecânico) *</label>
          <input
            type="text"
            required
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Ex: Roberto Mecânico"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Data de Abertura */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Data de Abertura *</label>
          <input
            type="date"
            required
            value={dataAbertura}
            onChange={(e) => setDataAbertura(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Previsão de Conclusão */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Previsão de Conclusão</label>
          <input
            type="date"
            value={previsaoConclusao}
            onChange={(e) => setPrevisaoConclusao(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Peças Necessárias */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Peças ou Insumos Previstos (Opcional)</label>
          <input
            type="text"
            value={pecasNecessarias}
            onChange={(e) => setPecasNecessarias(e.target.value)}
            placeholder="Ex: Correia trapezoidal B-54, rolamento 6205, óleo ISO VG 68..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Parada de Máquina Switch - min-h-[44px] */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between w-full min-h-[44px]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-5 h-5 shrink-0 ${paradaMaquina ? 'text-rose-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold text-slate-900 block text-xs sm:text-sm">O torno mecânico está PARADO?</span>
              <span className="text-[11px] text-slate-500">Parada impacta o cálculo de MTTR e disponibilidade</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer min-h-[44px] flex items-center">
            <input
              type="checkbox"
              checked={paradaMaquina}
              onChange={(e) => setParadaMaquina(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {/* Submit button - min-h-[44px] */}
        <button
          type="submit"
          className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer mt-2"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>Emitir e Registrar Ordem de Serviço</span>
        </button>
      </form>
    </div>
  );
};
