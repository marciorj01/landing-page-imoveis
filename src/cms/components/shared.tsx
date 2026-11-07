import React from "react";

export const A = "/assets";

export function Brand({ inverse = false }: { inverse?: boolean }) {
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

export function SectionHeading({
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
