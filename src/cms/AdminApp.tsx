import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";

function AdminRouter() {
  const { user, loading } = useAuth();

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

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRouter />
    </AuthProvider>
  );
}
