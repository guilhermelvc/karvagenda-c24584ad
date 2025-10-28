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
    const { action, searchQuery, templateId } = await req.json();
    console.log('Canva API action:', action);

    const CANVA_API_KEY = Deno.env.get('CANVA_API_KEY');
    
    if (!CANVA_API_KEY) {
      throw new Error('CANVA_API_KEY not configured');
    }

    const headers = {
      'Authorization': `Bearer ${CANVA_API_KEY}`,
      'Content-Type': 'application/json',
    };

    let response;

    switch (action) {
      case 'search-templates':
        // Buscar templates por query
        response = await fetch(
          `https://api.canva.com/rest/v1/designs?query=${encodeURIComponent(searchQuery || '')}&limit=50`,
          {
            method: 'GET',
            headers,
          }
        );
        break;

      case 'get-template':
        // Buscar template específico
        response = await fetch(
          `https://api.canva.com/rest/v1/designs/${templateId}`,
          {
            method: 'GET',
            headers,
          }
        );
        break;

      case 'create-design':
        // Criar novo design baseado em template
        response = await fetch(
          'https://api.canva.com/rest/v1/designs',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              design_type: 'SocialMediaPost',
              title: `Promoção ${new Date().toLocaleDateString()}`,
            }),
          }
        );
        break;

      case 'export-design':
        // Exportar design
        response = await fetch(
          `https://api.canva.com/rest/v1/exports`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              design_id: templateId,
              format: 'png',
            }),
          }
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Canva API error:', errorText);
      throw new Error(`Canva API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Canva API response:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in canva-integration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
