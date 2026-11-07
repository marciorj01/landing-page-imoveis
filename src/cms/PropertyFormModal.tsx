import React, { useState } from "react";
import { Property, PropertyStatus, PropertyPurpose } from "./types";
import { slugify } from "./propertyService";
import { uploadMedia } from "../lib/cms";

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => Promise<void>;
  initialProperty?: Property | null;
}

const COMMON_FEATURES = [
  "Piscina",
  "Piscina Aquecida",
  "Academia / Fitness",
  "Varanda Gourmet",
  "Churrasqueira",
  "Salão de Festas",
  "Playground",
  "Brinquedoteca",
  "Espaço Pet",
  "Portaria 24h",
  "Guarita Blindada",
  "Segurança Armada",
  "Elevador Inteligente",
  "Gerador de Energia",
  "Placas Solares",
  "Ar Condicionado",
  "Armários Embutidos",
  "Vista Panorâmica",
  "Quadra Poliesportiva",
  "Spa / Sauna",
  "Carregador Carro Elétrico",
  "Coworking",
];

const PROPERTY_TYPES = [
  "Apartamento",
  "Studio",
  "Casa",
  "Casa em Condomínio",
  "Cobertura",
  "Sala Comercial",
  "Lote / Terreno",
  "Chácara / Imóvel Rural",
];

