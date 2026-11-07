import { supabase } from "./supabase";

export interface SiteConfig {
  site_title: string;
  creci: string;
  whatsapp_phone: string;
  whatsapp_display: string;
  contact_email: string;
  instagram_url: string;
  facebook_url: string;
  primary_color: string;
  accent_color: string;
  meta_description: string;
}

export interface PropertyItem {
  id: string;
  name: string;
  tag: string;
  place: string;
  description: string;
  detail: string;
  image: string;
  targetUrl: string;
  active: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PartnerButton {
  label: string;
  href: string;
}

export interface PartnerItem {
  name: string;
  logo: string;
  actionRows: PartnerButton[][];
}

export interface HeroData {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  avatarText: string;
  experienceBadge: string;
}

export interface AboutData {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  paragraph1: string;
  paragraph2: string;
  name: string;
  creci: string;
  photoUrl: string;
  signatureUrl: string;
}

export interface PageData {
  hero: HeroData;
  partners: PartnerItem[];
  services: ServiceItem[];
  properties: PropertyItem[];
  about: AboutData;
  seo?: {
    title: string;
    description: string;
  };
}

// Configurações padrão iniciais (preservam com exatidão o layout do Figma)
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  site_title: "Márcio Rogério | Corretor de Imóveis - CRECI 59.138-F",
  creci: "59.138-F",
  whatsapp_phone: "5541991080293",
  whatsapp_display: "(41) 99108-0293",
  contact_email: "marciorj01@gmail.com",
  instagram_url: "https://www.instagram.com/marciorjcorretor/",
  facebook_url: "https://www.facebook.com/",
  primary_color: "#060c1d",
  accent_color: "#c5a880",
  meta_description: "Consultoria imobiliária especializada em lançamentos e imóveis de alto padrão em Curitiba e São Paulo.",
};

