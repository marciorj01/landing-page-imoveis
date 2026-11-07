import { A, SectionHeading } from "./shared";
import { PropertiesBlockProps, PropertyData } from "../types";

const DEFAULT_PROPERTIES: PropertyData[] = [
  {
    image: "e8527.png",
    tag: "Lançamento",
    place: "Curitiba - Ahú",
    name: "Bioma",
    description: "Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.",
    detail: "O empreendimento traz plantas de 90 a 191m²",
    imageClass: "property-image-bioma",
    targetUrl: "/bioma.html",
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
  },
];

interface ExtendedPropertiesBlockProps extends Partial<PropertiesBlockProps> {
  onOpenLeadModal?: (name: string, targetUrl: string) => void;
}

export default function PropertiesBlock({
  eyebrow = "Imóveis em destaque",
  subtitle = "Projetos que combinam localização, arquitetura e potencial.",
  properties = DEFAULT_PROPERTIES,
  onOpenLeadModal,
}: ExtendedPropertiesBlockProps) {
  return (
    <section className="properties page-shell" id="imoveis">
      <SectionHeading eyebrow={eyebrow} lineAsset="00449.svg">
        <p>{subtitle}</p>
      </SectionHeading>
      <div className="properties-grid">
        {properties.map((property) => (
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
            {property.targetUrl ? (
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
                href={`https://wa.me/5541991080293?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20do%20${encodeURIComponent(property.name)}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver detalhes
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
