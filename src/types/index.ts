// Tipos principais do sistema
export interface Usuario {
  id: string;
  email: string;
  nome?: string;
  avatar_url?: string;
  tipo_perfil: 'admin' | 'profissional' | 'cliente';
  created_at: string;
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
  created_at: string;
  updated_at: string;
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
