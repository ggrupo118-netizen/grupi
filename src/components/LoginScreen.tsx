import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEED_USERS } from '../data/seedData';
import { UserRole } from '../types';
import { 
  Lock, 
  User as UserIcon, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Wrench,
  Sparkles,
  Shield,
  Factory,
  Cpu,
  ArrowRight
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, quickLogin } = useApp();

  const [identifier, setIdentifier] = useState('ADM-001');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrador');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe a matrícula/usuário e a senha.');
      return;
    }

    const result = login(identifier, password, selectedRole);
    if (result.success) {
      setSuccessMsg('Autenticação autorizada! Carregando painel operacional...');
    } else {
      setErrorMsg(result.message || 'Credenciais inválidas.');
    }
  };

  const handleDirectAccess = (userId: string) => {
    quickLogin(userId);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Ambient Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg space-y-5 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-md border border-amber-400 mb-1">
            <Wrench className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            Torno<span className="text-amber-600">Maint</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Sistema Integrado de Gestão de Manutenção, Controle de OS, QR Code e Confiabilidade MTBF/MTTR
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Top colored accent bar */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 h-1.5 w-full"></div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Autenticação de Usuário & Nível de Acesso</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Informe sua identificação funcional para desbloquear o sistema operacional.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Profile / Role Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" /> Perfil / Nível de Acesso *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('Operador');
                      setIdentifier('OP-105');
                      setPassword('op123');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedRole === 'Operador'
                        ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Factory className="w-4 h-4" />
                    <span className="text-[11px]">Operador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('Técnico de Manutenção');
                      setIdentifier('TEC-202');
                      setPassword('tec123');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedRole === 'Técnico de Manutenção'
                        ? 'bg-sky-500 border-sky-500 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span className="text-[11px]">Técnico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('Administrador');
                      setIdentifier('ADM-001');
                      setPassword('admin123');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedRole === 'Administrador'
                        ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    <span className="text-[11px]">Administrador</span>
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  {selectedRole === 'Operador' && 'Abertura rápida de chamados, escaneamento de QR Code e consulta de especificações.'}
                  {selectedRole === 'Técnico de Manutenção' && 'Atendimento de chamados, encerramento de OS com apontamento de MTTR e preventivas.'}
                  {selectedRole === 'Administrador' && 'Gestão completa: todas as abas, controle de custos/gastos, MTBF/MTTR e relatórios.'}
                </div>
              </div>

              {/* Identifier */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-600" /> Matrícula, ID ou E-mail do Colaborador *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: OP-105, TEC-202, ADM-001 ou admin"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs shadow-xs"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Senha de Acesso *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition pr-10 text-xs shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500"
                  />
                  <span>Manter conectado neste terminal</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-2"
              >
                <span>Acessar Painel TornoMaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Access for Operators and Supervisors */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Acesso Rápido de Demonstração (1 Clique Direto)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SEED_USERS.map(({ user, passwordHash }) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDirectAccess(user.id)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] truncate group-hover:text-amber-800">
                        {user.nome.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1 py-0.2 rounded font-bold">
                        {user.matricula}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {user.role}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-1">
                      {user.username} &bull; {passwordHash}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sessão Protegida &bull; Auditoria PCM Industrial &bull; NR-12 Conforme</span>
          </div>
        </div>
      </div>
    </div>
  );
};
