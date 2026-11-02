import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Shield, 
  Users, 
  Trash2, 
  UserPlus, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Check, 
  Crown,
  DollarSign,
  ClipboardList,
  Warehouse,
  KeyRound,
  Cloud,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  Code2,
  CheckCheck
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabase';

export const AdminTab: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    registerUser, 
    deleteUser, 
    updateUserRole, 
    resetSystemData,
    tornos,
    ordens,
    preventivas,
    gastos,
    budgetMensal,
    cloudSyncStatus,
    cloudErrorMessage,
    syncWithSupabase,
    updateSupabaseCredentials,
    supabaseConfig
  } = useApp();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Técnico de Manutenção');
  const [newPassword, setNewPassword] = useState('');
  
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // Supabase cloud config state
  const [isEditingCloud, setIsEditingCloud] = useState(false);
  const [cloudUrlInput, setCloudUrlInput] = useState(supabaseConfig.url);
  const [cloudKeyInput, setCloudKeyInput] = useState(supabaseConfig.key);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    setMsgError('');

    if (!newNome.trim() || !newPassword.trim()) {
      setMsgError('Preencha os campos obrigatórios: Nome Completo e Senha.');
      return;
    }

    const defaultPrefix = newRole === 'Administrador' ? 'ADM' : newRole === 'Técnico de Manutenção' ? 'TEC' : 'OP';
    const autoMatricula = newMatricula.trim() || `${defaultPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const autoEmail = newEmail.trim() || `${newNome.trim().toLowerCase().replace(/\s+/g, '.') || 'usuario'}@tornomaint.ind.br`;

    const res = registerUser({
      nome: newNome.trim(),
      matricula: autoMatricula,
      email: autoEmail,
      cargo: newCargo.trim() || newRole,
      role: newRole,
      password: newPassword
    });

    if (res.success) {
      setMsgSuccess(`Usuário ${newNome} cadastrado com sucesso com perfil "${newRole}".`);
      setNewNome('');
      setNewMatricula('');
      setNewEmail('');
      setNewCargo('');
      setNewPassword('');
      setIsAddUserOpen(false);
    } else {
      setMsgError(res.message || 'Erro ao registrar usuário.');
    }
  };

  const handleDeleteUser = (userId: string, userNome: string) => {
    if (confirm(`Deseja realmente remover a conta de "${userNome}"? Esta ação é irreversível.`)) {
      const res = deleteUser(userId);
      if (res.success) {
        setMsgSuccess(`Usuário "${userNome}" removido com sucesso.`);
      } else {
        setMsgError(res.message || 'Não foi possível remover o usuário.');
      }
    }
  };

  const handleRoleChange = (userId: string, newRoleValue: UserRole) => {
    updateUserRole(userId, newRoleValue);
    setMsgSuccess('Perfil de acesso atualizado com sucesso.');
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setMsgSuccess('');
    setMsgError('');
    try {
      await syncWithSupabase();
      setMsgSuccess('Sincronização em tempo real com o Supabase concluída com sucesso!');
    } catch (err: any) {
      setMsgError(err?.message || 'Falha na sincronização.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleSaveCloudCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    setMsgError('');
    try {
      await updateSupabaseCredentials(cloudUrlInput, cloudKeyInput);
      setIsEditingCloud(false);
      setMsgSuccess('Credenciais do Supabase atualizadas e sincronização restabelecida!');
    } catch (err: any) {
      setMsgError(err?.message || 'Erro ao atualizar credenciais do Supabase.');
    }
  };

  const handleCopySql = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    }
  };

  const handleExportDatabase = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      exportedBy: currentUser?.nome,
      tornos,
      ordens,
      preventivas,
      gastos,
      budgetMensal,
      supabaseEndpoint: supabaseConfig.url,
      users: allUsers.map(u => ({
        id: u.user.id,
        nome: u.user.nome,
        matricula: u.user.matricula,
        cargo: u.user.cargo,
        role: u.user.role,
        email: u.user.email
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tornomaint_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMsgSuccess('Backup completo do banco de dados gerado e descarregado com sucesso!');
  };

  const handleResetSystem = () => {
    resetSystemData();
    setConfirmReset(false);
    setMsgSuccess('Sistema restaurado aos parâmetros de fábrica com sucesso e sincronizado.');
  };

  const totalGasto = gastos.reduce((sum, g) => sum + g.valor, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Painel de Controle Master do Administrador</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Governança, Banco de Dados Supabase & Usuários
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Você possui acesso irrestrito a todos os dados do TornoMaint: sincronização em tempo real na nuvem Supabase, gerenciamento de contas, custos financeiros e governança NR-12.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Sincronizar dados em tempo real com o Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Nuvem</span>
            </button>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Usuário</span>
            </button>

            <button
              onClick={handleExportDatabase}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Exportar arquivo JSON com todos os dados"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Exportar Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {msgSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msgSuccess}</span>
          </div>
          <button onClick={() => setMsgSuccess('')} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">Fechar</button>
        </div>
      )}

      {msgError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{msgError}</span>
          </div>
          <button onClick={() => setMsgError('')} className="text-rose-700 hover:text-rose-950 font-bold ml-2">Fechar</button>
        </div>
      )}

      {/* SUPABASE CLOUD INTEGRATION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Banco de Dados Supabase (Nuvem em Tempo Real)</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  cloudSyncStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    cloudSyncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : cloudSyncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'
                  }`}></span>
                  <span>{cloudSyncStatus === 'connected' ? 'Conectado em Tempo Real' : cloudSyncStatus === 'syncing' ? 'Sincronizando' : 'Modo Offline / Local'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Armazenamento permanente das tabelas <strong className="text-slate-700">tornos</strong> e <strong className="text-slate-700">ordens_servico</strong> com sincronização instantânea em qualquer aparelho.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Forçar Sincronização</span>
            </button>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Script SQL das Tabelas</span>
            </button>
          </div>
        </div>

        {/* Cloud status details - credentials safely masked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Conexão do Banco de Dados:</span>
            <div className="font-mono text-slate-800 bg-white px-2.5 py-1.5 rounded border border-slate-200 flex items-center justify-between">
              <span className="truncate">Nuvem Supabase (Tempo Real)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-sans">Seguro</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Chave de Acesso & Autenticação:</span>
            <div className="font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200 flex items-center justify-between">
              <span>••••••••••••••••••••••••••••••••</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-sans font-semibold">Oculta</span>
            </div>
          </div>
        </div>

        {cloudErrorMessage && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Status da Conexão:</strong> {cloudErrorMessage}
              <div className="text-[11px] text-amber-700 mt-1">
                Caso sua rede restrinja o acesso ou as tabelas ainda não tenham sido criadas no Supabase, o sistema continua 100% utilizável gravando em cache local e sincronizando automaticamente assim que restabelecido.
              </div>
            </div>
          </div>
        )}

        {/* Button to toggle manual URL/Key edit */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsEditingCloud(!isEditingCloud)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
          >
            {isEditingCloud ? 'Ocultar Configuração Avançada' : 'Ajustar URL ou Chave do Supabase'}
          </button>
          <span className="text-[11px] text-slate-400 font-mono">Tabelas: public.tornos &bull; public.ordens_servico</span>
        </div>

        {isEditingCloud && (
          <form onSubmit={handleSaveCloudCredentials} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Atualizar Configuração do Supabase</h4>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">URL do Supabase</label>
              <input
                type="text"
                required
                value={cloudUrlInput}
                onChange={(e) => setCloudUrlInput(e.target.value)}
                placeholder="https://sua-instancia.supabase.co"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Chave Anon / Publishable (Protegida)</label>
              <input
                type="password"
                required
                value={cloudKeyInput}
                onChange={(e) => setCloudKeyInput(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingCloud(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Salvar & Reconectar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Usuários Registrados</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{allUsers.length}</div>
          <span className="text-[10px] text-slate-500 font-mono">Contas ativas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tornos Cadastrados</span>
            <Warehouse className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{tornos.length}</div>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold">Sincronizado Supabase</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Ordens de Serviço</span>
            <ClipboardList className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{ordens.length}</div>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold">Sincronizado Supabase</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Gastos Acumulados</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Orçamento: R$ {budgetMensal.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Gerenciamento de Colaboradores & Permissões</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina as permissões funcionais. Usuários comuns têm acesso a todas as tarefas operacionais; somente o perfil Administrador acessa custos e governança.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar Colaborador</span>
          </button>
        </div>

        {/* Mobile View: Cards with "rótulo: valor" (one card per user) */}
        <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
          {allUsers.map(({ user }) => {
            const isCurrent = currentUser?.id === user.id;
            const isMasterAdmin = user.role === 'Administrador' && user.matricula === 'ADM-01';

            return (
              <div key={user.id} className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      user.role === 'Administrador'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : user.role === 'Técnico de Manutenção'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {user.avatar || user.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{user.nome}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-semibold">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{user.cargo || user.role}</div>
                    </div>
                  </div>

                  {isCurrent || isMasterAdmin ? (
                    <span className="text-[10px] text-slate-400 font-mono italic px-2 py-1">Protegido</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.nome)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-600 bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                      title="Excluir Colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">Função (RBAC):</span>
                    <select
                      value={user.role}
                      disabled={isMasterAdmin}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={`min-h-[44px] text-base font-bold rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                        user.role === 'Administrador'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                          : user.role === 'Técnico de Manutenção'
                          ? 'bg-sky-50 border-sky-300 text-sky-800'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                      }`}
                    >
                      <option value="Operador">Operador</option>
                      <option value="Técnico de Manutenção">Técnico de Manutenção</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 font-medium">Identificador:</span>
                    <span className="font-mono text-slate-700 font-bold">{user.matricula}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Wide Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Cargo Funcional</th>
                <th className="px-4 py-3">Função / Perfil (RBAC)</th>
                <th className="px-4 py-3">Segurança</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allUsers.map(({ user }) => {
                const isCurrent = currentUser?.id === user.id;
                const isMasterAdmin = user.role === 'Administrador' && user.matricula === 'ADM-01';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'Administrador'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : user.role === 'Técnico de Manutenção'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {user.avatar || user.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.nome}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-mono font-semibold">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {user.matricula}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {user.cargo}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        disabled={isMasterAdmin}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                          user.role === 'Administrador'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : user.role === 'Técnico de Manutenção'
                            ? 'bg-sky-50 border-sky-300 text-sky-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="Operador">Operador</option>
                        <option value="Técnico de Manutenção">Técnico de Manutenção</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono text-[10px] text-slate-500">••••••••</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isCurrent || isMasterAdmin ? (
                        <span className="text-[10px] text-slate-400 font-mono italic">Protegido</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nome)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Matriz de Controle de Acesso por Perfil (RBAC)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Usuários Gerais (Operadores & Técnicos)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Acesso total às operações industriais: Abertura e Gestão de O.S., Apontamentos de Horas, Cronograma de Preventivas, Indicadores MTBF/MTTR, Fichas Técnicas de Tornos, NR-12 e Leitor QR Code sincronizados no Supabase.
            </p>
            <div className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 pt-1">
              <Lock className="w-3 h-3" /> Bloqueados de: Gastos Financeiros e Painel Administrativo.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-950 font-bold">
              <Crown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Administrador (Acesso Total e Irrestrito)</span>
            </div>
            <p className="text-[11px] text-indigo-900">
              Acesso irrestrito a todos os módulos operacionais, além do controle de Gastos e Orçamentos Financeiros, Gerenciamento de Usuários, credenciais do Supabase e exportação de backups.
            </p>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
              <Check className="w-3 h-3" /> Acesso 100% liberado para todas as abas e ferramentas.
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/40 rounded-2xl border border-rose-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Zona de Manutenção do Sistema</span>
          </h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Restaura o sistema para o banco de dados inicial de fábrica do PCM e re-sincroniza com a nuvem Supabase.
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleResetSystem}
              className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Sim, Restaurar Dados
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3 py-1.5 text-xs bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold transition cursor-pointer"
          >
            Restaurar Padrões de Fábrica
          </button>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Adicionar Novo Colaborador</span>
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Ex: Amanda Silva Ribeiro"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base text-slate-900 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Função de Acesso (RBAC) *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  <option value="Operador">Operador (Abertura de OS & Fichas)</option>
                  <option value="Técnico de Manutenção">Técnico de Manutenção (Execução & Preventivas)</option>
                  <option value="Administrador">Administrador (Total Acesso)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo / Especialidade (Opcional)</label>
                <input
                  type="text"
                  value={newCargo}
                  onChange={(e) => setNewCargo(e.target.value)}
                  placeholder="Ex: Torneiro Mecânico Sênior"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base text-slate-900 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Senha de Acesso (mín. 4 caracteres) *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite uma senha..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base text-slate-900 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="w-full sm:flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Script Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Script SQL para o Supabase SQL Editor</h3>
                  <p className="text-[11px] text-slate-400">Tabelas tornos & ordens_servico com permissões e Realtime</p>
                </div>
              </div>
              <button onClick={() => setIsSqlModalOpen(false)} className="text-slate-400 hover:text-white font-bold px-2 py-1">✕</button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] bg-slate-950 text-slate-200 selection:bg-indigo-500 selection:text-white leading-relaxed">
              <pre>{SUPABASE_SETUP_SQL}</pre>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-600">Copie e cole este código na aba <strong>SQL Editor</strong> do seu painel Supabase.</span>
              <button
                onClick={handleCopySql}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                {sqlCopied ? <CheckCheck className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{sqlCopied ? 'Copiado para Área de Transferência!' : 'Copiar Código SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
