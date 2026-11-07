import { useState, useEffect } from "react";
import PageRenderer from "./PageRenderer";
import { getPageBySlug, getMenus } from "./cmsService";
import { PageSchema, MenuItem } from "./types";
import { DEFAULT_HOME_PAGE_SCHEMA, DEFAULT_MENU_ITEMS } from "./defaults";
import { useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";

export default function DynamicRouter() {
  const { user, loading: authLoading } = useAuth();

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  const [pageSchema, setPageSchema] = useState<PageSchema>(DEFAULT_HOME_PAGE_SCHEMA);
  const [menus, setMenus] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageNotFound, setPageNotFound] = useState(false);

  // Escuta mudanças de URL no histórico
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Determina se a rota atual é admin ou preview
  const isAdminRoute =
    currentPath.startsWith("/gestao-restrita") || currentHash.startsWith("#/gestao-restrita");

  const isPreview =
    currentPath.startsWith("/preview/") ||
    new URLSearchParams(currentSearch).get("preview") === "draft";

  // Carrega página e menus
  useEffect(() => {
    if (isAdminRoute) return;

    let isMounted = true;
    let slug = "home";

    if (currentPath.startsWith("/preview/")) {
      slug = currentPath.replace("/preview/", "").replace(/^\//, "");
    } else {
      const cleanPath = currentPath.replace(/^\//, "").replace(/\/$/, "");
      if (cleanPath && cleanPath !== "index.html") {
        slug = cleanPath;
      }
    }

    setPageLoading(true);
    setPageNotFound(false);

    Promise.all([getPageBySlug(slug, isPreview), getMenus()])
      .then(([page, loadedMenus]) => {
        if (!isMounted) return;
        setPageSchema(page);
        setMenus(loadedMenus);
        setPageNotFound(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (slug !== "home") {
          setPageNotFound(true);
        } else {
          setPageSchema(DEFAULT_HOME_PAGE_SCHEMA);
        }
      })
      .finally(() => {
        if (isMounted) setPageLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPath, currentSearch, currentHash, isAdminRoute, isPreview]);

  // ROTA 1: Painel Administrativo do CMS
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#060c1d] text-[#c5a880] text-sm font-semibold tracking-wider uppercase">
          Carregando MÁRCIO RJ CMS...
        </div>
      );
    }

    if (user) {
      return <AdminDashboard />;
    }

    return <LoginPage />;
  }

  // ROTA 2: Página 404 (quando uma rota dinâmica não existe)
  if (pageNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060c1d] text-white px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#c5a880] mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-gray-400 max-w-md mb-8">
          A página que você está procurando não existe ou ainda não foi publicada no CMS.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded bg-[#c5a880] text-[#060c1d] font-bold text-sm uppercase tracking-wider hover:bg-[#b59870] transition-colors"
        >
          Voltar para a Página Inicial
        </a>
      </div>
    );
  }

  // ROTA 3: Site Público / Preview
  return (
    <>
      {isPreview && (
        <div className="bg-amber-500 text-stone-900 py-2 px-4 text-center text-xs font-bold uppercase tracking-wider sticky top-0 z-50 flex items-center justify-center gap-3 shadow-md">
          <span>⚠️ Modo Pré-visualização: Visualizando rascunho de &quot;{pageSchema.slug}&quot; (não publicado)</span>
          <a
            href="/gestao-restrita"
            className="underline hover:text-black font-extrabold ml-2"
          >
            Voltar ao Painel
          </a>
        </div>
      )}

      {pageLoading && pageSchema.slug !== "home" && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#c5a880] animate-pulse z-50" />
      )}

      <PageRenderer
        schema={pageSchema}
        menuItems={menus}
      />
    </>
  );
}
