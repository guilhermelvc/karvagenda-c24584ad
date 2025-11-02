# Guia de Configuração de Chaves API

Este documento explica como configurar as chaves API para todas as integrações do sistema.

## 🔐 Segurança

**IMPORTANTE:** Nunca exponha chaves privadas no código do frontend. Todas as chaves sensíveis devem ser armazenadas nos **Secrets do Supabase** e acessadas apenas pelos Edge Functions.

## 📋 Chaves API Necessárias

### 1. Supabase (Público)

Já configuradas no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://zojdfdoyuhcshrtwibzx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Google Gemini AI (Privado)

**Onde obter:** [Google AI Studio](https://makersuite.google.com/app/apikey)

**Como configurar:**

1. Acesse: https://supabase.com/dashboard/project/zojdfdoyuhcshrtwibzx/settings/functions
2. Adicione um novo secret:
   - Nome: `GEMINI_API_KEY`
   - Valor: Sua chave da API do Google Gemini

**Uso:** Chatbot inteligente para atendimento ao cliente

### 3. WhatsApp Business API (Privado)

**Onde obter:** [Meta for Developers](https://developers.facebook.com/)

**Como configurar:**

1. Acesse o painel de secrets do Supabase (link acima)
2. Adicione os secrets:
   - `WHATSAPP_ACCESS_TOKEN`: Token de acesso permanente
   - `WHATSAPP_PHONE_NUMBER_ID`: ID do número de telefone
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`: ID da conta business (opcional)

**Uso:** Envio de mensagens de confirmação e resgate de clientes

### 4. Google Calendar API (Privado)

**Onde obter:** [Google Cloud Console](https://console.cloud.google.com/)

**Como configurar:**

1. Crie um projeto no Google Cloud Console
2. Ative a Google Calendar API
3. Crie credenciais OAuth 2.0
4. Adicione o secret no Supabase:
   - Nome: `GOOGLE_CALENDAR_API_KEY`
   - Valor: Sua chave da API

**Uso:** Sincronização de agendamentos com Google Calendar

### 5. Canva API (Privado - Opcional)

**Onde obter:** [Canva Developers](https://www.canva.com/developers/)

**Como configurar:**

1. Crie uma conta de desenvolvedor no Canva
2. Gere uma API key
3. Adicione o secret no Supabase:
   - Nome: `CANVA_API_KEY`
   - Valor: Sua chave da API

**Uso:** Criação automática de posts e materiais de marketing

### 6. Evolution API (Privado - Opcional)

**Onde obter:** Configure sua própria instância do Evolution API

**Como configurar:**

1. Configure os secrets no Supabase:
   - `EVOLUTION_API_KEY`: Chave da sua instância
   - `EVOLUTION_API_URL`: URL da sua instância

**Uso:** Alternativa para WhatsApp via Evolution API

## 🛠️ Como Adicionar Secrets no Supabase

### Via Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/zojdfdoyuhcshrtwibzx/settings/functions
2. Clique em "Add secret"
3. Digite o nome do secret (exemplo: `GEMINI_API_KEY`)
4. Cole o valor da chave
5. Clique em "Save"

### Via CLI do Supabase

```bash
# Login no Supabase CLI
supabase login

# Link com o projeto
supabase link --project-ref zojdfdoyuhcshrtwibzx

# Adicionar um secret
supabase secrets set GEMINI_API_KEY=sua_chave_aqui

# Ver todos os secrets configurados
supabase secrets list
```

## 📝 Usando Secrets nos Edge Functions

Exemplo de como acessar os secrets em um Edge Function:

```typescript
// supabase/functions/seu-function/index.ts

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY não configurado');
}

// Use as chaves...
```

## ✅ Checklist de Configuração

- [ ] Supabase URL e Anon Key configurados no `.env`
- [ ] GEMINI_API_KEY adicionado aos secrets
- [ ] WHATSAPP_ACCESS_TOKEN adicionado aos secrets
- [ ] WHATSAPP_PHONE_NUMBER_ID adicionado aos secrets
- [ ] GOOGLE_CALENDAR_API_KEY adicionado (se usar)
- [ ] CANVA_API_KEY adicionado (se usar)
- [ ] Edge Functions deployados após adicionar secrets

## 🔄 Atualizando Secrets

Após adicionar ou atualizar secrets:

1. Os Edge Functions irão automaticamente usar os novos valores
2. Não é necessário redeployar as functions
3. Pode levar alguns segundos para propagar

## ⚠️ Problemas Comuns

### Edge Function retorna erro 500

- Verifique se todos os secrets necessários estão configurados
- Confira os logs da function no dashboard do Supabase
- Certifique-se de que os nomes dos secrets estão corretos

### "Secret not found"

- O nome do secret é case-sensitive
- Use exatamente o mesmo nome nos Edge Functions e no dashboard

### API Key inválida

- Verifique se a chave foi copiada corretamente (sem espaços extras)
- Confirme se a chave está ativa no painel do provedor
- Verifique se há limites de uso ou restrições de IP

## 📚 Recursos Adicionais

- [Documentação Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Google Calendar API Docs](https://developers.google.com/calendar)

## 🆘 Suporte

Se tiver problemas com a configuração das chaves API:

1. Verifique os logs dos Edge Functions no dashboard
2. Consulte a documentação oficial de cada provedor
3. Entre em contato com o suporte do Supabase se necessário
