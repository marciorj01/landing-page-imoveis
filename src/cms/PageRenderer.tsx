import { useState } from "react";
import HeaderNav from "./components/HeaderNav";
import FooterBlock from "./components/FooterBlock";
import LeadModal from "../LeadModal";
import { BLOCK_REGISTRY } from "./registry";
import { PageSchema, MenuItem } from "./types";
import { DEFAULT_NAV_ITEMS, DEFAULT_WHATSAPP } from "./defaults";

interface PageRendererProps {
  schema: PageSchema;
  menuItems?: MenuItem[];
  whatsappLink?: string;
  isEditing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
}

export default function PageRenderer({
  schema,
  menuItems,
  whatsappLink = DEFAULT_WHATSAPP,
  isEditing = false,
  selectedBlockId = null,
  onSelectBlock,
}: PageRendererProps) {
  const [activeLeadProperty, setActiveLeadProperty] = useState<{
    name: string;
    targetUrl: string;
  } | null>(null);

  // Mapeia itens de menu personalizados para formato do Header se existirem
  const navItems: [string, string][] = menuItems && menuItems.length > 0
    ? menuItems
        .filter((item) => item.visible)
        .sort((a, b) => a.order - b.order)
        .map((item) => [item.label, item.url] as [string, string])
    : DEFAULT_NAV_ITEMS;

  return (
    <main id="home">
      <HeaderNav
        navItems={navItems}
        whatsappLink={whatsappLink}
      />

      {schema.sections.map((section) => {
        if (section.visible === false) return null;

        const registryItem = BLOCK_REGISTRY[section.type];
        if (!registryItem) {
          console.warn(`[PageRenderer] Bloco desconhecido: ${section.type}`);
          return null;
        }

        const Component = registryItem.component;
        const isSelected = isEditing && selectedBlockId === section.id;

        const blockElement = (
          <Component
            {...section}
            key={section.id}
            onOpenLeadModal={(name: string, targetUrl: string) =>
              setActiveLeadProperty({ name, targetUrl })
            }
          />
        );

        if (isEditing) {
          return (
            <div
              key={section.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock?.(section.id);
              }}
              className={`relative transition-all cursor-pointer group ${
                isSelected
                  ? "ring-4 ring-[#c5a880] ring-offset-2 z-10"
                  : "hover:ring-2 hover:ring-[#c5a880]/50"
              }`}
            >
              {blockElement}
              <div
                className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded bg-[#060c1d] text-[#c5a880] shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${
                  isSelected ? "!opacity-100 bg-[#c5a880] !text-[#060c1d]" : ""
                }`}
              >
                {registryItem.name} {isSelected ? "(Selecionado)" : "(Clique para editar)"}
              </div>
            </div>
          );
        }

        return <div key={section.id}>{blockElement}</div>;
      })}

      <FooterBlock
        navItems={navItems}
        whatsappLink={whatsappLink}
      />

      <LeadModal
        isOpen={Boolean(activeLeadProperty)}
        onClose={() => setActiveLeadProperty(null)}
        propertyName={activeLeadProperty?.name || ""}
        targetUrl={activeLeadProperty?.targetUrl || "/oas.html"}
      />
    </main>
  );
}
