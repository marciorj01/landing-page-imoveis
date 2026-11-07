import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    if (res.error) {
      setError(
        res.error === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : res.error
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060c1d] px-4 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0a1128] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c5a880]">
            Área Restrita
          </span>
          <h1 className="text-3xl font-light tracking-tight text-white">
            MÁRCIO RJ CMS
          </h1>
          <p className="text-xs text-white/60">
            Painel Administrativo e Gestão de Imóveis
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              E-mail do Administrador
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#c5a880] focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Senha de Acesso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#c5a880] focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#c5a880] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[#0a1128] hover:bg-[#d6bc96] active:scale-[0.99] transition disabled:opacity-60 cursor-pointer shadow-lg shadow-[#c5a880]/15"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <a
            href="/"
            className="text-xs text-white/50 hover:text-white transition"
          >
            ← Voltar ao site público
          </a>
        </div>
      </div>
    </div>
  );
}
