import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  CalendarClock, 
  DollarSign, 
  FileText, 
  Gauge, 
  Warehouse,
  Lock
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'abertura' 
  | 'gestao' 
  | 'cronograma' 
  | 'gastos' 
  | 'relatorios' 
  | 'mtbf' 
  | 'equipamentos';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onRestrictedClick?: (reason: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab, onRestrictedClick }) => {
  const { canAccessTab } = useApp();

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard, badge: null, num: '1' },
    { id: 'abertura' as TabType, label: 'Abertura de OS', icon: PlusCircle, badge: null, num: '2' },
    { id: 'gestao' as TabType, label: 'Gestão de OS', icon: ClipboardList, badge: null, num: '3' },
    { id: 'cronograma' as TabType, label: 'Cronograma', icon: CalendarClock, badge: null, num: '4' },
    { id: 'gastos' as TabType, label: 'Gastos & Custos', icon: DollarSign, badge: 'R$', num: '5', highlight: true },
    { id: 'relatorios' as TabType, label: 'Relatórios', icon: FileText, badge: 'PDF', num: '6', highlight: true },
    { id: 'mtbf' as TabType, label: 'MTBF & MTTR', icon: Gauge, badge: 'KPI', num: '7', highlight: true },
    { id: 'equipamentos' as TabType, label: 'Tornos (Máquinas)', icon: Warehouse, badge: null, num: '8' },
  ];

  const handleClick = (tabId: TabType) => {
    const access = canAccessTab(tabId);
    if (!access.allowed) {
      if (onRestrictedClick) {
        onRestrictedClick(access.reason || 'Acesso restrito para o perfil atual.');
      } else {
        alert(access.reason);
      }
      return;
    }
    onChangeTab(tabId);
  };

  return (
    <nav className="bg-white/95 border-b border-slate-200 sticky top-[57px] z-30 px-4 py-2 backdrop-blur-xs print:hidden shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const access = canAccessTab(tab.id);
          const isLocked = !access.allowed;

          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                isActive
                  ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : isLocked
                  ? 'border-slate-200 bg-slate-100/70 text-slate-400 hover:border-slate-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
              title={isLocked ? access.reason : undefined}
            >
              <span
                className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono font-bold ${
                  isActive
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {tab.num}
              </span>
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isLocked ? 'text-slate-400' : 'text-amber-600'}`} />
              <span>{tab.label}</span>
              {isLocked ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : tab.badge ? (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold uppercase ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 border border-slate-950/20'
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
    </nav>
  );
};
