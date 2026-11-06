import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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
