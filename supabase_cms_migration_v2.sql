-- ==============================================================================
-- MÁRCIO RJ CMS — MIGRAÇÃO SQL REVISADA (ETAPA 1)
-- POLÍTICAS DE SEGURANÇA RESTRITAS EXCLUSIVAMENTE AO ADMINISTRADOR
-- ==============================================================================

-- 1. TABELA DE CONFIGURAÇÃO GERAL DO SITE
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

-- 2. TABELA DE MENUS DINÂMICOS
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

-- 3. TABELA DE PÁGINAS E BLOCOS (SCHEMA MODULAR)
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE MÍDIA E ARQUIVOS
CREATE TABLE IF NOT EXISTS public.cms_media (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE HISTÓRICO DE VERSÕES / AUDITORIA
CREATE TABLE IF NOT EXISTS public.cms_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_slug TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ATIVAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.cms_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_history ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas prévias se existirem
DROP POLICY IF EXISTS "Publico visualiza config" ON public.cms_site_config;
DROP POLICY IF EXISTS "Admin gerencia config" ON public.cms_site_config;
DROP POLICY IF EXISTS "Publico visualiza menus" ON public.cms_menus;
DROP POLICY IF EXISTS "Admin gerencia menus" ON public.cms_menus;
DROP POLICY IF EXISTS "Publico visualiza paginas publicadas" ON public.cms_pages;
DROP POLICY IF EXISTS "Admin gerencia todas as paginas" ON public.cms_pages;
DROP POLICY IF EXISTS "Publico visualiza midias" ON public.cms_media;
DROP POLICY IF EXISTS "Admin gerencia midias" ON public.cms_media;
DROP POLICY IF EXISTS "Admin acessa historico" ON public.cms_history;

-- ==============================================================================
-- POLÍTICAS RESTRITAS DE SEGURANÇA
-- Regra de Admin: Somente o email marciorj01@gmail.com ou role 'admin'
-- ==============================================================================

-- 1. CONFIGURAÇÃO GERAL
CREATE POLICY "Publico visualiza config"
  ON public.cms_site_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin gerencia config"
  ON public.cms_site_config
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

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
  USING (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 3. PÁGINAS E BLOCOS
-- Visitantes públicos só podem ver páginas que estão publicadas
CREATE POLICY "Publico visualiza paginas publicadas"
  ON public.cms_pages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Administrador autenticado pode ler rascunhos, criar, editar e excluir páginas
CREATE POLICY "Admin gerencia todas as paginas"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 4. MÍDIAS
CREATE POLICY "Publico visualiza midias"
  ON public.cms_media
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin gerencia midias"
  ON public.cms_media
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. HISTÓRICO DE VERSÕES
CREATE POLICY "Admin acessa historico"
  ON public.cms_history
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'marciorj01@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

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

