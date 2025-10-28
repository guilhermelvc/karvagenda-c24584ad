-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_negocio ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis (usuários podem ver e editar seu próprio perfil)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON perfis;

CREATE POLICY "Usuários podem ver seu próprio perfil"
ON perfis FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON perfis FOR UPDATE
USING (auth.uid() = id);

-- Políticas para clientes (admins podem gerenciar todos, profissionais podem visualizar)
DROP POLICY IF EXISTS "Admins podem ver todos os clientes" ON clientes;
DROP POLICY IF EXISTS "Profissionais podem ver clientes" ON clientes;
DROP POLICY IF EXISTS "Admins podem inserir clientes" ON clientes;
DROP POLICY IF EXISTS "Admins podem atualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Admins podem deletar clientes" ON clientes;

CREATE POLICY "Admins podem ver todos os clientes"
ON clientes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Profissionais podem ver clientes"
ON clientes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil IN ('admin', 'profissional')
  )
);

CREATE POLICY "Admins podem inserir clientes"
ON clientes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar clientes"
ON clientes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem deletar clientes"
ON clientes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

-- Políticas para profissionais
DROP POLICY IF EXISTS "Admins podem ver todos os profissionais" ON profissionais;
DROP POLICY IF EXISTS "Profissionais podem ver seu próprio perfil" ON profissionais;
DROP POLICY IF EXISTS "Admins podem inserir profissionais" ON profissionais;
DROP POLICY IF EXISTS "Admins podem atualizar profissionais" ON profissionais;
DROP POLICY IF EXISTS "Admins podem deletar profissionais" ON profissionais;

CREATE POLICY "Admins podem ver todos os profissionais"
ON profissionais FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Profissionais podem ver seu próprio perfil"
ON profissionais FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins podem inserir profissionais"
ON profissionais FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar profissionais"
ON profissionais FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem deletar profissionais"
ON profissionais FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

-- Políticas para serviços
DROP POLICY IF EXISTS "Todos podem ver serviços ativos" ON servicos;
DROP POLICY IF EXISTS "Admins podem ver todos os serviços" ON servicos;
DROP POLICY IF EXISTS "Admins podem inserir serviços" ON servicos;
DROP POLICY IF EXISTS "Admins podem atualizar serviços" ON servicos;
DROP POLICY IF EXISTS "Admins podem deletar serviços" ON servicos;

CREATE POLICY "Todos podem ver serviços ativos"
ON servicos FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins podem ver todos os serviços"
ON servicos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem inserir serviços"
ON servicos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar serviços"
ON servicos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem deletar serviços"
ON servicos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

-- Políticas para agendamentos
DROP POLICY IF EXISTS "Admins podem ver todos os agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Clientes podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Profissionais podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem inserir agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem atualizar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem deletar agendamentos" ON agendamentos;

CREATE POLICY "Admins podem ver todos os agendamentos"
ON agendamentos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Clientes podem ver seus agendamentos"
ON agendamentos FOR SELECT
USING (
  cliente_id IN (
    SELECT id FROM clientes WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem ver seus agendamentos"
ON agendamentos FOR SELECT
USING (
  profissional_id IN (
    SELECT id FROM profissionais WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem inserir agendamentos"
ON agendamentos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar agendamentos"
ON agendamentos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem deletar agendamentos"
ON agendamentos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

-- Políticas para configurações do negócio
DROP POLICY IF EXISTS "Admins podem ver configurações" ON configuracoes_negocio;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON configuracoes_negocio;

CREATE POLICY "Admins podem ver configurações"
ON configuracoes_negocio FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar configurações"
ON configuracoes_negocio FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.tipo_perfil = 'admin'
  )
);

-- Inserir registro padrão de configurações se não existir
INSERT INTO configuracoes_negocio (
  nome_negocio,
  descricao,
  cor_primaria,
  idioma
)
SELECT 
  'Meu Negócio',
  'Configure seu negócio',
  '#3B82F6',
  'pt-BR'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_negocio LIMIT 1);