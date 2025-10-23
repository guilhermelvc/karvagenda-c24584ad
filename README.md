# KarvAgenda - Sistema de Agendamento White Label

Sistema completo de agendamento profissional desenvolvido em React com Supabase, preparado para personalização white label e deploy gratuito no GitHub Pages.

![KarvAgenda](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## 🚀 Funcionalidades

### Core Features
- ✅ **Autenticação Completa**: Login/cadastro com email/senha e Google OAuth
- ✅ **Dashboard Interativo**: Métricas em tempo real, gráficos e estatísticas
- ✅ **Agenda Visual**: Calendário semanal estilo Google Agenda com drag-and-drop
- ✅ **CRUD Completo**: Gerenciamento de clientes, profissionais e serviços
- ✅ **Perfis de Acesso**: Sistema de roles (admin, profissional, cliente)
- ✅ **Modo Claro/Escuro**: Tema personalizável com paleta profissional
- ✅ **100% Responsivo**: Otimizado para desktop, tablet, mobile e smartwatch

### Integrações (Preparado para conectar)
- 📱 **WhatsApp Business**: API Evolution para lembretes e notificações automáticas
- 🤖 **IA Gemini**: Robô de atendimento com prompt customizável
- 📅 **Google Calendar**: Sincronização bidirecional de agendamentos
- 💳 **Pagamentos**: Estrutura pronta para integração com gateways

### White Label
- 🎨 **Personalização Total**: Logo, cores, slogan e marca própria
- 🌐 **Multi-idioma**: Suporte para Português, Inglês e Espanhol
- 📊 **Analytics**: Relatórios detalhados e exportação de dados

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Roteamento**: React Router v6
- **Estado**: React Query, Context API
- **Gráficos**: Recharts
- **Datas**: date-fns
- **Deploy**: GitHub Pages

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm/yarn/bun
- Conta no Supabase (gratuita)
- Conta no Google Cloud Console (para OAuth)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/KarvAgenda.git
cd KarvAgenda
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
bun install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e as chaves (anon/public key)

#### 3.2 Configure as variáveis de ambiente
As credenciais já estão configuradas em `src/lib/supabase.ts`. Para usar suas próprias credenciais:

```typescript
// src/lib/supabase.ts
const supabaseUrl = 'SUA_URL_SUPABASE';
const supabaseAnonKey = 'SUA_CHAVE_PUBLICA';
```

#### 3.3 Execute as migrações do banco de dados
Execute os seguintes comandos SQL no SQL Editor do Supabase:

```sql
-- Criar tabela de perfis de usuário
CREATE TABLE public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  avatar_url TEXT,
  tipo_perfil TEXT DEFAULT 'cliente' CHECK (tipo_perfil IN ('admin', 'profissional', 'cliente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar tabela de profissionais
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  especialidade TEXT,
  avatar_url TEXT,
  horarios JSONB,
  dias_folga INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Criar tabela de agendamentos
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  observacoes TEXT,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario_avaliacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Clientes podem ver seus agendamentos"
  ON public.agendamentos FOR SELECT
  USING (cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid()));

CREATE POLICY "Profissionais podem ver seus agendamentos"
  ON public.agendamentos FOR SELECT
  USING (profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid()));
```

### 4. Configure Google OAuth

#### 4.1 Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google+ API
4. Configure a tela de consentimento OAuth
5. Crie credenciais OAuth 2.0:
   - Tipo: Web application
   - Authorized JavaScript origins: `http://localhost:8080` e seu domínio de produção
   - Authorized redirect URIs: `https://[seu-projeto].supabase.co/auth/v1/callback`

#### 4.2 Configure no Supabase
1. Vá para Authentication > Providers no Supabase
2. Ative o Google provider
3. Cole o Client ID e Client Secret do Google Cloud Console

### 5. Execute o projeto localmente
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

Acesse: `http://localhost:8080`

## 🚀 Deploy no GitHub Pages

### 1. Configure o package.json
O projeto já está configurado com:
```json
{
  "homepage": "https://seu-usuario.github.io/KarvAgenda/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**⚠️ IMPORTANTE**: Atualize o campo `homepage` com seu usuário do GitHub!

### 2. Instale gh-pages (já incluído)
```bash
npm install --save-dev gh-pages
```

### 3. Build e Deploy
```bash
npm run deploy
```

Isso irá:
1. Criar o build de produção
2. Criar/atualizar a branch `gh-pages`
3. Fazer push automático para o GitHub

### 4. Configure o GitHub Pages
1. Vá para Settings > Pages no seu repositório
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Salve

Seu site estará disponível em: `https://seu-usuario.github.io/KarvAgenda/`

### 5. Configurações importantes para GitHub Pages

#### Vite Config (já configurado)
```typescript
// vite.config.ts
export default defineConfig({
  base: '/KarvAgenda/', // Nome do seu repositório
  // ...
});
```

#### Supabase Redirect URLs
Configure no Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://seu-usuario.github.io/KarvAgenda/`
- Redirect URLs: Adicione a mesma URL acima

## 🌐 Migração para Domínio Próprio

### Opção 1: Custom Domain no GitHub Pages
1. Compre um domínio (Namecheap, GoDaddy, etc.)
2. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: seu-usuario.github.io
   ```
3. Adicione arquivo `CNAME` na pasta `public/` com seu domínio
4. Configure no GitHub: Settings > Pages > Custom domain

### Opção 2: Hospedagem Própria
Para escalar e ter mais controle, considere:

#### Vercel (Recomendado - Gratuito)
```bash
npm install -g vercel
vercel
```

#### Netlify (Gratuito)
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### AWS Amplify, Render, Railway, etc.
Todos suportam deploy direto do GitHub com CI/CD automático.

## 🔧 Configuração das Integrações

### WhatsApp Business (API Evolution)
```typescript
// Configure em: Configurações > WhatsApp
// 1. Obtenha API Key em: https://evolution-api.com
// 2. Configure webhook para receber mensagens
// 3. Ative lembretes automáticos
```

### IA Gemini
```typescript
// Configure em: Configurações > IA
// 1. Obtenha API Key: https://makersuite.google.com/app/apikey
// 2. Customize o prompt do assistente
// 3. Ative o atendimento automático
```

### Google Calendar
```typescript
// 1. Ative Google Calendar API no Cloud Console
// 2. Configure OAuth scope: https://www.googleapis.com/auth/calendar
// 3. Implemente sincronização bidirecional
```

## 📱 White Label - Personalização

### Alterar Logo e Cores
```typescript
// 1. Upload do logo: Configurações > Aparência
// 2. Escolha cores principais
// 3. Configure slogan e textos
```

### Customizar Paleta de Cores
```css
/* src/index.css */
:root {
  --primary: 217 91% 60%; /* Azul principal */
  --success: 142 71% 45%; /* Verde sucesso */
  --destructive: 0 84% 60%; /* Vermelho ações destrutivas */
}
```

## 📊 Analytics e Relatórios

O sistema já coleta métricas importantes:
- Total de agendamentos
- Taxa de ocupação
- Serviços mais solicitados
- Horários de pico
- Receita mensal
- Avaliações

Para analytics avançado, integre:
- Google Analytics
- Mixpanel
- Amplitude

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Autenticação JWT via Supabase
- ✅ Validação de dados no frontend e backend
- ✅ HTTPS obrigatório
- ✅ CORS configurado
- ✅ Sanitização de inputs

## 🐛 Troubleshooting

### Erro de autenticação Google
- Verifique se o redirect URI está correto no Google Cloud Console
- Confirme que o domínio está autorizado no Supabase

### Erro 404 no refresh no GitHub Pages
Adicione arquivo `404.html` na pasta `public/` com redirecionamento para index.html

### Build falha
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@karvagenda.com
- 💬 Discord: [Link do servidor]
- 📖 Documentação: [Link da documentação]

## 🎯 Roadmap

- [ ] Integração completa WhatsApp Business
- [ ] Sincronização Google Calendar
- [ ] Sistema de pagamentos integrado
- [ ] App mobile (React Native)
- [ ] Sistema de fidelidade/pontos
- [ ] Relatórios avançados em PDF
- [ ] Multi-tenancy (SaaS)
- [ ] API pública para integrações

---

Desenvolvido com ❤️ usando React, TypeScript e Supabase
