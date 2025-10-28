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
    const { action, accessToken, event } = await req.json();
    console.log('Google Calendar action:', action);

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let response;
    const calendarId = 'primary';

    switch (action) {
      case 'create':
        // Criar evento no Google Calendar
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              summary: event.summary,
              description: event.description,
              start: {
                dateTime: event.startDateTime,
                timeZone: 'America/Sao_Paulo',
              },
              end: {
                dateTime: event.endDateTime,
                timeZone: 'America/Sao_Paulo',
              },
              attendees: event.attendees || [],
              reminders: {
                useDefault: false,
                overrides: [
                  { method: 'email', minutes: 24 * 60 },
                  { method: 'popup', minutes: 30 },
                ],
              },
            }),
          }
        );
        break;

      case 'update':
        // Atualizar evento
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.eventId}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              summary: event.summary,
              description: event.description,
              start: {
                dateTime: event.startDateTime,
                timeZone: 'America/Sao_Paulo',
              },
              end: {
                dateTime: event.endDateTime,
                timeZone: 'America/Sao_Paulo',
              },
              attendees: event.attendees || [],
            }),
          }
        );
        break;

      case 'delete':
        // Deletar evento
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.eventId}`,
          {
            method: 'DELETE',
            headers,
          }
        );
        break;

      case 'list':
        // Listar eventos
        const now = new Date().toISOString();
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now}&maxResults=100&orderBy=startTime&singleEvents=true`,
          {
            method: 'GET',
            headers,
          }
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', errorText);
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = response.status === 204 ? { success: true } : await response.json();
    console.log('Google Calendar response:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-calendar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
