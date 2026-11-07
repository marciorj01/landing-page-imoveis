import { useState, useEffect } from "react";
import HeaderNav from "./components/HeaderNav";
import FooterBlock from "./components/FooterBlock";
import { Property, PropertyPurpose } from "./types";
import { getPublishedProperties } from "./propertyService";
import { DEFAULT_NAV_ITEMS, DEFAULT_WHATSAPP } from "./defaults";

export default function PropertiesListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurpose, setSelectedPurpose] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");

  useEffect(() => {
    let isMounted = true;
    getPublishedProperties().then((props) => {
      if (!isMounted) return;
      setProperties(props);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = properties.filter((prop) => {
    if (selectedPurpose !== "todos" && prop.purpose !== selectedPurpose) return false;
    if (selectedType !== "todos" && prop.property_type !== selectedType) return false;
    return true;
  });

  const availableTypes = Array.from(new Set(properties.map((p) => p.property_type))).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#060c1d] text-white flex flex-col font-sans">
      <HeaderNav navItems={DEFAULT_NAV_ITEMS} whatsappLink={DEFAULT_WHATSAPP} />

      <main className="flex-1 page-shell py-12 max-w-6xl mx-auto px-4 w-full">
        {/* Cabeçalho da Listagem */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c5a880]">
            Portfólio Imobiliário
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Imóveis & Lançamentos Exclusivos
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            Curadoria criteriosa de imóveis de alto padrão e oportunidades de investimento em Curitiba e São Paulo.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a1128] border border-white/10 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/50 mr-2 font-medium">Finalidade:</span>
            {[
              { id: "todos", label: "Todos" },
              { id: "venda", label: "Comprar" },
              { id: "locacao", label: "Alugar" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedPurpose(f.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition ${
                  selectedPurpose === f.id
                    ? "bg-[#c5a880] text-[#060c1d] border-[#c5a880] font-bold"
                    : "border-white/15 text-white/70 hover:border-white/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {availableTypes.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-medium">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-lg border border-white/15 bg-[#060c1d] px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="todos">Todos os tipos</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grade de Imóveis */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#c5a880] tracking-wider uppercase">
            Carregando imóveis...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm text-white/60">Nenhum imóvel encontrado com os filtros selecionados.</p>
            <button
              onClick={() => {
                setSelectedPurpose("todos");
                setSelectedType("todos");
              }}
              className="text-xs text-[#c5a880] underline font-medium"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => (
              <article
                key={prop.id}
                className="rounded-2xl border border-white/10 bg-[#0a1128] overflow-hidden flex flex-col group hover:border-[#c5a880]/50 transition duration-300 shadow-xl"
              >
                {/* Imagem do Imóvel */}
                <a href={`/imovel/${prop.slug}`} className="relative aspect-[16/10] overflow-hidden bg-black/40 block">
                  <img
                    src={prop.main_image}
                    alt={prop.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {prop.tag && (
                      <span className="px-2.5 py-0.5 rounded bg-[#c5a880] text-[#060c1d] font-bold text-[10px] uppercase tracking-wider shadow">
                        {prop.tag}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-[#060c1d]/80 text-white/90 text-[10px] uppercase tracking-wider backdrop-blur-sm border border-white/10">
                      {prop.purpose === "venda" ? "Venda" : "Locação"}
                    </span>
                  </div>
                </a>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-white/50 tracking-wider uppercase">
                      📍 {prop.neighborhood ? `${prop.neighborhood}, ` : ""}{prop.city}
                    </p>
                    <h3 className="text-xl font-light text-white group-hover:text-[#c5a880] transition">
                      <a href={`/imovel/${prop.slug}`}>{prop.title}</a>
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-2 font-light leading-relaxed">
                      {prop.summary || prop.description}
                    </p>
                  </div>

                  {/* Ficha rápida */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    {prop.private_area > 0 && <span>{prop.private_area} m²</span>}
                    {prop.bedrooms > 0 && <span>{prop.bedrooms} qts</span>}
                    {prop.suites > 0 && <span>{prop.suites} suítes</span>}
                    {prop.parking_spots > 0 && <span>{prop.parking_spots} vagas</span>}
                  </div>

                  {/* Preço e Botão */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-white/40 block uppercase tracking-widest">Valor</span>
                      <span className="text-base font-semibold text-[#c5a880]">{prop.price}</span>
                    </div>

                    <a
                      href={`/imovel/${prop.slug}`}
                      className="px-4 py-2 rounded-lg bg-[#c5a880] text-[#060c1d] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition"
                    >
                      Ver detalhes
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <FooterBlock navItems={DEFAULT_NAV_ITEMS} whatsappLink={DEFAULT_WHATSAPP} />
    </div>
  );
}
