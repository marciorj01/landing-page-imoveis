import { A, SectionHeading } from "./shared";
import { PartnersBlockProps, PartnerData } from "../types";

const DEFAULT_PARTNERS: PartnerData[] = [
  {
    logo: "9cc58.png",
    logoClass: "partner-logo-quinto",
    title: "Anuncie seu imóvel gratuitamente",
    text: "No QuintoAndar, seu imóvel pode ser visto por mais de 15 milhões de pessoas por mês. O anúncio é rápido, gratuito e a gente te ajuda a definir o valor ideal com base em dados de mercado.",
    actionRows: [
      [
        {
          label: "Cadastre seu imóvel",
          href: "https://portalcaptacao.quintoandar.com.br/marciorj01-59138",
        },
      ],
    ],
  },
  {
    logo: "6c0d8.svg",
    logoClass: "partner-logo-loft",
    title: "Crédito Imobiliário e Fiança Fácil",
    text: "Simule seu financiamento imobiliário em instantes com a Loft e garanta as melhores condições. Para locações, oferecemos fiança ágil e sem fiador para o inquilino, com garantia de recebimento seguro para o proprietário.",
    actionRows: [
      [
        {
          label: "Simulador imobiliário",
          href: "https://simular.credihome.com.br/marciorj-corretor",
        },
      ],
      [
        {
          label: "Garantir meu aluguel",
          href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20seguro%20locação",
        },
        {
          label: "Aluguel sem fiador",
          href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20locação%20sem%20fiador",
        },
      ],
    ],
  },
  {
    logo: "40514.png",
    logoClass: "partner-logo-sprint",
    title: "Simulação e Crédito Imobiliário",
    text: "Acesse crédito imobiliário sem complicações. Com o sistema da Sprint, você simula valores na hora e tem assessoria completa para comparar propostas dos maiores bancos, escolhendo as parcelas e condições perfeitas para você.",
    actionRows: [
      [
        {
          label: "Simulador imobiliário",
          href: "https://app.sousprint.com.br/p/marcio-rogerio-de-jesus-b41410",
        },
      ],
    ],
  },
];

export default function PartnersBlock({
  eyebrow = "Soluções que ampliam suas possibilidades",
  title = "Parcerias que conectam as melhores oportunidades",
  partners = DEFAULT_PARTNERS,
}: Partial<PartnersBlockProps>) {
  return (
    <section className="solutions page-shell" id="solucoes">
      <SectionHeading eyebrow={eyebrow} lineAsset="c5e5c.svg">
        <h2>{title}</h2>
      </SectionHeading>
      <div className="partners-grid">
        {partners.map((partner, index) => (
          <article className="partner-card" key={partner.title}>
            <div className="partner-logo-frame">
              <img
                className={partner.logoClass}
                src={partner.logo.startsWith("http") || partner.logo.startsWith("/assets") ? partner.logo : `${A}/${partner.logo}`}
                alt=""
              />
            </div>
            <h3>{partner.title}</h3>
            <img className="partner-rule" src={`${A}/0e5e3.svg`} alt="" />
            <p>{partner.text}</p>
            <div className="partner-actions">
              {partner.actionRows.map((row, rIdx) => (
                <div key={rIdx} className="partner-actions-row">
                  {row.map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            {index < partners.length - 1 && (
              <img
                className="partner-divider"
                src={`${A}/${index === 0 ? "03d17.svg" : "20816.svg"}`}
                alt=""
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
