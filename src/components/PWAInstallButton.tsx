import React, { useState } from 'react';
import { Smartphone, CheckCircle, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // If already running inside standalone app, show subtle "App Instalado" badge or return null
  if (isInstalled && variant === 'header') {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold ${className}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">App Ativo</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isIOS) {
      setModalOpen(true);
      return;
    }

    // Try native prompt first
    const installed = await install();
    if (!installed) {
      // If prompt not available or dismissed, open instructional modal
      setModalOpen(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400 ${className}`}>
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-tight leading-tight">
                Instale o TornoMaint no seu Celular ou Computador
              </h4>
              <p className="text-[11px] text-slate-900/80 font-medium">
                Acesse o app direto da tela inicial, com resposta rápida e operação offline na fábrica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleClick}
              className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar App</span>
            </button>
          </div>
        </div>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`text-xs bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl border border-amber-400 flex items-center gap-1.5 transition shadow-sm cursor-pointer ${className}`}
        title="Instalar Aplicativo TornoMaint no Celular ou PC"
      >
        <Smartphone className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
