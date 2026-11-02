import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <aside
      aria-label="Notificação de status offline"
      className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md sticky top-0 z-50 border-b border-amber-600"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
        <span>
          <strong>Modo Offline Ativo:</strong> Você está desconectado da rede. O aplicativo TornoMaint continua operacional em cache com seus dados salvos localmente.
        </span>
      </div>
    </aside>
  );
};