export default function PropertyFormModal({
  isOpen,
  onClose,
  onSave,
  initialProperty,
}: PropertyFormModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"geral" | "ficha" | "fotos" | "seo" | "contato">("geral");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [customFeature, setCustomFeature] = useState("");

  const [form, setForm] = useState<Property>(
    initialProperty || {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `prop-${Date.now()}`,
      slug: "",
      title: "",
      property_type: "Apartamento",
      purpose: "venda",
      status: "published",
      featured: true,
      tag: "Lançamento",
      price: "Sob Consulta",
      condo_fee: "",
      iptu: "",
      neighborhood: "",
      city: "Curitiba",
      state: "PR",
      address: "",
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parking_spots: 2,
      private_area: 120,
      total_area: 160,
      summary: "",
      description: "",
      features: ["Piscina", "Academia / Fitness", "Varanda Gourmet"],
      main_image: "/assets/e8527.png",
      gallery: [],
      video_url: "",
      whatsapp_custom_message: "",
      target_url: "",
      seo_title: "",
      seo_description: "",
      seo_image: "",
    }
  );

  const handleTitleChange = (title: string) => {
    // Se o slug ainda não foi modificado manualmente, sincroniza com o título
    if (!initialProperty || form.slug === slugify(form.title)) {
      setForm((prev) => ({
        ...prev,
        title,
        slug: slugify(title),
      }));
    } else {
      setForm((prev) => ({ ...prev, title }));
    }
  };

  const toggleFeature = (feature: string) => {
    setForm((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
      };
    });
  };

  const addCustomFeature = () => {
    if (!customFeature.trim()) return;
    if (!form.features.includes(customFeature.trim())) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, customFeature.trim()],
      }));
    }
    setCustomFeature("");
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newGalleryUrl.trim()],
    }));
    setNewGalleryUrl("");
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "main" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadMedia(files[0]);
      if (res?.url) {
        if (target === "main") {
          setForm((prev) => ({ ...prev, main_image: res.url }));
        } else {
          setForm((prev) => ({ ...prev, gallery: [...prev.gallery, res.url] }));
        }
      } else {
        alert("Falha no upload da imagem: " + (res?.error || "Erro desconhecido"));
      }
    } catch (err: any) {
      alert("Erro ao enviar imagem: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Por favor, preencha o título do imóvel.");
      setActiveTab("geral");
      return;
    }

    setSaving(true);
    try {
      const finalProperty: Property = {
        ...form,
        slug: form.slug ? slugify(form.slug) : slugify(form.title),
      };
      await onSave(finalProperty);
      onClose();
    } catch (err: any) {
      alert("Erro ao salvar imóvel: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0a1128] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c5a880]">
              Gerenciador de Imóveis
            </span>
            <h2 className="text-xl font-light text-white">
              {initialProperty ? `Editar: ${initialProperty.title}` : "Cadastrar Novo Imóvel"}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/40 hover:text-white p-2 rounded-lg text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-white/10 px-6 gap-2 shrink-0 overflow-x-auto bg-[#070d20]">
          {[
            { id: "geral", label: "1. Dados Gerais" },
            { id: "ficha", label: "2. Ficha Técnica" },
            { id: "fotos", label: "3. Fotos & Galeria" },
            { id: "contato", label: "4. Contato & Destino" },
            { id: "seo", label: "5. Publicação & SEO" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#c5a880] text-[#c5a880] font-bold"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corpo do Formulário com Rolagem */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ABA 1: DADOS GERAIS */}
          {activeTab === "geral" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Nome / Título Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ex: Bioma Ahú, Oás Bigorrilho, Casa Moderna"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white focus:border-[#c5a880] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    URL Amigável (Slug)
                  </label>
                  <div className="flex items-center rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs text-white/60">
                    <span>/imovel/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                      className="w-full bg-transparent p-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Tipo de Imóvel</label>
                  <select
                    value={form.property_type}
                    onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#0a1128] p-2.5 text-sm text-white"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Finalidade</label>
                  <select
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value as PropertyPurpose })}
                    className="w-full rounded-lg border border-white/15 bg-[#0a1128] p-2.5 text-sm text-white"
                  >
                    <option value="venda">Venda</option>
                    <option value="locacao">Locação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Etiqueta / Tag</label>
                  <input
                    type="text"
                    value={form.tag || ""}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="Lançamento, Em obras, Pronto"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Preço Comercial</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="R$ 1.250.000 ou Sob Consulta"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white text-[#c5a880] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Condomínio</label>
                  <input
                    type="text"
                    value={form.condo_fee || ""}
                    onChange={(e) => setForm({ ...form, condo_fee: e.target.value })}
                    placeholder="R$ 850 / mês"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">IPTU</label>
                  <input
                    type="text"
                    value={form.iptu || ""}
                    onChange={(e) => setForm({ ...form, iptu: e.target.value })}
                    placeholder="R$ 2.400 / ano"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Bairro *</label>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    placeholder="Batel, Ahú, Ecoville"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Cidade / Estado</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Curitiba"
                      className="w-2/3 rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      placeholder="PR"
                      className="w-1/3 rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white text-center uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rua, número, complemento (opcional para o público)"
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Resumo Breve (Exibido nos Cards)</label>
                <input
                  type="text"
                  value={form.summary || ""}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Ex: Plantas de 90 a 191m² com acabamento refinado de alto padrão."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Descrição Completa</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Apresente todos os detalhes da arquitetura, localização e potenciais do imóvel..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* ABA 2: FICHA TÉCNICA */}
          {activeTab === "ficha" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Quartos</label>
                  <input
                    type="number"
                    min={0}
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Suítes</label>
                  <input
                    type="number"
                    min={0}
                    value={form.suites}
                    onChange={(e) => setForm({ ...form, suites: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Banheiros</label>
                  <input
                    type="number"
                    min={0}
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Vagas de Garagem</label>
                  <input
                    type="number"
                    min={0}
                    value={form.parking_spots}
                    onChange={(e) => setForm({ ...form, parking_spots: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Área Privativa (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.private_area}
                    onChange={(e) => setForm({ ...form, private_area: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white text-[#c5a880] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Área Total (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.total_area || ""}
                    onChange={(e) => setForm({ ...form, total_area: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Diferenciais e Comodidades (Clique para adicionar/remover)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_FEATURES.map((feat) => {
                    const selected = form.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                          selected
                            ? "bg-[#c5a880] text-[#0a1128] border-[#c5a880] font-bold"
                            : "border-white/20 text-white/70 hover:border-white/50"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {feat}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    placeholder="Adicionar comodidade personalizada..."
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 p-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomFeature}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: FOTOS & GALERIA */}
          {activeTab === "fotos" && (
            <div className="space-y-6">
              {/* Foto Principal */}
              <div className="p-4 rounded-xl border border-white/15 bg-white/5 space-y-3">
                <label className="block text-xs font-semibold text-[#c5a880] uppercase tracking-wider">
                  Foto Principal de Destaque
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {form.main_image && (
                    <img
                      src={form.main_image}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg border border-white/20 bg-black/40"
                    />
                  )}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={form.main_image}
                      onChange={(e) => setForm({ ...form, main_image: e.target.value })}
                      placeholder="Caminho ou URL da imagem (ex: /assets/e8527.png)"
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-xs px-3 py-1.5 rounded-lg bg-[#c5a880] text-[#0a1128] font-bold hover:bg-[#d6bc96] transition">
                        {uploading ? "Enviando..." : "Upload Nova Foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, "main")}
                        />
                      </label>
                      <span className="text-[11px] text-white/40">Recomendado: 1200x800px JPG/PNG/WebP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Galeria de Fotos */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-white/70">
                  Galeria de Fotos do Imóvel ({form.gallery.length} fotos)
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="URL ou caminho da foto adicional..."
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 p-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition"
                  >
                    Adicionar URL
                  </button>
                  <label className="cursor-pointer text-xs px-4 py-2 rounded-lg bg-[#c5a880] text-[#0a1128] font-bold hover:bg-[#d6bc96] transition">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "gallery")}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {form.gallery.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/40 aspect-video">
                      <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded p-1 text-[10px] opacity-0 group-hover:opacity-100 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tour Virtual ou Vídeo */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Vídeo ou Tour Virtual (YouTube / Vimeo / Matterport)
                </label>
                <input
                  type="text"
                  value={form.video_url || ""}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... ou link de tour 360"
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* ABA 4: CONTATO & DESTINO */}
          {activeTab === "contato" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Mensagem Personalizada do WhatsApp
                </label>
                <input
                  type="text"
                  value={form.whatsapp_custom_message || ""}
                  onChange={(e) => setForm({ ...form, whatsapp_custom_message: e.target.value })}
                  placeholder={`Ex: Olá Márcio, tenho interesse no empreendimento ${form.title || "deste imóvel"}.`}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Ao clicar no botão de WhatsApp da página, essa mensagem já virá preenchida no celular do cliente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Destino Externo ou PDF / E-book (Opcional)
                </label>
                <input
                  type="text"
                  value={form.target_url || ""}
                  onChange={(e) => setForm({ ...form, target_url: e.target.value })}
                  placeholder="Ex: /oas.html ou /bioma.html ou link do catálogo PDF"
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Se preenchido com link de landing page (como /oas.html), o botão &quot;Ver detalhes&quot; abrirá o modal de captura de leads antes de redirecionar.
                </p>
              </div>
            </div>
          )}

          {/* ABA 5: PUBLICAÇÃO & SEO */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Status de Publicação</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })}
                    className="w-full rounded-lg border border-white/15 bg-[#0a1128] p-2.5 text-sm text-white font-semibold"
                  >
                    <option value="published">🟢 Publicado (No ar)</option>
                    <option value="draft">🟡 Rascunho (Apenas no Painel)</option>
                    <option value="archived">⚪ Arquivado (Desativado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Exibir em Destaque na Home?</label>
                  <select
                    value={form.featured ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, featured: e.target.value === "true" })}
                    className="w-full rounded-lg border border-white/15 bg-[#0a1128] p-2.5 text-sm text-white"
                  >
                    <option value="true">Sim (Aparece no carrossel da Home)</option>
                    <option value="false">Não (Apenas na listagem geral de imóveis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Título SEO (Google)</label>
                <input
                  type="text"
                  value={form.seo_title || ""}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  placeholder={`${form.title || "Imóvel"} à Venda em ${form.neighborhood || "Curitiba"} | Márcio Rogério`}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Descrição SEO (Meta Description)</label>
                <textarea
                  rows={2}
                  value={form.seo_description || ""}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  placeholder="Resumo otimizado de até 160 caracteres para buscas no Google..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Rodapé com Botões de Ação */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/20 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 transition"
            >
              Cancelar
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, status: "draft" }));
                  setTimeout(() => {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSubmit(fakeEvent);
                  }, 50);
                }}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg border border-amber-500/50 text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/10 transition"
              >
                Salvar como Rascunho
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition shadow-lg"
              >
                {saving ? "Salvando..." : form.status === "published" ? "Salvar e Publicar" : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