export const DEFAULT_PAGE_DATA: PageData = {
  hero: {
    eyebrow: "MÁRCIO ROGÉRIO · CORRETOR DE IMÓVEIS",
    headlineLine1: "Atendimento",
    headlineLine2: "personalizado com",
    headlineLine3: "visão de futuro.",
    subtitle: "Consultoria imobiliária que conecta clientes aos melhores lançamentos e imóveis de alto padrão em Curitiba e São Paulo.",
    ctaPrimaryText: "Conhecer Imóveis",
    ctaPrimaryLink: "#imoveis",
    ctaSecondaryText: "Falar com corretor",
    ctaSecondaryLink: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis",
    avatarText: "Mais de 10 anos de experiência no mercado imobiliário",
    experienceBadge: "10+ Anos de Experiência",
  },
  partners: [
    {
      name: "Loft",
      logo: "246bf.png",
      actionRows: [
        [{ label: "Simulador imobiliário", href: "https://simular.credihome.com.br/marciorj-corretor" }],
        [
          { label: "Garantir meu aluguel", href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20seguro%20locação" },
          { label: "Aluguel sem fiador", href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20locação%20sem%20fiador" },
        ],
      ],
    },
    {
      name: "QuintoAndar",
      logo: "9cc58.png",
      actionRows: [
        [
          { label: "Comprar", href: "https://www.quintoandar.com.br/" },
          { label: "Alugar", href: "https://www.quintoandar.com.br/" },
        ],
      ],
    },
    {
      name: "Sprint",
      logo: "40514.png",
      actionRows: [
        [
          { label: "Simulador imobiliário", href: "https://sprintnegocios.com.br" },
          { label: "Consórcio", href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20consorcios" },
        ],
      ],
    },
  ],
  services: [
    {
      id: "1",
      title: "Consultoria de compra e venda",
      description: "Orientação estratégica em todas as etapas da negociação, com foco em segurança jurídica e melhores oportunidades.",
      icon: "92395.svg",
    },
    {
      id: "2",
      title: "Assessoria em financiamento",
      description: "Apoio completo para encontrar as melhores condições de crédito imobiliário através dos principais bancos e parceiros.",
      icon: "a43dc.svg",
    },
    {
      id: "3",
      title: "Soluções de locação e garantia",
      description: "Alternativas modernas para alugar com agilidade e sem burocracia, incluindo opções sem fiador e com garantia locatícia.",
      icon: "e9e2b.svg",
    },
    {
      id: "4",
      title: "Avaliação mercadológica",
      description: "Análise técnica e precisa do valor de mercado do seu imóvel para garantir negociações vantajosas e realistas.",
      icon: "766a0.svg",
    },
  ],
  properties: [
    {
      id: "bioma",
      name: "Bioma",
      tag: "Lançamento",
      place: "Curitiba - Ahú",
      description: "Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.",
      detail: "O empreendimento traz plantas de 90 a 191m²",
      image: "e8527.png",
      targetUrl: "/bioma.html",
      active: true,
    },
    {
      id: "oas",
      name: "Oás",
      tag: "Em obras",
      place: "Curitiba - Bigorrilho",
      description: "50 andares diferente de tudo o que você já viu. O OÁS conecta você com a cidade e com a emoção de estar quase nas nuvens.",
      detail: "Entrega: 06/2027",
      image: "613f6.png",
      targetUrl: "/oas.html",
      active: true,
    },
    {
      id: "helbor-vm125",
      name: "Helbor VM 125",
      tag: "Lançamento",
      place: "São Paulo - Vila Madalena",
      description: "Um endereço que combina facilidade para ir e vir com cultura, lazer, gastronomia e conveniência por perto.",
      detail: "Studios 27 a 30 m² privativos | Salas comerciais de 24 a 55 m²",
      image: "7698d.png",
      targetUrl: "https://imovel.corretoron.com.br/helbor-vm125/61944",
      active: true,
    },
  ],
  about: {
    eyebrow: "SOBRE MÁRCIO ROGÉRIO",
    titleLine1: "Escolhas imobiliárias",
    titleLine2: "com visão de futuro.",
    paragraph1: "Cada cliente tem um momento, um objetivo e uma história. Meu trabalho é entender suas prioridades e apresentar opções com transparência, conhecimento de mercado e acompanhamento.",
    paragraph2: "Com anos de experiência nos mercados de Curitiba e São Paulo, conecto pessoas aos empreendimentos mais promissores e exclusivos, garantindo segurança jurídica e solidez patrimonial em cada negociação.",
    name: "Marcio Rogério",
    creci: "CRECI 59.138 | F",
    photoUrl: "/assets/ef9a9.png",
    signatureUrl: "/assets/c39c5.png",
  },
};

// Funções de Acesso ao Banco com Fallback Seguro
export async function getSiteConfig(): Promise<SiteConfig> {
  if (!supabase) return DEFAULT_SITE_CONFIG;
  try {
    const { data, error } = await supabase
      .from("cms_site_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...data };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(newConfig: Partial<SiteConfig>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("cms_site_config")
      .update({ ...newConfig, updated_at: new Date().toISOString() })
      .eq("id", 1);
    return !error;
  } catch {
    return false;
  }
}

export async function getPageData(slug: string = "home"): Promise<PageData> {
  if (!supabase) return DEFAULT_PAGE_DATA;
  try {
    const { data, error } = await supabase
      .from("cms_pages")
      .select("sections")
      .eq("slug", slug)
      .single();

    if (error || !data || !data.sections) {
      return DEFAULT_PAGE_DATA;
    }
    return { ...DEFAULT_PAGE_DATA, ...data.sections };
  } catch {
    return DEFAULT_PAGE_DATA;
  }
}

export async function savePageData(
  slug: string,
  data: PageData,
  publish: boolean = true
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase não conectado" };
  try {
    const status = publish ? "published" : "draft";
    const { error } = await supabase.from("cms_pages").upsert(
      {
        slug,
        title: slug === "home" ? "Página Principal" : slug,
        status,
        sections: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) return { success: false, error: error.message };

    // Grava histórico
    try {
      await supabase.from("cms_history").insert([
        {
          page_slug: slug,
          snapshot: data,
          action: publish ? "publish" : "draft_save",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Histórico não bloqueia publicação
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro desconhecido" };
  }
}

export async function uploadMedia(file: File, bucketName: string = "property-media"): Promise<{ url: string; error?: string } | null> {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Tenta primeiro no bucket especificado (ex: property-media para fotos de imóveis)
    let activeBucket = bucketName;
    let uploadRes = await supabase.storage
      .from(activeBucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    // Se o bucket não existir, tenta cms-media como contingência
    if (uploadRes.error && activeBucket !== "cms-media") {
      activeBucket = "cms-media";
      uploadRes = await supabase.storage
        .from(activeBucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
    }

    if (uploadRes.error) return { url: "", error: uploadRes.error.message };

    const { data: publicUrlData } = supabase.storage
      .from(activeBucket)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Registra na tabela cms_media se existir
    try {
      await supabase.from("cms_media").insert([
        {
          name: file.name,
          url: publicUrl,
          size: file.size,
          mime_type: file.type,
        },
      ]);
    } catch {
      // Ignora se cms_media ainda não tiver sido criada
    }

    return { url: publicUrl };
  } catch (err: any) {
    return { url: "", error: err?.message };
  }
}

