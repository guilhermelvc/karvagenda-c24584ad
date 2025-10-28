import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, phone, conversationHistory = [] } = await req.json();
    console.log('Received message:', message, 'from phone:', phone);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar informações do negócio
    const { data: config } = await supabase
      .from('configuracao_negocio')
      .select('*')
      .single();

    // Buscar serviços disponíveis
    const { data: servicos } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    // Buscar profissionais disponíveis
    const { data: profissionais } = await supabase
      .from('profissionais')
      .select('*')
      .order('nome');

    // Buscar dados do cliente pelo telefone
    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .or(`telefone.eq.${phone},whatsapp.eq.${phone}`)
      .maybeSingle();

    // Montar contexto para o Gemini
    const systemPrompt = config?.gemini_prompt || `Você é um assistente virtual de agendamentos para ${config?.nome_negocio || 'nossa empresa'}.

Suas funções principais:
1. Agendar serviços
2. Cancelar agendamentos
3. Alterar horários
4. Confirmar agendamentos
5. Orientar sobre serviços disponíveis
6. Solicitar avaliação no Google após atendimento

Informações do negócio:
- Nome: ${config?.nome_negocio}
- Telefone: ${config?.telefone}
- Endereço: ${config?.endereco}
- Horários de funcionamento: ${JSON.stringify(config?.horarios_funcionamento)}

Serviços disponíveis:
${servicos?.map(s => `- ${s.nome}: R$ ${s.valor} (${s.duracao_minutos} min) - ${s.descricao}`).join('\n')}

Profissionais:
${profissionais?.map(p => `- ${p.nome} (${p.especialidade})`).join('\n')}

${cliente ? `Cliente: ${cliente.nome}` : 'Cliente novo'}

Seja cordial, profissional e objetivo. Use emojis para tornar a conversa mais amigável.`;

    // Preparar histórico de conversação
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido! Estou pronto para ajudar com agendamentos e informações.' }] },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    // Chamar Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua mensagem.';

    console.log('Bot response:', response);

    // Salvar interação no banco (opcional)
    await supabase.from('chat_history').insert({
      phone,
      cliente_id: cliente?.id,
      message,
      response,
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ response, clienteId: cliente?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-chatbot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
