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
    const { action, to, message, templateName, templateParams } = await req.json();
    console.log('WhatsApp action:', action, 'to:', to);

    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      throw new Error('WhatsApp credentials not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let responseData;

    switch (action) {
      case 'send_message': {
        // Enviar mensagem de texto simples
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: to.replace(/[^\d]/g, ''), // Remove formatação
              type: 'text',
              text: { body: message }
            }),
          }
        );

        if (!whatsappResponse.ok) {
          const error = await whatsappResponse.text();
          console.error('WhatsApp API error:', error);
          throw new Error(`WhatsApp API error: ${whatsappResponse.status}`);
        }

        responseData = await whatsappResponse.json();
        break;
      }

      case 'send_template': {
        // Enviar template message (para confirmações, lembretes, etc)
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: to.replace(/[^\d]/g, ''),
              type: 'template',
              template: {
                name: templateName,
                language: { code: 'pt_BR' },
                components: templateParams ? [
                  {
                    type: 'body',
                    parameters: templateParams.map((p: string) => ({
                      type: 'text',
                      text: p
                    }))
                  }
                ] : []
              }
            }),
          }
        );

        if (!whatsappResponse.ok) {
          const error = await whatsappResponse.text();
          console.error('WhatsApp API error:', error);
          throw new Error(`WhatsApp API error: ${whatsappResponse.status}`);
        }

        responseData = await whatsappResponse.json();
        break;
      }

      case 'send_broadcast': {
        // Enviar mensagem para múltiplos contatos
        const { recipients, message: broadcastMessage } = await req.json();
        
        const results = await Promise.allSettled(
          recipients.map(async (recipient: string) => {
            const response = await fetch(
              `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: recipient.replace(/[^\d]/g, ''),
                  type: 'text',
                  text: { body: broadcastMessage }
                }),
              }
            );
            return response.json();
          })
        );

        responseData = {
          total: recipients.length,
          successful: results.filter(r => r.status === 'fulfilled').length,
          failed: results.filter(r => r.status === 'rejected').length,
          results
        };
        break;
      }

      case 'check_rescue': {
        // Verificar clientes para mensagem de resgate
        const { data: config } = await supabase
          .from('configuracoes_negocio')
          .select('whatsapp_resgate_ativa, whatsapp_resgate_dias, whatsapp_resgate_mensagem')
          .single();

        if (!config?.whatsapp_resgate_ativa) {
          return new Response(
            JSON.stringify({ message: 'Mensagem de resgate não está ativa' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const diasAtras = new Date();
        diasAtras.setDate(diasAtras.getDate() - (config.whatsapp_resgate_dias || 15));

        // Buscar clientes que tiveram último agendamento há N dias
        const { data: clientes } = await supabase
          .from('clientes')
          .select(`
            id,
            nome,
            whatsapp,
            agendamentos:agendamentos(data_hora)
          `)
          .not('whatsapp', 'is', null)
          .order('agendamentos(data_hora)', { ascending: false });

        const clientesResgate = clientes?.filter((cliente: any) => {
          if (!cliente.agendamentos || cliente.agendamentos.length === 0) return false;
          const ultimoAgendamento = new Date(cliente.agendamentos[0].data_hora);
          return ultimoAgendamento <= diasAtras;
        });

        responseData = {
          clientesEncontrados: clientesResgate?.length || 0,
          clientes: clientesResgate
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-oficial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
