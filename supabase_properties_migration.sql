-- ==============================================================================
-- MÁRCIO RJ CMS — MIGRAÇÃO SUPABASE: TABELA DE IMÓVEIS (VERSÃO REVISADA FINAL)
-- STATUS: AGUARDANDO REVISÃO — NÃO EXECUTAR SEM AUTORIZAÇÃO EXPRESSA
-- ==============================================================================
-- AJUSTES OBRIGATÓRIOS IMPLEMENTADOS:
-- 1. SEGURANÇA TOTAL EM `cms_admin_users`:
--    - Removida qualquer permissão de escrita para usuários comuns.
--    - Escrita (INSERT, UPDATE, DELETE) restrita estritamente a quem já possui a
--      claim de servidor `app_metadata -> role = 'admin'` (ou via service_role).
--    - Elimina completamente o risco de escalada de privilégios.
-- 2. CONFIABILIDADE E ROBUSTEZ DA MIGRAÇÃO:
--    - Removidos todos os blocos de supressão de erro (EXCEPTION WHEN others THEN NULL).
--    - Conversões de tipos explícitas com USING ...::text baseadas na inspeção de
--      information_schema.columns. Se houver erro, a migração falha imediatamente.
--    - Verificação e garantia de PRIMARY KEY em `id`.
--    - Verificação e garantia de restrição UNIQUE em `slug`.
--    - Preservação integral das restrições caso já existam no banco.
-- 3. PRESERVAÇÃO INTEGRAL:
--    - NÃO altera a tabela `leads`, os e-books ou o bucket `cms-media`.
--    - Storage isolado no bucket `property-media` com ON CONFLICT (id) DO NOTHING.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA DE ADMINISTRADORES AUTORIZADOS & FUNÇÃO is_admin()
-- ------------------------------------------------------------------------------
-- Registra UUIDs autorizados vinculados diretamente a auth.users
CREATE TABLE IF NOT EXISTS public.cms_admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT DEFAULT 'Administrador autorizado do CMS',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cms_admin_users ENABLE ROW LEVEL SECURITY;

-- Limpeza preventiva de políticas antigas exclusivamente nesta tabela
DROP POLICY IF EXISTS "admin_users_isolate" ON public.cms_admin_users;
DROP POLICY IF EXISTS "admin_users_select" ON public.cms_admin_users;
DROP POLICY IF EXISTS "admin_users_write" ON public.cms_admin_users;

-- A. Leitura: Usuários autenticados podem consultar a tabela apenas para verificar
-- sua própria autorização ou se já possuem claim de servidor (app_metadata -> role = 'admin')
CREATE POLICY "admin_users_select"
    ON public.cms_admin_users
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR user_id = auth.uid()
    );

