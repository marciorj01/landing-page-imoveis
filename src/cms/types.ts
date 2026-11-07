// ==============================================================================
// PROJETO MÁRCIO RJ CMS — TIPAGEM DO SCHEMA DE CONTEÚDO E BLOCOS
// ==============================================================================

export type PageStatus = "draft" | "published";

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: "_self" | "_blank";
  visible: boolean;
  order: number;
  children?: MenuItem[];
}

export interface BlockBase {
  id: string;
  type: string;
  visible?: boolean;
}

// 1. Bloco Hero
export interface HeroBlockProps extends BlockBase {
  type: "HeroBlock";
  title: string;
  subtitle: string;
  tagline: string;
  image?: string;
  imageAlt?: string;
}

// 2. Bloco de Soluções / Parcerias Principais (Loft, QuintoAndar, Sprint)
export interface PartnerAction {
  label: string;
  href: string;
}

export interface PartnerData {
  title: string;
  logo: string;
  logoClass: string;
  text: string;
  actionRows: PartnerAction[][];
}

export interface PartnersBlockProps extends BlockBase {
  type: "PartnersBlock";
  eyebrow: string;
  title: string;
  partners: PartnerData[];
}

// 3. Bloco de Imóveis em Destaque
export interface PropertyData {
  id?: string;
  name: string;
  tag: string;
  place: string;
  description: string;
  detail: string;
  image: string;
  imageClass: string;
  targetUrl?: string;
  active?: boolean;
}

export interface PropertiesBlockProps extends BlockBase {
  type: "PropertiesBlock";
  eyebrow?: string;
  subtitle?: string;
  properties?: PropertyData[];
}

// 4. Bloco de Lançamentos & Construtoras (Marquee Rolante)
export interface LaunchesMarqueeBlockProps extends BlockBase {
  type: "LaunchesMarqueeBlock";
  eyebrow?: string;
  title?: string;
}

// 5. Bloco de Serviços e Consultoria (4 cards com ícones)
export interface ServiceData {
  icon: string;
  title: string;
  text: string;
}

export interface ServicesBlockProps extends BlockBase {
  type: "ServicesBlock";
  title?: string;
  services?: ServiceData[];
}

// 6. Bloco Sobre o Corretor
export interface AboutBlockProps extends BlockBase {
  type: "AboutBlock";
  eyebrow?: string;
  titlePart1?: string;
  titleHighlight?: string;
  text?: string;
  creci?: string;
  signatureImage?: string;
  personImage?: string;
  roomImage?: string;
}

// 7. Bloco Faixa Consultoria
export interface ConsultingBannerBlockProps extends BlockBase {
  type: "ConsultingBannerBlock";
  title?: string;
  backgroundImage?: string;
}

// 8. Bloco de Texto / Conteúdo Livre (Para criação de novas páginas em branco)
export interface CustomTextBlockProps extends BlockBase {
  type: "CustomTextBlock";
  eyebrow?: string;
  title: string;
  contentHtml: string;
}

// União de todos os blocos possíveis
export type ContentBlock =
  | HeroBlockProps
  | PartnersBlockProps
  | PropertiesBlockProps
  | LaunchesMarqueeBlockProps
  | ServicesBlockProps
  | AboutBlockProps
  | ConsultingBannerBlockProps
  | CustomTextBlockProps;

export interface PageSchema {
  id?: string;
  slug: string;
  title: string;
  status: PageStatus;
  seo: SEOData;
  sections: ContentBlock[];
  updated_at?: string;
}
