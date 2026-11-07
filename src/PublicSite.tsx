import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";
import VisualEditorBar from "./cms/VisualEditorBar";
import {
  PageData,
  SiteConfig,
  DEFAULT_PAGE_DATA,
  DEFAULT_SITE_CONFIG,
  getPageData,
  getSiteConfig,
  savePageData,
} from "./lib/cms";
import { useAuth } from "./cms/AuthContext";

const A = "/assets";

const navItems = [
  ["Home", "#home"],
  ["Imóveis", "#imoveis"],
  ["Soluções", "#solucoes"],
  ["Sobre", "#sobre"],
];

const staticServices = [
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

const partners = [
  {
    name: "Loft",
    logo: "246bf.png",
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
    name: "QuintoAndar",
    logo: "9cc58.png",
    actionRows: [
      [
        {
          label: "Comprar",
          href: "https://www.quintoandar.com.br/",
        },
        {
          label: "Alugar",
          href: "https://www.quintoandar.com.br/",
        },
      ],
    ],
  },
  {
    name: "Sprint",
    logo: "40514.png",
    actionRows: [
      [
        {
          label: "Simulador imobiliário",
          href: "https://sprintnegocios.com.br",
        },
        {
          label: "Consórcio",
          href: "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20consorcios",
        },
      ],
    ],
  },
];

function SectionHeading({
  eyebrow,
  lineAsset,
  children,
}: {
  eyebrow: string;
  lineAsset?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="eyebrow-row">
        <span>{eyebrow}</span>
        {lineAsset ? (
          <img className="heading-line" src={`${A}/${lineAsset}`} alt="" />
        ) : (
          <span className="heading-rule" />
        )}
      </div>
      {children}
    </div>
  );
}

export default function PublicSite() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLeadProperty, setActiveLeadProperty] = useState<{
    name: string;
    targetUrl: string;
  } | null>(null);

  // Estados dinâmicos do CMS
  const [pageData, setPageData] = useState<PageData>(DEFAULT_PAGE_DATA);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  // Modo Editor Visual
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carrega dados dinâmicos do Supabase
  useEffect(() => {
    getPageData("home").then(setPageData);
    getSiteConfig().then(setSiteConfig);

    // Se tiver parametro ?edit=true na URL, ativa o modo editor
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "true") {
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsapp = `https://wa.me/${siteConfig.whatsapp_phone}?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis`;

  // Salvar alterações feitas no modo Editor Visual
  const handlePublishVisualEdit = async () => {
    setSavingEdit(true);
    const res = await savePageData("home", pageData, true);
    setSavingEdit(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Erro ao publicar: " + res.error);
    }
  };

  return (
    <main className="landing-page" id="home">
      {/* Barra do Editor Visual (visível se ativado ou se administrador) */}
      {(user || isEditing) && (
        <VisualEditorBar
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onSave={handlePublishVisualEdit}
          saving={savingEdit}
          saveSuccess={saveSuccess}
        />
      )}

      <header className={`hero ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="hero-content page-shell">
          <nav className="site-header" aria-label="Navegação principal">
            <a className="brand-lockup" href="#home">
              <span className="brand-name">MÁRCIO ROGÉRIO</span>
              <span className="brand-role">CORRETOR DE IMÓVEIS</span>
            </a>

            <div className={`main-nav ${menuOpen ? "is-open" : ""}`}>
              {navItems.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              ))}
              <a
                className="outline-button mobile-contact"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Contato
              </a>
            </div>

            <a
              className="outline-button desktop-contact"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Contato
            </a>

            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-tag">
                <span className="hero-tag-text">{pageData.hero.eyebrow}</span>
                <span className="hero-tag-badge">{pageData.hero.experienceBadge}</span>
              </div>

              <h1>
                {pageData.hero.headlineLine1}
                <br />
                {pageData.hero.headlineLine2}
                <br />
                <span className="accent-italic">{pageData.hero.headlineLine3}</span>
              </h1>

              <p className="hero-description">{pageData.hero.subtitle}</p>

              <div className="hero-actions">
                <a className="primary-button" href={pageData.hero.ctaPrimaryLink}>
                  <span>{pageData.hero.ctaPrimaryText}</span>
                  <img src={`${A}/d549f.svg`} alt="" />
                </a>
                <a
                  className="hero-contact-button"
                  href={pageData.hero.ctaSecondaryLink || whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={`${A}/ef9a9.png`} alt="Márcio Rogério" />
                  <span>{pageData.hero.ctaSecondaryText}</span>
                </a>
              </div>

              <div className="hero-proof">
                <div className="avatar-group" aria-hidden="true">
                  <span className="avatar-bubble">
                    <img src={`${A}/ef9a9.png`} alt="" />
                  </span>
                  <span className="avatar-bubble">
                    <img src={`${A}/22e43.png`} alt="" />
                  </span>
                  <span className="avatar-bubble">
                    <img src={`${A}/3ff79.png`} alt="" />
                  </span>
                </div>
                <p>{pageData.hero.avatarText}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="partners page-shell" aria-labelledby="partners-title">
        <h2 id="partners-title" className="sr-only">
          Parceiros
        </h2>
        <div className="partners-grid">
          {partners.map((partner) => (
            <div className="partner-card" key={partner.name}>
              <div className="partner-logo-box">
                <img src={`${A}/${partner.logo}`} alt={partner.name} />
              </div>
              <div className="partner-actions">
                {partner.actionRows.map((row, rowIndex) => (
                  <div
                    className={`partner-row ${rowIndex === 1 ? "is-split" : ""}`}
                    key={rowIndex}
                  >
                    {row.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={
                          partner.name === "Loft" && rowIndex === 0
                            ? "loft-wide-button"
                            : ""
                        }
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="properties page-shell" id="imoveis">
        <SectionHeading eyebrow="Imóveis em destaque" lineAsset="00449.svg">
          <p>Projetos que combinam localização, arquitetura e potencial.</p>
        </SectionHeading>
        <div className="properties-grid">
          {pageData.properties.map((property) => (
            <article className="property-card" key={property.id || property.name}>
              <div className="property-media">
                <img
                  className={`property-image-${property.id}`}
                  src={property.image.startsWith("http") ? property.image : `${A}/${property.image}`}
                  alt={`Empreendimento ${property.name}`}
                />
                <span>{property.tag}</span>
              </div>
              <p className="property-place">{property.place}</p>
              <h3>{property.name}</h3>
              <p className="property-description">{property.description}</p>
              <p className="property-detail">{property.detail}</p>
              <button
                type="button"
                className="small-button cursor-pointer"
                onClick={() =>
                  setActiveLeadProperty({
                    name: property.name,
                    targetUrl: property.targetUrl,
                  })
                }
              >
                Ver detalhes
              </button>
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
                  <span>
                    <img src={`${A}/a9f02.svg`} alt={copy === 0 ? "Plaenge" : ""} />
                    <img src={`${A}/0e5e3.svg`} alt="" />
                    <img src={`${A}/7d86f.svg`} alt="" />
                    <img src={`${A}/2b4df.svg`} alt="" />
                    <img src={`${A}/00185.svg`} alt="" />
                  </span>
                  <span>
                    <img src={`${A}/20816.svg`} alt="" />
                    <img src={`${A}/03d17.svg`} alt="" />
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
        <SectionHeading eyebrow="Soluções imobiliárias" lineAsset="00449.svg">
          <p>
            O mercado imobiliário oferece diferentes caminhos. Minha assessoria
            ajuda você a tomar decisões com segurança e assertividade.
          </p>
        </SectionHeading>
        <div className="services-grid">
          {staticServices.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-icon-box">
                <img src={`${A}/${service.icon}`} alt="" />
              </div>
              <div className="service-body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about page-shell" id="sobre">
        <div className="about-grid">
          <div className="about-media">
            <div className="portrait-frame">
              <img src={`${A}/ef9a9.png`} alt={pageData.about.name} />
            </div>
          </div>
          <div className="about-copy">
            <SectionHeading eyebrow={pageData.about.eyebrow} lineAsset="f3ee3.svg" />
            <h2>
              {pageData.about.titleLine1}
              <br />
              <span className="accent-italic">{pageData.about.titleLine2}</span>
            </h2>
            <p>{pageData.about.paragraph1}</p>
            <p>{pageData.about.paragraph2}</p>
            <div className="broker-signature">
              <img
                src={pageData.about.signatureUrl}
                alt={pageData.about.name}
                className="signature-image"
              />
              <span className="broker-creci">{siteConfig.creci}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="contato">
        <div className="footer-content page-shell">
          <nav className="footer-nav" aria-label="Links institucionais">
            {navItems.map(([label, href], index) => (
              <span key={label} className="footer-nav-item">
                <a href={href}>{label}</a>
                {index < navItems.length - 1 && (
                  <span className="footer-divider" aria-hidden="true">
                    |
                  </span>
                )}
              </span>
            ))}
            <span className="footer-divider" aria-hidden="true">
              |
            </span>
            <span className="footer-nav-item">
              <img src={`${A}/3a4ea.svg`} alt="" />
              <a href={whatsapp} target="_blank" rel="noreferrer">
                Contato
              </a>
            </span>
          </nav>
          <div className="social-links" aria-label="Redes sociais">
            <a
              href={siteConfig.instagram_url}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <img src={`${A}/d4ad8.svg`} alt="" />
            </a>
            <a
              href={siteConfig.facebook_url}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <img src={`${A}/a9895.svg`} alt="" />
            </a>
          </div>
          <p className="copyright">
            © 2026 {pageData.about.name} Corretor de Imóveis. Todos os direitos reservados.
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

