import { useState, useEffect } from "react";
import PageRenderer from "./PageRenderer";
import { getPageBySlug, getMenus } from "./cmsService";
import { PageSchema, MenuItem } from "./types";
import { DEFAULT_HOME_PAGE_SCHEMA, DEFAULT_MENU_ITEMS } from "./defaults";
import { useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";

export default function DynamicRouter() {
  const { user, isAdmin, loading: authLoading } = useAuth();

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

  const isPreviewRoute = currentPath.startsWith("/preview/");
  const hasPreviewParam = new URLSearchParams(currentSearch).get("preview") === "draft";

  // O modo de preview é estritamente condicionado à autenticação e autorização do administrador
  // Visitantes anônimos ou usuários comuns NUNCA podem ativar isPreview
  const isAuthorizedPreview = isAdmin && (isPreviewRoute || hasPreviewParam);

  // Carrega página e menus
  useEffect(() => {
    if (isAdminRoute) return;

    // Se estiver em rota de preview mas não for admin e ainda estiver carregando auth, aguarda
    if (isPreviewRoute && authLoading) return;

    // Se estiver em rota de preview e não for admin, não carrega nada (o guard de rota cuidará)
    if (isPreviewRoute && !isAdmin) return;

    let isMounted = true;
    let slug = "home";

    if (isPreviewRoute) {
      const extractedSlug = currentPath.replace("/preview/", "").replace(/^\//, "");
      slug = extractedSlug || "home";
    } else {
      const cleanPath = currentPath.replace(/^\//, "").replace(/\/$/, "");
      if (cleanPath && cleanPath !== "index.html") {
        slug = cleanPath;
      }
    }

    setPageLoading(true);
    setPageNotFound(false);

    Promise.all([getPageBySlug(slug, isAuthorizedPreview), getMenus()])
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
  }, [currentPath, currentSearch, currentHash, isAdminRoute, isPreviewRoute, isAuthorizedPreview, authLoading, isAdmin]);

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
      if (!isAdmin) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#060c1d] text-white px-4 text-center">
            <h1 className="text-3xl font-bold text-red-400 mb-3">Acesso Não Autorizado</h1>
            <p className="text-gray-300 max-w-md mb-6">
              Sua conta ({user.email}) não possui permissão de administrador para gerenciar o CMS.
            </p>
            <a
              href="/"
              className="px-5 py-2.5 rounded bg-[#c5a880] text-[#060c1d] font-bold text-sm uppercase tracking-wider"
            >
              Voltar ao Site
            </a>
          </div>
        );
      }
      return <AdminDashboard />;
    }

    return <LoginPage />;
  }

  // ROTA DE PREVIEW PROTEGIDA: Se um usuário não admin acessar /preview/:slug
  if (isPreviewRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#060c1d] text-[#c5a880] text-sm font-semibold tracking-wider uppercase">
          Verificando autorização de pré-visualização...
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#060c1d] text-white px-4 text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-3">Pré-visualização Restrita</h1>
          <p className="text-gray-300 max-w-md mb-6">
            A visualização de rascunhos é exclusiva para o administrador autorizado do CMS.
          </p>
          <a
            href="/gestao-restrita"
            className="px-6 py-2.5 rounded bg-[#c5a880] text-[#060c1d] font-bold text-sm uppercase tracking-wider"
          >
            Fazer Login como Administrador
          </a>
        </div>
      );
    }
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

  // ROTA 3: Site Público / Preview Autorizado
  return (
    <>
      {isAuthorizedPreview && (
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
