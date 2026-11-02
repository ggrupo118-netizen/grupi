import { Torno, OrdemServico, PreventivaRotina, Gasto, User } from '../types';

interface ExportDataOptions {
  tornos: Torno[];
  ordens: OrdemServico[];
  preventivas: PreventivaRotina[];
  gastos: Gasto[];
  currentUser: User | null;
  globalReliability?: {
    mtbf: number;
    mttr: number;
    disponibilidade: number;
    totalFalhas: number;
    totalHorasReparo: number;
  };
  liveUrl?: string;
}

export function generateStandaloneHtml(data: ExportDataOptions): string {
  const {
    tornos,
    ordens,
    preventivas,
    gastos,
    currentUser,
    globalReliability = {
      mtbf: 320,
      mttr: 4.2,
      disponibilidade: 98.7,
      totalFalhas: ordens.filter(o => o.tipo === 'Corretiva').length,
      totalHorasReparo: 28.5
    },
    liveUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-f6jbh4jmrbgc2n56il5gj4-234366601998.us-east1.run.app'
  } = data;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const operationalCount = tornos.filter(t => t.status === 'Operacional').length;
  const maintenanceCount = tornos.filter(t => t.status !== 'Operacional').length;
  const totalCost = gastos.reduce((acc, g) => acc + g.valor, 0);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TornoMaint - Relatório & Dossiê de Manutenção</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: #ffffff;
      border-bottom: 2px solid #f59e0b;
      padding: 24px 32px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      background: #f59e0b;
      color: #020617;
      font-weight: 900;
      font-size: 20px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid #d97706;
    }
    .brand h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand h1 span { color: #d97706; }
    .brand p { font-size: 12px; color: #64748b; }
    .header-meta {
      text-align: right;
      font-size: 12px;
      color: #475569;
    }
    .btn-live {
      display: inline-block;
      margin-top: 6px;
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
    }
    .btn-live:hover { background: #0369a1; }
    .content { padding: 32px; }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; }
    .kpi-val { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .badge-ok { color: #16a34a; }
    .badge-warn { color: #d97706; }
    .badge-danger { color: #dc2626; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) { background-color: #f8fafc; }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .tag-operacional { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .tag-manutencao { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .tag-parado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .tag-alta { background: #fee2e2; color: #991b1b; }
    .tag-media { background: #ffedd5; color: #9a3412; }
    .tag-baixa { background: #f1f5f9; color: #475569; }
    .code { font-family: monospace; font-weight: 700; color: #0f172a; }
    
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 32px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; border-radius: 0; }
      .btn-live, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="logo-badge">TM</div>
        <div>
          <h1>Torno<span>Maint</span> - Gestão de Manutenção</h1>
          <p>Relatório Consolidado de Ativos, Ordens de Serviço e Confiabilidade MTBF/MTTR</p>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Data de Emissão:</strong> ${dateFormatted}</div>
        <div><strong>Emissor:</strong> ${currentUser ? `${currentUser.nome} (${currentUser.role})` : 'PCM Industrial'}</div>
        <div><a href="${liveUrl}" target="_blank" class="btn-live">Acessar Sistema Online &rarr;</a></div>
      </div>
    </header>

    <div class="content">
      <!-- KPIs -->
      <h2 class="section-title">Indicadores Gerais de Manutenção</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tornos Operacionais</div>
          <div class="kpi-val badge-ok">${operationalCount} <span style="font-size:14px;color:#64748b">/ ${tornos.length}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Em Manutenção / Parados</div>
          <div class="kpi-val ${maintenanceCount > 0 ? 'badge-warn' : 'badge-ok'}">${maintenanceCount}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">MTBF Global (Confiabilidade)</div>
          <div class="kpi-val">${globalReliability.mtbf.toFixed(1)} <span style="font-size:14px;color:#64748b">horas</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">MTTR Médio (Tempo de Reparo)</div>
          <div class="kpi-val">${globalReliability.mttr.toFixed(1)} <span style="font-size:14px;color:#64748b">horas</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Disponibilidade Operacional</div>
          <div class="kpi-val badge-ok">${globalReliability.disponibilidade.toFixed(1)}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Custo Total de Reparos</div>
          <div class="kpi-val">R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <!-- Tornos -->
      <h2 class="section-title">Inventário de Tornos Mecânicos & CNC</h2>
      <table>
        <thead>
          <tr>
            <th>TAG / Patrimônio</th>
            <th>Modelo & Fabricante</th>
            <th>Setor</th>
            <th>Status</th>
            <th>Horímetro</th>
            <th>Última Lubrificação</th>
            <th>Próxima Preventiva</th>
          </tr>
        </thead>
        <tbody>
          ${tornos.map(t => {
            const statusClass = t.status === 'Operacional' ? 'tag-operacional' : t.status === 'Em Manutenção' ? 'tag-manutencao' : 'tag-parado';
            return `
            <tr>
              <td><span class="code">${t.patrimonio}</span></td>
              <td><strong>${t.modelo}</strong> (${t.anoFabricacao || '-'})</td>
              <td>${t.setor}</td>
              <td><span class="tag ${statusClass}">${t.status}</span></td>
              <td>${(t.horasOperadasEstimadas || 0).toLocaleString('pt-BR')} h</td>
              <td>${t.ultimaLubrificacao || '-'}</td>
              <td><strong>${t.proximaPreventiva || '-'}</strong></td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Ordens de Serviço -->
      <h2 class="section-title">Histórico e Controle de Ordens de Serviço (OS)</h2>
      <table>
        <thead>
          <tr>
            <th>Nº OS</th>
            <th>Torno</th>
            <th>Tipo</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Abertura</th>
            <th>Responsável</th>
            <th>Custo (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${ordens.map(o => {
            const torno = tornos.find(t => t.id === o.tornoId);
            const prioClass = o.prioridade === 'Alta' ? 'tag-alta' : o.prioridade === 'Média' ? 'tag-media' : 'tag-baixa';
            const statusClass = o.status === 'Concluída' ? 'tag-operacional' : o.status === 'Em Andamento' ? 'tag-manutencao' : 'tag-parado';
            return `
            <tr>
              <td><span class="code">${o.id}</span></td>
              <td>${torno ? `${torno.patrimonio} (${torno.modelo})` : o.tornoId}</td>
              <td><strong>${o.tipo}</strong></td>
              <td><span class="tag ${prioClass}">${o.prioridade}</span></td>
              <td><span class="tag ${statusClass}">${o.status}</span></td>
              <td>${o.dataAbertura}</td>
              <td>${o.responsavel || '-'}</td>
              <td>R$ ${(o.custoTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Manutenção Preventiva Programada -->
      <h2 class="section-title">Cronograma de Manutenção Preventiva</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Torno</th>
            <th>Atividade Programada</th>
            <th>Sistema</th>
            <th>Frequência</th>
            <th>Próxima Execução</th>
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          ${preventivas.map(p => {
            const torno = tornos.find(t => t.id === p.tornoId);
            return `
            <tr>
              <td><span class="code">${p.id}</span></td>
              <td>${torno ? torno.patrimonio : p.tornoId}</td>
              <td><strong>${p.titulo}</strong></td>
              <td>${p.sistemaAlvo}</td>
              <td>${p.frequencia}</td>
              <td><strong>${p.proximaExecucao}</strong></td>
              <td>${p.responsavelPadrao || '-'}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="no-print" style="margin-top:24px; text-align:center;">
        <button onclick="window.print()" style="background:#f59e0b; color:#020617; border:none; padding:10px 20px; font-weight:800; border-radius:8px; cursor:pointer; font-size:14px;">
          🖨️ Imprimir ou Salvar em PDF
        </button>
      </div>
    </div>

    <footer class="footer">
      <div>Sistema TornoMaint - Manutenção Preventiva, Preditiva e Corretiva de Tornos Mecânicos &bull; Conforme NR-12</div>
      <div>Link do Sistema: <a href="${liveUrl}" target="_blank" style="color:#0284c7;">${liveUrl}</a></div>
    </footer>
  </div>
</body>
</html>`;
}

export function downloadStandaloneHtml(data: ExportDataOptions, filename = 'relatorio_manutencao_tornos.html'): void {
  const html = generateStandaloneHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