-- B. Escrita (INSERT, UPDATE, DELETE): EXCLUSIVA para quem já possui a role 'admin'
-- emitida pelo servidor no app_metadata (ou via Supabase Dashboard / service_role).
-- Usuários comuns NUNCA podem cadastrar a si mesmos ou a terceiros.
CREATE POLICY "admin_users_write"
    ON public.cms_admin_users
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Função de autorização administrativa robusta (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- 1. Verificação por role exclusiva atribuída pelo servidor no app_metadata (inalterável pelo cliente)
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- 2. Verificação por UUID explícito cadastrado na tabela de administradores autorizados
  IF EXISTS (
    SELECT 1 FROM public.cms_admin_users WHERE user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE IMÓVEIS (public.properties) & MIGRAÇÃO DEFENSIVA EXPLÍCITA
-- ------------------------------------------------------------------------------
-- Criação estrutural base caso a tabela não exista
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    property_type TEXT NOT NULL DEFAULT 'Apartamento',
    purpose TEXT NOT NULL DEFAULT 'venda',
    status TEXT NOT NULL DEFAULT 'draft',
    featured BOOLEAN NOT NULL DEFAULT false,
    tag TEXT,
    price TEXT,
    condo_fee TEXT,
    iptu TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Curitiba',
    state TEXT DEFAULT 'PR',
    bedrooms INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_spots INTEGER DEFAULT 0,
    private_area NUMERIC(10, 2),
    total_area NUMERIC(10, 2),
    summary TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    main_image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    whatsapp_custom_message TEXT,
    target_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Bloco defensivo de validação e conversão explícita (sem silenciamento de erros)
DO $$
DECLARE
    curr_type TEXT;
BEGIN
    -- Executa verificações detalhadas caso a tabela 'properties' já existisse previamente
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'properties'
    ) THEN

        -- A. Garantir que 'id' seja TEXT (converte explicitamente caso fosse UUID ou outro tipo)
        SELECT data_type INTO curr_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'id';

        IF curr_type IS NOT NULL AND curr_type NOT IN ('text', 'character varying') THEN
            ALTER TABLE public.properties ALTER COLUMN id TYPE TEXT USING id::text;
        END IF;

        -- B. Garantir que 'price' seja TEXT (suporta "Sob Consulta" e valores formatados)
        SELECT data_type INTO curr_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'price';

        IF curr_type IS NOT NULL AND curr_type NOT IN ('text', 'character varying') THEN
            ALTER TABLE public.properties ALTER COLUMN price TYPE TEXT USING price::text;
        END IF;

        -- C. Garantir que 'condo_fee' seja TEXT
        SELECT data_type INTO curr_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'condo_fee';

        IF curr_type IS NOT NULL AND curr_type NOT IN ('text', 'character varying') THEN
            ALTER TABLE public.properties ALTER COLUMN condo_fee TYPE TEXT USING condo_fee::text;
        END IF;

        -- D. Garantir que 'iptu' seja TEXT
        SELECT data_type INTO curr_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'iptu';

        IF curr_type IS NOT NULL AND curr_type NOT IN ('text', 'character varying') THEN
            ALTER TABLE public.properties ALTER COLUMN iptu TYPE TEXT USING iptu::text;
        END IF;

        -- E. Remoção explícita de restrições NOT NULL em colunas opcionais
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'price' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN price DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'condo_fee' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN condo_fee DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'iptu' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN iptu DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'summary' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN summary DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'description' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN description DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties'
              AND column_name = 'address' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE public.properties ALTER COLUMN address DROP NOT NULL;
        END IF;

        -- F. Garantir que 'id' possua restrição PRIMARY KEY
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'properties'
              AND tc.constraint_type = 'PRIMARY KEY'
        ) THEN
            ALTER TABLE public.properties ADD PRIMARY KEY (id);
        END IF;

        -- G. Garantir que 'slug' possua restrição UNIQUE
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'properties'
              AND tc.constraint_type = 'UNIQUE'
              AND kcu.column_name = 'slug'
        ) AND NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = 'properties'
              AND indexdef ILIKE '%UNIQUE%slug%'
        ) THEN
            ALTER TABLE public.properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);
        END IF;

    END IF;
END $$;

-- H. Adição idempotente de todas as colunas necessárias ao gerenciador
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
-- 3. ÍNDICES DE PERFORMANCE E CONSULTA
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS RLS ESPECÍFICAS (PRESERVANDO POLÍTICAS EXTERNAS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Remove APENAS as políticas específicas deste módulo de imóveis
DROP POLICY IF EXISTS "properties_select_published" ON public.properties;
DROP POLICY IF EXISTS "properties_admin_all" ON public.properties;

-- Visitantes públicos só podem ler imóveis marcados como 'published'
CREATE POLICY "properties_select_published"
    ON public.properties
    FOR SELECT
    TO public, anon, authenticated
    USING (status = 'published');

-- Somente administradores autenticados e autorizados por is_admin() têm acesso total
CREATE POLICY "properties_admin_all"
    ON public.properties
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TRIGGER DE updated_at AUTOMÁTICO
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
-- 6. STORAGE DEDICADO PARA FOTOS DE IMÓVEIS (property-media)
-- ------------------------------------------------------------------------------
-- O bucket `cms-media` permanece 100% inalterado.
-- Cria o bucket público exclusivo para imagens de imóveis caso não exista:
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage restritas ao bucket `property-media`
DROP POLICY IF EXISTS "property_media_public_read" ON storage.objects;
CREATE POLICY "property_media_public_read"
    ON storage.objects
    FOR SELECT
    TO public, anon, authenticated
    USING (bucket_id = 'property-media');

DROP POLICY IF EXISTS "property_media_admin_insert" ON storage.objects;
CREATE POLICY "property_media_admin_insert"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'property-media' AND public.is_admin());

DROP POLICY IF EXISTS "property_media_admin_update" ON storage.objects;
CREATE POLICY "property_media_admin_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'property-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'property-media' AND public.is_admin());

