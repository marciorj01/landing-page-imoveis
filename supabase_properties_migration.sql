-- ==============================================================================
-- MIGRAÇÃO SUPABASE: TABELA DE IMÓVEIS (GERENCIADOR DE IMÓVEIS)
-- STATUS: AGUARDANDO REVISÃO E APROVAÇÃO — NÃO EXECUTAR SEM AUTORIZAÇÃO EXPRESSA
-- ==============================================================================
-- Esta migração cria a tabela `public.properties` para suportar o Gerenciador
-- de Imóveis do MÁRCIO RJ CMS.
-- 
-- SEGURANÇA E ISOLAMENTO:
-- 1. NÃO afeta nem altera a tabela existente de `leads`.
-- 2. Leitura pública permitida APENAS para imóveis com status 'published'.
-- 3. Rascunhos ('draft') e arquivados ('archived') são visíveis apenas para administradores via `public.is_admin()`.
-- 4. Criação, edição, exclusão e publicação exigem autorização estrita via `public.is_admin()`.
-- ==============================================================================

-- 1. Criação da Tabela `public.properties`
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    property_type TEXT NOT NULL DEFAULT 'Apartamento',
    purpose TEXT NOT NULL DEFAULT 'venda', -- 'venda', 'locacao', 'ambos'
    status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'published', 'archived'
    featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Valores financeiros
    price NUMERIC(14, 2),
    condo_fee NUMERIC(10, 2),
    iptu NUMERIC(10, 2),
    
    -- Localização
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Curitiba',
    state TEXT DEFAULT 'PR',
    
    -- Textos e Descrição
    description TEXT,
    summary TEXT,
    
    -- Ficha técnica
    bedrooms INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_spots INTEGER DEFAULT 0,
    private_area NUMERIC(10, 2),
    total_area NUMERIC(10, 2),
    
    -- Mídias
    main_image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    tour_virtual_url TEXT,
    
    -- Diferenciais e Características
    features JSONB DEFAULT '[]'::jsonb,
    differentials JSONB DEFAULT '[]'::jsonb,
    
    -- Contato e Destino Específico
    whatsapp_number TEXT,
    whatsapp_message TEXT,
    target_url TEXT, -- Link alternativo ou landing page específica (ex: /oas.html)
    
    -- SEO e Metatags
    meta_title TEXT,
    meta_description TEXT,
    meta_image TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices de Performance e Consulta
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);

-- 3. Habilitação de RLS (Row Level Security)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 4. Limpeza preventiva de políticas anteriores na tabela properties
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.properties', pol.policyname);
    END LOOP;
END $$;

-- 5. Políticas de Segurança RLS
-- A. Leitura pública: qualquer visitante anônimo ou autenticado pode ver imóveis PUBLICADOS
CREATE POLICY properties_select_published
    ON public.properties
    FOR SELECT
    TO public, anon, authenticated
    USING (status = 'published');

-- B. Acesso administrativo total: somente administradores autorizados podem ler rascunhos, criar, editar e excluir
CREATE POLICY properties_admin_all
    ON public.properties
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Trigger para atualização automática de `updated_at`
CREATE OR REPLACE FUNCTION public.set_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.set_properties_updated_at();

-- Fim do script de migração.
