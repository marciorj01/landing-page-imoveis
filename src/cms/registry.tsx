import React from "react";
import HeroBlock from "./components/HeroBlock";
import ServicesBlock from "./components/ServicesBlock";
import PropertiesBlock from "./components/PropertiesBlock";
import LaunchesMarqueeBlock from "./components/LaunchesMarqueeBlock";
import PartnersBlock from "./components/PartnersBlock";
import AboutBlock from "./components/AboutBlock";
import ConsultingBannerBlock from "./components/ConsultingBannerBlock";
import CustomTextBlock from "./components/CustomTextBlock";
import { ContentBlock } from "./types";

export interface ComponentMetadata {
  name: string;
  category: "hero" | "conteudo" | "imoveis" | "parceiros" | "sobre" | "chamada";
  description: string;
  defaultData: ContentBlock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

export const BLOCK_REGISTRY: Record<string, ComponentMetadata> = {
  HeroBlock: {
    name: "Hero Principal",
    category: "hero",
    description: "Cabeçalho com imagem de destaque, título principal e chamada.",
    defaultData: {
      id: "hero-1",
      type: "HeroBlock",
      title: "Seu próximo movimento no mercado imobiliário começa aqui.",
      subtitle: "Oportunidades para diferentes objetivos e momentos.",
      tagline: "Curadoria imobiliária · Moradia · Patrimônio",
    },
    component: HeroBlock,
  },
  ServicesBlock: {
    name: "Serviços e Soluções",
    category: "conteudo",
    description: "Grade com os 4 pilares de atuação (comprar, vender, alugar, financiamento).",
    defaultData: {
      id: "services-1",
      type: "ServicesBlock",
      title: "Encontre a solução ideal",
    },
    component: ServicesBlock,
  },
  PropertiesBlock: {
    name: "Imóveis em Destaque",
    category: "imoveis",
    description: "Carrossel/grade de lançamentos imobiliários com captura de lead.",
    defaultData: {
      id: "properties-1",
      type: "PropertiesBlock",
      eyebrow: "Imóveis em destaque",
      subtitle: "Projetos que combinam localização, arquitetura e potencial.",
    },
    component: PropertiesBlock,
  },
  LaunchesMarqueeBlock: {
    name: "Lançamentos e Construtoras (Marquee)",
    category: "parceiros",
    description: "Faixa animada com logos de construtoras parceiras (ATR, GT Building, Helbor).",
    defaultData: {
      id: "marquee-1",
      type: "LaunchesMarqueeBlock",
      eyebrow: "Empreendimentos e lançamentos",
      title: "Conheça os principais lançamentos e empreendimentos do mercado",
    },
    component: LaunchesMarqueeBlock,
  },
  PartnersBlock: {
    name: "Parceiros e Financiamento",
    category: "parceiros",
    description: "Cartões de parceiros credenciados (Loft, QuintoAndar, Sprint).",
    defaultData: {
      id: "partners-1",
      type: "PartnersBlock",
      eyebrow: "Soluções que ampliam suas possibilidades",
      title: "Parcerias que conectam as melhores oportunidades",
      partners: [],
    },
    component: PartnersBlock,
  },
  AboutBlock: {
    name: "Sobre o Corretor",
    category: "sobre",
    description: "Seção institucional com foto de perfil, bio, assinatura e CRECI.",
    defaultData: {
      id: "about-1",
      type: "AboutBlock",
      eyebrow: "Mais do que encontrar um imóvel",
      titlePart1: "Escolhas imobiliárias com ",
      titleHighlight: "visão de futuro.",
      text: "Cada cliente tem um momento, um objetivo e uma história. Meu trabalho é entender suas prioridades e apresentar opções com transparência, conhecimento de mercado e acompanhamento.",
      creci: "CRECI 59.138 | F",
    },
    component: AboutBlock,
  },
  ConsultingBannerBlock: {
    name: "Banner Consultoria",
    category: "chamada",
    description: "Faixa visual com chamada para atendimento consultivo.",
    defaultData: {
      id: "consulting-1",
      type: "ConsultingBannerBlock",
      title: "Conte com uma consultoria e visão de mercado",
    },
    component: ConsultingBannerBlock,
  },
  CustomTextBlock: {
    name: "Conteúdo Livre / Texto",
    category: "conteudo",
    description: "Bloco flexível para texto, HTML e páginas institucionais personalizadas.",
    defaultData: {
      id: "text-1",
      type: "CustomTextBlock",
      eyebrow: "Informação",
      title: "Título da Seção",
      contentHtml: "<p>Digite seu texto aqui...</p>",
    },
    component: CustomTextBlock,
  },
};

