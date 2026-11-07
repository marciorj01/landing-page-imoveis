import { useState, useEffect } from "react";
import { Brand } from "./shared";

interface HeaderNavProps {
  navItems?: [string, string][];
  whatsappLink?: string;
  ctaText?: string;
}

const DEFAULT_NAV_ITEMS: [string, string][] = [
  ["Home", "#home"],
  ["Imóveis", "#imoveis"],
  ["Soluções", "#solucoes"],
  ["Sobre", "#sobre"],
];

const DEFAULT_WHATSAPP =
  "https://wa.me/5541991080293?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20os%20imóveis";

export default function HeaderNav({
  navItems = DEFAULT_NAV_ITEMS,
  whatsappLink = DEFAULT_WHATSAPP,
  ctaText = "Fale com o corretor",
}: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            {ctaText}
          </a>
        </nav>
        <a
          className="outline-button desktop-contact"
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          {ctaText}
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
  );
}
