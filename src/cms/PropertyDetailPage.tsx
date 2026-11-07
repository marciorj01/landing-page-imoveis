import React, { useState, useEffect } from "react";
import HeaderNav from "./components/HeaderNav";
import FooterBlock from "./components/FooterBlock";
import { Property } from "./types";
import { getPropertyBySlug } from "./propertyService";
import { saveLead } from "../lib/supabase";
import { DEFAULT_NAV_ITEMS, DEFAULT_WHATSAPP } from "./defaults";

interface PropertyDetailPageProps {
  slug: string;
  isDraft?: boolean;
}

export default function PropertyDetailPage({ slug, isDraft = false }: PropertyDetailPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Formulário de Lead
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPropertyBySlug(slug, isDraft).then((prop) => {
      if (!isMounted) return;
      if (prop) {
        setProperty(prop);
        setActivePhoto(prop.main_image);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, isDraft]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setLeadPhone(val);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    if (!leadName.trim() || !leadPhone.trim() || !leadEmail.trim()) {
      setLeadError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLeadLoading(true);
    setLeadError(null);

    try {
      const res = await saveLead({
        name: leadName.trim(),
        phone: leadPhone.trim(),
        email: leadEmail.trim(),
        property: property.title,
      });

      if (res.success) {
        setLeadSuccess(true);
        // Se houver target_url de PDF ou landing page externa, abre em nova aba
        if (property.target_url) {
          window.open(property.target_url, "_blank");
        }
      } else {
        setLeadError(res.error || "Não foi possível enviar sua solicitação. Tente novamente.");
      }
    } catch (err: any) {
      setLeadError(err?.message || "Ocorreu um erro ao enviar seus dados.");
    } finally {
      setLeadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060c1d] flex items-center justify-center text-[#c5a880] text-sm font-semibold tracking-wider uppercase">
        Carregando informações do imóvel...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#060c1d] flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-3xl font-light text-[#c5a880] mb-3">Imóvel Não Encontrado</h1>
        <p className="text-white/60 max-w-md mb-6 text-sm">
          O imóvel que você procura não está disponível ou foi despublicado.
        </p>
        <a
          href="/imoveis"
          className="px-6 py-3 rounded-lg bg-[#c5a880] text-[#060c1d] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition"
        >
          Ver Todos os Imóveis
        </a>
      </div>
    );
  }

  const allPhotos = [property.main_image, ...(property.gallery || [])].filter(Boolean);
  const whatsappMsg =
    property.whatsapp_custom_message ||
    `Olá Márcio Rogério, tenho interesse no imóvel ${property.title} em ${property.neighborhood || property.city}.`;
  const whatsappUrl = `https://wa.me/5541991080293?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="min-h-screen bg-[#060c1d] text-white flex flex-col font-sans">
      <HeaderNav navItems={DEFAULT_NAV_ITEMS} whatsappLink={whatsappUrl} />

      {/* Faixa de Rascunho se aplicável */}
      {property.status !== "published" && (
        <div className="bg-amber-500 text-stone-900 py-2 px-4 text-center text-xs font-bold uppercase tracking-wider sticky top-0 z-40">
          ⚠️ Modo Pré-visualização: Imóvel com status &quot;{property.status}&quot; (não publicado para o público)
        </div>
      )}

      <main className="flex-1 page-shell py-8 sm:py-12 max-w-6xl mx-auto px-4 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-white/50 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-white transition">Início</a>
          <span>/</span>
          <a href="/imoveis" className="hover:text-white transition">Imóveis</a>
          <span>/</span>
          <span className="text-[#c5a880] font-medium truncate">{property.title}</span>
        </nav>

        {/* Título e Localização */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded bg-[#c5a880]/20 text-[#c5a880] text-[11px] font-bold uppercase tracking-wider">
                {property.tag || property.purpose}
              </span>
              <span className="text-xs text-white/60 uppercase tracking-wider">
                {property.property_type}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              📍 {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city} - {property.state}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[11px] text-white/50 uppercase tracking-widest block">Valor de Investimento</span>
            <span className="text-2xl sm:text-3xl font-light text-[#c5a880]">
              {property.price}
            </span>
            {(property.condo_fee || property.iptu) && (
              <p className="text-[11px] text-white/40 mt-1">
                {property.condo_fee && `Cond: ${property.condo_fee}`}
                {property.condo_fee && property.iptu && " | "}
                {property.iptu && `IPTU: ${property.iptu}`}
              </p>
            )}
          </div>
        </div>

        {/* Galeria de Fotos em Destaque */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Foto Principal */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer group shadow-2xl"
            >
              <img
                src={activePhoto}
                alt={property.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="text-xs text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  🔍 Clique para ampliar fotos
                </span>
              </div>
            </div>

            {/* Miniaturas da Galeria */}
            {allPhotos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allPhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(photo)}
                    className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition ${
                      activePhoto === photo ? "border-[#c5a880] scale-95" : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card Lateral de Contato Rápido e Atendimento */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/15 space-y-6 shadow-xl">
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c5a880]">
                  Atendimento Consultivo
                </span>
                <h3 className="text-lg font-light text-white">Interessado neste imóvel?</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Fale diretamente com Márcio Rogério para agendar uma visita ou receber a apresentação técnica completa.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#c5a880] text-[#060c1d] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:bg-[#d6bc96] transition shadow-lg"
              >
                <span>Falar no WhatsApp</span>
              </a>

              {/* Mini Formulário de Interesse */}
              <div className="pt-6 border-t border-white/10">
                {leadSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-1">
                    <p className="font-bold">✓ Mensagem enviada com sucesso!</p>
                    <p className="text-white/70">Márcio Rogério entrará em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <span className="text-xs font-semibold text-white/80 block">Ou receba o material por e-mail:</span>
                    {leadError && (
                      <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{leadError}</p>
                    )}
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#c5a880]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Seu WhatsApp"
                      value={leadPhone}
                      onChange={handlePhoneChange}
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#c5a880]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Seu e-mail"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#c5a880]"
                    />
                    <button
                      type="submit"
                      disabled={leadLoading}
                      className="w-full py-2.5 rounded-lg border border-[#c5a880] text-[#c5a880] text-xs font-bold uppercase tracking-wider hover:bg-[#c5a880] hover:text-[#060c1d] transition"
                    >
                      {leadLoading ? "Enviando..." : "Solicitar Informações"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ficha Técnica e Medidas */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0a1128] border border-white/10 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880] mb-6">
            Ficha Técnica do Imóvel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-2xl font-light text-white block">{property.private_area}</span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider">m² Privativos</span>
            </div>
            {property.total_area && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-2xl font-light text-white block">{property.total_area}</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">m² Totais</span>
              </div>
            )}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-2xl font-light text-white block">{property.bedrooms}</span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider">Quartos</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-2xl font-light text-white block">{property.suites}</span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider">Suítes</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-2xl font-light text-white block">{property.bathrooms}</span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider">Banheiros</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-2xl font-light text-white block">{property.parking_spots}</span>
              <span className="text-[11px] text-white/50 uppercase tracking-wider">Vagas</span>
            </div>
          </div>
        </div>

        {/* Descrição e Diferenciais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          {/* Descrição Textual */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-light text-white tracking-wide">
              Sobre o Imóvel
            </h2>
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line space-y-4 font-light">
              {property.description}
            </div>

            {/* Vídeo / Tour Virtual se houver */}
            {property.video_url && (
              <div className="pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880] mb-3">
                  Vídeo & Apresentação
                </h3>
                <a
                  href={property.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition border border-white/10"
                >
                  <span>▶ Acessar Vídeo / Tour Virtual</span>
                </a>
              </div>
            )}
          </div>

          {/* Diferenciais e Comodidades */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-light text-white tracking-wide">
                Diferenciais
              </h2>
              <ul className="space-y-2.5">
                {property.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-white/80">
                    <span className="w-5 h-5 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center text-[10px] shrink-0 font-bold">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal de Imagens */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8">
          <div className="flex justify-between items-center text-white">
            <span className="text-xs text-white/60">
              Visualizando fotos de &quot;{property.title}&quot;
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="text-white text-2xl p-2 hover:text-[#c5a880] transition"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={activePhoto} alt="" className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" />
          </div>
          <div className="flex gap-2 justify-center overflow-x-auto p-2">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(photo)}
                className={`w-16 h-12 rounded overflow-hidden border ${activePhoto === photo ? "border-[#c5a880]" : "border-white/20"}`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <FooterBlock navItems={DEFAULT_NAV_ITEMS} whatsappLink={whatsappUrl} />
    </div>
  );
}
