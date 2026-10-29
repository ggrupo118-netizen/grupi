import { Torno, OrdemServico, PreventivaRotina, Gasto, User } from '../types';

export const SEED_USERS: { user: User; passwordHash: string }[] = [
  {
    user: {
      id: 'USR-01',
      username: 'admin',
      nome: 'Eng. Ricardo Mendes',
      cargo: 'Coordenador de Manutenção e PCM',
      role: 'Administrador',
      email: 'ricardo.mendes@tornomaint.ind.br',
      matricula: 'ADM-001',
      avatar: 'RM'
    },
    passwordHash: 'admin123'
  },
  {
    user: {
      id: 'USR-02',
      username: 'tecnico',
      nome: 'Carlos Eduardo Oliveira',
      cargo: 'Técnico de Manutenção Mecânica',
      role: 'Técnico de Manutenção',
      email: 'carlos.mecanica@tornomaint.ind.br',
      matricula: 'TEC-202',
      avatar: 'CO'
    },
    passwordHash: 'tec123'
  },
  {
    user: {
      id: 'USR-03',
      username: 'operador',
      nome: 'José Geraldo Santos',
      cargo: 'Torneiro Mecânico Operacional',
      role: 'Operador',
      email: 'jose.santos@tornomaint.ind.br',
      matricula: 'OP-105',
      avatar: 'JS'
    },
    passwordHash: 'op123'
  }
];

