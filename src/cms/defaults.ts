import { PageSchema, MenuItem } from "./types";

export const DEFAULT_NAV_ITEMS: [string, string][] = [
  ["Home", "#home"],
  ["Imóveis", "#imoveis"],
  ["Soluções", "#solucoes"],
  ["Sobre", "#sobre"],
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "menu-1", label: "Home", url: "#home", visible: true, order: 0 },
  { id: "menu-2", label: "Imóveis", url: "#imoveis", visible: true, order: 1 },
  { id: "menu-3", label: "Soluções", url: "#solucoes", visible: true, order: 2 },
  { id: "menu-4", label: "Sobre", url: "#sobre", visible: true, order: 3 },
];

export const DEFAULT_WHATSAPP =
  "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis";

export const DEFAULT_HOME_PAGE_SCHEMA: PageSchema = {
  slug: "home",
  title: "Página Inicial - Márcio Rogério Corretor",
  status: "published",
  seo: {
    title: "Márcio Rogério - Corretor de Imóveis | CRECI 59.138-F",
    description:
      "Consultoria imobiliária de alto padrão em Curitiba e São Paulo. Conheça empreendimentos exclusivos como Oás, Bioma e Helbor VM 125.",
    keywords: "corretor de imóveis, curitiba, são paulo, oás, bioma, helbor, alto padrão",
  },
  sections: [
    {
      id: "hero-section",
      type: "HeroBlock",
      title: "Seu próximo movimento no mercado imobiliário começa aqui.",
      subtitle: "Oportunidades para diferentes objetivos e momentos.",
      tagline: "Curadoria imobiliária · Moradia · Patrimônio",
      visible: true,
    },
    {
      id: "services-section",
      type: "ServicesBlock",
      title: "Encontre a solução ideal",
      visible: true,
    },
    {
      id: "properties-section",
      type: "PropertiesBlock",
      eyebrow: "Imóveis em destaque",
      subtitle: "Projetos que combinam localização, arquitetura e potencial.",
      visible: true,
    },
    {
      id: "launches-section",
      type: "LaunchesMarqueeBlock",
      eyebrow: "Empreendimentos e lançamentos",
      title: "Conheça os principais lançamentos e empreendimentos do mercado",
      visible: true,
    },
    {
      id: "partners-section",
      type: "PartnersBlock",
      eyebrow: "Soluções que ampliam suas possibilidades",
      title: "Parcerias que conectam as melhores oportunidades",
      visible: true,
    },
    {
      id: "about-section",
      type: "AboutBlock",
      eyebrow: "Mais do que encontrar um imóvel",
      titlePart1: "Escolhas imobiliárias com ",
      titleHighlight: "visão de futuro.",
      text: "Cada cliente tem um momento, um objetivo e uma história. Meu trabalho é entender suas prioridades e apresentar opções com transparência, conhecimento de mercado e acompanhamento.",
      creci: "CRECI 59.138 | F",
      visible: true,
    },
    {
      id: "consulting-section",
      type: "ConsultingBannerBlock",
      title: "Conte com uma consultoria e visão de mercado",
      visible: true,
    },
  ],
};

