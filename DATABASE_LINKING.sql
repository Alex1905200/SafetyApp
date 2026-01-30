-- =====================================================
-- TABLAS PARA SISTEMA DE VINCULACIÓN PADRE-HIJO
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Tabla de códigos de vinculación temporales
CREATE TABLE IF NOT EXISTS public.link_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vinculaciones padre-hijo
CREATE TABLE IF NOT EXISTS public.parent_child_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'linked', 'rejected', 'unlinked')),
    link_code_used VARCHAR(6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(parent_id, child_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_link_codes_code ON public.link_codes(code);
CREATE INDEX IF NOT EXISTS idx_link_codes_parent ON public.link_codes(parent_id);
CREATE INDEX IF NOT EXISTS idx_link_codes_expires ON public.link_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent ON public.parent_child_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_child ON public.parent_child_links(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_status ON public.parent_child_links(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para link_codes
CREATE POLICY "Parents can create their own link codes"
    ON public.link_codes FOR INSERT
    WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can view their own link codes"
    ON public.link_codes FOR SELECT
    USING (auth.uid() = parent_id);

CREATE POLICY "Anyone can validate a code"
    ON public.link_codes FOR SELECT
    USING (is_used = false AND expires_at > NOW());

CREATE POLICY "System can update link codes"
    ON public.link_codes FOR UPDATE
    USING (true);

-- Políticas de seguridad para parent_child_links
CREATE POLICY "Parents and children can view their links"
    ON public.parent_child_links FOR SELECT
    USING (auth.uid() = parent_id OR auth.uid() = child_id);

CREATE POLICY "Children can create link requests"
    ON public.parent_child_links FOR INSERT
    WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Parents can update link status"
    ON public.parent_child_links FOR UPDATE
    USING (auth.uid() = parent_id);

-- Función para limpiar códigos expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION clean_expired_link_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.link_codes
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
