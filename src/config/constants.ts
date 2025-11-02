/**
 * Configurações e constantes centralizadas da aplicação
 * 
 * SEGURANÇA:
 * - Chaves públicas podem ficar aqui
 * - Chaves privadas DEVEM estar nos Secrets do Supabase
 * - Nunca exponha chaves secretas no código do frontend
 */

// Configurações do Supabase (públicas)
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://zojdfdoyuhcshrtwibzx.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvamRmZG95dWhjc2hydHdpYnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDg0ODksImV4cCI6MjA3NjcyNDQ4OX0.4NNkc8B_2ZyYEsS6K9ahEc501SsDyS8GGN8iT3-g48M',
};

// Cores dos serviços para a agenda
export const CORES_SERVICOS: { [key: string]: string } = {
  'Corte de Cabelo': '#3B82F6',
  'Barba': '#10B981',
  'Manicure': '#F59E0B',
  'Massagem': '#8B5CF6',
  'Design Sobrancelha': '#EF4444',
  default: '#6B7280'
};

// Configurações de horário
export const HORARIO_CONFIG = {
  horaInicio: 8,
  horaFim: 20,
  intervaloMinutos: 60,
  diasSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
};

// Status de agendamento
export const STATUS_AGENDAMENTO = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
} as const;

// Tipos de perfil de usuário
export const TIPOS_PERFIL = {
  admin: 'Administrador',
  profissional: 'Profissional',
  cliente: 'Cliente',
} as const;

// Configurações de formatação
export const FORMATO_CONFIG = {
  data: 'dd/MM/yyyy',
  dataHora: 'dd/MM/yyyy HH:mm',
  hora: 'HH:mm',
  moeda: 'pt-BR',
  moedaSimbolo: 'BRL',
};

// Limites e validações
export const VALIDACAO = {
  nomeMin: 3,
  nomeMax: 100,
  emailMax: 100,
  telefoneFormato: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  duracaoMinima: 15,
  duracaoMaxima: 480,
  valorMinimo: 0,
  valorMaximo: 99999,
};

/**
 * IMPORTANTE: Chaves privadas de APIs externas
 * 
 * Estas chaves DEVEM ser configuradas nos Secrets do Supabase:
 * - GEMINI_API_KEY (Google Gemini)
 * - WHATSAPP_ACCESS_TOKEN (WhatsApp Business)
 * - WHATSAPP_PHONE_NUMBER_ID (WhatsApp Business)
 * - CANVA_API_KEY (Canva)
 * - GOOGLE_CALENDAR_API_KEY (Google Calendar)
 * 
 * Para configurar:
 * 1. Acesse: https://supabase.com/dashboard/project/zojdfdoyuhcshrtwibzx/settings/functions
 * 2. Adicione os secrets necessários
 * 3. Use nos Edge Functions via Deno.env.get('NOME_DO_SECRET')
 */

// URLs dos Edge Functions
export const EDGE_FUNCTIONS = {
  whatsappOficial: `${SUPABASE_CONFIG.url}/functions/v1/whatsapp-oficial`,
  chatbotGemini: `${SUPABASE_CONFIG.url}/functions/v1/chatbot-gemini`,
  googleCalendar: `${SUPABASE_CONFIG.url}/functions/v1/google-calendar`,
  canvaIntegration: `${SUPABASE_CONFIG.url}/functions/v1/canva-integration`,
  evolutionApi: `${SUPABASE_CONFIG.url}/functions/v1/evolution-api`,
};

// Mensagens padrão
export const MENSAGENS = {
  erroGenerico: 'Ocorreu um erro. Por favor, tente novamente.',
  sucessoSalvar: 'Salvo com sucesso!',
  sucessoExcluir: 'Excluído com sucesso!',
  confirmacaoExcluir: 'Tem certeza que deseja excluir?',
  semPermissao: 'Você não tem permissão para realizar esta ação.',
  erroCarregar: 'Erro ao carregar dados. Por favor, recarregue a página.',
};
