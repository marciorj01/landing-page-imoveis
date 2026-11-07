import { A } from "./shared";
import { HeroBlockProps } from "../types";

export default function HeroBlock({
  title = "Seu próximo movimento no mercado imobiliário começa aqui.",
  subtitle = "Oportunidades para diferentes objetivos e momentos.",
  tagline = "Curadoria imobiliária · Moradia · Patrimônio",
  image = `${A}/bb9df.png`,
  imageAlt = "Empreendimento residencial contemporâneo",
}: Partial<HeroBlockProps>) {
  return (
    <section className="hero">
      <img
        className="hero-image"
        src={image.startsWith("http") || image.startsWith("/assets") ? image : `${A}/${image}`}
        alt={imageAlt}
      />
      <div className="hero-shade" />
      <div className="page-shell hero-content">
        <div className="hero-copy">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <strong>{tagline}</strong>
        </div>
      </div>
    </section>
  );
}
