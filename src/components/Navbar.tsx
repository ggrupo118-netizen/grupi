import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  CalendarClock, 
  FileText, 
  Gauge, 
  Warehouse,
  Lock,
  Factory,
  Wrench,
  DollarSign,
  ShieldCheck,
  Crown
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'abertura' 
  | 'gestao' 
  | 'cronograma' 
  | 'mtbf' 
  | 'relatorios' 
  | 'equipamentos'
  | 'gastos'
  | 'admin';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onRestrictedClick?: (reason: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab, onRestrictedClick }) => {
  const { canAccessTab, currentUser } = useApp();

  const tabs = [
    { 
      id: 'dashboard' as TabType, 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      badge: null, 
      num: '1'
    },
    { 
      id: 'abertura' as TabType, 
      label: 'Abertura de OS', 
      icon: PlusCircle, 
      badge: null, 
      num: '2'
    },
    { 
      id: 'gestao' as TabType, 
      label: 'Gestão de OS', 
      icon: ClipboardList, 
      badge: null, 
      num: '3'
    },
    { 
      id: 'cronograma' as TabType, 
      label: 'Preventivas', 
      icon: CalendarClock, 
      badge: null, 
      num: '4'
    },
    { 
      id: 'mtbf' as TabType, 
      label: 'MTBF & MTTR', 
      icon: Gauge, 
      badge: 'KPI', 
      num: '5'
    },
    { 
      id: 'relatorios' as TabType, 
      label: 'Relatórios Técnicos', 
      icon: FileText, 
      badge: null, 
      num: '6'
    },
    { 
      id: 'equipamentos' as TabType, 
      label: 'Tornos & NR-12', 
      icon: Warehouse, 
      badge: null, 
      num: '7'
    },
    { 
      id: 'gastos' as TabType, 
      label: 'Gastos & Custos', 
      icon: DollarSign, 
      badge: 'Admin', 
      num: '8'
    },
    { 
      id: 'admin' as TabType, 
      label: 'Painel Admin & Usuários', 
      icon: Crown, 
      badge: 'Admin', 
      num: '9'
    },
  ];

  const handleClick = (tabId: TabType) => {
    const access = canAccessTab(tabId);
    if (!access.allowed) {
      if (onRestrictedClick) {
        onRestrictedClick(access.reason || 'Acesso restrito: módulo reservado ao perfil de Administrador.');
      } else {
        alert(access.reason);
      }
      return;
    }
    onChangeTab(tabId);
  };

  const isAdmin = currentUser?.role === 'Administrador';
  const isOperator = currentUser?.role === 'Operador';

  return (
    <nav className="hidden sm:block bg-white/95 border-b border-slate-200 sticky top-[57px] z-30 px-4 py-2 backdrop-blur-xs print:hidden shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 py-0.5 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const access = canAccessTab(tab.id);
            const isLocked = !access.allowed;

            return (
              <button
                key={tab.id}
                onClick={() => handleClick(tab.id)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : isLocked
                    ? 'border-slate-200/80 bg-slate-100/60 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                }`}
                title={isLocked ? access.reason : undefined}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono font-bold ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : isLocked
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.num}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isLocked ? 'text-slate-400' : 'text-amber-600'}`} />
                <span>{tab.label}</span>
                {isLocked ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded font-mono">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Bloqueado</span>
                  </span>
                ) : tab.badge ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold uppercase ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : tab.badge === 'Admin'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Current Role Indicator Pill */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
            {isAdmin ? (
              <>
                <Crown className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-slate-700">Acesso: <strong className="text-indigo-700">Administrador Master (Total)</strong></span>
              </>
            ) : isOperator ? (
              <>
                <Factory className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-700">Acesso: <strong className="text-amber-700">Operador</strong></span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-700">Acesso: <strong className="text-sky-700">Técnico de Manutenção</strong></span>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
