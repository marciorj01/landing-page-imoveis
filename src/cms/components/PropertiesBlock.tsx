import { useState, useEffect } from "react";
import { A, SectionHeading } from "./shared";
import { PropertiesBlockProps, PropertyData } from "../types";
import { getPublishedProperties } from "../propertyService";

const FALLBACK_CAROUSEL_PROPERTIES: PropertyData[] = [
  {
    image: "e8527.png",
    tag: "Lançamento",
    place: "Curitiba - Ahú",
    name: "Bioma",
    description: "Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.",
    detail: "O empreendimento traz plantas de 90 a 191m²",
    imageClass: "property-image-bioma",
    targetUrl: "/bioma.html",
    slug: "bioma",
  },
  {
    image: "613f6.png",
    tag: "Em obras",
    place: "Curitiba - Bigorrilho",
    name: "Oás",
    description:
      "50 andares diferente de tudo o que você já viu. O OÁS conecta você com a cidade e com a emoção de estar quase nas nuvens.",
    detail: "Entrega: 06/2027",
    imageClass: "property-image-oas",
    targetUrl: "/oas.html",
    slug: "oas",
  },
  {
    image: "7698d.png",
    tag: "Lançamento",
    place: "São Paulo - Vila Madalena",
    name: "Helbor VM 125",
    description:
      "Um endereço que combina facilidade para ir e vir com cultura, lazer, gastronomia e conveniência por perto.",
    detail: "Studios 27 a 30 m² privativos | Salas comerciais de 24 a 55 m²",
    imageClass: "property-image-helbor",
    targetUrl: "https://imovel.corretoron.com.br/helbor-vm125/61944",
    slug: "helbor-vm-125",
  },
];

interface ExtendedPropertiesBlockProps extends Partial<PropertiesBlockProps> {
  onOpenLeadModal?: (name: string, targetUrl: string) => void;
}

export default function PropertiesBlock({
  eyebrow = "Imóveis em destaque",
  subtitle = "Projetos que combinam localização, arquitetura e potencial.",
  properties,
  onOpenLeadModal,
}: ExtendedPropertiesBlockProps) {
  const [activeProperties, setActiveProperties] = useState<PropertyData[]>(
    properties && properties.length > 0 ? properties : FALLBACK_CAROUSEL_PROPERTIES
  );

  useEffect(() => {
    if (properties && properties.length > 0) {
      setActiveProperties(properties);
      return;
    }

    // Busca imóveis publicados no gerenciador
    getPublishedProperties().then((published) => {
      if (published && published.length > 0) {
        const featured = published.filter((p) => p.featured);
        const listToDisplay = featured.length > 0 ? featured : published;

        const mapped: PropertyData[] = listToDisplay.map((p) => ({
          id: p.id,
          name: p.title,
          tag: p.tag || "Destaque",
          place: `${p.city}${p.neighborhood ? ` - ${p.neighborhood}` : ""}`,
          description: p.summary || p.description.slice(0, 120) + "...",
          detail: p.price,
          image: p.main_image,
          imageClass: p.slug === "bioma" ? "property-image-bioma" : p.slug === "oas" ? "property-image-oas" : "property-image-helbor",
          targetUrl: p.target_url || `/imovel/${p.slug}`,
          slug: p.slug,
        }));
        setActiveProperties(mapped);
      }
    });
  }, [properties]);

  return (
    <section className="properties page-shell" id="imoveis">
      <SectionHeading eyebrow={eyebrow} lineAsset="00449.svg">
        <p>{subtitle}</p>
      </SectionHeading>
      <div className="properties-grid">
        {activeProperties.map((property) => (
          <article className="property-card" key={property.name}>
            <div className="property-media">
              <img
                className={property.imageClass}
                src={property.image.startsWith("http") || property.image.startsWith("/assets") ? property.image : `${A}/${property.image}`}
                alt={`Empreendimento ${property.name}`}
              />
              <span>{property.tag}</span>
            </div>
            <p className="property-place">{property.place}</p>
            <h3>{property.name}</h3>
            <p className="property-description">{property.description}</p>
            <p className="property-detail">{property.detail}</p>
            {property.targetUrl && (property.targetUrl.endsWith(".html") || property.targetUrl.startsWith("http")) ? (
              <button
                type="button"
                className="small-button cursor-pointer"
                onClick={() =>
                  onOpenLeadModal?.(property.name, property.targetUrl || "")
                }
              >
                Ver detalhes
              </button>
            ) : (
              <a
                className="small-button"
                href={property.slug ? `/imovel/${property.slug}` : (property.targetUrl || "/imoveis")}
              >
                Ver detalhes
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/imoveis"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c5a880] hover:text-white transition py-2 px-4 border border-[#c5a880]/30 rounded-lg hover:border-[#c5a880]"
        >
          <span>Explorar Todos os Imóveis do Portfólio ↗</span>
        </a>
      </div>
    </section>
  );
}
