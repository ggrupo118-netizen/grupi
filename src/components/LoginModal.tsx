import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEED_USERS } from '../data/seedData';
import { 
  Lock, 
  User as UserIcon, 
  KeyRound, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Wrench,
  Sparkles
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, quickLogin, currentUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe o usuário e a senha.');
      return;
    }

    const result = login(username, password);
    if (result.success) {
      setSuccessMsg('Autenticação realizada com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message || 'Usuário ou senha incorretos.');
    }
  };

  const handleQuickAccess = (userId: string) => {
    quickLogin(userId);
    setSuccessMsg('Acesso rápido autorizado!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">Controle de Acesso PCM</h2>
              <p className="text-[11px] font-semibold opacity-90">TornoMaint &bull; Gestão de Tornos Mecânicos</p>
            </div>
          </div>
          {currentUser && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {currentUser.avatar || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{currentUser.nome}</p>
                  <p className="text-[10px] text-slate-500">{currentUser.role} &bull; {currentUser.matricula}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Conectado
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-600" /> Usuário / Login
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin, carlos, operador"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition pr-10 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Contas Pré-Configuradas (1 Clique)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {SEED_USERS.map(({ user, passwordHash }) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickAccess(user.id)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition group cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] truncate group-hover:text-amber-800">
                      {user.nome.split(' ')[0]} {user.nome.split(' ')[1] || ''}
                    </span>
                    <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1 py-0.2 rounded font-bold">
                      {user.username}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {user.role}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    Senha: <code className="text-slate-700 font-bold">{passwordHash}</code>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ambiente Seguro &bull; Sessão Ativa Localmente no Navegador</span>
        </div>
      </div>
    </div>
  );
};
