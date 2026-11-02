import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  Printer, 
  LogOut, 
  UserCheck, 
  Shield, 
  QrCode,
  Share2,
  Factory,
  Crown,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenQrScanner: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, onOpenQrScanner, onOpenShare }) => {
  const { 
    currentUser, 
    logout, 
    tornos, 
    cloudSyncStatus, 
    cloudErrorMessage, 
    syncWithSupabase 
  } = useApp();

  const operationalCount = tornos.filter(t => t.status === 'Operacional').length;
  const maintenanceCount = tornos.filter(t => t.status !== 'Operacional').length;
  const isAdmin = currentUser?.role === 'Administrador';
  const isOperator = currentUser?.role === 'Operador';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-sm border border-amber-400">
            <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Torno<span className="text-amber-600">Maint</span>
              </h1>
              <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                Chão de Fábrica PCM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Gestão de Manutenção de Tornos Mecânicos &bull; Supabase Nuvem &bull; QR Code
            </p>
          </div>
        </div>

        {/* Action Controls & User info */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Prominent QR Code Scan Button */}
          <button
            onClick={onOpenQrScanner}
            className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 sm:px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 sm:gap-2 transition shadow-sm cursor-pointer border border-amber-400"
            title="Escanear QR Code do Torno Mecânico"
          >
            <QrCode className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="font-extrabold text-xs">Ler QR Code</span>
          </button>

          {/* Machine Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">
              <strong className="text-emerald-700">{operationalCount}</strong> Operando &bull; <strong className="text-amber-700">{maintenanceCount}</strong> Parados
            </span>
          </div>

          {/* Supabase Cloud Realtime Indicator */}
          <button
            onClick={() => syncWithSupabase()}
            className={`min-h-[44px] text-xs px-2.5 sm:px-3 py-2 rounded-xl border flex items-center gap-1.5 transition font-semibold cursor-pointer shadow-2xs ${
              cloudSyncStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : cloudSyncStatus === 'syncing'
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={
              cloudSyncStatus === 'connected'
                ? 'Nuvem Supabase Ativa: dados sincronizados em tempo real. Clique para sincronizar agora.'
                : cloudSyncStatus === 'syncing'
                ? 'Sincronizando com Supabase...'
                : `Nuvem Supabase: ${cloudErrorMessage || 'Modo local ativo com fallback na nuvem. Clique para sincronizar.'}`
            }
          >
            <Cloud className={`w-4 h-4 ${
              cloudSyncStatus === 'connected' ? 'text-emerald-600' : cloudSyncStatus === 'syncing' ? 'text-amber-600 animate-pulse' : 'text-slate-500'
            }`} />
            <span className="hidden sm:inline font-mono text-[11px]">
              {cloudSyncStatus === 'connected' ? 'Nuvem Ativa' : cloudSyncStatus === 'syncing' ? 'Sincronizando...' : 'Supabase'}
            </span>
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${cloudSyncStatus === 'syncing' ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Share App Link Button */}
          <button
            onClick={onOpenShare}
            className="min-h-[44px] text-xs bg-sky-50 hover:bg-sky-100 text-sky-800 hover:text-sky-950 px-2.5 sm:px-3 py-2 rounded-xl border border-sky-200 flex items-center gap-1.5 transition font-bold cursor-pointer shadow-2xs"
            title="Compartilhar Link do Sistema para trabalhar no celular ou computador"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex min-h-[44px] text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 items-center gap-1.5 transition font-medium cursor-pointer"
            title="Imprimir relatório / tela atual"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Imprimir</span>
          </button>

          {/* User Profile / Logout status */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                isAdmin
                  ? 'bg-indigo-100 border border-indigo-300 text-indigo-800'
                  : isOperator 
                  ? 'bg-amber-100 border border-amber-300 text-amber-800' 
                  : 'bg-sky-100 border border-sky-300 text-sky-800'
              }`}>
                {isAdmin ? <Crown className="w-3.5 h-3.5" /> : isOperator ? <Factory className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>{currentUser.nome}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <span className={isAdmin ? 'text-indigo-700 font-bold' : isOperator ? 'text-amber-700 font-bold' : 'text-sky-700 font-bold'}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Logout & Switch Buttons */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  onClick={onOpenLogin}
                  title="Trocar Perfil de Acesso ou Cadastrar Usuário"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  title="Bloquear terminal e sair (Logout)"
                  className="min-h-[44px] px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Acessar Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
