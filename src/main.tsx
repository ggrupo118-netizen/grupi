import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline caching & auto-updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('TornoMaint: Nova versão disponível, atualizando cache em segundo plano...');
  },
  onOfflineReady() {
    console.log('TornoMaint: Aplicativo pronto para trabalhar 100% offline no chão de fábrica.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
