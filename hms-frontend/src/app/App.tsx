import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
