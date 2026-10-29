import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { Torno } from '../types';
import { 
  QrCode, 
  Camera, 
  X, 
  AlertCircle, 
  Search, 
  Sparkles,
  Keyboard
} from 'lucide-react';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTorno: (torno: Torno) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectTorno
}) => {
  const { tornos, findTornoByQrCode } = useApp();

  const [activeTab, setActiveTab] = useState<'camera' | 'simulador' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [errorCamera, setErrorCamera] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Sound feedback on success
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio not supported or blocked
    }
  };

  const handleTornoFound = (torno: Torno) => {
    playBeep();
    stopCamera();
    onSelectTorno(torno);
  };

  // Camera handling
  const startCamera = async () => {
    setErrorCamera(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorCamera('Navegador não possui suporte à câmera ou bloqueou o recurso de vídeo.');
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Câmera indisponível:', err);
      setErrorCamera('Câmera não autorizada ou indisponível. Utilize a aba Simulador ou Digitação Manual abaixo.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsScanning(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            const found = findTornoByQrCode(code.data);
            if (found) {
              handleTornoFound(found);
              return;
            }
          }
        }
      }
    }
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tickScan);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const found = findTornoByQrCode(manualCode);
    if (found) {
      handleTornoFound(found);
    } else {
      alert(`Nenhum torno mecânico localizado para o código: "${manualCode}". Tente TR-01, TR-02, TR-03, TR-04 ou TR-05.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Identificação de Torno por QR Code
              </h3>
              <p className="text-[11px] font-semibold opacity-90">
                Aponte a câmera para a placa do torno ou selecione na simulação
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Câmera do Celular / Tablet</span>
          </button>

          <button
            onClick={() => setActiveTab('simulador')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'simulador'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Rápido (1 Clique)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Digitar TAG</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* TAB 1: Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-3 text-center">
              {errorCamera ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 text-left">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>Câmera não detectada no ambiente web ou sem permissão</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Em desktops sem webcam ou em conexões sem SSL da rede local, utilize o <strong>Simulador Rápido</strong> para testar a leitura de qualquer torno da fábrica com 1 clique!
                  </p>
                  <button
                    onClick={() => setActiveTab('simulador')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs mt-2 transition cursor-pointer shadow-xs"
                  >
                    Abrir Simulador de QR Code do Chão de Fábrica
                  </button>
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-xs h-64 bg-black rounded-2xl overflow-hidden border-2 border-amber-500 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  ></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>

                  {/* Target scanner overlay box */}
                  <div className="absolute inset-8 border-2 border-amber-400 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-bounce"></div>
                  </div>

                  <span className="absolute bottom-2 bg-slate-950/80 text-amber-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-amber-500/30">
                    Enquadre o código QR colado no torno
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                O leitor reconhece instantaneamente etiquetas industriais com TAGs como <code className="text-amber-800 font-bold">TR-01</code>, <code className="text-amber-800 font-bold">TR-02</code>, <code className="text-amber-800 font-bold">TR-03</code>.
              </p>
            </div>
          )}

          {/* TAB 2: Simulator (Chão de Fábrica 1 Clique) */}
          {activeTab === 'simulador' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Simulação de leitura direta da etiqueta QR Code afixada na carcaça da máquina:
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {tornos.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTornoFound(t)}
                    className="p-3 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 transition text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-700 text-xs">{t.patrimonio}</span>
                          <span className="text-slate-900 font-semibold text-xs">{t.modelo}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{t.fabricante} &bull; {t.setor}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'Operacional'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'Em Manutenção'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1 group-hover:text-amber-700 font-semibold">
                        Escanear &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Manual Input */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSearch} className="space-y-4 text-xs">
              <p className="text-slate-600 text-xs">
                Caso a etiqueta QR Code física esteja suja de óleo ou a lente da câmera não foque, digite a TAG gravada na placa de identificação do torno:
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Patrimônio, TAG ou Código do Torno *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ex: TR-01, TR-02, TRN-003, Mascote..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition uppercase shadow-xs"
                  />
                </div>
              </div>

              {/* Quick tags suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-slate-500">Sugestões rápidas:</span>
                {tornos.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setManualCode(t.patrimonio);
                      handleTornoFound(t);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono border border-slate-300 cursor-pointer"
                  >
                    {t.patrimonio}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Localizar Ficha do Torno</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