export const SEED_TORNOS: Torno[] = [
  {
    id: 'TRN-001',
    patrimonio: 'TR-01',
    codigoQr: 'TR-01',
    aliases: ['TORNO-01', 'TORNO-1', 'TRN-001', 'TR-01', 'A1', 'TORNO-A1'],
    modelo: 'Mascote MS-205',
    fabricante: 'Nardini',
    setor: 'Galpão 1 - Ferramentaria',
    dataAquisicao: '2019-04-15',
    status: 'Operacional',
    potenciaCv: '5.0 CV',
    distanciaEntrePontas: '1000 mm',
    barramentoLargura: '320 mm',
    tensaoEletrica: '380V Trifásico',
    anoFabricacao: 2019,
    observacoes: 'Torno universal de precisão. Equipado com régua digital Mitutoyo de 2 eixos e placa universal de 3 castanhas Ø200mm.',
    horasOperadasEstimadas: 1850,
    oleoRecomendado: 'Mobil Vactra Nº 2 (ISO VG 68) nas guias / Mobil DTE 25 no cabeçote',
    ultimaLubrificacao: '2026-10-24',
    ultimaManutencao: '15/09/2026',
    proximaPreventiva: '15/11/2026',
    responsavel: 'Carlos Técnico',
    manualBasico: '1. Acionar bomba manual de lubrificação centralizada no início de cada turno. 2. Checar folga axial antes de desbastes pesados. 3. Limpar cavacos com espátula de latão ao término do lote. 4. Manter rotação máxima em 1800 RPM.',
    normasSeguranca: [
      'NR-12: Proibido trabalhar com a proteção acrílica da placa basculada.',
      'NR-06: Uso obrigatório de óculos de proteção ampla visão e protetor auricular.',
      'Segurança Mecânica: Estritamente proibido o uso de luvas e mangas compridas soltas próximo à placa giratória.',
      'Parada de Emergência: Testar o botão tipo cogumelo no painel frontal antes de ligar o motor.'
    ]
  },
  {
    id: 'TRN-002',
    patrimonio: 'TR-02',
    codigoQr: 'TR-02',
    aliases: ['TORNO-02', 'TORNO-2', 'TRN-002', 'TR-02', 'B2', 'TORNO-CNC-01', 'TORNO-B2'],
    modelo: 'Centur 30D CNC',
    fabricante: 'Indústrias Romi',
    setor: 'Galpão 1 - Usinagem CNC',
    dataAquisicao: '2021-08-10',
    status: 'Em Manutenção',
    potenciaCv: '12.5 CV',
    distanciaEntrePontas: '1000 mm',
    barramentoLargura: '380 mm',
    tensaoEletrica: '380V Trifásico',
    anoFabricacao: 2021,
    observacoes: 'Comando Siemens Sinumerik 828D. Torre hidráulica de 8 posições. Utiliza óleo hidráulico Tellus S2 M 46.',
    horasOperadasEstimadas: 2420,
    oleoRecomendado: 'Shell Tellus S2 MX 46 (hidráulico) / Shell Tonna S3 M 68 (guias)',
    ultimaLubrificacao: '2026-10-22',
    ultimaManutencao: '10/08/2026',
    proximaPreventiva: '30/10/2026',
    responsavel: 'Ana Manutenção',
    manualBasico: '1. Referenciar eixos X e Z antes de qualquer usinagem automática. 2. Monitorar temperatura do servomotor Siemens. 3. Concentração do fluido solúvel entre 6% e 8% Brix. 4. Não abrir portas de intertravamento em ciclo M03.',
    normasSeguranca: [
      'NR-12: Sistema de intertravamento categoria 4 com chave de segurança codificada.',
      'NR-10: Painel elétrico traseiro acessível apenas por eletricistas habilitados.',
      'EPI: Óculos de proteção e calçado com biqueira de composite.',
      'Fluido: Uso de creme de proteção dérmica contra óleo solúvel sintético.'
    ]
  },
  {
    id: 'TRN-003',
    patrimonio: 'TR-03',
    codigoQr: 'TR-03',
    modelo: 'Tormax 30-A',
    fabricante: 'Indústrias Romi',
    setor: 'Galpão 2 - Usinagem Pesada',
    dataAquisicao: '2017-02-20',
    status: 'Operacional',
    potenciaCv: '7.5 CV',
    distanciaEntrePontas: '1500 mm',
    barramentoLargura: '350 mm',
    tensaoEletrica: '380V Trifásico',
    anoFabricacao: 2017,
    observacoes: 'Torno mecânico pesado para eixos e flanges de grande porte. Barramento temperado por indução.',
    horasOperadasEstimadas: 3100,
    oleoRecomendado: 'Ipiranga Ipitur 68 nas guias e prismas / Lubrax Industrial EGF 100 PS na Caixa Norton',
    ultimaLubrificacao: '2026-10-25',
    manualBasico: '1. Verificar visor de nível da Caixa Norton e cabeçote fixo. 2. Sempre utilizar luneta móvel/fixa para eixos acima de 800mm de comprimento. 3. Travar carro transversal antes de operações de faceamento.',
    normasSeguranca: [
      'NR-12: Proteção traseira contra projeção de cavacos e fluido.',
      'Segurança: Nunca tentar frear a placa com a mão ou alavanca de madeira.',
      'EPI Obrigatório: Protetor auditivo tipo concha e óculos de proteção UV.'
    ]
  },
  {
    id: 'TRN-004',
    patrimonio: 'TR-04',
    codigoQr: 'TR-04',
    modelo: 'L-1640',
    fabricante: 'Clever / Debmaq',
    setor: 'Galpão 2 - Oficina de Manutenção',
    dataAquisicao: '2022-11-05',
    status: 'Operacional',
    potenciaCv: '4.0 CV',
    distanciaEntrePontas: '1000 mm',
    barramentoLargura: '300 mm',
    tensaoEletrica: '220V Trifásico',
    anoFabricacao: 2022,
    observacoes: 'Utilizado para usinagem de buchas, roscas especiais e recuperação de eixos da própria manutenção.',
    horasOperadasEstimadas: 1200,
    oleoRecomendado: 'Mobil Vactra Nº 2 (ISO VG 68)',
    ultimaLubrificacao: '2026-10-26',
    manualBasico: '1. Testar pedal de freio mecânico antes da operação. 2. Aplicar graxa de lítio no contra-ponto a cada 4 horas de uso. 3. Não exceder carga máxima de 250 kg entre pontas.',
    normasSeguranca: [
      'NR-12: Freio de pedal com microinterruptor elétrico de corte de potência.',
      'EPI: Calçado de segurança com biqueira e óculos de proteção.',
      'Proibido trabalhar com cabelos compridos soltos ou adornos (relógios, alianças).'
    ]
  },
  {
    id: 'TRN-005',
    patrimonio: 'TR-05',
    codigoQr: 'TR-05',
    modelo: 'Nodus 325',
    fabricante: 'Nardini',
    setor: 'Galpão 3 - Linha de Desbaste',
    dataAquisicao: '2016-06-12',
    status: 'Parado',
    potenciaCv: '10.0 CV',
    distanciaEntrePontas: '2000 mm',
    barramentoLargura: '400 mm',
    tensaoEletrica: '380V Trifásico',
    anoFabricacao: 2016,
    observacoes: 'Aguardando substituição do rolamento cônico duplo de encosto do cabeçote principal. Parado para evitar danos ao barramento.',
    horasOperadasEstimadas: 3890,
    oleoRecomendado: 'Mobil DTE 25 (cabeçote) / Vactra 2 (barramento)',
    ultimaLubrificacao: '2026-10-18',
    manualBasico: 'EQUIPAMENTO PARADO (LOCKOUT/TAGOUT ATIVO). Não ligar sem prévia autorização da chefia de manutenção.',
    normasSeguranca: [
      'NR-10 / NR-12: Máquina com cadeado e cartão de bloqueio (LOTO).',
      'Proibida energização até a conclusão da OS-2026-002.'
    ]
  }
];

