-- ==============================================================================
-- MÁRCIO RJ CMS — MIGRAÇÃO SQL REVISADA v3 (ETAPA 1)
-- MODELO DE AUTORIZAÇÃO ROBUSTO, RASCUNHOS SEGUROS E STORAGE RESTRITO
-- ==============================================================================
-- ATENÇÃO: ESTE SCRIPT NÃO FOI EXECUTADO. ESTÁ DISPONÍVEL APENAS PARA REVISÃO.
-- NÃO ALTERA NEM REMOVE A TABELA "leads" OU OUTRAS ESTRUTURAS EXISTENTES.
-- ==============================================================================

-- 1. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADOR (SECURITY DEFINER)
-- Utiliza 'app_metadata' confiável gerido pelo servidor do Supabase e auth.jwt()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- 1. Verifica role de administrador nos metadados confiáveis do servidor (app_metadata)
  -- app_metadata é protegido pelo Supabase Auth e só pode ser alterado via Service Role ou Dashboard
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- 2. Salvaguarda: validação pelo e-mail do proprietário/administrador oficial
  IF (auth.jwt() ->> 'email') = 'marciorj01@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 2. TABELA DE CONFIGURAÇÃO GERAL DO SITE
CREATE TABLE IF NOT EXISTS public.cms_site_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  site_title TEXT NOT NULL DEFAULT 'Márcio Rogério - Corretor de Imóveis',
  creci TEXT NOT NULL DEFAULT '59.138-F',
  whatsapp_phone TEXT NOT NULL DEFAULT '5541991080293',
  whatsapp_display TEXT NOT NULL DEFAULT '(41) 99108-0293',
  contact_email TEXT NOT NULL DEFAULT 'marciorj01@gmail.com',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/',
  primary_color TEXT DEFAULT '#060c1d',
  accent_color TEXT DEFAULT '#c5a880',
  meta_description TEXT DEFAULT 'Consultoria imobiliária de alto padrão em Curitiba e São Paulo.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE MENUS DINÂMICOS
