import React, { useState } from "react";
import { saveLead } from "./lib/supabase";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  targetUrl?: string;
}

export default function LeadModal({
  isOpen,
  onClose,
  propertyName,
  targetUrl = "/oas.html",
}: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!isOpen) return null;

  // Formatação automática de telefone/WhatsApp: (41) 99108-0293
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    setLoading(true);
    setStatus("idle");

    try {
      await saveLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        property: propertyName,
        notes: `Interesse demonstrado em: ${propertyName}`,
      });

      setStatus("success");

      // Abre o material em uma nova aba e fecha o modal no site principal
      setTimeout(() => {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Erro ao enviar lead:", err);
      // Mesmo com erro de rede, abre o material para o cliente
      setTimeout(() => {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
        onClose();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0a1128] p-6 sm:p-8 text-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(184, 151, 100, 0.15)",
        }}
      >
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Fechar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white">Dados recebidos!</h3>
            <p className="text-sm text-white/70">
              Abrindo a apresentação exclusiva do <strong>{propertyName}</strong> em uma nova aba...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-2 text-center sm:text-left">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-[#c5a880]">
                Material Exclusivo · {propertyName}
              </span>
              <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                Acesse todos os detalhes
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Preencha seus dados para visualizar a apresentação completa, plantas humanizadas e especificações da torre.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#c5a880] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#c5a880] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  WhatsApp com DDD
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(41) 99108-0293"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#c5a880] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#c5a880] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#c5a880] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#c5a880] transition"
                />
              </div>

              <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                🔒 Seus dados estão seguros e serão utilizados exclusivamente para envio das informações deste imóvel.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#c5a880] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[#0a1128] hover:bg-[#d6bc96] active:scale-[0.99] transition disabled:opacity-60 cursor-pointer shadow-lg shadow-[#c5a880]/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#0a1128]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Material Completo</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

