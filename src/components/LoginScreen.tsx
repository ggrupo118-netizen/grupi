import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Wrench,
  Factory,
  UserPlus,
  LogIn,
  BadgeCheck,
  User as UserIcon,
  ShieldAlert,
  Info,
  Crown
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loginAdmin, registerUser } = useApp();

  // Mode: login (operador/técnico), admin (nome, senha e código) or register (criar conta)
  const [mode, setMode] = useState<'login' | 'admin' | 'register'>('login');

  // Login form state (Only username & password - no matrícula, no email)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin form state (Nome, Senha e Código)
  const [adminNome, setAdminNome] = useState('Administrador');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Register form state (Nome, Cargo, Senha, Role, Código se ADM)
  const [regNome, setRegNome] = useState('');
  const [regCargo, setRegCargo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Operador');
  const [regAdminCode, setRegAdminCode] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe seu usuário e senha.');
      return;
    }

    const result = login(username, password);
    if (result.success) {
      setSuccessMsg('Autenticado com sucesso! Carregando chão de fábrica...');
    } else {
      setErrorMsg(result.message || 'Usuário ou senha incorretos.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminNome.trim() || !adminPassword.trim() || !adminCode.trim()) {
      setErrorMsg('Preencha os 3 campos obrigatórios: Nome, Senha e Código de Segurança do Administrador.');
      return;
    }

    const result = loginAdmin(adminNome, adminPassword, adminCode);
    if (result.success) {
      setSuccessMsg('Autenticado com sucesso como Administrador! Acesso total liberado.');
    } else {
      setErrorMsg(result.message || 'Credenciais de Administrador inválidas.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNome.trim()) {
      setErrorMsg('Informe o nome completo do colaborador.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('Defina uma senha de acesso.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('A confirmação da senha não confere com a senha digitada.');
      return;
    }
    if (regRole === 'Administrador' && !regAdminCode.trim()) {
      setErrorMsg('O Código de Autorização é obrigatório para cadastrar uma conta como Administrador (Padrão: ADM-2026).');
      return;
    }

    const result = registerUser({
      nome: regNome,
      cargo: regCargo || (regRole === 'Administrador' ? 'Gerente Geral / PCM' : regRole === 'Operador' ? 'Torneiro Mecânico Operador' : 'Técnico de Manutenção Mecânica'),
      password: regPassword,
      role: regRole,
      codigoAdm: regAdminCode
    });

    if (result.success) {
      setSuccessMsg(`Conta criada com sucesso! Acessando sistema como ${regRole}...`);
    } else {
      setErrorMsg(result.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-center items-center p-3 sm:p-4 selection:bg-amber-400 selection:text-slate-950 relative w-full max-w-full overflow-x-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-4 z-10 my-4 px-1">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-md border border-amber-400 mb-1">
            <Wrench className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            Torno<span className="text-amber-600">Maint</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Acesso Obrigatório</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Sistema industrial de gestão de tornos mecânicos e manutenção PCM conforme NR-12.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-full">
          {/* Top colored accent bar */}
          <div className="bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 h-1.5 w-full"></div>

          {/* Mode Switcher Tabs - min-h-[44px] */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 min-h-[44px] py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 min-h-[44px] py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'admin'
                  ? 'bg-white text-indigo-950 shadow-xs border border-indigo-200 ring-1 ring-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-900'
              }`}
            >
              <Crown className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Acesso ADM</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 min-h-[44px] py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Criar Conta</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 w-full">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN MODE (Operador & Técnico) */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5 w-full">
                {/* Field 1: Usuário */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-slate-500 shrink-0" /> Usuário ou Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário ou nome..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                {/* Field 2: Senha */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-slate-500 shrink-0" /> Senha de Acesso *
                  </label>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer min-h-[44px]"
                      aria-label="Mostrar ou ocultar senha"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button - min-h-[44px] */}
                <button
                  type="submit"
                  className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-1 border border-amber-400"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Entrar no Sistema TornoMaint</span>
                </button>

                {/* Shortcut to switch to ADM tab */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('admin');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="w-full min-h-[44px] bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-indigo-200"
                  >
                    <Crown className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Acesso do Administrador (Requer Nome, Senha e Código)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ADMIN ACCESS MODE (Requires: Nome, Senha and Código) */}
            {mode === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5 w-full animate-in fade-in">
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Crown className="w-4 h-4 text-indigo-700" />
                    <span>Área Restrita & Governança PCM</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Para acessar como Administrador, informe seu <strong>Nome</strong>, sua <strong>Senha</strong> e o <strong>Código de Segurança Master</strong>.
                  </p>
                </div>

                {/* Field 1: Nome / Usuário */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" /> 1. Nome ou Usuário ADM *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNome}
                    onChange={(e) => setAdminNome(e.target.value)}
                    placeholder="Ex: adm ou seu nome..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  />
                </div>

                {/* Field 2: Senha */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" /> 2. Senha de Acesso *
                  </label>
                  <div className="relative w-full">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Digite sua senha de administrador..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer min-h-[44px]"
                      aria-label="Mostrar ou ocultar senha"
                    >
                      {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Field 3: Código de Segurança Master */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" /> 3. Código de Segurança Master *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Ex: ADM-2026"
                    className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs uppercase tracking-wider"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Código de segurança padrão:</span>
                    <button
                      type="button"
                      onClick={() => setAdminCode('ADM-2026')}
                      className="font-mono font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      ADM-2026
                    </button>
                  </div>
                </div>

                {/* Submit button - min-h-[44px] */}
                <button
                  type="submit"
                  className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-1"
                >
                  <Crown className="w-4 h-4" />
                  <span>Validar Nome, Senha e Código & Acessar ADM</span>
                </button>
              </form>
            )}

            {/* REGISTER MODE */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5 w-full">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-900 text-xs leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Criação de Conta:</strong> Cadastre seu perfil para acessar ordens de serviço, tornos, preventivas ou governança administrativa.
                  </div>
                </div>

                {/* Role selection for registration */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-sky-600 shrink-0" /> Selecione sua Função *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setRegRole('Operador')}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        regRole === 'Operador'
                          ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Factory className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">Operador</div>
                        <div className="text-[10px] text-slate-500 font-normal">Torneiro</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('Técnico de Manutenção')}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        regRole === 'Técnico de Manutenção'
                          ? 'bg-sky-50 border-sky-500 text-slate-900 ring-1 ring-sky-500 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-sky-600 shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">Técnico</div>
                        <div className="text-[10px] text-slate-500 font-normal">Mecânica</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('Administrador')}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        regRole === 'Administrador'
                          ? 'bg-indigo-50 border-indigo-500 text-slate-900 ring-1 ring-indigo-500 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Crown className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">ADM</div>
                        <div className="text-[10px] text-slate-500 font-normal">Acesso Total</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Field: Nome */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-slate-500 shrink-0" /> Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNome}
                    onChange={(e) => setRegNome(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
                  />
                </div>

                {/* Field: Cargo */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Cargo / Especialidade (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regCargo}
                    onChange={(e) => setRegCargo(e.target.value)}
                    placeholder={regRole === 'Operador' ? 'Ex: Torneiro Mecânico Oficial' : 'Ex: Mecânico Industrial'}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
                  />
                </div>

                {/* Field: Senha */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-slate-500 shrink-0" /> Senha (mín. 4 caracteres) *
                  </label>
                  <div className="relative w-full">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Defina sua senha..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer min-h-[44px]"
                      aria-label="Mostrar ou ocultar senha"
                    >
                      {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Field: Confirmar Senha */}
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-slate-500 shrink-0" /> Confirmar Senha *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs"
                  />
                </div>

                {/* Field: Código de Liberação do Administrador (se role === Administrador) */}
                {regRole === 'Administrador' && (
                  <div className="w-full bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 space-y-1.5 animate-in fade-in">
                    <label className="block text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" /> Código de Liberação do Administrador *
                    </label>
                    <input
                      type="text"
                      required
                      value={regAdminCode}
                      onChange={(e) => setRegAdminCode(e.target.value)}
                      placeholder="Digite o código (Ex: ADM-2026)"
                      className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-mono font-bold uppercase tracking-wider placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Código padrão de liberação:</span>
                      <button
                        type="button"
                        onClick={() => setRegAdminCode('ADM-2026')}
                        className="font-mono font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        ADM-2026
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button - min-h-[44px] */}
                <button
                  type="submit"
                  className="w-full min-h-[44px] bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar e Acessar Chão de Fábrica</span>
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sistema Seguro &bull; Controle de Acesso Baseado em Funções (RBAC) &bull; NR-12</span>
          </div>
        </div>
      </div>
    </div>
  );
};
