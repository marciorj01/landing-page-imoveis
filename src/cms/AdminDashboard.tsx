import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  SiteConfig,
  PageData,
  getSiteConfig,
  saveSiteConfig,
  getPageData,
  savePageData,
  uploadMedia,
} from "../lib/cms";
import { supabase } from "../lib/supabase";
import { Property } from "./types";
import {
  getAllAdminProperties,
  saveProperty as persistProperty,
  deleteProperty as removeProperty,
  duplicateProperty as cloneProperty,
} from "./propertyService";
import PropertyFormModal from "./PropertyFormModal";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "properties" | "texts" | "identity" | "media" | "leads"
  >("overview");

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gerenciador Completo de Imóveis
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [propertySearch, setPropertySearch] = useState("");

  // Upload de mídia
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const config = await getSiteConfig();
    const page = await getPageData("home");
    const props = await getAllAdminProperties();
    setSiteConfig(config);
    setPageData(page);
    setPropertiesList(props);

    // Carrega leads do Supabase
    if (supabase) {
      try {
        const { data } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (data) setLeadsList(data);
      } catch (e) {
        console.warn("Aviso ao carregar leads:", e);
      }
    }
  };

  const handleSavePage = async (updatedData?: PageData) => {
    const dataToSave = updatedData || pageData;
    if (!dataToSave) return;
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const res = await savePageData("home", dataToSave, true);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage(res.error || "Erro ao salvar alterações.");
    }
    setSaving(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;
    setSaving(true);
    setErrorMessage(null);

    const success = await saveSiteConfig(siteConfig);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage("Erro ao atualizar configurações do site.");
    }
    setSaving(false);
  };

  // Salvar imóvel (novo ou editado no banco)
  const handleSaveProperty = async (prop: Property) => {
    const res = await persistProperty(prop);
    if (res.success) {
      const updated = await getAllAdminProperties();
      setPropertiesList(updated);
      setIsPropertyModalOpen(false);
      setEditingProperty(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Erro ao salvar imóvel: " + res.error);
    }
  };

  // Excluir imóvel
  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;
    const res = await removeProperty(id);
    if (res.success) {
      setPropertiesList((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erro ao excluir: " + res.error);
    }
  };

  // Duplicar imóvel
  const handleDuplicateProperty = async (prop: Property) => {
    const res = await cloneProperty(prop);
    if (res.success && res.newProperty) {
      setPropertiesList((prev) => [res.newProperty!, ...prev]);
      alert(`Imóvel duplicado com sucesso como rascunho!\nNovo link: /imovel/${res.newProperty.slug}`);
    } else {
      alert("Erro ao duplicar: " + res.error);
    }
  };

  // Publicar / Despublicar
  const handleToggleStatus = async (prop: Property) => {
    const newStatus = prop.status === "published" ? "draft" : "published";
    const updated: Property = { ...prop, status: newStatus };
    const res = await persistProperty(updated);
    if (res.success) {
      setPropertiesList((prev) => prev.map((p) => (p.id === prop.id ? updated : p)));
    } else {
      alert("Erro ao atualizar status: " + res.error);
    }
  };

  // Upload de Imagem para Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const file = files[0];
    const res = await uploadMedia(file);
    setUploading(false);
    if (res?.url) {
      alert(`Upload concluído com sucesso!\nURL: ${res.url}`);
    } else {
      alert(`Falha no upload: ${res?.error || "Erro desconhecido"}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1d] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a1128] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c5a880]">
            Gestão de Conteúdo
          </span>
          <h2 className="text-xl font-light text-white tracking-tight">MÁRCIO RJ CMS</h2>
          <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "overview" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>📊</span> Visão Geral
          </button>

          <a
            href="/?edit=true"
            target="_blank"
            rel="noreferrer"
            className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 text-[#c5a880] hover:bg-white/5"
          >
            <span>✏️</span> Abrir Editor Visual ↗
          </a>

          <button
            onClick={() => setActiveTab("properties")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "properties" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>🏢</span> Imóveis & Lançamentos
          </button>

          <button
            onClick={() => setActiveTab("texts")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "texts" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>📝</span> Textos & Conteúdos
          </button>

          <button
            onClick={() => setActiveTab("identity")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "identity" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>🎨</span> Contato & Identidade
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "media" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>🖼️</span> Upload de Imagens
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition flex items-center gap-3 ${
              activeTab === "leads" ? "bg-[#c5a880] text-[#0a1128] font-bold" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>👥</span> Leads Capturados ({leadsList.length})
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="/"
            className="block text-center w-full py-2 text-xs text-white/60 hover:text-white transition"
          >
            Ver Site Público ↗
          </a>
          <button
            onClick={() => signOut()}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-6xl">
        {/* Header de Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <h1 className="text-2xl font-light text-white">
              {activeTab === "overview" && "Visão Geral do Site"}
              {activeTab === "properties" && "Gerenciar Imóveis & Empreendimentos"}
              {activeTab === "texts" && "Edição de Textos e Conteúdos"}
              {activeTab === "identity" && "Informações de Contato e Identidade"}
              {activeTab === "media" && "Biblioteca de Imagens"}
              {activeTab === "leads" && "Leads e Contatos de Clientes"}
            </h1>
            <p className="text-xs text-white/50">
              Todas as publicações são sincronizadas diretamente com o seu site.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-fade-in">
                ✓ Publicado com sucesso!
              </span>
            )}
            {errorMessage && (
              <span className="text-xs text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded-lg">
                {errorMessage}
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: VISÃO GERAL */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-2">
                <span className="text-xs text-white/60 uppercase tracking-wider">Imóveis Ativos</span>
                <p className="text-3xl font-light text-[#c5a880]">{pageData?.properties.length || 0}</p>
                <p className="text-[11px] text-white/40">Bioma, Oás, Helbor VM 125...</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-2">
                <span className="text-xs text-white/60 uppercase tracking-wider">Total de Leads</span>
                <p className="text-3xl font-light text-emerald-400">{leadsList.length}</p>
                <p className="text-[11px] text-white/40">Gravados no Supabase</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-2">
                <span className="text-xs text-white/60 uppercase tracking-wider">Status do Site</span>
                <p className="text-3xl font-light text-white">Online</p>
                <p className="text-[11px] text-emerald-400">✓ Netlify + Supabase Conectados</p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880]">
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/?edit=true"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-between"
                >
                  <div>
                    <strong className="block text-sm text-white">Abrir Editor Visual In-Context</strong>
                    <span className="text-xs text-white/60">Edite textos e imagens clicando direto na página</span>
                  </div>
                  <span className="text-[#c5a880] text-xl">↗</span>
                </a>

                <button
                  onClick={() => {
                    setEditingProperty({
                      id: Date.now().toString(),
                      name: "",
                      tag: "Lançamento",
                      place: "",
                      description: "",
                      detail: "",
                      image: "e8527.png",
                      targetUrl: "/oas.html",
                      active: true,
                    });
                    setIsPropertyModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-between text-left"
                >
                  <div>
                    <strong className="block text-sm text-white">+ Adicionar Novo Imóvel</strong>
                    <span className="text-xs text-white/60">Cadastre um novo empreendimento no site</span>
                  </div>
                  <span className="text-[#c5a880] text-xl">+</span>
                </button>
              </div>
            </div>

            {/* Últimos Leads */}
            <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Últimos Leads Recebidos
                </h3>
                <button
                  onClick={() => setActiveTab("leads")}
                  className="text-xs text-[#c5a880] hover:underline"
                >
                  Ver todos →
                </button>
              </div>

              {leadsList.length === 0 ? (
                <p className="text-xs text-white/50 py-4">Nenhum lead registrado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase">
                        <th className="py-2">Nome</th>
                        <th className="py-2">WhatsApp</th>
                        <th className="py-2">E-mail</th>
                        <th className="py-2">Imóvel</th>
                        <th className="py-2">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leadsList.slice(0, 5).map((lead, i) => (
                        <tr key={lead.id || i} className="hover:bg-white/5">
                          <td className="py-2.5 font-medium text-white">{lead.name}</td>
                          <td className="py-2.5 text-[#c5a880]">
                            <a
                              href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {lead.phone}
                            </a>
                          </td>
                          <td className="py-2.5 text-white/70">{lead.email}</td>
                          <td className="py-2.5 text-white/80">{lead.property || "—"}</td>
                          <td className="py-2.5 text-white/40">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: IMÓVEIS & LANÇAMENTOS (GERENCIADOR COMPLETO) */}
        {activeTab === "properties" && (
          <div className="space-y-6">
            {/* Barra de Status e Contadores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-2xl font-light text-white block">{propertiesList.length}</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Total de Imóveis</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-2xl font-light text-emerald-400 block">
                  {propertiesList.filter((p) => p.status === "published").length}
                </span>
                <span className="text-[11px] text-emerald-300 uppercase tracking-wider">Publicados no Ar</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-2xl font-light text-amber-400 block">
                  {propertiesList.filter((p) => p.status === "draft").length}
                </span>
                <span className="text-[11px] text-amber-300 uppercase tracking-wider">Rascunhos</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-2xl font-light text-white/60 block">
                  {propertiesList.filter((p) => p.status === "archived").length}
                </span>
                <span className="text-[11px] text-white/40 uppercase tracking-wider">Arquivados</span>
              </div>
            </div>

            {/* Barra de Filtros, Busca e Botão Novo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a1128] border border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "Todos" },
                  { id: "published", label: "Publicados" },
                  { id: "draft", label: "Rascunhos" },
                  { id: "archived", label: "Arquivados" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPropertyFilter(f.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      propertyFilter === f.id
                        ? "bg-[#c5a880] text-[#0a1128] border-[#c5a880] font-bold"
                        : "border-white/15 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="Buscar por nome, bairro..."
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#c5a880] w-full sm:w-48"
                />

                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsPropertyModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition shrink-0 shadow-lg"
                >
                  + Novo Imóvel
                </button>
              </div>
            </div>

            {/* Grade de Imóveis Cadastrados */}
            {propertiesList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-white/10 bg-[#0a1128] space-y-3">
                <p className="text-sm text-white/70">Nenhum imóvel cadastrado ainda.</p>
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsPropertyModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider"
                >
                  Cadastrar Primeiro Imóvel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesList
                  .filter((p) => {
                    if (propertyFilter !== "all" && p.status !== propertyFilter) return false;
                    if (
                      propertySearch &&
                      !p.title.toLowerCase().includes(propertySearch.toLowerCase()) &&
                      !p.neighborhood.toLowerCase().includes(propertySearch.toLowerCase()) &&
                      !p.city.toLowerCase().includes(propertySearch.toLowerCase())
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((prop) => (
                    <div
                      key={prop.id}
                      className="rounded-2xl border border-white/10 bg-[#0a1128] overflow-hidden flex flex-col justify-between group hover:border-[#c5a880]/40 transition shadow-lg"
                    >
                      {/* Miniatura do Imóvel */}
                      <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
                        <img
                          src={prop.main_image}
                          alt={prop.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow ${
                              prop.status === "published"
                                ? "bg-emerald-500 text-black"
                                : prop.status === "draft"
                                ? "bg-amber-500 text-black"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {prop.status === "published"
                              ? "Publicado"
                              : prop.status === "draft"
                              ? "Rascunho"
                              : "Arquivado"}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] uppercase backdrop-blur-sm">
                            {prop.purpose === "venda" ? "Venda" : "Locação"}
                          </span>
                        </div>

                        {prop.featured && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded bg-[#c5a880] text-[#0a1128] text-[10px] font-bold uppercase tracking-wider shadow">
                              ★ Destaque Home
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="p-4 space-y-2 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#c5a880] font-semibold text-sm">{prop.price}</span>
                          <span className="text-white/40 text-[11px] truncate">
                            {prop.neighborhood ? `${prop.neighborhood}, ` : ""}{prop.city}
                          </span>
                        </div>

                        <h3 className="text-base font-medium text-white">{prop.title}</h3>
                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {prop.summary || prop.description}
                        </p>

                        <div className="pt-2 text-[11px] text-white/50 flex items-center gap-3">
                          {prop.private_area > 0 && <span>{prop.private_area} m²</span>}
                          {prop.bedrooms > 0 && <span>{prop.bedrooms} qts</span>}
                          {prop.suites > 0 && <span>{prop.suites} sts</span>}
                          {prop.parking_spots > 0 && <span>{prop.parking_spots} vag</span>}
                        </div>

                        {/* Link Direto */}
                        <div className="pt-2">
                          <a
                            href={prop.status === "published" ? `/imovel/${prop.slug}` : `/preview/imovel/${prop.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#c5a880] hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>/imovel/{prop.slug}</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>

                      {/* Ações Administrativas */}
                      <div className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs gap-1">
                        <button
                          onClick={() => {
                            setEditingProperty(prop);
                            setIsPropertyModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition font-medium text-[11px]"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDuplicateProperty(prop)}
                          className="px-2.5 py-1.5 rounded bg-white/10 text-white/80 hover:bg-white/20 transition text-[11px]"
                          title="Criar cópia do imóvel"
                        >
                          Duplicar
                        </button>

                        <button
                          onClick={() => handleToggleStatus(prop)}
                          className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition ${
                            prop.status === "published"
                              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          }`}
                        >
                          {prop.status === "published" ? "Despublicar" : "Publicar"}
                        </button>

                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition text-sm"
                          title="Excluir imóvel"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEXTOS & CONTEÚDOS */}
        {activeTab === "texts" && pageData && (
          <div className="space-y-8">
            {/* Seção Hero */}
            <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880]">
                Seção Hero (Início da Página)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Título Linha 1</label>
                  <input
                    type="text"
                    value={pageData.hero.headlineLine1}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        hero: { ...pageData.hero, headlineLine1: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Título Linha 2</label>
                  <input
                    type="text"
                    value={pageData.hero.headlineLine2}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        hero: { ...pageData.hero, headlineLine2: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-white/70 mb-1">Título Linha 3 (Destaque Dourado)</label>
                  <input
                    type="text"
                    value={pageData.hero.headlineLine3}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        hero: { ...pageData.hero, headlineLine3: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-white/70 mb-1">Subtítulo do Hero</label>
                  <textarea
                    rows={2}
                    value={pageData.hero.subtitle}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        hero: { ...pageData.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção Sobre o Corretor */}
            <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880]">
                Seção Sobre Márcio Rogério
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Parágrafo 1</label>
                  <textarea
                    rows={3}
                    value={pageData.about.paragraph1}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        about: { ...pageData.about, paragraph1: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Parágrafo 2</label>
                  <textarea
                    rows={3}
                    value={pageData.about.paragraph2}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        about: { ...pageData.about, paragraph2: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSavePage()}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition"
            >
              {saving ? "Salvando..." : "Salvar Alterações de Texto"}
            </button>
          </div>
        )}

        {/* TAB 4: CONTATO & IDENTIDADE */}
        {activeTab === "identity" && siteConfig && (
          <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880]">
              Dados de Contato e Registro Profissional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/70 mb-1">Número do CRECI</label>
                <input
                  type="text"
                  value={siteConfig.creci}
                  onChange={(e) => setSiteConfig({ ...siteConfig, creci: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">WhatsApp para Contato (com DDD)</label>
                <input
                  type="text"
                  value={siteConfig.whatsapp_display}
                  onChange={(e) =>
                    setSiteConfig({
                      ...siteConfig,
                      whatsapp_display: e.target.value,
                      whatsapp_phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={siteConfig.contact_email}
                  onChange={(e) => setSiteConfig({ ...siteConfig, contact_email: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Link do Instagram</label>
                <input
                  type="text"
                  value={siteConfig.instagram_url}
                  onChange={(e) => setSiteConfig({ ...siteConfig, instagram_url: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-white/70 mb-1">Título do Site (Google / Abas)</label>
                <input
                  type="text"
                  value={siteConfig.site_title}
                  onChange={(e) => setSiteConfig({ ...siteConfig, site_title: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-3 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition"
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          </form>
        )}

        {/* TAB 5: BIBLIOTECA DE MÍDIA */}
        {activeTab === "media" && (
          <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a880] mb-2">
                Upload de Imagens e Fotos de Imóveis
              </h3>
              <p className="text-xs text-white/60">
                Faça upload de fotos para o Supabase Storage. As fotos ficarão salvas na nuvem com link público imediato.
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-white/20 rounded-xl text-center space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block mx-auto text-xs text-white/60 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#c5a880] file:text-[#0a1128] hover:file:bg-[#d6bc96] cursor-pointer"
              />
              {uploading && <p className="text-xs text-[#c5a880] animate-pulse">Enviando imagem para o Supabase...</p>}
            </div>
          </div>
        )}

        {/* TAB 6: LEADS */}
        {activeTab === "leads" && (
          <div className="p-6 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Lista Completa de Leads ({leadsList.length})
              </h3>
              <button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    ["Nome,WhatsApp,Email,Imovel,Data"].join(",") +
                    "\n" +
                    leadsList
                      .map((l) => `"${l.name}","${l.phone}","${l.email}","${l.property}","${l.created_at}"`)
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `leads_marciorj_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#c5a880] text-[#c5a880] text-xs font-semibold hover:bg-[#c5a880] hover:text-[#0a1128] transition"
              >
                Exportar CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 uppercase">
                    <th className="py-2.5">Nome</th>
                    <th className="py-2.5">WhatsApp</th>
                    <th className="py-2.5">E-mail</th>
                    <th className="py-2.5">Imóvel de Interesse</th>
                    <th className="py-2.5">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leadsList.map((lead, i) => (
                    <tr key={lead.id || i} className="hover:bg-white/5">
                      <td className="py-3 font-medium text-white">{lead.name}</td>
                      <td className="py-3 text-[#c5a880]">
                        <a
                          href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {lead.phone} ↗
                        </a>
                      </td>
                      <td className="py-3 text-white/70">{lead.email}</td>
                      <td className="py-3 text-white/80">{lead.property || "—"}</td>
                      <td className="py-3 text-white/40">
                        {lead.created_at ? new Date(lead.created_at).toLocaleString("pt-BR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Adicionar / Editar Imóvel */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialProperty={editingProperty}
      />
    </div>
  );
}

