import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  Printer, 
  LogOut, 
  UserCheck, 
  Shield, 
  QrCode
} from 'lucide-react';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenQrScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, onOpenQrScanner }) => {
  const { currentUser, logout, tornos } = useApp();

  const operationalCount = tornos.filter(t => t.status === 'Operacional').length;
  const maintenanceCount = tornos.filter(t => t.status !== 'Operacional').length;

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
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                PCM Chão de Fábrica
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Gestão de Manutenção de Tornos Mecânicos &bull; QR Code &bull; Confiabilidade MTBF / MTTR
            </p>
          </div>
        </div>

        {/* Action Controls & User info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Prominent QR Code Scan Button */}
          <button
            onClick={onOpenQrScanner}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition shadow-sm cursor-pointer border border-amber-400"
            title="Escanear QR Code do Torno Mecânico"
          >
            <QrCode className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="font-extrabold">Ler QR Code</span>
          </button>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">
              <strong className="text-emerald-700">{operationalCount}</strong> Operando &bull; <strong className="text-amber-700">{maintenanceCount}</strong> Parados
            </span>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition font-medium cursor-pointer"
            title="Imprimir relatório / tela atual"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* User Profile / Logout status */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-700 flex items-center justify-center font-bold text-xs">
                {currentUser.avatar || currentUser.nome.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>{currentUser.nome}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-800 px-1 py-0.2 rounded font-mono font-bold">
                    {currentUser.matricula}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.role}
                </div>
              </div>

              {/* Logout & Switch Buttons */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  onClick={onOpenLogin}
                  title="Trocar Perfil de Acesso"
                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-200/60 rounded transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  title="Sair do Sistema (Logout)"
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer"
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
