-- Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'profissional', 'cliente');

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy para ver próprios roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- REMOVER TODAS AS POLICIES ANTIGAS PRIMEIRO

-- PERFIS
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.perfis;

-- CLIENTES
DROP POLICY IF EXISTS "Admins podem ver todos os clientes" ON public.clientes;
DROP POLICY IF EXISTS "Profissionais podem ver clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admins podem inserir clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admins podem atualizar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admins podem deletar clientes" ON public.clientes;

-- PROFISSIONAIS
DROP POLICY IF EXISTS "Admins podem ver todos os profissionais" ON public.profissionais;
DROP POLICY IF EXISTS "Profissionais podem ver seu próprio perfil" ON public.profissionais;
DROP POLICY IF EXISTS "Admins podem inserir profissionais" ON public.profissionais;
DROP POLICY IF EXISTS "Admins podem atualizar profissionais" ON public.profissionais;
DROP POLICY IF EXISTS "Admins podem deletar profissionais" ON public.profissionais;

-- SERVICOS
DROP POLICY IF EXISTS "Todos podem ver serviços ativos" ON public.servicos;
DROP POLICY IF EXISTS "Admins podem ver todos os serviços" ON public.servicos;
DROP POLICY IF EXISTS "Admins podem inserir serviços" ON public.servicos;
DROP POLICY IF EXISTS "Admins podem atualizar serviços" ON public.servicos;
DROP POLICY IF EXISTS "Admins podem deletar serviços" ON public.servicos;

-- AGENDAMENTOS
DROP POLICY IF EXISTS "Admins podem ver todos os agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Clientes podem ver seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Profissionais podem ver seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admins podem inserir agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admins podem atualizar agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admins podem deletar agendamentos" ON public.agendamentos;

-- CONFIGURACOES_NEGOCIO
DROP POLICY IF EXISTS "Admins podem ver configurações" ON public.configuracoes_negocio;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON public.configuracoes_negocio;

-- Agora remover coluna tipo_perfil
ALTER TABLE public.perfis DROP COLUMN IF EXISTS tipo_perfil;

-- CRIAR NOVAS POLICIES USANDO has_role

-- PERFIS
CREATE POLICY "Users can view their own profile"
ON public.perfis FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.perfis FOR UPDATE
USING (auth.uid() = id);

-- CLIENTES
CREATE POLICY "Admins can view all clients"
ON public.clientes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view clients"
ON public.clientes FOR SELECT
USING (public.has_role(auth.uid(), 'profissional'));

CREATE POLICY "Admins can insert clients"
ON public.clientes FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clients"
ON public.clientes FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clients"
ON public.clientes FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- PROFISSIONAIS
CREATE POLICY "Admins can view all professionals"
ON public.profissionais FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view their own profile"
ON public.profissionais FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can insert professionals"
ON public.profissionais FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update professionals"
ON public.profissionais FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete professionals"
ON public.profissionais FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- SERVICOS
CREATE POLICY "Everyone can view active services"
ON public.servicos FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can view all services"
ON public.servicos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert services"
ON public.servicos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update services"
ON public.servicos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete services"
ON public.servicos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- AGENDAMENTOS
CREATE POLICY "Admins can view all appointments"
ON public.agendamentos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their appointments"
ON public.agendamentos FOR SELECT
USING (cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can view their appointments"
ON public.agendamentos FOR SELECT
USING (profissional_id IN (SELECT id FROM profissionais WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert appointments"
ON public.agendamentos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appointments"
ON public.agendamentos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete appointments"
ON public.agendamentos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- CONFIGURACOES_NEGOCIO
CREATE POLICY "Admins can view configurations"
ON public.configuracoes_negocio FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update configurations"
ON public.configuracoes_negocio FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar campos para mensagem de resgate e WhatsApp oficial
ALTER TABLE public.configuracoes_negocio
ADD COLUMN IF NOT EXISTS whatsapp_resgate_ativa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_resgate_dias INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS whatsapp_resgate_mensagem TEXT DEFAULT 'Olá {nome}! Sentimos sua falta! Faz {dias} dias do seu último atendimento. Que tal agendar um novo horário?',
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT;

-- Inserir configuração padrão se não existir
INSERT INTO public.configuracoes_negocio (
  nome_negocio,
  descricao,
  idioma,
  cor_primaria
)
SELECT 
  'Meu Negócio',
  'Sistema de Agendamento',
  'pt-BR',
  '#3B82F6'
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes_negocio LIMIT 1);