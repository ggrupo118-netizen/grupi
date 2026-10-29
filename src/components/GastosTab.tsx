import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GastoCategoria } from '../types';
import { 
  DollarSign, 
  Plus, 
  PieChart, 
  Trash2, 
  Search, 
  Building2, 
  Receipt,
  X,
  CheckCircle2
} from 'lucide-react';

const CATEGORIAS: GastoCategoria[] = [
  'Peças de Reposição',
  'Óleos e Lubrificantes',
  'Ferramental e Acessórios',
  'Serviços Terceirizados',
  'Mão de Obra Externa',
  'EPI e Consumíveis'
];

export const GastosTab: React.FC = () => {
  const { 
    gastos, 
    addGasto, 
    deleteGasto, 
    tornos, 
    ordens, 
    budgetMensal, 
    setBudgetMensal,
    getTorno,
    currentUser
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTorno, setFilterTorno] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetMensal.toString());

  // Form state
  const [formTornoId, setFormTornoId] = useState(tornos[0]?.id || '');
  const [formOsId, setFormOsId] = useState('');
  const [formCategoria, setFormCategoria] = useState<GastoCategoria>('Peças de Reposição');
  const [formDescricao, setFormDescricao] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formData, setFormData] = useState(new Date().toISOString().split('T')[0]);
  const [formFornecedor, setFormFornecedor] = useState('');
  const [formNotaFiscal, setFormNotaFiscal] = useState('');

  // Calculations
  const totalGasto = gastos.reduce((sum, g) => sum + g.valor, 0);
  const percentualOrcamento = Math.min(100, Math.round((totalGasto / budgetMensal) * 100));
  const custoMedioPorTorno = tornos.length > 0 ? totalGasto / tornos.length : 0;

  // Breakdown by Category
  const gastosPorCategoria = CATEGORIAS.map(cat => {
    const valor = gastos
      .filter(g => g.categoria === cat)
      .reduce((sum, g) => sum + g.valor, 0);
    const percent = totalGasto > 0 ? (valor / totalGasto) * 100 : 0;
    return { categoria: cat, valor, percent };
  }).sort((a, b) => b.valor - a.valor);

  // Highest spending lathe (Maior ofensor de custos)
  const gastosPorTorno = tornos.map(t => {
    const total = gastos.filter(g => g.tornoId === t.id).reduce((sum, g) => sum + g.valor, 0);
    return { torno: t, total };
  }).sort((a, b) => b.total - a.total);

  const maiorOfensor = gastosPorTorno[0]?.total > 0 ? gastosPorTorno[0] : null;

  // Filtered list
  const filteredGastos = gastos.filter(g => {
    if (filterTorno && g.tornoId !== filterTorno) return false;
    if (filterCategoria && g.categoria !== filterCategoria) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const t = getTorno(g.tornoId);
      const text = `${g.id} ${g.descricao} ${g.fornecedor} ${g.notaFiscal || ''} ${t.patrimonio} ${t.modelo}`.toLowerCase();
      return text.includes(q);
    }
    return true;
  });

  const handleSalvarGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescricao || !formValor || !formFornecedor) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const valorNum = parseFloat(formValor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      alert('Informe um valor monetário válido maior que zero.');
      return;
    }

    addGasto({
      tornoId: formTornoId,
      osId: formOsId || undefined,
      categoria: formCategoria,
      descricao: formDescricao,
      valor: valorNum,
      data: formData,
      fornecedor: formFornecedor,
      notaFiscal: formNotaFiscal || undefined,
      registradoPor: currentUser ? currentUser.nome : 'PCM Gestor'
    });

    // Reset form & close
    setFormDescricao('');
    setFormValor('');
    setFormFornecedor('');
    setFormNotaFiscal('');
    setFormOsId('');
    setIsModalOpen(false);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudgetMensal(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Budget Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Gestão e Controle de Custos de Manutenção
              </h2>
              <p className="text-[11px] text-slate-500">
                Acompanhamento orçamentário, despesas por torno, peças e serviços contratados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Nova Despesa</span>
            </button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Orçamento Mensal PCM:</span>
              {isEditingBudget ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-28 bg-white border border-amber-500 rounded px-2 py-0.5 text-xs text-slate-900"
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <span className="text-slate-900 font-bold flex items-center gap-1.5">
                  R$ {budgetMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  <button
                    onClick={() => { setIsEditingBudget(true); setTempBudget(budgetMensal.toString()); }}
                    className="text-[10px] text-amber-700 hover:underline font-normal cursor-pointer"
                  >
                    (Alterar Meta)
                  </button>
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-slate-500 mr-1.5">Total Realizado:</span>
              <strong className={totalGasto > budgetMensal ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
              <span className="text-slate-500 text-[11px] ml-1">
                ({percentualOrcamento}% consumido)
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentualOrcamento > 90
                  ? 'bg-rose-500'
                  : percentualOrcamento > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentualOrcamento)}%` }}
            ></div>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Gasto Total Acumulado</span>
            <p className="text-xl font-black text-slate-900 mt-1">
              R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{gastos.length} lançamentos registrados</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Custo Médio por Torno</span>
            <p className="text-xl font-black text-amber-700 mt-1">
              R$ {custoMedioPorTorno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Média entre os {tornos.length} tornos</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Maior Ofensor de Custo</span>
            {maiorOfensor ? (
              <>
                <p className="text-xl font-black text-rose-700 mt-1 truncate">
                  {maiorOfensor.torno.patrimonio}
                </p>
                <p className="text-[10px] text-rose-700 mt-1 truncate font-medium">
                  R$ {maiorOfensor.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({maiorOfensor.torno.modelo})
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-slate-500 mt-1">Nenhum custo registrado</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Saldo Restante do Mês</span>
            <p className={`text-xl font-black mt-1 ${budgetMensal - totalGasto >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              R$ {(budgetMensal - totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {budgetMensal - totalGasto >= 0 ? 'Dentro do teto' : 'Teto estourado'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Distribution by Category and by Lathe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-600" /> Distribuição de Custos por Categoria
          </h3>
          <div className="space-y-2.5 pt-1">
            {gastosPorCategoria.map((item, idx) => (
              <div key={item.categoria} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{item.categoria}</span>
                  <span className="text-slate-600 font-mono">
                    <strong className="text-slate-900">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({item.percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-amber-500' :
                      idx === 1 ? 'bg-sky-500' :
                      idx === 2 ? 'bg-emerald-500' :
                      idx === 3 ? 'bg-purple-500' :
                      idx === 4 ? 'bg-rose-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Despesas por Torno Mecânico */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> Custos de Manutenção por Torno
          </h3>
          <div className="space-y-2.5 pt-1">
            {gastosPorTorno.map((item) => {
              const perc = totalGasto > 0 ? (item.total / totalGasto) * 100 : 0;
              return (
                <div key={item.torno.id} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-800">{item.torno.patrimonio}</span>
                      <span className="text-slate-500 ml-1.5">{item.torno.modelo} ({item.torno.setor})</span>
                    </div>
                    <span className="text-slate-600 font-mono">
                      <strong className="text-slate-900">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      <span className="text-slate-500 ml-1">({perc.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos com Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição, fornecedor, nota fiscal..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

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

            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-xs"
            >
              <option value="">Todas as Categorias</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {filteredGastos.length} despesa(s) listada(s)
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Código / Data</th>
                <th className="p-3">Torno Mecânico</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Descrição do Insumo / Serviço</th>
                <th className="p-3">Fornecedor / NF-e</th>
                <th className="p-3">OS Vinculada</th>
                <th className="p-3 text-right">Valor (R$)</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGastos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    Nenhum lançamento de gasto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredGastos.map((g) => {
                  const torno = getTorno(g.tornoId);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <span className="font-mono font-bold text-amber-700 block">{g.id}</span>
                        <span className="text-[11px] text-slate-500">{g.data}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{torno.patrimonio}</span>
                        <span className="text-[11px] text-slate-500">{torno.modelo}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {g.categoria}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs text-slate-800">
                        <div className="font-medium">{g.descricao}</div>
                        <div className="text-[10px] text-slate-400">Reg: {g.registradoPor}</div>
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-medium text-slate-900">{g.fornecedor}</div>
                        {g.notaFiscal && (
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-slate-400" /> {g.notaFiscal}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {g.osId ? (
                          <span className="font-mono text-sky-800 text-xs bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-bold">
                            {g.osId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          R$ {g.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o lançamento ${g.id} (R$ ${g.valor})?`)) {
                              deleteGasto(g.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Excluir Despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lançar Nova Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Novo Lançamento de Despesa de Manutenção
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarGasto} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Torno Mecânico *</label>
                  <select
                    value={formTornoId}
                    onChange={(e) => setFormTornoId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                  >
                    {tornos.map(t => (
                      <option key={t.id} value={t.id}>{t.patrimonio} - {t.modelo} ({t.setor})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria de Custo *</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value as GastoCategoria)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Item / Serviço *</label>
                <input
                  type="text"
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Jogo de Rolamentos SKF 30214, Óleo Mobil Vactra 20L..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    placeholder="Ex: 850.00"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-bold shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data da Despesa *</label>
                  <input
                    type="date"
                    required
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fornecedor / Prestador *</label>
                  <input
                    type="text"
                    required
                    value={formFornecedor}
                    onChange={(e) => setFormFornecedor(e.target.value)}
                    placeholder="Ex: SKF Rolamentos Brasil, Shell..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nota Fiscal / Cupom (Opcional)</label>
                  <input
                    type="text"
                    value={formNotaFiscal}
                    onChange={(e) => setFormNotaFiscal(e.target.value)}
                    placeholder="Ex: NF-e 49102"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vincular a Ordem de Serviço (Opcional)</label>
                <select
                  value={formOsId}
                  onChange={(e) => setFormOsId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  <option value="">Nenhuma OS vinculada (Despesa Avulsa/Preventiva de Estoque)</option>
                  {ordens.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.tipo} ({getTorno(o.tornoId).patrimonio}) - {o.descricao.slice(0, 45)}...
                    </option>
                  ))}
                </select>
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gravar Despesa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
