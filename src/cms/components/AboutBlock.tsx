import { A } from "./shared";
import { AboutBlockProps } from "../types";

export default function AboutBlock({
  eyebrow = "Mais do que encontrar um imóvel",
  titlePart1 = "Escolhas imobiliárias com ",
  titleHighlight = "visão de futuro.",
  text = "Cada cliente tem um momento, um objetivo e uma história. Meu trabalho é entender suas prioridades e apresentar opções com transparência, conhecimento de mercado e acompanhamento.",
  creci = "CRECI 59.138 | F",
  signatureImage = `${A}/c39c5.png`,
  personImage = `${A}/cbd86.png`,
  roomImage = `${A}/08ae9.png`,
}: Partial<AboutBlockProps>) {
  return (
    <section className="about page-shell" id="sobre">
      <div className="portrait">
        <img
          className="portrait-room"
          src={roomImage.startsWith("http") || roomImage.startsWith("/assets") ? roomImage : `${A}/${roomImage}`}
          alt="Ambiente residencial sofisticado"
        />
        <img
          className="portrait-person"
          src={personImage.startsWith("http") || personImage.startsWith("/assets") ? personImage : `${A}/${personImage}`}
          alt="Márcio Rogério, corretor de imóveis"
        />
      </div>
      <div className="about-copy">
        <p className="about-eyebrow">{eyebrow}</p>
        <h2>
          {titlePart1}
          <span>{titleHighlight}</span>
        </h2>
        <p>{text}</p>
        <div className="signature">
          <img
            src={signatureImage.startsWith("http") || signatureImage.startsWith("/assets") ? signatureImage : `${A}/${signatureImage}`}
            alt="Assinatura Márcio Rogério"
          />
          <span>{creci}</span>
        </div>
      </div>
    </section>
  );
}
