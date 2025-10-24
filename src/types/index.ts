// Tipos principais do sistema
export interface Usuario {
  id: string;
  email: string;
  nome?: string;
  avatar_url?: string;
  tipo_perfil: 'admin' | 'profissional' | 'cliente';
  created_at: string;
}

export interface FichaAnamnese {
  tipo_pele?: string;
  alergias?: string;
  medicamentos_uso?: string;
  cirurgias_previas?: string;
  tratamentos_esteticos_anteriores?: string;
  exposicao_solar?: string;
  gestante_lactante?: string;
  doencas_preexistentes?: string;
  objetivo_tratamento?: string;
  observacoes_adicionais?: string;
  assinatura_digital?: string; // Base64 da assinatura
  data_preenchimento?: string;
}

export interface Cliente {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  avatar_url?: string;
  observacoes?: string;
  ficha_anamnese?: FichaAnamnese;
  created_at: string;
  updated_at: string;
}


export interface HorarioTrabalho {
  dia_semana: number; // 0-6 (Domingo-Sábado)
  inicio: string; // HH:mm
  fim: string; // HH:mm
  intervalo_inicio?: string;
  intervalo_fim?: string;
}

export interface DiaFolgaManual {
  data: string; // YYYY-MM-DD
  descricao: string;
  dia_todo: boolean;
  horario_inicio?: string;
  horario_fim?: string;
}

export interface Profissional {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  avatar_url?: string;
  horarios?: HorarioTrabalho[];
  dias_folga?: number[];
  folgas_manuais?: DiaFolgaManual[];
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  duracao_minutos: number;
  valor: number;
  categoria?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agendamento {
  id: string;
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  observacoes?: string;
  avaliacao?: number;
  comentario_avaliacao?: string;
  created_at: string;
  updated_at: string;
  // Relações populadas
  cliente?: Cliente;
  profissional?: Profissional;
  servico?: Servico;
}

export interface ConfiguracaoNegocio {
  id: string;
  nome_negocio: string;
  descricao?: string;
  logo_url?: string;
  cor_primaria?: string;
  slogan?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  horarios_funcionamento?: HorarioTrabalho[];
  whatsapp_api_key?: string;
  whatsapp_numero?: string;
  gemini_api_key?: string;
  gemini_prompt?: string;
  idioma: string;
}
