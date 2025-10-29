-- Corrigir função handle_new_user adicionando search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.perfis (id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome');
  RETURN NEW;
END;
$function$;

-- Corrigir função handle_updated_at adicionando search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;