DROP POLICY IF EXISTS "property_media_admin_delete" ON storage.objects;
CREATE POLICY "property_media_admin_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'property-media' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. SEED: CARGA DOS 3 EMPREENDIMENTOS BASE (Publicados)
-- ------------------------------------------------------------------------------
INSERT INTO public.properties (
    id, slug, title, property_type, purpose, status, featured, tag,
    price, condo_fee, neighborhood, city, state, address,
    bedrooms, suites, bathrooms, parking_spots, private_area, total_area,
    summary, description, features, main_image, gallery,
    target_url, whatsapp_custom_message, seo_title, seo_description
) VALUES
(
    'prop-bioma', 'bioma', 'Bioma', 'Apartamento', 'venda', 'published', true, 'Lançamento',
    'Sob Consulta', 'Sob consulta', 'Ahú', 'Curitiba', 'PR', 'Rua Vereador Washington Mansur, Ahú, Curitiba - PR',
    3, 3, 4, 2, 140, 191,
    'Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.',
    'O Bioma é a expressão máxima de arquitetura contemporânea e integração com a natureza no coração do Ahú. Com plantas flexíveis de 90 a 191m², o empreendimento conta com acabamento de alto padrão, isolamento acústico superior, amplas varandas e áreas de lazer completas equipadas e decoradas com elegância e requinte.',
    '["Piscina Aquecida", "Espaço Fitness", "Salão de Festas Gourmet", "Bicicletário", "Brinquedoteca", "Guarita Blindada", "Energia Solar para Áreas Comuns", "Varanda com Churrasqueira"]'::jsonb,
    '/assets/e8527.png', '["/assets/e8527.png", "/assets/08ae9.png", "/assets/bb9df.png"]'::jsonb,
    '/bioma.html', 'Olá Márcio, tenho interesse no empreendimento Bioma no Ahú.',
    'Bioma - Apartamentos de Alto Padrão no Ahú | Curitiba',
    'Conheça o Bioma da ATR no Ahú. Plantas de 90 a 191m² com acabamento refinado e lazer completo.'
),
(
    'prop-oas', 'oas', 'Oás', 'Apartamento', 'venda', 'published', true, 'Em obras',
    'Sob Consulta', 'Sob consulta', 'Bigorrilho', 'Curitiba', 'PR', 'Bigorrilho, Curitiba - PR',
    4, 4, 5, 3, 250, 380,
    '50 andares diferente de tudo o que você já viu. O OÁS conecta você com a cidade nas nuvens.',
    'Com 50 andares, o OÁS é um marco na arquitetura de Curitiba e o residencial mais alto da cidade. Projetado para quem busca exclusividade absoluta, oferece vista 360 graus panorâmica para a Serra do Mar e o Parque Barigui. Uma infraestrutura incomparável com heliponto, spa panorâmico, piscinas suspensas e concierge internacional.',
    '["Torre de 50 Andares", "Vista 360° Panorâmica", "Piscina Suspensa", "Spa & Wellness Center", "Elevadores Inteligentes de Alta Velocidade", "Segurança com Reconhecimento Facial", "Adega Climatizada Privativa", "Carregamento para Veículos Elétricos"]'::jsonb,
    '/assets/613f6.png', '["/assets/613f6.png", "/assets/1c45d.png", "/assets/08ae9.png"]'::jsonb,
    '/oas.html', 'Olá Márcio, gostaria de mais informações e apresentação do OÁS no Bigorrilho.',
    'OÁS - O Maior Ícone Residencial de Curitiba | Bigorrilho',
    '50 andares de puro luxo no Bigorrilho. Conheça as unidades exclusivas do OÁS com vista para o Barigui.'
),
(
    'prop-helbor', 'helbor-vm-125', 'Helbor VM 125', 'Studio', 'venda', 'published', true, 'Lançamento',
    'Sob Consulta', 'Sob consulta', 'Vila Madalena', 'São Paulo', 'SP', 'Vila Madalena, São Paulo - SP',
    1, 1, 1, 1, 30, 45,
    'Um endereço que combina facilidade para ir e vir com cultura, gastronomia e conveniência por perto.',
    'Localizado no bairro mais vibrante e cosmopolita de São Paulo, o Helbor VM 125 foi desenhado para moradia moderna e alto retorno de investimento em locação. Studios inteligentes de 27 a 30m² e salas comerciais de 24 a 55m² a poucos passos de estações de metrô, restaurantes renomados e galerias de arte da Vila Madalena.',
    '["Rooftop com Piscina e Lounge", "Coworking Integrado", "Lavanderia Compartilhada", "Academia no Último Andar", "Serviços Pay-per-use", "Próximo ao Metrô", "Ideal para Airbnb e Short-stay"]'::jsonb,
    '/assets/7698d.png', '["/assets/7698d.png", "/assets/bb9df.png"]'::jsonb,
    'https://imovel.corretoron.com.br/helbor-vm125/61944', 'Olá Márcio, tenho interesse nos studios do Helbor VM 125 na Vila Madalena.',
    'Helbor VM 125 - Studios e Salas na Vila Madalena | São Paulo',
    'Invista na Vila Madalena com o Helbor VM 125. Studios modernos com alto potencial de rentabilidade.'
)
ON CONFLICT (slug) DO NOTHING;
