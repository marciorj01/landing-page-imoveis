import { AuthProvider } from "./cms/AuthContext";
import DynamicRouter from "./cms/DynamicRouter";

export default function App() {
  return (
    <AuthProvider>
      <DynamicRouter />
    </AuthProvider>
  );
}
