import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, instanceName, data } = await req.json();
    console.log('Evolution API action:', action, 'instance:', instanceName);

    const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://api.evolution.com';

    if (!EVOLUTION_API_KEY) {
      throw new Error('EVOLUTION_API_KEY not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    };

    let response;
    let endpoint;

    switch (action) {
      case 'generate-qr':
        // Gerar QR Code para conectar WhatsApp
        endpoint = `${EVOLUTION_API_URL}/instance/connect/${instanceName}`;
        response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });
        break;

      case 'instance-status':
        // Verificar status da instância
        endpoint = `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
        response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });
        break;

      case 'send-message':
        // Enviar mensagem
        endpoint = `${EVOLUTION_API_URL}/message/sendText/${instanceName}`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            number: data.number,
            text: data.text,
          }),
        });
        break;

      case 'send-bulk':
        // Enviar mensagem em massa
        const results = [];
        for (const number of data.numbers) {
          const bulkResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              number,
              text: data.text,
            }),
          });
          results.push({ number, success: bulkResponse.ok });
          // Delay entre mensagens para evitar bloqueio
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'webhook-set':
        // Configurar webhook
        endpoint = `${EVOLUTION_API_URL}/webhook/set/${instanceName}`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            url: data.webhookUrl,
            webhook_by_events: true,
            events: [
              'MESSAGES_UPSERT',
              'CONNECTION_UPDATE',
              'QRCODE_UPDATED',
            ],
          }),
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Evolution API error:', errorText);
      throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Evolution API response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in evolution-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