export const SEED_ORDENS: OrdemServico[] = [
  {
    id: 'OS-2026-001',
    tornoId: 'TRN-002',
    tipo: 'Corretiva',
    prioridade: 'Urgente',
    descricao: 'Torno parou durante usinagem com alarme 25201 de sobrecorrente no acionamento do fuso. Verificado aquecimento próximo à caixa do servomotor.',
    solicitante: 'Eduardo Silveira (Operador CNC)',
    responsavel: 'Marcos Eletromecânico',
    dataAbertura: '2026-10-25',
    previsaoConclusao: '2026-10-27',
    status: 'Em Andamento',
    paradaMaquina: true,
    categoriaComponente: 'Sistema Elétrico/Motor',
    pecasNecessarias: 'Ventilador auxiliar do servo drive e fusíveis de ação rápida gL 32A',
    custoTotal: 1250
  },
  {
    id: 'OS-2026-002',
    tornoId: 'TRN-005',
    tipo: 'Corretiva',
    prioridade: 'Alta',
    descricao: 'Ruído estridente e vibração excessiva no cabeçote ao engatar rotações acima de 600 RPM. Acabamento das peças usinadas com marcas de trepidação.',
    solicitante: 'Antônio Ferreira (Líder de Usinagem)',
    responsavel: 'Carlos Mecânico',
    dataAbertura: '2026-10-23',
    previsaoConclusao: '2026-10-28',
    status: 'Aberta',
    paradaMaquina: true,
    categoriaComponente: 'Cabeçote Fixo',
    pecasNecessarias: 'Rolamento de rolos cônicos SKF 30214 e retentor de nitrílica 70x90x10',
    custoTotal: 890
  },
  {
    id: 'OS-2026-003',
    tornoId: 'TRN-001',
    tipo: 'Preventiva',
    prioridade: 'Média',
    descricao: 'Execução do plano de lubrificação quinzenal de barramento e inspeção dos raspadores de cavacos das guias prismáticas.',
    solicitante: 'Planejamento PCM',
    responsavel: 'Carlos Mecânico',
    dataAbertura: '2026-10-25',
    previsaoConclusao: '2026-10-26',
    status: 'Aberta',
    paradaMaquina: false,
    categoriaComponente: 'Barramento/Guias',
    pecasNecessarias: '2 Litros de Óleo Mobil Vactra Nº 2 (ISO VG 68)',
    custoTotal: 180
  },
  {
    id: 'OS-2026-004',
    tornoId: 'TRN-003',
    tipo: 'Corretiva',
    prioridade: 'Baixa',
    descricao: 'Vazamento contínuo de óleo pela alavanca seletora de passos de rosca da Caixa Norton. Gotejamento sujando a bandeja inferior.',
    solicitante: 'José Geraldo (Operador)',
    responsavel: 'Roberto Técnico',
    dataAbertura: '2026-10-19',
    previsaoConclusao: '2026-10-22',
    status: 'Concluída',
    paradaMaquina: false,
    categoriaComponente: 'Caixa Norton',
    pecasNecessarias: 'Anéis O-ring NBR 18x2.5mm',
    dataFechamento: '2026-10-22',
    horasTrabalhadas: 2.5,
    causaRaiz: 'O-ring de vedação ressecado devido à ação térmica e tempo de uso.',
    pecasUtilizadas: '2x Anéis O-ring NBR 18x2.5mm, 1x Bisnaga Loctite 518 flange seal',
    tecnicoFechamento: 'Roberto Técnico',
    observacoesFinais: 'Alavanca desmontada, eixo limpo com desengraxante, anéis trocados. Testado sob rotação contínua sem vazamento.',
    custoTotal: 240
  },
  {
    id: 'OS-2026-005',
    tornoId: 'TRN-004',
    tipo: 'Preventiva',
    prioridade: 'Média',
    descricao: 'Revisão geral trimestral: verificação do cabeçote móvel (alinhamento e contra-ponto) e teste do freio mecânico de pedal.',
    solicitante: 'Planejamento PCM',
    responsavel: 'Carlos Mecânico',
    dataAbertura: '2026-10-14',
    previsaoConclusao: '2026-10-16',
    status: 'Concluída',
    paradaMaquina: true,
    categoriaComponente: 'Geral',
    dataFechamento: '2026-10-16',
    horasTrabalhadas: 3.0,
    causaRaiz: 'Preventiva de rotina cumprida 100%.',
    pecasUtilizadas: 'Graxa de lítio para rolamentos NLGI 2, lixa d’água 600',
    tecnicoFechamento: 'Carlos Mecânico',
    observacoesFinais: 'Freio de pedal regulado, contra-ponto ajustado a zero no relógio comparador. Equipamento liberado para a ferramentaria.',
    custoTotal: 150
  },
  {
    id: 'OS-2026-006',
    tornoId: 'TRN-001',
    tipo: 'Corretiva',
    prioridade: 'Média',
    descricao: 'Substituição das correias em V do motor primário após rompimento parcial da segunda via de tração durante operação de roscagem.',
    solicitante: 'Carlos Mecânico',
    responsavel: 'Carlos Mecânico',
    dataAbertura: '2026-10-05',
    previsaoConclusao: '2026-10-06',
    status: 'Concluída',
    paradaMaquina: true,
    categoriaComponente: 'Sistema Elétrico/Motor',
    dataFechamento: '2026-10-06',
    horasTrabalhadas: 1.8,
    causaRaiz: 'Fadiga mecânica e ressecamento natural das correias de borracha.',
    pecasUtilizadas: 'Jogo de 3 correias trapezoidais Gates Hi-Power B-54',
    tecnicoFechamento: 'Carlos Mecânico',
    observacoesFinais: 'Polias alinhadas a laser e tensionamento aferido conforme tabela do fabricante.',
    custoTotal: 380
  }
];