CREATE TABLE IF NOT EXISTS public.cms_menus (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT DEFAULT '_self',
  visible BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  children JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PÁGINAS E BLOCOS
-- REQUISITO ATENDIDO: Novas páginas nascem com status = 'draft' por padrão
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT check_cms_page_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- 5. TABELA DE MÍDIA E ARQUIVOS (COM SEPARAÇÃO PÚBLICO / PRIVADO)
-- REQUISITO ATENDIDO: Distinção estrita entre mídias públicas e documentos privados
CREATE TABLE IF NOT EXISTS public.cms_media (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true, -- true: fotos de imóveis / false: documentos privados
  storage_bucket TEXT NOT NULL DEFAULT 'site-media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE HISTÓRICO DE VERSÕES / AUDITORIA
CREATE TABLE IF NOT EXISTS public.cms_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_slug TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ATIVAÇÃO DO ROW LEVEL SECURITY (RLS) NAS TABELAS CMS
-- ==============================================================================
ALTER TABLE public.cms_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_history ENABLE ROW LEVEL SECURITY;

-- Revogação profilática de quaisquer políticas antigas existentes
DROP POLICY IF EXISTS "Publico visualiza config" ON public.cms_site_config;
DROP POLICY IF EXISTS "Admin gerencia config" ON public.cms_site_config;
DROP POLICY IF EXISTS "Admin altera config" ON public.cms_site_config;

DROP POLICY IF EXISTS "Publico visualiza menus" ON public.cms_menus;
DROP POLICY IF EXISTS "Admin gerencia menus" ON public.cms_menus;

DROP POLICY IF EXISTS "Publico visualiza paginas publicadas" ON public.cms_pages;
DROP POLICY IF EXISTS "Admin gerencia paginas" ON public.cms_pages;
DROP POLICY IF EXISTS "Admin gerencia todas as paginas" ON public.cms_pages;

DROP POLICY IF EXISTS "Publico visualiza midias" ON public.cms_media;
DROP POLICY IF EXISTS "Publico visualiza midias publicas" ON public.cms_media;
DROP POLICY IF EXISTS "Admin gerencia midias" ON public.cms_media;

DROP POLICY IF EXISTS "Admin acessa historico" ON public.cms_history;

-- ==============================================================================
-- POLÍTICAS RESTRITAS RLS (BASEADAS EM public.is_admin())
-- ==============================================================================

-- 1. CONFIGURAÇÃO GERAL (Somente metadados públicos do site)
CREATE POLICY "Publico visualiza config"
  ON public.cms_site_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin gerencia config"
  ON public.cms_site_config
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. MENUS DINÂMICOS
CREATE POLICY "Publico visualiza menus"
  ON public.cms_menus
  FOR SELECT
  TO anon, authenticated
  USING (visible = true);

CREATE POLICY "Admin gerencia menus"
  ON public.cms_menus
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. PÁGINAS E BLOCOS
-- Visitantes comuns e anônimos NUNCA veem rascunhos ('draft')
CREATE POLICY "Publico visualiza paginas publicadas"
  ON public.cms_pages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Apenas o administrador autenticado pode ler rascunhos, criar, editar e excluir
CREATE POLICY "Admin gerencia todas as paginas"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. MÍDIAS E ARQUIVOS
-- Visitantes públicos SÓ podem visualizar mídias marcadas como is_public = true
CREATE POLICY "Publico visualiza midias publicas"
  ON public.cms_media
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Administrador gerencia todas as mídias (incluindo privadas)
CREATE POLICY "Admin gerencia midias"
  ON public.cms_media
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. HISTÓRICO DE AUDITORIA (100% restrito ao Administrador)
CREATE POLICY "Admin acessa historico"
  ON public.cms_history
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- POLÍTICAS ESPECÍFICAS PARA SUPABASE STORAGE (storage.objects)
-- ==============================================================================
-- Criação dos buckets caso ainda não existam:
-- 1) 'site-media': Bucket público apenas para leitura das imagens do site
-- 2) 'cms-private': Bucket 100% privado para documentos administrativos
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-private', 'cms-private', false)
ON CONFLICT (id) DO NOTHING;

-- Revogação profilática de políticas antigas do storage para os buckets do CMS
DROP POLICY IF EXISTS "Publico visualiza arquivos do site" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload site media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update site media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete site media" ON storage.objects;
DROP POLICY IF EXISTS "Admin gerencia documentos privados" ON storage.objects;

-- Regra 1: Leitura pública APENAS para arquivos do bucket 'site-media'
CREATE POLICY "Publico visualiza arquivos do site"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-media');

-- Regra 2: Upload, alteração e exclusão no bucket 'site-media' EXCLUSIVAMENTE para admin
CREATE POLICY "Admin upload site media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

CREATE POLICY "Admin update site media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

CREATE POLICY "Admin delete site media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-media' AND public.is_admin());

-- Regra 3: Bucket 'cms-private' (Leitura, upload, edição e deleção 100% restritos ao admin)
CREATE POLICY "Admin gerencia documentos privados"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'cms-private' AND public.is_admin())
  WITH CHECK (bucket_id = 'cms-private' AND public.is_admin());

-- ==============================================================================
-- CARGA INICIAL DE MENUS PADRÃO (SE A TABELA ESTIVER VAZIA)
-- ==============================================================================
INSERT INTO public.cms_menus (id, label, url, "order", visible)
VALUES
  ('menu-1', 'Home', '#home', 0, true),
  ('menu-2', 'Imóveis', '#imoveis', 1, true),
  ('menu-3', 'Soluções', '#solucoes', 2, true),
  ('menu-4', 'Sobre', '#sobre', 3, true)
ON CONFLICT (id) DO NOTHING;
