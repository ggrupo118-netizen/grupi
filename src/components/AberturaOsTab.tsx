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
    currentUser ? `${currentUser.nome} (${currentUser.role} - ${currentUser.matricula})` : 'Carlos (Operador Usinagem)'
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
    onSuccess('gestao');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
      <div className="mb-6 border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <FilePlus className="w-5 h-5 text-amber-600" />
            <span>Formulário de Abertura de Ordem de Serviço (O.S.)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Preencha os dados técnicos para intervenção de manutenção no torno mecânico.
          </p>
        </div>

        {onOpenQrScanner && (
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span>Identificar por QR Code</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Torno selection and QR feedback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-700">
              Selecione o Torno Mecânico *
            </label>
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="text-[11px] text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Ler Etiqueta QR Code da Máquina</span>
              </button>
            )}
          </div>

          <select
            value={tornoId}
            onChange={(e) => {
              setTornoId(e.target.value);
              setPreSelectedTornoIdForOs(null);
            }}
            required
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-xs"
          >
            {tornos.map(t => (
              <option key={t.id} value={t.id}>
                {t.patrimonio} - {t.modelo} ({t.setor}) &bull; [{t.status}]
              </option>
            ))}
          </select>

          {selectedTornoObj && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-500">Torno Selecionado: </span>
                <strong className="text-slate-900">{selectedTornoObj.patrimonio} - {selectedTornoObj.modelo}</strong>
                <span className="text-slate-500 ml-1.5">({selectedTornoObj.fabricante})</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Manutenção *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as OsTipo)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
            >
              <option value="Corretiva">Manutenção Corretiva (Reparo / Quebra não programada)</option>
              <option value="Preventiva">Manutenção Preventiva (Planejada / Rotina periódica)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Prioridade / Criticidade *</label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as OsPrioridade)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
            >
              <option value="Baixa">Baixa (Pode aguardar janela de produção)</option>
              <option value="Média">Média (Rotina normal de trabalho)</option>
              <option value="Alta">Alta (Comprometimento da qualidade / tolerância dimensional)</option>
              <option value="Urgente">Urgente (Máquina parada / Linha crítica)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Subsistema Afetado do Torno</label>
          <select
            value={categoriaComponente}
            onChange={(e) => setCategoriaComponente(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
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

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Descrição Detalhada do Problema / Sintoma *</label>
          <textarea
            rows={3}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva sintomas, barulhos anormais, folgas no fuso, vibrações ou o procedimento preventivo..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Solicitante (Operador / Setor) *</label>
            <input
              type="text"
              required
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              placeholder="Ex: Carlos (Operador Usinagem)"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Responsável pela Execução (Mecânico) *</label>
            <input
              type="text"
              required
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Ex: Roberto Mecânico"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Data de Abertura *</label>
            <input
              type="date"
              required
              value={dataAbertura}
              onChange={(e) => setDataAbertura(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Previsão de Conclusão *</label>
            <input
              type="date"
              required
              value={previsaoConclusao}
              onChange={(e) => setPrevisaoConclusao(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Peças ou Insumos Previstos (Opcional)</label>
          <input
            type="text"
            value={pecasNecessarias}
            onChange={(e) => setPecasNecessarias(e.target.value)}
            placeholder="Ex: 2L Óleo ISO VG 68, Correia B-52, Anel O-ring"
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center gap-2.5">
          <input
            type="checkbox"
            id="os-parada"
            checked={paradaMaquina}
            onChange={(e) => setParadaMaquina(e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="os-parada" className="text-xs text-slate-700 font-medium cursor-pointer flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Exige Parada Imediata do Torno Mecânico (Impacto no cálculo de MTTR e Disponibilidade)</span>
          </label>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Emitir Ordem de Serviço</span>
          </button>
        </div>
      </form>
    </div>
  );
};
