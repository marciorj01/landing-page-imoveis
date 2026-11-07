-- ==============================================================================
-- MÁRCIO RJ CMS — MIGRAÇÃO SUPABASE: TABELA DE IMÓVEIS (REVISADA)
-- STATUS: AGUARDANDO REVISÃO — NÃO EXECUTAR SEM AUTORIZAÇÃO EXPRESSA
-- ==============================================================================
-- Este script cria e configura de forma segura e idempotente:
-- 1. A função de segurança `public.is_admin()`.
-- 2. A tabela `public.properties` com todas as colunas correspondentes ao código.
-- 3. As políticas Row Level Security (RLS) para leitura pública e escrita restrita.
-- 4. O bucket de storage `cms-media` com leitura pública de fotos e upload restrito ao admin.
-- 5. Os 3 empreendimentos iniciais (Bioma, Oás, Helbor VM 125) para carga inicial imediata.
--
-- ISOLAMENTO E PRESERVAÇÃO:
-- NÃO altera, remove ou afeta a tabela `leads` ou outras tabelas existentes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADOR (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- 1. Verificação primária: app_metadata -> role = 'admin' (protegido pelo servidor Supabase Auth)
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- 2. Salvaguarda: e-mail oficial do corretor administrador
  IF (auth.jwt() ->> 'email') = 'marciorj01@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE IMÓVEIS (public.properties)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    property_type TEXT NOT NULL DEFAULT 'Apartamento',
    purpose TEXT NOT NULL DEFAULT 'venda', -- 'venda', 'locacao'
    status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'published', 'archived'
    featured BOOLEAN NOT NULL DEFAULT false,
    tag TEXT,
    
    -- Valores comerciais e taxas (formato textual flexível: ex: "Sob Consulta", "R$ 1.850.000")
    price TEXT,
    condo_fee TEXT,
    iptu TEXT,
    
    -- Localização
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Curitiba',
    state TEXT DEFAULT 'PR',
    
    -- Ficha técnica
    bedrooms INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_spots INTEGER DEFAULT 0,
    private_area NUMERIC(10, 2),
    total_area NUMERIC(10, 2),
    
    -- Textos
    summary TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Mídias
    main_image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    
    -- Contato & Destino
    whatsapp_custom_message TEXT,
    target_url TEXT,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Garantia de idempotência: adiciona colunas caso a tabela já existisse previamente
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Apartamento';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'venda';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condo_fee TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS iptu TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Curitiba';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'PR';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS suites INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS parking_spots INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS private_area NUMERIC(10, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_area NUMERIC(10, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS main_image TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS whatsapp_custom_message TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS seo_image TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 3. ÍNDICES DE CONSULTA E PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Limpeza preventiva de políticas antigas exclusivamente nesta tabela
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.properties', pol.policyname);
    END LOOP;
END $$;

-- Política A: Visitantes públicos (anônimos ou autenticados) podem ler APENAS imóveis PUBLICADOS
CREATE POLICY properties_select_published
    ON public.properties
    FOR SELECT
    TO public, anon, authenticated
    USING (status = 'published');

-- Política B: Administrador autorizado possui controle total (SELECT de rascunhos, INSERT, UPDATE, DELETE)
CREATE POLICY properties_admin_all
    ON public.properties
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TRIGGER DE ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. CONFIGURAÇÃO DO BUCKET DE FOTOS NO SUPABASE STORAGE (cms-media)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para `cms-media`
DROP POLICY IF EXISTS "cms_media_public_read" ON storage.objects;
CREATE POLICY "cms_media_public_read"
    ON storage.objects
    FOR SELECT
    TO public, anon, authenticated
    USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "cms_media_admin_insert" ON storage.objects;
CREATE POLICY "cms_media_admin_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'cms-media' AND public.is_admin());

DROP POLICY IF EXISTS "cms_media_admin_update" ON storage.objects;
CREATE POLICY "cms_media_admin_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'cms-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'cms-media' AND public.is_admin());

DROP POLICY IF EXISTS "cms_media_admin_delete" ON storage.objects;
CREATE POLICY "cms_media_admin_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'cms-media' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. SEED: CARGA INICIAL DOS 3 EMPREENDIMENTOS BASE (Publicados)
-- ------------------------------------------------------------------------------
INSERT INTO public.properties (
    id, slug, title, property_type, purpose, status, featured, tag,
    price, condo_fee, neighborhood, city, state, address,
    bedrooms, suites, bathrooms, parking_spots, private_area, total_area,
    summary, description, features, main_image, gallery,
    target_url, whatsapp_custom_message, seo_title, seo_description
) VALUES
(
    'prop-bioma',
    'bioma',
    'Bioma',
    'Apartamento',
    'venda',
    'published',
    true,
    'Lançamento',
    'Sob Consulta',
    'Sob consulta',
    'Ahú',
    'Curitiba',
    'PR',
    'Rua Vereador Washington Mansur, Ahú, Curitiba - PR',
    3, 3, 4, 2, 140, 191,
    'Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.',
    'O Bioma é a expressão máxima de arquitetura contemporânea e integração com a natureza no coração do Ahú. Com plantas flexíveis de 90 a 191m², o empreendimento conta com acabamento de alto padrão, isolamento acústico superior, amplas varandas e áreas de lazer completas equipadas e decoradas com elegância e requinte.',
    '["Piscina Aquecida", "Espaço Fitness", "Salão de Festas Gourmet", "Bicicletário", "Brinquedoteca", "Guarita Blindada", "Energia Solar para Áreas Comuns", "Varanda com Churrasqueira"]'::jsonb,
    '/assets/e8527.png',
    '["/assets/e8527.png", "/assets/08ae9.png", "/assets/bb9df.png"]'::jsonb,
    '/bioma.html',
    'Olá Márcio, tenho interesse no empreendimento Bioma no Ahú.',
    'Bioma - Apartamentos de Alto Padrão no Ahú | Curitiba',
    'Conheça o Bioma da ATR no Ahú. Plantas de 90 a 191m² com acabamento refinado e lazer completo.'
),
(
    'prop-oas',
    'oas',
    'Oás',
    'Apartamento',
    'venda',
    'published',
    true,
    'Em obras',
    'Sob Consulta',
    'Sob consulta',
    'Bigorrilho',
    'Curitiba',
    'PR',
    'Bigorrilho, Curitiba - PR',
    4, 4, 5, 3, 250, 380,
    '50 andares diferente de tudo o que você já viu. O OÁS conecta você com a cidade nas nuvens.',
    'Com 50 andares, o OÁS é um marco na arquitetura de Curitiba e o residencial mais alto da cidade. Projetado para quem busca exclusividade absoluta, oferece vista 360 graus panorâmica para a Serra do Mar e o Parque Barigui. Uma infraestrutura incomparável com heliponto, spa panorâmico, piscinas suspensas e concierge internacional.',
    '["Torre de 50 Andares", "Vista 360° Panorâmica", "Piscina Suspensa", "Spa & Wellness Center", "Elevadores Inteligentes de Alta Velocidade", "Segurança com Reconhecimento Facial", "Adega Climatizada Privativa", "Carregamento para Veículos Elétricos"]'::jsonb,
    '/assets/613f6.png',
    '["/assets/613f6.png", "/assets/1c45d.png", "/assets/08ae9.png"]'::jsonb,
    '/oas.html',
    'Olá Márcio, gostaria de mais informações e apresentação do OÁS no Bigorrilho.',
    'OÁS - O Maior Ícone Residencial de Curitiba | Bigorrilho',
    '50 andares de puro luxo no Bigorrilho. Conheça as unidades exclusivas do OÁS com vista para o Barigui.'
),
(
    'prop-helbor',
    'helbor-vm-125',
    'Helbor VM 125',
    'Studio',
    'venda',
    'published',
    true,
    'Lançamento',
    'Sob Consulta',
    'Sob consulta',
    'Vila Madalena',
    'São Paulo',
    'SP',
    'Vila Madalena, São Paulo - SP',
    1, 1, 1, 1, 30, 45,
    'Um endereço que combina facilidade para ir e vir com cultura, gastronomia e conveniência por perto.',
    'Localizado no bairro mais vibrante e cosmopolita de São Paulo, o Helbor VM 125 foi desenhado para moradia moderna e alto retorno de investimento em locação. Studios inteligentes de 27 a 30m² e salas comerciais de 24 a 55m² a poucos passos de estações de metrô, restaurantes renomados e galerias de arte da Vila Madalena.',
    '["Rooftop com Piscina e Lounge", "Coworking Integrado", "Lavanderia Compartilhada", "Academia no Último Andar", "Serviços Pay-per-use", "Próximo ao Metrô", "Ideal para Airbnb e Short-stay"]'::jsonb,
    '/assets/7698d.png',
    '["/assets/7698d.png", "/assets/bb9df.png"]'::jsonb,
    'https://imovel.corretoron.com.br/helbor-vm125/61944',
    'Olá Márcio, tenho interesse nos studios do Helbor VM 125 na Vila Madalena.',
    'Helbor VM 125 - Studios e Salas na Vila Madalena | São Paulo',
    'Invista na Vila Madalena com o Helbor VM 125. Studios modernos com alto potencial de rentabilidade.'
)
ON CONFLICT (slug) DO NOTHING;
