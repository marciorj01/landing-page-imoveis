import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./cms/AuthContext";
import LoginPage from "./cms/LoginPage";
import AdminDashboard from "./cms/AdminDashboard";
import PublicSite from "./PublicSite";

function AppRouter() {
  const { user, loading } = useAuth();
  const [isAdminPath, setIsAdminPath] = useState(
    window.location.pathname.startsWith("/gestao-restrita") ||
      window.location.hash.startsWith("#/gestao-restrita")
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPath(
        window.location.pathname.startsWith("/gestao-restrita") ||
          window.location.hash.startsWith("#/gestao-restrita")
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (isAdminPath) {
    if (loading) {
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

  return <PublicSite />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
