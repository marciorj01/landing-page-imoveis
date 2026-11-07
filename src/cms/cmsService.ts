import { supabase } from "../lib/supabase";
import { PageSchema, MenuItem } from "./types";
import { DEFAULT_HOME_PAGE_SCHEMA, DEFAULT_MENU_ITEMS } from "./defaults";

/**
 * Busca página por slug.
 * Caso o Supabase esteja temporariamente indisponível ou a tabela ainda não tenha sido
 * criada/migrada, aplica FALLBACK AUTOMÁTICO garantindo 100% de disponibilidade.
 */
export async function getPageBySlug(
  slug: string = "home",
  isDraft: boolean = false
): Promise<PageSchema> {
  const normalizedSlug = slug.trim().toLowerCase() === "" ? "home" : slug.trim().toLowerCase();

  try {
    let query = supabase.from("cms_pages").select("*").eq("slug", normalizedSlug);

    if (!isDraft) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.order("updated_at", { ascending: false }).limit(1);

    if (error) {
      console.warn(`[CMS] Supabase query falhou para "${normalizedSlug}":`, error.message);
      if (normalizedSlug === "home") {
        return DEFAULT_HOME_PAGE_SCHEMA;
      }
      throw error;
    }

    if (data && data.length > 0) {
      const row = data[0];
      return {
        id: row.id,
        slug: row.slug,
        title: row.title || DEFAULT_HOME_PAGE_SCHEMA.title,
        status: row.status || "published",
        seo: row.seo || DEFAULT_HOME_PAGE_SCHEMA.seo,
        sections: Array.isArray(row.sections) ? row.sections : DEFAULT_HOME_PAGE_SCHEMA.sections,
        updated_at: row.updated_at,
      };
    }

    // Se for home e não houver no banco, retorna default
    if (normalizedSlug === "home") {
      return DEFAULT_HOME_PAGE_SCHEMA;
    }

    throw new Error(`Página "/${normalizedSlug}" não encontrada.`);
  } catch (err) {
    console.warn(`[CMS] Usando fallback para slug "${normalizedSlug}"`, err);
    if (normalizedSlug === "home") {
      return DEFAULT_HOME_PAGE_SCHEMA;
    }
    throw err;
  }
}

/**
 * Busca menus do CMS com fallback para menus padrão
 */
export async function getMenus(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("cms_menus")
      .select("*")
      .eq("visible", true)
      .order("order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_MENU_ITEMS;
    }

    return data.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      target: item.target || "_self",
      visible: item.visible ?? true,
      order: item.order ?? 0,
      children: item.children || [],
    }));
  } catch {
    return DEFAULT_MENU_ITEMS;
  }
}
