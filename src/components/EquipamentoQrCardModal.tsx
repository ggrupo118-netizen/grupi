import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Torno } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  X, 
  Clock, 
  Droplet, 
  PlusCircle, 
  Printer, 
  Download, 
  Layers, 
  BookOpen, 
  ArrowRight,
  UserCheck,
  Calendar
} from 'lucide-react';

interface EquipamentoQrCardModalProps {
  torno: Torno | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOsForTorno: (tornoId: string) => void;
}

export const EquipamentoQrCardModal: React.FC<EquipamentoQrCardModalProps> = ({
  torno,
  isOpen,
  onClose,
  onOpenOsForTorno
}) => {
  const { ordens } = useApp();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrPrintView, setShowQrPrintView] = useState<boolean>(false);
  const [directUrl, setDirectUrl] = useState<string>('');

  useEffect(() => {
    if (torno && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const scanUrl = `${origin}${pathname}?id=${encodeURIComponent(torno.patrimonio)}`;
      setDirectUrl(scanUrl);

      QRCode.toDataURL(scanUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Erro ao gerar QR Code:', err));
    }
  }, [torno]);

  if (!isOpen || !torno) return null;

  // Linked Work Orders
  const ultimasOrdens = ordens
    .filter(o => o.tornoId === torno.id)
    .slice(0, 3);

  const handleOpenOs = () => {
    onClose();
    onOpenOsForTorno(torno.id);
  };

  const isEmManutencao = torno.status.toLowerCase().includes('manutenção') || torno.status.toLowerCase().includes('parado');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-xs">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Gestão de Manutenção - TornoMaint
                </span>
                <span className="text-xs font-mono font-black text-slate-950 bg-amber-400/80 px-1.5 py-0.2 rounded">
                  {torno.patrimonio}
                </span>
              </div>
              <h2 className="text-base font-black tracking-wide text-slate-950">
                {torno.modelo} &bull; {torno.fabricante}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Main Card with Core Fields */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Identificação do Equipamento
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-black text-amber-700 font-mono">{torno.patrimonio}</span>
                  <span className="text-sm font-semibold text-slate-800">({torno.id})</span>
                  {torno.aliases && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-medium">
                      TAGs: {torno.aliases.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Status Atual</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  !isEmManutencao
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${!isEmManutencao ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
                  {torno.status}
                </span>
              </div>
            </div>

            {/* Core Info Rows matching exact snippet requirement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px]">Nome / Modelo:</span>
                <strong className="text-slate-900 text-sm">{torno.modelo}</strong>
                <span className="text-slate-500 block text-[10px]">Fabricante: {torno.fabricante}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px]">Setor / Localização:</span>
                <strong className="text-slate-900 text-sm">{torno.setor}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-600" /> Última Manutenção:
                </span>
                <strong className="text-sky-800 font-mono text-sm">
                  {torno.ultimaManutencao || '15/09/2026'}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> Próxima Preventiva:
                </span>
                <strong className="text-amber-800 font-mono text-sm">
                  {torno.proximaPreventiva || '15/11/2026'}
                </strong>
              </div>

              <div className="sm:col-span-2 p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" /> Técnico Responsável pelo Torno:
                  </span>
                  <strong className="text-slate-900 text-sm">
                    {torno.responsavel || 'Carlos Técnico (Líder Mecânica)'}
                  </strong>
                </div>

                <button
                  onClick={handleOpenOs}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Manutenção</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toggle QR Code physical sticker preview */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowQrPrintView(!showQrPrintView)}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-amber-800 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition font-semibold cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{showQrPrintView ? 'Ocultar Etiqueta QR' : 'Visualizar Etiqueta Física QR Code (URL de Leitura)'}</span>
            </button>

            {directUrl && (
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                URL: {directUrl}
              </span>
            )}
          </div>

          {showQrPrintView && (
            <div className="p-4 bg-slate-50 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code ${torno.patrimonio}`}
                  className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  Gerando QR...
                </div>
              )}
              <div className="space-y-1.5 flex-1 text-xs">
                <span className="text-[10px] font-mono text-amber-800 uppercase font-bold tracking-wider block">
                  Etiqueta de Leitura Direta por Qualquer Câmera / Smartphone
                </span>
                <h4 className="text-sm font-black text-slate-900">{torno.patrimonio} &bull; {torno.modelo}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ao escanear este QR Code com a câmera nativa de qualquer celular ou tablet no chão de fábrica, o link abre diretamente este painel com o torno carregado.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={qrCodeDataUrl}
                    download={`etiqueta_qrcode_${torno.patrimonio}.png`}
                    className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 border border-slate-300 transition shadow-xs"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>Baixar Imagem PNG</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="bg-white hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 border border-slate-300 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3 h-3 text-amber-600" />
                    <span>Imprimir Etiqueta</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Technical Specifications Matrix */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" /> Especificações Técnicas do Equipamento
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Potência Motor:</span>
                <strong className="text-slate-900 font-mono">{torno.potenciaCv || '5.0 CV'}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Largura Guias:</span>
                <strong className="text-slate-900 font-mono">{torno.barramentoLargura || '320 mm'}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Entre Pontas:</span>
                <strong className="text-slate-900 font-mono">{torno.distanciaEntrePontas || '1000 mm'}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block">Alimentação:</span>
                <strong className="text-slate-900 font-mono">{torno.tensaoEletrica || '380V Trifásico'}</strong>
              </div>
            </div>
          </div>

          {/* Lubrication & Fluid info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-600" /> Lubrificação Homologada & Óleo Recomendado
              </span>
              <span className="text-[10px] font-mono text-sky-900 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded font-bold">
                Última Lubrificação: {torno.ultimaLubrificacao || '2026-10-24'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {torno.oleoRecomendado || 'Mobil Vactra Nº 2 (ISO VG 68) para barramentos e prismas'}
            </p>
          </div>

          {/* Quick Maintenance History */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Histórico Recente de Intervenções
            </h3>
            {ultimasOrdens.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 italic">
                Nenhuma ordem de serviço pendente para este torno.
              </div>
            ) : (
              <div className="space-y-2">
                {ultimasOrdens.map(os => (
                  <div
                    key={os.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700">{os.id}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          os.tipo === 'Preventiva' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {os.tipo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{os.dataAbertura}</span>
                      </div>
                      <p className="text-slate-700 text-xs line-clamp-1">{os.descricao}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      os.status === 'Concluída' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      os.status === 'Em Andamento' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}>
                      {os.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Operating & Safety Manual (NR-12) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" /> Manual Técnico Básico & Segurança (NR-12)
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {torno.manualBasico || '1. Verificar nível de óleo nos visores antes de ligar o motor primário. 2. Acionar a bomba manual de lubrificação a cada 4 horas. 3. Não remover proteções mecânicas da placa giratória durante a usinagem.'}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200 shadow-xs"
          >
            Fechar
          </button>

          <button
            onClick={handleOpenOs}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Manutenção / Abrir Ordem de Serviço</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
