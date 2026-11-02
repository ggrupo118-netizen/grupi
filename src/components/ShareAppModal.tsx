import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Smartphone, 
  Download, 
  ExternalLink, 
  QrCode as QrCodeIcon, 
  Globe, 
  MessageCircle, 
  Mail, 
  FileCode,
  Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadStandaloneHtml } from '../utils/exportHtmlFile';
import { PWAInstallButton } from './PWAInstallButton';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const { tornos, ordens, preventivas, gastos, currentUser, globalReliability } = useApp();
  
  // Official live preview URL and dynamic location
  const fallbackUrl = 'https://ais-pre-f6jbh4jmrbgc2n56il5gj4-234366601998.us-east1.run.app';
  const [selectedUrlType, setSelectedUrlType] = useState<'cloud' | 'current'>('cloud');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [htmlDownloaded, setHtmlDownloaded] = useState(false);

  const currentHostUrl = typeof window !== 'undefined' ? window.location.href : fallbackUrl;
  const activeUrl = selectedUrlType === 'cloud' ? fallbackUrl : currentHostUrl;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(activeUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code de compartilhamento:', err));
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = activeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = 'qrcode_tornomaint_acesso.png';
    a.click();
  };

  const handleDownloadHtml = () => {
    downloadStandaloneHtml({
      tornos,
      ordens,
      preventivas,
      gastos,
      currentUser,
      globalReliability,
      liveUrl: activeUrl
    });
    setHtmlDownloaded(true);
    setTimeout(() => setHtmlDownloaded(false), 3000);
  };

  const shareText = encodeURIComponent(
    `🔧 *TornoMaint - Gestão de Manutenção de Tornos*\n\nAcesse o sistema da nossa fábrica para abrir chamados, ler QR Codes dos tornos e acompanhar ordens de serviço:\n${activeUrl}`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent('Acesso ao TornoMaint - Sistema de Manutenção')}&body=${encodeURIComponent(
    `Olá equipe,\n\nSegue o link direto para trabalhar no sistema TornoMaint:\n${activeUrl}\n\nVocê pode abrir no celular para escanear os QR Codes dos tornos ou no computador para gerenciar ordens de serviço e relatórios.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/15 border border-slate-950/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Compartilhar Link para Trabalhar</h2>
              <p className="text-xs text-slate-900/80 font-medium">
                Acesse o TornoMaint no celular, tablet ou em outro computador da fábrica
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Link Input & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                Link Oficial de Trabalho & Acesso
              </label>
              
              {/* Option to toggle URLs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedUrlType('cloud')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    selectedUrlType === 'cloud' 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Link Nuvem
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUrlType('current')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    selectedUrlType === 'current' 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  URL Atual
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeUrl}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              Compartilhe esse endereço com operadores, mecânicos e supervisores para que todos trabalhem no mesmo sistema.
            </p>
          </div>

          {/* Quick Sharing Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Enviar pelo WhatsApp</span>
            </a>
            <a
              href={mailtoUrl}
              className="flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Enviar por E-mail</span>
            </a>
          </div>

          {/* QR Code Section for Shop Floor Scanning */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code de Acesso ao TornoMaint" 
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                  Gerando QR Code...
                </div>
              )}
              <button
                type="button"
                onClick={handleDownloadQrCode}
                className="mt-2 text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Salvar Imagem (PNG)</span>
              </button>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <QrCodeIcon className="w-4 h-4 text-amber-600" />
                <span>Acesso Rápido via Câmera do Celular</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aponte a câmera de qualquer smartphone (Android ou iPhone) para o QR Code ao lado para abrir o sistema instantaneamente no chão de fábrica.
              </p>
              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  Dica de Instalação no Celular:
                </p>
                <p>&bull; <strong>No Android (Chrome):</strong> Toque nos 3 pontos &rarr; "Adicionar à tela inicial".</p>
                <p>&bull; <strong>No iPhone (Safari):</strong> Toque em Compartilhar &rarr; "Adicionar à Tela de Início".</p>
              </div>
            </div>
          </div>

          {/* PWA Install Card for App Installation */}
          <PWAInstallButton variant="banner" />

          {/* Download Standalone HTML Package */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <FileCode className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Baixar Arquivo HTML Completo (Trabalho Offline)
                </h3>
                <p className="text-[11px] text-slate-600">
                  Gere um arquivo <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">.html</code> único e independente com todos os tornos, ordens de serviço, MTBF/MTTR e cronogramas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 shadow-xs ${
                htmlDownloaded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {htmlDownloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Arquivo Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo HTML</span>
                </>
              )}
            </button>
          </div>

          {/* Machine-Specific Direct Link Example */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Laptop className="w-3.5 h-3.5 text-amber-600" />
              <span>Link Direto para Equipamento Específico (Tag no QR Code Físico)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Você pode colar etiquetas físicas com links diretos nos tornos. Exemplo para o Torno CNC A1:
            </p>
            <div className="bg-white border border-slate-200 p-2 rounded font-mono text-[11px] text-amber-800 select-all">
              {activeUrl}?id=TR-01
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            TornoMaint &bull; Gestão Colaborativa de Manutenção
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
