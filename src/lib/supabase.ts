import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://bzusbywocpsqmwfokgsw.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dXNieXdvY3BzcW13Zm9rZ3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5ODU0MTIsImV4cCI6MjEwOTU2MTQxMn0.2kkQP_f30GH_KJqfpcWqKLdUijWFc8jKiEV9r1llQ9g";

// Se tiver /rest/v1/ no final, limpa para pegar a base URL correta do Supabase
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface LeadData {
  name: string;
  phone: string;
  email: string;
  property: string;
  notes?: string;
}

export async function saveLead(data: LeadData): Promise<{ success: boolean; error?: string }> {
  // Salva backup de contingência local no navegador para nunca perder leads
  try {
    const existing = JSON.parse(localStorage.getItem("leads_backup") || "[]");
    existing.push({ ...data, saved_at: new Date().toISOString() });
    localStorage.setItem("leads_backup", JSON.stringify(existing));
  } catch (e) {
    console.warn("Falha ao salvar backup local do lead", e);
  }

  if (!supabase) {
    console.info("Supabase ainda não configurado com VITE_SUPABASE_URL. Lead salvo localmente:", data);
    return { success: true };
  }

  try {
    const { error } = await supabase.from("leads").insert([
      {
        name: data.name,
        phone: data.phone,
        email: data.email,
        property: data.property,
        notes: data.notes || "Lead capturado via Landing Page",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Erro ao enviar lead ao Supabase:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erro inesperado no Supabase:", err);
    return { success: false, error: err?.message || "Erro desconhecido" };
  }
}
