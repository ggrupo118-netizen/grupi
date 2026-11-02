import React from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Laptop, 
  Share, 
  PlusSquare, 
  ArrowRight,
  ShieldCheck,
  Zap,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = React.useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-md border border-amber-300">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Instalar Aplicativo TornoMaint</h2>
              <p className="text-xs text-slate-950/80 font-semibold">
                Aplicativo nativo para Chão de Fábrica (Android, iOS & PC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-950/70 hover:text-slate-950 hover:bg-black/10 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-emerald-900">Aplicativo Já Instalado no Dispositivo</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  O TornoMaint já está instalado como app nativo no seu dispositivo com suporte offline e acesso em tela cheia.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/pwa-192x192.png" 
                  alt="TornoMaint Logo" 
                  className="w-14 h-14 rounded-2xl border border-slate-300 shadow-xs"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900">TornoMaint PCM Industrial</h3>
                  <p className="text-xs text-slate-600">
                    Instale sem passar por lojas de aplicativos. Funciona direto no aparelho, ocupa menos de 3MB e funciona offline.
                  </p>
                </div>
              </div>

              {/* Direct Install CTA button (Android / Chrome / Edge) */}
              {!isIOS && (
                <div className="mt-4">
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer border border-amber-400"
                  >
                    <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>{installing ? 'Instalando...' : 'Instalar Agora no Aparelho'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Value Props / Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Zap className="w-4 h-4 text-amber-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Abertura Instantânea</div>
              <div className="text-[11px] text-slate-500">Sem barra de navegador ou abas extras.</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <WifiOff className="w-4 h-4 text-sky-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Suporte Offline</div>
              <div className="text-[11px] text-slate-500">Funciona em áreas fabris sem sinal de Wi-Fi.</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">100% Seguro</div>
              <div className="text-[11px] text-slate-500">Atualizações automáticas em segundo plano.</div>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          {isIOS ? (
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-sky-700" />
                <span>Instruções para iPhone & iPad (Safari)</span>
              </div>
              <ol className="text-xs text-sky-950 space-y-2 pl-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Toque no botão <strong>Compartilhar</strong> no menu inferior do Safari (<Share className="w-3.5 h-3.5 inline text-sky-600" />).</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-sky-600" />).</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Confirme tocando em <strong>Adicionar</strong> no canto superior direito.</span>
                </li>
              </ol>
            </div>
          ) : (
            /* Other devices guide */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Laptop className="w-4 h-4 text-amber-600" />
                <span>Instalação no Computador ou Navegador (Chrome / Edge)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Você também pode instalar no Windows, Mac ou Linux clicando no ícone de computador com seta para baixo <strong>(Instalar aplicativo)</strong> localizado na ponta direita da barra de endereços do seu navegador.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            PWA TornoMaint &bull; v2.4 Industrial
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
