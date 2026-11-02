import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Torno } from './types';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { LoginModal } from './components/LoginModal';
import { QrCodeScannerModal } from './components/QrCodeScannerModal';
import { EquipamentoQrCardModal } from './components/EquipamentoQrCardModal';
import { ShareAppModal } from './components/ShareAppModal';
import { DashboardTab } from './components/DashboardTab';
import { AberturaOsTab } from './components/AberturaOsTab';
import { GestaoOsTab } from './components/GestaoOsTab';
import { CronogramaTab } from './components/CronogramaTab';
import { GastosTab } from './components/GastosTab';
import { RelatoriosTab } from './components/RelatoriosTab';
import { MtbfMttrTab } from './components/MtbfMttrTab';
import { EquipamentosTab } from './components/EquipamentosTab';
import { AdminTab } from './components/AdminTab';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Lock, AlertCircle, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [scannedTorno, setScannedTorno] = useState<Torno | null>(null);
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);
  const [urlScanError, setUrlScanError] = useState<string | null>(null);

  const { currentUser, setPreSelectedTornoIdForOs, findTornoByQrCode, tornos, canAccessTab } = useApp();

  // Enforce RBAC tab restriction: redirect operator to dashboard if on forbidden tab
  useEffect(() => {
    if (currentUser) {
      const access = canAccessTab(activeTab);
      if (!access.allowed) {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab, canAccessTab]);

  // Detect URL parameter (ex: ?id=TORNO-01 or ?id=TR-01) from physical QR Code scan or PWA shortcuts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const equipamentoId = urlParams.get('id') || urlParams.get('torno') || urlParams.get('tag') || urlParams.get('equipamento');
      if (equipamentoId) {
        const found = findTornoByQrCode(equipamentoId);
        if (found) {
          setScannedTorno(found);
        } else {
          setUrlScanError(`Equipamento com ID "${equipamentoId}" não encontrado no sistema TornoMaint.`);
        }
      }

      // PWA Shortcuts & actions
      const action = urlParams.get('action');
      const tabParam = urlParams.get('tab');
      if (action === 'new-os') {
        setActiveTab('abertura');
      } else if (tabParam === 'qrcode') {
        setIsQrScannerOpen(true);
      } else if (tabParam === 'inventario') {
        setActiveTab('equipamentos');
      }
    }
  }, [tornos, findTornoByQrCode]);

  // Mandatory Login Gate: absolutely no view of shop floor or equipment until logged in
  if (!currentUser) {
    return (
      <div className="bg-slate-100 min-h-screen text-slate-900">
        <LoginScreen />
      </div>
    );
  }

  const handleOpenNewOs = () => {
    setActiveTab('abertura');
  };

  const handleNavigateToReport = (_osId: string) => {
    setActiveTab('relatorios');
  };

  const handleSelectTornoFromQr = (torno: Torno) => {
    setIsQrScannerOpen(false);
    setScannedTorno(torno);
  };

  const handleOpenOsForTorno = (tornoId: string) => {
    setPreSelectedTornoIdForOs(tornoId);
    setScannedTorno(null);
    setActiveTab('abertura');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Offline Connectivity Status Indicator */}
      <OfflineIndicator />

      {/* URL scan error banner if any */}
      {urlScanError && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{urlScanError}</span>
          </div>
          <button onClick={() => setUrlScanError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Industrial Header in crisp white */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Navigation Bar in white */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onRestrictedClick={(reason) => setRestrictedNotice(reason)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewOs={handleOpenNewOs}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {activeTab === 'abertura' && (
          <AberturaOsTab
            onSuccess={(tab) => setActiveTab(tab)}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {activeTab === 'gestao' && (
          <GestaoOsTab
            onOpenNewOs={handleOpenNewOs}
            onNavigateToReport={handleNavigateToReport}
          />
        )}

        {activeTab === 'cronograma' && (
          <CronogramaTab />
        )}

        {activeTab === 'gastos' && (
          <GastosTab />
        )}

        {activeTab === 'relatorios' && (
          <RelatoriosTab />
        )}

        {activeTab === 'mtbf' && (
          <MtbfMttrTab />
        )}

        {activeTab === 'equipamentos' && (
          <EquipamentosTab />
        )}

        {activeTab === 'admin' && (
          <AdminTab />
        )}
      </main>

      {/* Industrial Footer in white */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 print:hidden mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">
              TornoMaint &bull; Gestão Integrada de Manutenção &bull; Chão de Fábrica Conforme NR-12
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span>Operando como: <strong className="text-slate-800">{currentUser.nome}</strong> ({currentUser.role})</span>
            <span>&bull;</span>
            <span>Confiabilidade MTBF &bull; MTTR &bull; Identificação QR Code Ativa</span>
          </div>
        </div>
      </footer>

      {/* Touch-Friendly Bottom Bar on Mobile Devices */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />

      {/* Login & Switch Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* QR Code Scanner Camera & Simulator Modal */}
      <QrCodeScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onSelectTorno={handleSelectTornoFromQr}
      />

      {/* Equipment Detailed Information Card Modal (Opened upon QR Scan or URL ?id=TORNO-01) */}
      <EquipamentoQrCardModal
        torno={scannedTorno}
        isOpen={!!scannedTorno}
        onClose={() => setScannedTorno(null)}
        onOpenOsForTorno={handleOpenOsForTorno}
      />

      {/* Share Link & QR Code Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Permission Restriction Alert Modal */}
      {restrictedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Controle de Acesso por Perfil</h3>
              <p className="text-xs text-slate-600">{restrictedNotice}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p>Perfil atual: <strong className="text-amber-700">{currentUser.role}</strong> ({currentUser.nome})</p>
              <p>Todas as rotinas operacionais (OS, Preventivas, Confiabilidade e Tornos) estão liberadas. Módulos de custos financeiros e controle de contas são exclusivos do <strong>Administrador</strong>.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestrictedNotice(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-200"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setRestrictedNotice(null);
                  setIsLoginModalOpen(true);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Trocar de Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
