import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  QrCode, 
  Warehouse,
  Menu,
  X,
  CalendarClock,
  Gauge,
  FileText,
  DollarSign,
  Crown,
  Lock,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { TabType } from './Navbar';
import { PWAInstallModal } from './PWAInstallModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQrScanner: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQrScanner,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const { isInstalled, install, isIOS } = usePWAInstall();
  const { currentUser, canAccessTab } = useApp();

  const handleInstallClick = async () => {
    if (isIOS) {
      setInstallModalOpen(true);
      return;
    }
    const success = await install();
    if (!success) {
      setInstallModalOpen(true);
    }
  };

  const handleTabClick = (tab: TabType) => {
    const access = canAccessTab(tab);
    if (access.allowed) {
      onChangeTab(tab);
      setIsMenuDrawerOpen(false);
    } else {
      alert(access.reason || 'Módulo restrito ao Administrador.');
    }
  };

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard Geral', icon: LayoutDashboard, desc: 'Visão do chão de fábrica e alertas' },
    { id: 'abertura' as TabType, label: 'Abertura de O.S.', icon: PlusCircle, desc: 'Abrir chamado de corretiva ou preventiva' },
    { id: 'gestao' as TabType, label: 'Gestão de O.S.', icon: ClipboardList, desc: 'Acompanhar, executar e concluir ordens' },
    { id: 'cronograma' as TabType, label: 'Manutenções Preventivas', icon: CalendarClock, desc: 'Checklists periódicos e lubrificação' },
    { id: 'mtbf' as TabType, label: 'KPIs MTBF & MTTR', icon: Gauge, desc: 'Métricas de confiabilidade e disponibilidade' },
    { id: 'relatorios' as TabType, label: 'Relatórios Técnicos', icon: FileText, desc: 'Históricos impressos e prontuários' },
    { id: 'equipamentos' as TabType, label: 'Tornos & NR-12', icon: Warehouse, desc: 'Inventário completo e guias de barramento' },
    { id: 'gastos' as TabType, label: 'Gastos & Custos', icon: DollarSign, desc: 'Orçamentos e compras (Admin)', adminOnly: true },
    { id: 'admin' as TabType, label: 'Painel Admin & Usuários', icon: Crown, desc: 'Governança e colaboradores (Admin)', adminOnly: true },
  ];

  return (
    <>
      {/* Barra Fixa Embaixo da Tela - Touch friendly (min 44px de altura) */}
      <nav 
        aria-label="Navegação móvel de chão de fábrica" 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] print:hidden w-full max-w-full"
      >
        <div className="flex items-center justify-around max-w-md mx-auto w-full">
          {/* 1. Início */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Início</span>
          </button>

          {/* 2. Tornos */}
          <button
            onClick={() => handleTabClick('equipamentos')}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'equipamentos' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Warehouse className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Tornos</span>
          </button>

          {/* 3. Central Elevated QR Scanner */}
          <button
            onClick={onOpenQrScanner}
            className="min-h-[50px] min-w-[50px] flex items-center justify-center -mt-5 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-lg border-2 border-white active:scale-95 transition"
            title="Escanear QR Code do Torno"
            aria-label="Escanear QR Code"
          >
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* 4. Ordens de Serviço */}
          <button
            onClick={() => handleTabClick('gestao')}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'gestao' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">O.S.</span>
          </button>

          {/* 5. Menu Hambúrguer Completo */}
          <button
            onClick={() => setIsMenuDrawerOpen(true)}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              isMenuDrawerOpen ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
            aria-label="Abrir Menu Completo"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </nav>

      {/* Drawer / Menu Hambúrguer deslizante no celular */}
      {isMenuDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden w-full">
            {/* Header do Menu */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Módulos do Sistema TornoMaint</h3>
                  <p className="text-[11px] text-slate-500">Selecione uma área para navegar</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className="w-9 h-9 min-h-[36px] rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de itens do menu - todos com min-h-[44px] */}
            <div className="p-3 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const access = canAccessTab(item.id);
                const isLocked = !access.allowed;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full min-h-[44px] py-3 px-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                      isActive 
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300' 
                        : isLocked
                        ? 'opacity-50 text-slate-400 bg-slate-50/50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.adminOnly && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">Admin</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                    </div>

                    <div>
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}

              {!isInstalled && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      handleInstallClick();
                    }}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-sky-50 text-sky-800 font-bold border border-sky-200 flex items-center justify-center gap-2 text-xs"
                  >
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>Instalar TornoMaint no Celular</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </>
  );
};
