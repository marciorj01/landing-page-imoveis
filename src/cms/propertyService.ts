import { supabase } from "../lib/supabase";
import { Property } from "./types";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: "prop-bioma",
    slug: "bioma",
    title: "Bioma",
    property_type: "Apartamento",
    purpose: "venda",
    status: "published",
    featured: true,
    tag: "Lançamento",
    price: "Sob Consulta",
    neighborhood: "Ahú",
    city: "Curitiba",
    state: "PR",
    address: "Rua Vereador Washington Mansur, Ahú, Curitiba - PR",
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parking_spots: 2,
    private_area: 140,
    total_area: 191,
    summary: "Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.",
    description:
      "O Bioma é a expressão máxima de arquitetura contemporânea e integração com a natureza no coração do Ahú. Com plantas flexíveis de 90 a 191m², o empreendimento conta com acabamento de alto padrão, isolamento acústico superior, amplas varandas e áreas de lazer completas equipadas e decoradas com elegância e requinte.",
    features: [
      "Piscina Aquecida",
      "Espaço Fitness",
      "Salão de Festas Gourmet",
      "Bicicletário",
      "Brinquedoteca",
      "Guarita Blindada",
      "Energia Solar para Áreas Comuns",
      "Varanda com Churrasqueira",
    ],
    main_image: "/assets/e8527.png",
    gallery: ["/assets/e8527.png", "/assets/08ae9.png", "/assets/bb9df.png"],
    target_url: "/bioma.html",
    whatsapp_custom_message: "Olá Márcio, tenho interesse no empreendimento Bioma no Ahú.",
    seo_title: "Bioma - Apartamentos de Alto Padrão no Ahú | Curitiba",
    seo_description: "Conheça o Bioma da ATR no Ahú. Plantas de 90 a 191m² com acabamento refinado e lazer completo.",
  },
  {
    id: "prop-oas",
    slug: "oas",
    title: "Oás",
    property_type: "Apartamento",
    purpose: "venda",
    status: "published",
    featured: true,
    tag: "Em obras",
    price: "Sob Consulta",
    condo_fee: "Sob consulta",
    neighborhood: "Bigorrilho",
    city: "Curitiba",
    state: "PR",
    address: "Bigorrilho, Curitiba - PR",
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parking_spots: 3,
    private_area: 250,
    total_area: 380,
    summary: "50 andares diferente de tudo o que você já viu. O OÁS conecta você com a cidade nas nuvens.",
    description:
      "Com 50 andares, o OÁS é um marco na arquitetura de Curitiba e o residencial mais alto da cidade. Projetado para quem busca exclusividade absoluta, oferece vista 360 graus panorâmica para a Serra do Mar e o Parque Barigui. Uma infraestrutura incomparável com heliponto, spa panorâmico, piscinas suspensas e concierge internacional.",
    features: [
      "Torre de 50 Andares",
      "Vista 360° Panorâmica",
      "Piscina Suspensa",
      "Spa & Wellness Center",
      "Elevadores Inteligentes de Alta Velocidade",
      "Segurança com Reconhecimento Facial",
      "Adega Climatizada Privativa",
      "Carregamento para Veículos Elétricos",
    ],
    main_image: "/assets/613f6.png",
    gallery: ["/assets/613f6.png", "/assets/1c45d.png", "/assets/08ae9.png"],
    target_url: "/oas.html",
    whatsapp_custom_message: "Olá Márcio, gostaria de mais informações e apresentação do OÁS no Bigorrilho.",
    seo_title: "OÁS - O Maior Ícone Residencial de Curitiba | Bigorrilho",
    seo_description: "50 andares de puro luxo no Bigorrilho. Conheça as unidades exclusivas do OÁS com vista para o Barigui.",
  },
  {
    id: "prop-helbor",
    slug: "helbor-vm-125",
    title: "Helbor VM 125",
    property_type: "Studio",
    purpose: "venda",
    status: "published",
    featured: true,
    tag: "Lançamento",
    price: "Sob Consulta",
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    state: "SP",
    address: "Vila Madalena, São Paulo - SP",
    bedrooms: 1,
    suites: 1,
    bathrooms: 1,
    parking_spots: 1,
    private_area: 30,
    total_area: 45,
    summary: "Um endereço que combina facilidade para ir e vir com cultura, gastronomia e conveniência por perto.",
    description:
      "Localizado no bairro mais vibrante e cosmopolita de São Paulo, o Helbor VM 125 foi desenhado para moradia moderna e alto retorno de investimento em locação. Studios inteligentes de 27 a 30m² e salas comerciais de 24 a 55m² a poucos passos de estações de metrô, restaurantes renomados e galerias de arte da Vila Madalena.",
    features: [
      "Rooftop com Piscina e Lounge",
      "Coworking Integrado",
      "Lavanderia Compartilhada",
      "Academia no Último Andar",
      "Serviços Pay-per-use",
      "Próximo ao Metrô",
      "Ideal para Airbnb e Short-stay",
    ],
    main_image: "/assets/7698d.png",
    gallery: ["/assets/7698d.png", "/assets/bb9df.png"],
    target_url: "https://imovel.corretoron.com.br/helbor-vm125/61944",
    whatsapp_custom_message: "Olá Márcio, tenho interesse nos studios do Helbor VM 125 na Vila Madalena.",
    seo_title: "Helbor VM 125 - Studios e Salas na Vila Madalena | São Paulo",
    seo_description: "Invista na Vila Madalena com o Helbor VM 125. Studios modernos com alto potencial de rentabilidade.",
  },
];