export const SEED_PREVENTIVAS: PreventivaRotina[] = [
  {
    id: 'PLN-001',
    tornoId: 'TRN-001',
    titulo: 'Lubrificação das Guias e Barramento (Way Lube 68)',
    frequencia: 'Quinzenal',
    sistemaAlvo: 'Barramento/Guias',
    ultimaExecucao: '2026-10-10',
    proximaExecucao: '2026-10-25',
    itensChecklist: [
      'Limpar cavacos finos das guias com espátula de latão e pano seco',
      'Abastecer bomba manual de lubrificação centralizada (óleo ISO VG 68)',
      'Verificar vazão nos orifícios do carro transversal e longitudinal',
      'Checar raspadores de cavacos em poliuretano das extremidades do carro'
    ],
    responsavelPadrao: 'Carlos Mecânico',
    duracaoEstimadaMinutos: 30
  },
  {
    id: 'PLN-002',
    tornoId: 'TRN-002',
    titulo: 'Troca do Fluido de Corte e Limpeza do Reservatório',
    frequencia: 'Mensal',
    sistemaAlvo: 'Refrigeração/Cavacos',
    ultimaExecucao: '2026-09-30',
    proximaExecucao: '2026-10-30',
    itensChecklist: [
      'Decantar cavacos e lamas de ferro fundido do tanque de refrigeração',
      'Verificar concentração com refratômetro óptico (Brix 6-8%)',
      'Limpar tela de sucção e filtro magnético da bomba de refrigeração',
      'Desobstruir bicos articulados de fluido refrigerante'
    ],
    responsavelPadrao: 'Marcos Eletromecânico',
    duracaoEstimadaMinutos: 60
  },
  {
    id: 'PLN-003',
    tornoId: 'TRN-003',
    titulo: 'Verificação de Nível e Drenagem da Caixa Norton e Cabeçote',
    frequencia: 'Trimestral',
    sistemaAlvo: 'Caixa Norton',
    ultimaExecucao: '2026-08-12',
    proximaExecucao: '2026-11-10',
    itensChecklist: [
      'Inspecionar visor de nível do cabeçote fixo (óleo ISO VG 46)',
      'Checar visor da Caixa Norton de roscas e avanços',
      'Verificar ruídos anormais no engrenamento com estetoscópio mecânico',
      'Inspecionar vedação de gaxetas e retentores de saída'
    ],
    responsavelPadrao: 'Carlos Mecânico',
    duracaoEstimadaMinutos: 45
  },
  {
    id: 'PLN-004',
    tornoId: 'TRN-004',
    titulo: 'Inspeção de Tensão das Correias Trapezoidais do Motor',
    frequencia: 'Trimestral',
    sistemaAlvo: 'Sistema Elétrico/Motor',
    ultimaExecucao: '2026-07-26',
    proximaExecucao: '2026-10-24',
    itensChecklist: [
      'Desconectar chave geral e aplicar procedimento de Lockout/Tagout',
      'Inspecionar desgaste e trincas nas correias em V perfil B',
      'Medir deflexão com tensiômetro mecânico (10 a 15mm sob pressão manual)',
      'Checar aperto dos parafusos do esticador do motor'
    ],
    responsavelPadrao: 'Roberto Técnico',
    duracaoEstimadaMinutos: 40
  },
  {
    id: 'PLN-005',
    tornoId: 'TRN-005',
    titulo: 'Revisão de Folga da Régua Cônica e Fuso Transversal',
    frequencia: 'Semestral',
    sistemaAlvo: 'Placa e Fuso',
    ultimaExecucao: '2026-04-29',
    proximaExecucao: '2026-10-21',
    itensChecklist: [
      'Acoplar relógio comparador com base magnética no carro porta-ferramentas',
      'Medir folga axial do fuso trapezoidal (tolerância máxima 0,08mm)',
      'Ajustar parafuso de pressão da régua cônica de latão do rabo de andorinha',
      'Testar suavidade de deslocamento manual em todo o curso'
    ],
    responsavelPadrao: 'Carlos Mecânico',
    duracaoEstimadaMinutos: 90
  }
];

