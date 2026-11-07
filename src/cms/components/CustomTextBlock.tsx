import { SectionHeading } from "./shared";
import { CustomTextBlockProps } from "../types";

export default function CustomTextBlock({
  eyebrow,
  title,
  contentHtml,
}: Partial<CustomTextBlockProps>) {
  return (
    <section className="custom-text-block page-shell py-16" style={{ padding: "4rem 1.5rem" }}>
      {eyebrow && (
        <SectionHeading eyebrow={eyebrow} lineAsset="00449.svg">
          {title && <h2 style={{ fontSize: "2rem", marginTop: "0.5rem" }}>{title}</h2>}
        </SectionHeading>
      )}
      {!eyebrow && title && (
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#161b26" }}>{title}</h2>
      )}
      <div
        className="custom-content prose prose-stone max-w-none"
        style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#4a5568" }}
        dangerouslySetInnerHTML={{ __html: contentHtml || "" }}
      />
    </section>
  );
}

