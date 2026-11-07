import React from "react";

interface VisualEditorBarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  saving: boolean;
  saveSuccess: boolean;
}

export default function VisualEditorBar({
  isEditing,
  onToggleEdit,
  onSave,
  saving,
  saveSuccess,
}: VisualEditorBarProps) {
  if (!isEditing) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <button
          onClick={onToggleEdit}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#c5a880] text-[#0a1128] text-xs font-bold uppercase tracking-wider shadow-2xl hover:bg-[#d6bc96] transition cursor-pointer"
          style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(197,168,128,0.4)" }}
        >
          <span>✏️</span>
          <span>Ativar Editor Visual</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1128] text-white border-b border-[#c5a880]/30 shadow-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a880] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c5a880]"></span>
        </span>
        <strong className="font-semibold tracking-wider uppercase text-[#c5a880]">
          MÁRCIO RJ CMS · Modo Editor Visual
        </strong>
        <span className="hidden sm:inline text-white/50 border-l border-white/20 pl-3">
          Clique nos textos marcados para editar ao vivo
        </span>
      </div>

      <div className="flex items-center gap-3">
        {saveSuccess && (
          <span className="text-emerald-400 font-medium">✓ Publicado com sucesso!</span>
        )}
        <a
          href="/gestao-restrita"
          className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition"
        >
          Abrir Painel
        </a>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-[#c5a880] text-[#0a1128] font-bold uppercase tracking-wider hover:bg-[#d6bc96] transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Publicando..." : "Publicar no Site"}
        </button>
        <button
          onClick={onToggleEdit}
          className="text-white/50 hover:text-white px-2 py-1 text-sm cursor-pointer"
          title="Fechar barra"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
