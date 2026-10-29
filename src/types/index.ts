export type UserRole = 
  | 'Operador'
  | 'Técnico de Manutenção'
  | 'Administrador'
  | 'PCM Gestor' 
  | 'Mecânico Líder' 
  | 'Operador de Torno';

export interface User {
  id: string;
  username: string;
  nome: string;
  cargo: string;
  role: UserRole;
  email: string;
  avatar?: string;
  matricula: string;
}

export type TornoStatus = 'Operacional' | 'Em Manutenção' | 'Parado';

export interface Torno {
  id: string;
  patrimonio: string;
  modelo: string;
  fabricante: string;
  setor: string;
  dataAquisicao: string;
  status: TornoStatus;
  potenciaCv?: string;
  distanciaEntrePontas?: string;
  barramentoLargura?: string;
  tensaoEletrica?: string;
  anoFabricacao?: number;
  observacoes?: string;
  horasOperadasEstimadas?: number;
  codigoQr?: string;
  aliases?: string[];
  oleoRecomendado?: string;
  ultimaLubrificacao?: string;
  ultimaManutencao?: string;
  proximaPreventiva?: string;
  responsavel?: string;
  manualBasico?: string;
  normasSeguranca?: string[];
}

export type OsTipo = 'Corretiva' | 'Preventiva';
export type OsPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type OsStatus = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

export interface OrdemServico {
  id: string;
  tornoId: string;
  tipo: OsTipo;
  prioridade: OsPrioridade;
  categoriaComponente: string;
  descricao: string;
  solicitante: string;
  responsavel: string;
  dataAbertura: string;
  previsaoConclusao: string;
  status: OsStatus;
  paradaMaquina: boolean;
  pecasNecessarias?: string;
  dataFechamento?: string;
  horasTrabalhadas?: number;
  causaRaiz?: string;
  pecasUtilizadas?: string;
  tecnicoFechamento?: string;
  observacoesFinais?: string;
  custoTotal?: number;
}

export interface PreventivaRotina {
  id: string;
  tornoId: string;
  titulo: string;
  frequencia: 'Semanal' | 'Quinzenal' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  sistemaAlvo: string;
  ultimaExecucao: string;
  proximaExecucao: string;
  itensChecklist: string[];
  responsavelPadrao: string;
  duracaoEstimadaMinutos: number;
}

export type GastoCategoria = 
  | 'Peças de Reposição' 
  | 'Óleos e Lubrificantes' 
  | 'Ferramental e Acessórios' 
  | 'Serviços Terceirizados' 
  | 'Mão de Obra Externa' 
  | 'EPI e Consumíveis';

export interface Gasto {
  id: string;
  tornoId: string;
  osId?: string;
  categoria: GastoCategoria;
  descricao: string;
  valor: number;
  data: string;
  fornecedor: string;
  notaFiscal?: string;
  registradoPor: string;
}

export interface TornoReliabilityStats {
  torno: Torno;
  numFalhas: number;
  horasReparo: number;
  horasOperadas: number;
  mtbf: number;
  mttr: number;
  disponibilidade: number;
  taxaFalhas: number;
  custoManutencao: number;
  criticidade: 'Alta' | 'Média' | 'Baixa';
}
