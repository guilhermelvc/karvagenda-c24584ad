# Schema do Banco de Dados Supabase

## Configuração Inicial

Execute os comandos SQL abaixo no editor SQL do Supabase para criar toda a estrutura do banco de dados.

## 1. Limpar Banco (DROP TABLES)

```sql
-- Drop all tables if they exist
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP TABLE IF EXISTS public.agendamentos CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.profissionais CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.configuracao_negocio CASCADE;
```

## 2. Criar Tabelas

### 2.1 Tabela de Configuração do Negócio

```sql
CREATE TABLE public.configuracao_negocio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_negocio TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#3b82f6',
  slogan TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  horarios_funcionamento JSONB DEFAULT '[]',
  whatsapp_api_key TEXT,
  whatsapp_numero TEXT,
  whatsapp_instance_name TEXT DEFAULT 'instance',
  whatsapp_confirmacao_habilitada BOOLEAN DEFAULT false,
  whatsapp_confirmacao_antecedencia_horas INTEGER DEFAULT 24,
  whatsapp_confirmacao_mensagem TEXT DEFAULT 'Olá {nome}! Confirmamos seu agendamento para {data} às {horario} com {profissional}.',
  whatsapp_resgate_habilitado BOOLEAN DEFAULT false,
  whatsapp_resgate_dias INTEGER DEFAULT 30,
  whatsapp_resgate_mensagem TEXT DEFAULT 'Olá {nome}! Sentimos sua falta! Faz {dias} dias do seu último atendimento. Que tal agendar um novo horário?',
  whatsapp_lista_transmissao TEXT DEFAULT '[]',
  gemini_api_key TEXT,
  gemini_prompt TEXT,
  google_calendar_enabled BOOLEAN DEFAULT false,
  google_analytics_id TEXT,
  canva_client_id TEXT,
  canva_api_key TEXT,
  idioma TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.configuracao_negocio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own config"
  ON public.configuracao_negocio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
  ON public.configuracao_negocio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
  ON public.configuracao_negocio FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2.2 Tabela de Clientes

```sql
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  observacoes TEXT,
  ficha_anamnese JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clientes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clientes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_clientes_telefone ON public.clientes(telefone);
CREATE INDEX idx_clientes_whatsapp ON public.clientes(whatsapp);
```

### 2.3 Tabela de Profissionais

```sql
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  especialidade TEXT,
  avatar_url TEXT,
  horarios JSONB DEFAULT '[]',
  dias_folga JSONB DEFAULT '[]',
  folgas_manuais JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own professionals"
  ON public.profissionais FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own professionals"
  ON public.profissionais FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professionals"
  ON public.profissionais FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own professionals"
  ON public.profissionais FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_profissionais_user_id ON public.profissionais(user_id);
```

### 2.4 Tabela de Serviços

```sql
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own services"
  ON public.servicos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
  ON public.servicos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON public.servicos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON public.servicos FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_servicos_user_id ON public.servicos(user_id);
CREATE INDEX idx_servicos_categoria ON public.servicos(categoria);
```

### 2.5 Tabela de Agendamentos

```sql
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE NOT NULL,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  observacoes TEXT,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario_avaliacao TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON public.agendamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
  ON public.agendamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON public.agendamentos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON public.agendamentos FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_agendamentos_user_id ON public.agendamentos(user_id);
CREATE INDEX idx_agendamentos_cliente_id ON public.agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_profissional_id ON public.agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_servico_id ON public.agendamentos(servico_id);
CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
```

### 2.6 Tabela de Histórico de Chat

```sql
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat history"
  ON public.chat_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read all chat history"
  ON public.chat_history FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_chat_history_phone ON public.chat_history(phone);
CREATE INDEX idx_chat_history_cliente_id ON public.chat_history(cliente_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at);
```

## 3. Criar Funções e Triggers

### 3.1 Trigger para atualizar updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_configuracao_negocio_updated_at BEFORE UPDATE ON public.configuracao_negocio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON public.profissionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Configurar Secrets no Supabase

No Supabase Dashboard, vá em **Settings** > **Edge Functions** > **Manage secrets** e adicione:

- `GEMINI_API_KEY`: Sua chave da API do Google Gemini
- `EVOLUTION_API_KEY`: Sua chave da API Evolution
- `EVOLUTION_API_URL`: URL base da API Evolution
- `CANVA_API_KEY`: Sua chave da API Canva
- `CANVA_CLIENT_ID`: Seu Client ID do Canva
- `GOOGLE_ANALYTICS_ID`: Seu ID do Google Analytics (ou configure como variável de ambiente: `VITE_GOOGLE_ANALYTICS_ID`)

## 5. Estrutura de Dados JSONB

### 5.1 horarios_funcionamento

```json
[
  {
    "dia_semana": 1,
    "inicio": "09:00",
    "fim": "18:00",
    "intervalo_inicio": "12:00",
    "intervalo_fim": "13:00"
  }
]
```

### 5.2 folgas_manuais (profissionais)

```json
[
  {
    "data": "2025-12-25",
    "descricao": "Natal",
    "dia_todo": true,
    "horario_inicio": null,
    "horario_fim": null
  }
]
```

### 5.3 ficha_anamnese (clientes)

```json
{
  "tipo_pele": "Normal",
  "alergias": "Nenhuma",
  "medicamentos_uso": "Nenhum",
  "cirurgias_previas": "Não",
  "tratamentos_esteticos_anteriores": "Limpeza de pele",
  "exposicao_solar": "Moderada",
  "gestante_lactante": "Não",
  "doencas_preexistentes": "Nenhuma",
  "objetivo_tratamento": "Melhora da pele",
  "observacoes_adicionais": "",
  "assinatura_digital": "data:image/png;base64,...",
  "data_preenchimento": "2025-01-01T10:00:00Z"
}
```

### 5.4 whatsapp_lista_transmissao (configuracao_negocio)

```json
["5511999999999", "5511888888888"]
```

## 6. Notas Importantes

- Todas as tabelas (exceto `chat_history`) devem ter `user_id` preenchido nas operações de INSERT
- O `user_id` deve ser o ID do usuário autenticado (`auth.uid()`)
- As políticas RLS garantem que cada usuário veja apenas seus próprios dados
- A tabela `chat_history` é acessível pelas edge functions usando o Service Role Key
- Configure todos os secrets no Supabase Dashboard antes de usar as edge functions

## 7. Exemplo de Query para Popular Dados Iniciais

Após criar sua conta e fazer login, você pode inserir dados de exemplo:

```sql
-- Inserir configuração do negócio (substitua USER_ID_AQUI pelo seu ID)
INSERT INTO public.configuracao_negocio (user_id, nome_negocio, telefone, email, endereco)
VALUES ('USER_ID_AQUI', 'Minha Empresa', '(11) 99999-9999', 'contato@empresa.com', 'Rua Exemplo, 123');

-- Inserir serviço de exemplo
INSERT INTO public.servicos (user_id, nome, descricao, duracao_minutos, valor, categoria, ativo)
VALUES ('USER_ID_AQUI', 'Corte de Cabelo', 'Corte moderno e personalizado', 45, 50.00, 'Cabelo', true);
```
