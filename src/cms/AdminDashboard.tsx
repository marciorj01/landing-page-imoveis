import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  SiteConfig,
  PageData,
  PropertyItem,
  getSiteConfig,
  saveSiteConfig,
  getPageData,
  savePageData,
  uploadMedia,
} from "../lib/cms";
import { supabase } from "../lib/supabase";

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

  // Modal para adicionar/editar imóvel
  const [editingProperty, setEditingProperty] = useState<PropertyItem | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  // Upload de mídia
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const config = await getSiteConfig();
    const page = await getPageData("home");
    setSiteConfig(config);
    setPageData(page);

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

  // Salvar imóvel (novo ou editado)
  const handleSavePropertyModal = () => {
    if (!editingProperty || !pageData) return;

    let updatedProperties = [...pageData.properties];
    const index = updatedProperties.findIndex((p) => p.id === editingProperty.id);

    if (index >= 0) {
      updatedProperties[index] = editingProperty;
    } else {
      updatedProperties.push({
        ...editingProperty,
        id: editingProperty.id || Date.now().toString(),
      });
    }

    const newPageData = { ...pageData, properties: updatedProperties };
    setPageData(newPageData);
    handleSavePage(newPageData);
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  };

  // Excluir imóvel
  const handleDeleteProperty = (id: string) => {
    if (!pageData || !confirm("Tem certeza que deseja remover este imóvel?")) return;
    const newPageData = {
      ...pageData,
      properties: pageData.properties.filter((p) => p.id !== id),
    };
    setPageData(newPageData);
    handleSavePage(newPageData);
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

        {/* TAB 2: IMÓVEIS & LANÇAMENTOS */}
        {activeTab === "properties" && pageData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-white/60">
                Gerencie os empreendimentos exibidos na seção principal de Imóveis em Destaque.
              </p>
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
                className="px-4 py-2.5 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition"
              >
                + Adicionar Imóvel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.properties.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-2xl border border-white/10 bg-[#0a1128] p-5 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#c5a880]/20 text-[#c5a880] font-semibold uppercase text-[10px]">
                      {prop.tag}
                    </span>
                    <span className="text-white/40 text-[11px]">{prop.place}</span>
                  </div>

                  <h3 className="text-lg font-light text-white">{prop.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{prop.description}</p>
                  <p className="text-[11px] text-[#c5a880] truncate">{prop.detail}</p>
                  <p className="text-[11px] text-white/40 truncate">Destino: {prop.targetUrl}</p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingProperty(prop);
                        setIsPropertyModalOpen(true);
                      }}
                      className="text-xs text-[#c5a880] hover:underline font-medium"
                    >
                      Editar Imóvel
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
      {isPropertyModalOpen && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a1128] p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-light text-white">
                {editingProperty.name ? `Editar: ${editingProperty.name}` : "Novo Empreendimento"}
              </h3>
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Nome do Imóvel</label>
                <input
                  type="text"
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  placeholder="Ex: Bioma, Oás, Horizon..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1">Tag de Destaque</label>
                  <input
                    type="text"
                    value={editingProperty.tag}
                    onChange={(e) => setEditingProperty({ ...editingProperty, tag: e.target.value })}
                    placeholder="Lançamento / Em obras / Pronto"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1">Localização</label>
                  <input
                    type="text"
                    value={editingProperty.place}
                    onChange={(e) => setEditingProperty({ ...editingProperty, place: e.target.value })}
                    placeholder="Ex: Curitiba - Bigorrilho"
                    className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Descrição Curta</label>
                <textarea
                  rows={2}
                  value={editingProperty.description}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  placeholder="Breve texto sobre o projeto..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Detalhes (Metragem / Entrega)</label>
                <input
                  type="text"
                  value={editingProperty.detail}
                  onChange={(e) => setEditingProperty({ ...editingProperty, detail: e.target.value })}
                  placeholder="Ex: Plantas de 90 a 191m² | Entrega: 06/2027"
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Link de Destino ao clicar em "Ver Detalhes"</label>
                <input
                  type="text"
                  value={editingProperty.targetUrl}
                  onChange={(e) => setEditingProperty({ ...editingProperty, targetUrl: e.target.value })}
                  placeholder="Ex: /oas.html ou /bioma.html ou link externo"
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-white font-mono"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  O cliente sempre preencherá o formulário de Lead antes de abrir este link.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-white/60 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePropertyModal}
                className="px-5 py-2 rounded-lg bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider hover:bg-[#d6bc96]"
              >
                Salvar Imóvel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