/**
 * Busca imóveis publicados para exibição pública no site e na home
 */
export async function getPublishedProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[PropertyService] Tabela de imóveis inacessível no Supabase, usando fallback padrão:", error.message);
      return DEFAULT_PROPERTIES;
    }

    return (data || []) as Property[];
  } catch (err) {
    console.warn("[PropertyService] Falha de conexão, usando fallback padrão:", err);
    return DEFAULT_PROPERTIES;
  }
}

/**
 * Busca imóvel específico pelo slug amigável (ex: /imovel/bioma)
 */
export async function getPropertyBySlug(
  slug: string,
  isDraft: boolean = false
): Promise<Property | null> {
  const cleanSlug = slug.trim().toLowerCase();

  try {
    let query = supabase.from("properties").select("*").eq("slug", cleanSlug);

    if (!isDraft) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.maybeSingle();

    if (!error) {
      return (data as Property) || null;
    }

    // Se falhou por erro de tabela inexistente (ex: antes da migração SQL), busca no fallback padrão
    const fallback = DEFAULT_PROPERTIES.find((p) => p.slug === cleanSlug);
    if (fallback) {
      // Se não for rascunho e o status for published, retorna fallback
      if (!isDraft && fallback.status !== "published") return null;
      return fallback;
    }

    return null;
  } catch {
    const fallback = DEFAULT_PROPERTIES.find((p) => p.slug === cleanSlug);
    return fallback || null;
  }
}

/**
 * Busca todos os imóveis (publicados, rascunhos e arquivados) para o painel de administração
 */
export async function getAllAdminProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Apenas recorre aos padrões se houver erro técnico (ex: tabela ainda não criada)
      console.warn("[PropertyService] Erro ao carregar imóveis do Supabase, exibindo padrão:", error.message);
      return DEFAULT_PROPERTIES;
    }

    return (data || []) as Property[];
  } catch {
    return DEFAULT_PROPERTIES;
  }
}

/**
 * Salva ou atualiza um imóvel no Supabase
 */
export async function saveProperty(property: Property): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      ...property,
      id: property.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `prop-${Date.now()}`),
      slug: property.slug ? slugify(property.slug) : slugify(property.title),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("properties")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro desconhecido ao salvar imóvel." };
  }
}

/**
 * Exclui um imóvel do Supabase
 */
export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao excluir imóvel." };
  }
}

/**
 * Duplica um imóvel criando um novo ID e slug derivado
 */
export async function duplicateProperty(property: Property): Promise<{ success: boolean; newProperty?: Property; error?: string }> {
  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `prop-${Date.now()}`;
  const newTitle = `${property.title} (Cópia)`;
  const newSlug = `${slugify(property.slug)}-copia-${Math.random().toString(36).substring(2, 6)}`;

  const duplicated: Property = {
    ...property,
    id: newId,
    title: newTitle,
    slug: newSlug,
    status: "draft", // Cópias nascem sempre como rascunho por segurança
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const res = await saveProperty(duplicated);
  if (!res.success) {
    return { success: false, error: res.error };
  }

  return { success: true, newProperty: duplicated };
}

