import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  KeyRound, 
  X, 
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
  Crown,
  ShieldCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, loginAdmin, registerUser, currentUser } = useApp();

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

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
      setSuccessMsg('Perfil autenticado com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
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
      setSuccessMsg('Acesso concedido com perfil Administrador (ADM)!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message || 'Credenciais de Administrador inválidas.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNome.trim()) {
      setErrorMsg('Informe o nome do colaborador.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('A senha precisa ter no mínimo 4 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('A confirmação da senha não coincide.');
      return;
    }
    if (regRole === 'Administrador' && !regAdminCode.trim()) {
      setErrorMsg('O Código de Autorização é obrigatório para cadastrar um Administrador (Padrão: ADM-2026).');
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
      setSuccessMsg(`Novo colaborador cadastrado como ${regRole}!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-3.5 sm:p-4 text-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">Controle de Acesso PCM</h2>
              <p className="text-[11px] font-semibold opacity-90">Troca de Conta & Cadastro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition cursor-pointer min-h-[36px]"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user summary */}
        {currentUser && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm shrink-0">
            <span className="text-slate-500">Conectado:</span>
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="truncate max-w-[150px]">{currentUser.nome}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                currentUser.role === 'Administrador'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : currentUser.role === 'Técnico de Manutenção'
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Tabs for Login / Admin / Register - min-h-[44px] */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 shrink-0">
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
            <span>Cadastrar</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN (Operador & Técnico) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-slate-500 shrink-0" /> Usuário ou Nome *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário cadastrado..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-slate-500 shrink-0" /> Senha de Acesso *
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 min-h-[44px]"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-xs cursor-pointer mt-1"
              >
                Autenticar e Trocar Conta
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
                  <span>Acesso do Administrador (Nome, Senha e Código)</span>
                </button>
              </div>
            </form>
          )}

          {/* ADMIN ACCESS (Requer Nome, Senha e Código) */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5 w-full animate-in fade-in">
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Crown className="w-4 h-4 text-indigo-700" />
                  <span>Autenticação de Administrador</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Informe o seu <strong>Nome</strong>, a sua <strong>Senha</strong> e o <strong>Código de Segurança Master</strong>.
                </p>
              </div>

              {/* 1. Nome */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" /> 1. Nome ou Usuário ADM *
                </label>
                <input
                  type="text"
                  required
                  value={adminNome}
                  onChange={(e) => setAdminNome(e.target.value)}
                  placeholder="Ex: adm ou seu nome..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 2. Senha */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" /> 2. Senha de Acesso *
                </label>
                <div className="relative w-full">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Sua senha..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 min-h-[44px]"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 3. Código */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" /> 3. Código de Segurança Master *
                </label>
                <input
                  type="text"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Ex: ADM-2026"
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-600"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Código padrão:</span>
                  <button
                    type="button"
                    onClick={() => setAdminCode('ADM-2026')}
                    className="font-mono font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    ADM-2026
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-xs cursor-pointer mt-1"
              >
                Validar e Entrar como ADM
              </button>
            </form>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5 w-full">
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Função do Colaborador *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setRegRole('Operador')}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      regRole === 'Operador'
                        ? 'bg-amber-50 border-amber-500 text-slate-900 font-bold ring-1 ring-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Factory className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs sm:text-sm">Operador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('Técnico de Manutenção')}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      regRole === 'Técnico de Manutenção'
                        ? 'bg-sky-50 border-sky-500 text-slate-900 font-bold ring-1 ring-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="text-xs sm:text-sm">Técnico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('Administrador')}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      regRole === 'Administrador'
                        ? 'bg-indigo-50 border-indigo-500 text-slate-900 font-bold ring-1 ring-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs sm:text-sm">ADM</span>
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Nome do colaborador..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Cargo (Opcional)</label>
                <input
                  type="text"
                  value={regCargo}
                  onChange={(e) => setRegCargo(e.target.value)}
                  placeholder={regRole === 'Operador' ? 'Ex: Torneiro Mecânico Oficial' : 'Ex: Mecânico Industrial'}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Senha (mín. 4) *</label>
                <div className="relative w-full">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Senha de acesso..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 pr-12 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 min-h-[44px]"
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Confirmar Senha *</label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirme a senha..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Field: Código de Liberação do Administrador */}
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
                    className="w-full bg-white border border-indigo-300 rounded-xl px-3.5 min-h-[44px] text-base text-slate-900 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-600 shadow-xs"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Código padrão:</span>
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

              <button
                type="submit"
                className="w-full min-h-[44px] bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-xs cursor-pointer mt-1"
              >
                Cadastrar Colaborador
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500 text-center shrink-0">
          Autenticação Obrigatória Individual &bull; Chão de Fábrica NR-12
        </div>
      </div>
    </div>
  );
};
