import { A, SectionHeading } from "./shared";
import { LaunchesMarqueeBlockProps } from "../types";

export default function LaunchesMarqueeBlock({
  eyebrow = "Empreendimentos e lançamentos",
  title = "Conheça os principais lançamentos e empreendimentos do mercado",
}: Partial<LaunchesMarqueeBlockProps>) {
  return (
    <section className="launches page-shell" aria-labelledby="launches-title">
      <SectionHeading eyebrow={eyebrow} lineAsset="f3ee3.svg" />
      <div className="launches-content">
        <h2 id="launches-title">{title}</h2>
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
  );
}
