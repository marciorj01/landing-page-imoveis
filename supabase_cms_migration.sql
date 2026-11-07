-- ==============================================================================
-- PROJETO MÁRCIO RJ CMS — MIGRAÇÃO DE BANCO DE DADOS (SUPABASE)
-- Preserva 100% a tabela 'leads' existente e cria as novas estruturas do CMS
-- ==============================================================================

-- 1. Tabela de Configurações Globais do Site (Telefone, WhatsApp, CRECI, Redes, Cores)
CREATE TABLE IF NOT EXISTS public.cms_site_config (
    id INT PRIMARY KEY DEFAULT 1,
    site_title TEXT NOT NULL DEFAULT 'Márcio Rogério | Corretor de Imóveis',
    creci TEXT NOT NULL DEFAULT '59.138-F',
    whatsapp_phone TEXT NOT NULL DEFAULT '5541991080293',
    whatsapp_display TEXT NOT NULL DEFAULT '(41) 99108-0293',
    contact_email TEXT NOT NULL DEFAULT 'marciorj01@gmail.com',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/marciorjcorretor/',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/',
    primary_color TEXT DEFAULT '#0a1128',
    accent_color TEXT DEFAULT '#c5a880',
    meta_description TEXT DEFAULT 'Consultoria imobiliária especializada em lançamentos e imóveis de alto padrão em Curitiba e São Paulo.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir registro inicial caso não exista
INSERT INTO public.cms_site_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabela de Páginas e Seções Estruturadas (Home e Landing Pages)
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    seo JSONB DEFAULT '{"title": "", "description": "", "keywords": ""}'::jsonb,
    sections JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Biblioteca de Mídia (Imagens e Documentos)
CREATE TABLE IF NOT EXISTS public.cms_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    mime_type TEXT,
    alt_text TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Histórico e Auditoria de Alterações
CREATE TABLE IF NOT EXISTS public.cms_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    changed_by TEXT,
    action TEXT DEFAULT 'update',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Ativar RLS em todas as tabelas novas do CMS
ALTER TABLE public.cms_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_history ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Regras para: cms_site_config
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Publico pode visualizar config do site" ON public.cms_site_config;
CREATE POLICY "Publico pode visualizar config do site"
    ON public.cms_site_config FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Apenas admin autenticado altera config do site" ON public.cms_site_config;
CREATE POLICY "Apenas admin autenticado altera config do site"
    ON public.cms_site_config FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Regras para: cms_pages
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Publico visualiza paginas publicadas" ON public.cms_pages;
CREATE POLICY "Publico visualiza paginas publicadas"
    ON public.cms_pages FOR SELECT
    TO anon
    USING (status = 'published');

DROP POLICY IF EXISTS "Admin autenticado tem acesso total as paginas" ON public.cms_pages;
CREATE POLICY "Admin autenticado tem acesso total as paginas"
    ON public.cms_pages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Regras para: cms_media
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Publico visualiza midias cadastradas" ON public.cms_media;
CREATE POLICY "Publico visualiza midias cadastradas"
    ON public.cms_media FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Apenas admin autenticado gerencia midias" ON public.cms_media;
CREATE POLICY "Apenas admin autenticado gerencia midias"
    ON public.cms_media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- Regras para: cms_history
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Apenas admin autenticado acessa historico" ON public.cms_history;
CREATE POLICY "Apenas admin autenticado acessa historico"
    ON public.cms_history FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET: cms-media
-- Criação do Bucket e permissões para Upload de Imagens
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Publico pode visualizar imagens do bucket" ON storage.objects;
CREATE POLICY "Publico pode visualizar imagens do bucket"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Admin pode fazer upload no bucket" ON storage.objects;
CREATE POLICY "Admin pode fazer upload no bucket"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'cms-media')
    WITH CHECK (bucket_id = 'cms-media');
