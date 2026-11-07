import { A } from "./shared";
import { ConsultingBannerBlockProps } from "../types";

export default function ConsultingBannerBlock({
  title = "Conte com uma consultoria e visão de mercado",
  backgroundImage = `${A}/1c45d.png`,
}: Partial<ConsultingBannerBlockProps>) {
  return (
    <section className="consulting">
      <img
        src={backgroundImage.startsWith("http") || backgroundImage.startsWith("/assets") ? backgroundImage : `${A}/${backgroundImage}`}
        alt=""
      />
      <div className="consulting-shade" />
      <div className="page-shell">
        <h2>{title}</h2>
      </div>
    </section>
  );
}