export const SEED_GASTOS: Gasto[] = [
  {
    id: 'GST-2026-001',
    tornoId: 'TRN-002',
    osId: 'OS-2026-001',
    categoria: 'Peças de Reposição',
    descricao: 'Conjunto Ventilador Axiais 24V e Conjunto Fusíveis Siemens gL 32A',
    valor: 1250.00,
    data: '2026-10-26',
    fornecedor: 'Siemens Automação Brasil',
    notaFiscal: 'NF-e 88412',
    registradoPor: 'Eng. Ricardo Mendes'
  },
  {
    id: 'GST-2026-002',
    tornoId: 'TRN-005',
    osId: 'OS-2026-002',
    categoria: 'Peças de Reposição',
    descricao: 'Rolamento de rolos cônicos de precisão SKF 30214 e Retentor Sabó',
    valor: 890.00,
    data: '2026-10-24',
    fornecedor: 'Distribuidora Rolapeças Industrial',
    notaFiscal: 'NF-e 45210',
    registradoPor: 'Carlos Eduardo Oliveira'
  },
  {
    id: 'GST-2026-003',
    tornoId: 'TRN-001',
    osId: 'OS-2026-003',
    categoria: 'Óleos e Lubrificantes',
    descricao: 'Balde de 20 Litros Óleo Lubrificante de Barramento Mobil Vactra Nº 2',
    valor: 485.50,
    data: '2026-10-22',
    fornecedor: 'Cosan Lubrificantes Mobil',
    notaFiscal: 'NF-e 91024',
    registradoPor: 'Eng. Ricardo Mendes'
  },
  {
    id: 'GST-2026-004',
    tornoId: 'TRN-003',
    categoria: 'Serviços Terceirizados',
    descricao: 'Calibração metrológica com interferômetro e emissão de laudo RBC',
    valor: 1850.00,
    data: '2026-10-18',
    fornecedor: 'Mitutoyo Metrologia Sul',
    notaFiscal: 'NF-e 12903',
    registradoPor: 'Mariana Duarte'
  },
  {
    id: 'GST-2026-005',
    tornoId: 'TRN-001',
    osId: 'OS-2026-006',
    categoria: 'Peças de Reposição',
    descricao: 'Jogo 3 Correias Trapezoidais Gates Hi-Power B-54',
    valor: 380.00,
    data: '2026-10-06',
    fornecedor: 'Borrachas & Correias Piratininga',
    notaFiscal: 'NF-e 33901',
    registradoPor: 'Carlos Eduardo Oliveira'
  },
  {
    id: 'GST-2026-006',
    tornoId: 'TRN-004',
    osId: 'OS-2026-005',
    categoria: 'Óleos e Lubrificantes',
    descricao: 'Cartucho Graxa Mobilux EP 2 para alta pressão (Caixa com 6 un)',
    valor: 260.00,
    data: '2026-10-15',
    fornecedor: 'Cosan Lubrificantes Mobil',
    notaFiscal: 'NF-e 90118',
    registradoPor: 'Carlos Eduardo Oliveira'
  },
  {
    id: 'GST-2026-007',
    tornoId: 'TRN-003',
    categoria: 'Ferramental e Acessórios',
    descricao: 'Castanhas moles temperáveis de reposição para placa de 3 castanhas Ø250mm',
    valor: 640.00,
    data: '2026-10-11',
    fornecedor: 'Ferdig Fixações Mecânicas',
    notaFiscal: 'NF-e 77312',
    registradoPor: 'José Geraldo Santos'
  },
  {
    id: 'GST-2026-008',
    tornoId: 'TRN-002',
    categoria: 'Óleos e Lubrificantes',
    descricao: 'Tambor 200L Óleo Hidráulico Shell Tellus S2 MX 46 para torre e barramento CNC',
    valor: 3120.00,
    data: '2026-10-02',
    fornecedor: 'Shell Indústria & Lubrificantes',
    notaFiscal: 'NF-e 10459',
    registradoPor: 'Eng. Ricardo Mendes'
  },
  {
    id: 'GST-2026-009',
    tornoId: 'TRN-005',
    categoria: 'EPI e Consumíveis',
    descricao: 'Trapos industriais esterilizados, desengraxante biodegradável e espátulas de latão',
    valor: 215.00,
    data: '2026-10-14',
    fornecedor: 'Suprimentos Químicos Alpha',
    notaFiscal: 'NF-e 55019',
    registradoPor: 'Carlos Eduardo Oliveira'
  }
];

export const DEFAULT_BUDGET_MENSUAL = 15000.00;
