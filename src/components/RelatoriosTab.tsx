import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Printer, 
  Filter, 
  Building2, 
  DollarSign, 
  Gauge, 
  Wrench,
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';

type ReportType = 
  | 'executivo' 
  | 'custos' 
  | 'confiabilidade' 
  | 'preventiva' 
  | 'os_individual';

export const RelatoriosTab: React.FC = () => {
  const { 
    tornos, 
    ordens, 
    preventivas, 
    gastos, 
    budgetMensal, 
    globalReliability, 
    tornosReliability, 
    getTorno,
    currentUser
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('executivo');
  const [selectedTornoId, setSelectedTornoId] = useState<string>('');
  const [selectedOsId, setSelectedOsId] = useState<string>(ordens[0]?.id || '');

  // Filtered Gastos based on machine filter
  const relGastos = selectedTornoId 
    ? gastos.filter(g => g.tornoId === selectedTornoId)
    : gastos;

  const totalGastoRel = relGastos.reduce((sum, g) => sum + g.valor, 0);

  // Filtered OS based on machine filter
  const relOrdens = selectedTornoId
    ? ordens.filter(o => o.tornoId === selectedTornoId)
    : ordens;

  // Selected OS for individual printing
  const currentOs = ordens.find(o => o.id === selectedOsId) || ordens[0];
  const currentOsTorno = currentOs ? getTorno(currentOs.tornoId) : null;

  // CSV Export utility
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    let filename = `relatorio_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'custos') {
      csvContent += 'ID;Data;Torno;Setor;Categoria;Descricao;Fornecedor;Nota Fiscal;OS Vinculada;Valor (R$)\n';
      relGastos.forEach(g => {
        const t = getTorno(g.tornoId);
        csvContent += `"${g.id}";"${g.data}";"${t.patrimonio} - ${t.modelo}";"${t.setor}";"${g.categoria}";"${g.descricao}";"${g.fornecedor}";"${g.notaFiscal || '-'}";"${g.osId || '-'}";"${g.valor.toFixed(2)}"\n`;
      });
    } else if (activeReport === 'confiabilidade') {
      csvContent += 'Patrimonio;Modelo;Setor;Quebras;Horas Paradas;Horas Operando;MTBF (h);MTTR (h);Disponibilidade (%);Criticidade;Custos (R$)\n';
      tornosReliability.forEach(r => {
        csvContent += `"${r.torno.patrimonio}";"${r.torno.modelo}";"${r.torno.setor}";"${r.numFalhas}";"${r.horasReparo}";"${r.horasOperadas}";"${r.mtbf}";"${r.mttr}";"${r.disponibilidade}%";"${r.criticidade}";"${r.custoManutencao.toFixed(2)}"\n`;
      });
    } else {
      // Default to Ordens de Serviço
      csvContent += 'ID;Torno;Setor;Tipo;Prioridade;Status;Data Abertura;Previsao;Conclusao;Horas;Solicitante;Mecanico;Descricao;Causa Raiz;Pecas;Custo (R$)\n';
      relOrdens.forEach(o => {
        const t = getTorno(o.tornoId);
        csvContent += `"${o.id}";"${t.patrimonio}";"${t.setor}";"${o.tipo}";"${o.prioridade}";"${o.status}";"${o.dataAbertura}";"${o.previsaoConclusao}";"${o.dataFechamento || '-'}";"${o.horasTrabalhadas || 0}";"${o.solicitante}";"${o.responsavel}";"${o.descricao.replace(/"/g, '""')}";"${(o.causaRaiz || '').replace(/"/g, '""')}";"${(o.pecasUtilizadas || o.pecasNecessarias || '').replace(/"/g, '""')}";"${(o.custoTotal || 0).toFixed(2)}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Report Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Central de Relatórios Técnicos e Gerenciais
              </h2>
              <p className="text-[11px] text-slate-500">
                Gere documentos prontos para reuniões de diretoria, auditorias de PCM e emissão de OS física
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Baixar planilha para Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel / CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveReport('executivo')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeReport === 'executivo'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Relatório Executivo PCM</span>
          </button>

          <button
            onClick={() => setActiveReport('custos')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeReport === 'custos'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>2. Analítico de Custos & Gastos</span>
          </button>

          <button
            onClick={() => setActiveReport('confiabilidade')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeReport === 'confiabilidade'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>3. Matriz MTBF & MTTR</span>
          </button>

          <button
            onClick={() => setActiveReport('preventiva')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeReport === 'preventiva'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Aderência Preventiva 52 Semanas</span>
          </button>

          <button
            onClick={() => setActiveReport('os_individual')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeReport === 'os_individual'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>5. Ficha Impressa da OS (A4)</span>
          </button>
        </div>

        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Filtro de Máquina:</span>
          </div>

          <select
            value={selectedTornoId}
            onChange={(e) => setSelectedTornoId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 shadow-xs"
          >
            <option value="">Todos os Tornos da Fábrica</option>
            {tornos.map(t => (
              <option key={t.id} value={t.id}>{t.patrimonio} - {t.modelo} ({t.setor})</option>
            ))}
          </select>

          {activeReport === 'os_individual' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Selecionar O.S.:</span>
              <select
                value={selectedOsId}
                onChange={(e) => setSelectedOsId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 shadow-xs"
              >
                {ordens.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.tipo} - {getTorno(o.tornoId).patrimonio} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="border-b-2 border-amber-500 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Wrench className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-slate-900">
                TornoMaint &bull; Gestão de Manutenção Industrial
              </h1>
              <p className="text-xs text-slate-500">
                Divisão de Engenharia de Manutenção &bull; PCM (Planejamento e Controle de Manutenção)
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono font-bold text-amber-800">
              RELATÓRIO TÉCNICO OFICIAL
            </div>
            <div className="text-slate-500 mt-0.5">
              Data de Emissão: <strong className="text-slate-900">{todayStr}</strong>
            </div>
            <div className="text-slate-500 text-[11px]">
              Emitido por: {currentUser ? `${currentUser.nome} (${currentUser.role})` : 'PCM Gestor'}
            </div>
          </div>
        </div>

        {/* REPORT 1: EXECUTIVO */}
        {activeReport === 'executivo' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-2">
                1. Síntese Executiva de Desempenho e Confiabilidade
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                Este relatório consolida a performance do parque fabril composto por <strong>{tornos.length} tornos mecânicos</strong>. Durante o período analisado, a fábrica registrou uma disponibilidade média de <strong>{globalReliability.disponibilidade}%</strong>, com MTBF de <strong>{globalReliability.mtbf} horas</strong> e tempo médio de recuperação (MTTR) de <strong>{globalReliability.mttr} horas</strong>. O índice de cumprimento das preventivas atingiu <strong>{globalReliability.taxaAderenciaPreventiva}%</strong>.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Disponibilidade</span>
                <span className="text-2xl font-black text-emerald-700">{globalReliability.disponibilidade}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Meta: &ge; 90%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">MTBF Global</span>
                <span className="text-2xl font-black text-sky-700">{globalReliability.mtbf}h</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tempo entre falhas</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">MTTR Médio</span>
                <span className="text-2xl font-black text-amber-700">{globalReliability.mttr}h</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tempo de reparo</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Gastos Totais</span>
                <span className="text-2xl font-black text-emerald-700">
                  R$ {totalGastoRel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Orçamento: R$ {budgetMensal.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Lathes status table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                Situação do Parque de Tornos Mecânicos
              </h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2 border border-slate-200 font-semibold">Patrimônio</th>
                    <th className="p-2 border border-slate-200 font-semibold">Modelo / Marca</th>
                    <th className="p-2 border border-slate-200 font-semibold">Setor</th>
                    <th className="p-2 border border-slate-200 font-semibold">Status</th>
                    <th className="p-2 border border-slate-200 text-center font-semibold">MTBF</th>
                    <th className="p-2 border border-slate-200 text-center font-semibold">MTTR</th>
                    <th className="p-2 border border-slate-200 text-center font-semibold">Disponib.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tornosReliability.map(r => (
                    <tr key={r.torno.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono font-bold text-amber-800">{r.torno.patrimonio}</td>
                      <td className="p-2 border border-slate-200">{r.torno.modelo} ({r.torno.fabricante})</td>
                      <td className="p-2 border border-slate-200">{r.torno.setor}</td>
                      <td className="p-2 border border-slate-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.torno.status === 'Operacional'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.torno.status}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-mono">{r.mtbf}h</td>
                      <td className="p-2 border border-slate-200 text-center font-mono">{r.mttr}h</td>
                      <td className="p-2 border border-slate-200 text-center font-mono font-bold text-emerald-700">{r.disponibilidade}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: CUSTOS & GASTOS */}
        {activeReport === 'custos' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-2">
                2. Relatório Analítico de Custos de Manutenção e Suprimentos
              </h2>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
                <span>Total de Despesas Lançadas: <strong>R$ {totalGastoRel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                <span>Teto Orçamentário Mensal: <strong>R$ {budgetMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                <span>Saldo Disponível: <strong>R$ {(budgetMensal - totalGastoRel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-200">Data</th>
                  <th className="p-2 border border-slate-200">Torno</th>
                  <th className="p-2 border border-slate-200">Categoria</th>
                  <th className="p-2 border border-slate-200">Descrição</th>
                  <th className="p-2 border border-slate-200">Fornecedor / NF-e</th>
                  <th className="p-2 border border-slate-200 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relGastos.map(g => {
                  const t = getTorno(g.tornoId);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono">{g.data}</td>
                      <td className="p-2 border border-slate-200 font-semibold">{t.patrimonio}</td>
                      <td className="p-2 border border-slate-200">{g.categoria}</td>
                      <td className="p-2 border border-slate-200">{g.descricao}</td>
                      <td className="p-2 border border-slate-200">{g.fornecedor} {g.notaFiscal ? `(${g.notaFiscal})` : ''}</td>
                      <td className="p-2 border border-slate-200 text-right font-mono font-bold text-emerald-700">
                        R$ {g.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: CONFIABILIDADE MTBF & MTTR */}
        {activeReport === 'confiabilidade' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-sky-800 mb-2">
                3. Matriz Técnica de Confiabilidade & Engenharia de Falhas (NBR 5462)
              </h2>
              <p className="text-xs text-slate-700">
                Análise discriminada do tempo médio entre falhas (MTBF), manutenibilidade (MTTR) e índice de disponibilidade física por ativo da linha de tornos mecânicos.
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-200">Patrimônio</th>
                  <th className="p-2 border border-slate-200">Modelo</th>
                  <th className="p-2 border border-slate-200 text-center">N° Falhas</th>
                  <th className="p-2 border border-slate-200 text-center">Horas Paradas</th>
                  <th className="p-2 border border-slate-200 text-center">Horas Operando</th>
                  <th className="p-2 border border-slate-200 text-center">MTBF (h)</th>
                  <th className="p-2 border border-slate-200 text-center">MTTR (h)</th>
                  <th className="p-2 border border-slate-200 text-center">Disponib.</th>
                  <th className="p-2 border border-slate-200 text-center">Criticidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tornosReliability.map(r => (
                  <tr key={r.torno.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 font-mono font-bold text-amber-800">{r.torno.patrimonio}</td>
                    <td className="p-2 border border-slate-200">{r.torno.modelo}</td>
                    <td className="p-2 border border-slate-200 text-center">{r.numFalhas}</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{r.horasReparo}h</td>
                    <td className="p-2 border border-slate-200 text-center font-mono">{r.horasOperadas}h</td>
                    <td className="p-2 border border-slate-200 text-center font-mono font-bold text-sky-800">{r.mtbf}h</td>
                    <td className="p-2 border border-slate-200 text-center font-mono font-bold text-amber-800">{r.mttr}h</td>
                    <td className="p-2 border border-slate-200 text-center font-mono font-black text-emerald-700">{r.disponibilidade}%</td>
                    <td className="p-2 border border-slate-200 text-center font-semibold">{r.criticidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: PREVENTIVA */}
        {activeReport === 'preventiva' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-800 mb-2">
                4. Aderência ao Cronograma de Preventivas 52 Semanas
              </h2>
              <p className="text-xs text-slate-700">
                Taxa de cumprimento de rotinas periódicas de lubrificação de barramentos, trocas de óleo de caixas de engrenagens e inspeção de correias.
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-200">Código</th>
                  <th className="p-2 border border-slate-200">Torno</th>
                  <th className="p-2 border border-slate-200">Título da Rotina</th>
                  <th className="p-2 border border-slate-200">Freq.</th>
                  <th className="p-2 border border-slate-200">Última Execução</th>
                  <th className="p-2 border border-slate-200">Próxima Execução</th>
                  <th className="p-2 border border-slate-200">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preventivas.map(p => {
                  const t = getTorno(p.tornoId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono font-bold text-amber-800">{p.id}</td>
                      <td className="p-2 border border-slate-200 font-semibold">{t.patrimonio}</td>
                      <td className="p-2 border border-slate-200">{p.titulo}</td>
                      <td className="p-2 border border-slate-200">{p.frequencia}</td>
                      <td className="p-2 border border-slate-200 font-mono">{p.ultimaExecucao}</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold">{p.proximaExecucao}</td>
                      <td className="p-2 border border-slate-200">{p.responsavelPadrao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: FICHA TÉCNICA INDIVIDUAL DE OS */}
        {activeReport === 'os_individual' && currentOs && currentOsTorno && (
          <div className="space-y-6">
            <div className="border border-slate-300 rounded-xl p-5 space-y-4 bg-white shadow-xs">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-500">Ficha da Ordem de Manutenção</span>
                  <h2 className="text-xl font-mono font-black text-amber-800">
                    {currentOs.id} &bull; Manutenção {currentOs.tipo}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    Status: {currentOs.status}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Torno Mecânico:</span>
                  <strong className="text-slate-900 text-sm">{currentOsTorno.patrimonio} - {currentOsTorno.modelo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Setor / Galpão:</span>
                  <strong className="text-slate-900">{currentOsTorno.setor}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Prioridade:</span>
                  <strong className="text-slate-900">{currentOs.prioridade}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Parada de Máquina:</span>
                  <strong className={currentOs.paradaMaquina ? 'text-rose-700' : 'text-emerald-700'}>
                    {currentOs.paradaMaquina ? 'SIM (Impacto na Produção)' : 'NÃO'}
                  </strong>
                </div>
              </div>

              {/* Dates & Personnel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">Data Abertura:</span>
                  <strong className="text-slate-900 font-mono">{currentOs.dataAbertura}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Previsão Conclusão:</span>
                  <strong className="text-slate-900 font-mono">{currentOs.previsaoConclusao}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Solicitante:</span>
                  <strong className="text-slate-900">{currentOs.solicitante}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Técnico Mecânico:</span>
                  <strong className="text-slate-900">{currentOs.responsavel}</strong>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-700 block font-semibold mb-1">
                  Descrição Técnica do Problema / Atividade:
                </span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {currentOs.descricao}
                </p>
              </div>

              {/* Execution details */}
              {currentOs.dataFechamento && (
                <div className="pt-2 border-t border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block">Data Fechamento:</span>
                      <strong className="text-slate-900 font-mono">{currentOs.dataFechamento}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Horas Trabalhadas (MTTR):</span>
                      <strong className="text-amber-800 font-mono">{currentOs.horasTrabalhadas || 0} horas</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mecânico Finalizador:</span>
                      <strong className="text-slate-900">{currentOs.tecnicoFechamento || currentOs.responsavel}</strong>
                    </div>
                  </div>

                  {currentOs.causaRaiz && (
                    <div>
                      <span className="text-slate-700 block font-semibold">Causa Raiz Identificada:</span>
                      <p className="text-slate-800">{currentOs.causaRaiz}</p>
                    </div>
                  )}

                  {currentOs.pecasUtilizadas && (
                    <div>
                      <span className="text-slate-700 block font-semibold">Peças & Insumos Utilizados:</span>
                      <p className="text-slate-800">{currentOs.pecasUtilizadas}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official Signatures for Auditing and ISO */}
        <div className="pt-10 mt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-slate-300 pb-8"></div>
            <p className="font-bold text-slate-900 mt-2">Operador / Solicitante</p>
            <p className="text-[10px] text-slate-500">Liberação de Máquina</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-300 pb-8"></div>
            <p className="font-bold text-slate-900 mt-2">Mecânico de Manutenção</p>
            <p className="text-[10px] text-slate-500">Execução e Teste de Carga</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-300 pb-8"></div>
            <p className="font-bold text-slate-900 mt-2">Engenharia de Manutenção / PCM</p>
            <p className="text-[10px] text-slate-500">Aprovação Técnica & Baixa de OS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
