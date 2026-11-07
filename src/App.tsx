import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";

const A = "/assets";
const whatsapp =
  "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis";

const navItems = [
  ["Home", "#home"],
  ["Imóveis", "#imoveis"],
  ["Soluções", "#solucoes"],
  ["Sobre", "#sobre"],
];

const services = [
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

const propertyLandingPages: Record<string, string> = {
  "Oás": "/oas.html",
  "Bioma": "/bioma.html",
  "Helbor VM 125": "https://imovel.corretoron.com.br/helbor-vm125/61944",
};

const properties = [
  {
    image: "e8527.png",
    tag: "Lançamento",
    place: "Curitiba - Ahú",
    name: "Bioma",
    description: "Apresentação mais refinada do acabamento de alto padrão que é assinatura da ATR.",
    detail: "O empreendimento traz plantas de 90 a 191m²",
    imageClass: "property-image-bioma",
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
  },
];

const partners = [
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

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      href="#home"
      aria-label="Márcio Rogério - início"
    >
      <img src={`${A}/9b2b4.svg`} alt="" />
      <span>
        <strong>Márcio Rogério</strong>
        <small>Corretor de imóveis</small>
        <small>CRECI: F 59138</small>
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  lineAsset,
  children,
}: {
  eyebrow: string;
  lineAsset: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="section-heading">
      <div className="eyebrow-row">
        <p>{eyebrow}</p>
        <img src={`${A}/${lineAsset}`} alt="" />
      </div>
      {children}
    </header>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLeadProperty, setActiveLeadProperty] = useState<{
    name: string;
    targetUrl: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="home">
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="page-shell topbar">
          <Brand />
          <nav
            className={menuOpen ? "main-nav is-open" : "main-nav"}
            aria-label="Navegação principal"
          >
            {navItems.map(([label, href]) => (
              <a href={href} key={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
            <a
              className="outline-button mobile-contact"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Fale com o corretor
            </a>
          </nav>
          <a
            className="outline-button desktop-contact"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Fale com o corretor
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <section className="hero">
        <img
          className="hero-image"
          src={`${A}/bb9df.png`}
          alt="Empreendimento residencial contemporâneo"
        />
        <div className="hero-shade" />
        <div className="page-shell hero-content">
          <div className="hero-copy">
            <h1>Seu próximo movimento no mercado imobiliário começa aqui.</h1>
            <p>Oportunidades para diferentes objetivos e momentos.</p>
            <strong>Curadoria imobiliária · Moradia · Patrimônio</strong>
          </div>
        </div>
      </section>

      <section className="services page-shell" aria-labelledby="services-title">
        <div className="services-title">
          <img src={`${A}/4026a.svg`} alt="" />
          <h2 id="services-title">Encontre a solução ideal</h2>
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
              <img src={`${A}/${service.icon}`} alt="" />
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="properties page-shell" id="imoveis">
        <SectionHeading eyebrow="Imóveis em destaque" lineAsset="00449.svg">
          <p>Projetos que combinam localização, arquitetura e potencial.</p>
        </SectionHeading>
        <div className="properties-grid">
          {properties.map((property) => (
            <article className="property-card" key={property.name}>
              <div className="property-media">
                <img
                  className={property.imageClass}
                  src={`${A}/${property.image}`}
                  alt={`Empreendimento ${property.name}`}
                />
                <span>{property.tag}</span>
              </div>
              <p className="property-place">{property.place}</p>
              <h3>{property.name}</h3>
              <p className="property-description">{property.description}</p>
              <p className="property-detail">{property.detail}</p>
              {propertyLandingPages[property.name] ? (
                <button
                  type="button"
                  className="small-button cursor-pointer"
                  onClick={() =>
                    setActiveLeadProperty({
                      name: property.name,
                      targetUrl: propertyLandingPages[property.name],
                    })
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

      <section className="launches page-shell" aria-labelledby="launches-title">
        <SectionHeading eyebrow="Empreendimentos e lançamentos" lineAsset="f3ee3.svg" />
        <div className="launches-content">
          <h2 id="launches-title">
            Conheça os principais lançamentos e empreendimentos do mercado
          </h2>
          <div className="logo-marquee" aria-label="Construtoras parceiras">
            <div className="logo-track">
              {[0, 1, 2].map((copy) => (
                <div className="logo-set" key={copy} aria-hidden={copy !== 0}>
                  <img src={`${A}/c9a56.png`} alt={copy === 0 ? "ATR" : ""} />
                  <img src={`${A}/65898.png`} alt={copy === 0 ? "GT Building" : ""} />
                  <span className="helbor-logo">
                    <img src={`${A}/56a79.svg`} alt="" />
                    <img src={`${A}/260c8.svg`} alt="" />
                    <img src={`${A}/8c6c5.svg`} alt={copy === 0 ? "Helbor" : ""} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="solutions page-shell" id="solucoes">
        <SectionHeading eyebrow="Soluções que ampliam suas possibilidades" lineAsset="c5e5c.svg">
          <h2>Parcerias que conectam as melhores oportunidades</h2>
        </SectionHeading>
        <div className="partners-grid">
          {partners.map((partner, index) => (
            <article className="partner-card" key={partner.title}>
              <div className="partner-logo-frame">
                <img className={partner.logoClass} src={`${A}/${partner.logo}`} alt="" />
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

      <section className="about page-shell" id="sobre">
        <div className="portrait">
          <img
            className="portrait-room"
            src={`${A}/08ae9.png`}
            alt="Ambiente residencial sofisticado"
          />
          <img
            className="portrait-person"
            src={`${A}/cbd86.png`}
            alt="Márcio Rogério, corretor de imóveis"
          />
        </div>
        <div className="about-copy">
          <p className="about-eyebrow">Mais do que encontrar um imóvel</p>
          <h2>
            Escolhas imobiliárias com <span>visão de futuro.</span>
          </h2>
          <p>
            Cada cliente tem um momento, um objetivo e uma história. Meu trabalho é entender suas
            prioridades e apresentar opções com transparência, conhecimento de mercado e
            acompanhamento.
          </p>
          <div className="signature">
            <img src={`${A}/c39c5.png`} alt="Assinatura Márcio Rogério" />
            <span>CRECI 59.138 | F</span>
          </div>
        </div>
      </section>

      <section className="consulting">
        <img src={`${A}/1c45d.png`} alt="" />
        <div className="consulting-shade" />
        <div className="page-shell">
          <h2>Conte com uma consultoria e visão de mercado</h2>
        </div>
      </section>

      <footer>
        <div className="page-shell footer-content">
          <div className="footer-about">
            <Brand inverse />
            <p>
              Curadoria imobiliária, atendimento consultivo e oportunidades para morar e investir.
            </p>
          </div>
          <nav aria-label="Navegação do rodapé">
            {navItems.map(([label, href], index) => (
              <span key={href}>
                {index > 0 && <img src={`${A}/3a4ea.svg`} alt="" />}
                <a href={href}>{label}</a>
              </span>
            ))}
            <span>
              <img src={`${A}/3a4ea.svg`} alt="" />
              <a href={whatsapp} target="_blank" rel="noreferrer">
                Contato
              </a>
            </span>
          </nav>
          <div className="socials">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <img src={`${A}/d4ad8.svg`} alt="" />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <img src={`${A}/a9895.svg`} alt="" />
            </a>
          </div>
          <p className="copyright">
            © 2026 Márcio Rogério Corretor de Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <LeadModal
        isOpen={Boolean(activeLeadProperty)}
        onClose={() => setActiveLeadProperty(null)}
        propertyName={activeLeadProperty?.name || ""}
        targetUrl={activeLeadProperty?.targetUrl || "/oas.html"}
      />
    </main>
  );
}
