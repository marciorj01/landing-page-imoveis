import { A } from "./shared";
import { ServicesBlockProps, ServiceData } from "../types";

const DEFAULT_SERVICES: ServiceData[] = [
  {
    icon: "ab55b.svg",
    title: "Comprar ou investir",
    text: "Apartamentos, Studio, Casa e imóveis rurais",
  },
  {
    icon: "d2348.svg",
    title: "Vender seu imóvel",
    text: "Conexão e negociação com compradores",
  },
  {
    icon: "eb1be.svg",
    title: "Alugar ou locar",
    text: "Opção para proprietários e inquilinos",
  },
  {
    icon: "bb308.svg",
    title: "Financiamento",
    text: "Suporte para viabilizar seu próximo imóvel",
  },
];

export default function ServicesBlock({
  title = "Encontre a solução ideal",
  services = DEFAULT_SERVICES,
}: Partial<ServicesBlockProps>) {
  return (
    <section className="services page-shell" aria-labelledby="services-title">
      <div className="services-title">
        <img src={`${A}/4026a.svg`} alt="" />
        <h2 id="services-title">{title}</h2>
        <img src={`${A}/7d67d.svg`} alt="" />
      </div>
      <div className="services-grid">
        {services.map((service, index) => (
          <article className="service-card" key={service.title}>
            {index > 0 && (
              <span className="service-divider" aria-hidden="true">
                <img src={`${A}/de5c4.svg`} alt="" />
              </span>
            )}
            <img
              src={service.icon.startsWith("http") || service.icon.startsWith("/assets") ? service.icon : `${A}/${service.icon}`}
              alt=""
            />
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

