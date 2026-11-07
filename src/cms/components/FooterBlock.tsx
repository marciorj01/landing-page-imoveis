import { A, Brand } from "./shared";

interface FooterBlockProps {
  navItems?: [string, string][];
  whatsappLink?: string;
  aboutText?: string;
  copyrightText?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

const DEFAULT_NAV_ITEMS: [string, string][] = [
  ["Home", "#home"],
  ["Imóveis", "#imoveis"],
  ["Soluções", "#solucoes"],
  ["Sobre", "#sobre"],
];

const DEFAULT_WHATSAPP =
  "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis";

export default function FooterBlock({
  navItems = DEFAULT_NAV_ITEMS,
  whatsappLink = DEFAULT_WHATSAPP,
  aboutText = "Curadoria imobiliária, atendimento consultivo e oportunidades para morar e investir.",
  copyrightText = "© 2026 Márcio Rogério Corretor de Imóveis. Todos os direitos reservados.",
  instagramUrl = "https://www.instagram.com/",
  facebookUrl = "https://www.facebook.com/",
}: FooterBlockProps) {
  return (
    <footer>
      <div className="page-shell footer-content">
        <div className="footer-about">
          <Brand inverse />
          <p>{aboutText}</p>
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
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              Contato
            </a>
          </span>
        </nav>
        <div className="socials">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <img src={`${A}/d4ad8.svg`} alt="" />
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <img src={`${A}/a9895.svg`} alt="" />
          </a>
        </div>
        <p className="copyright">{copyrightText}</p>
      </div>
    </footer>
  );
}
