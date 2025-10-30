import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeConfigProvider } from "./providers/ThemeConfigProvider";
import { useAppInitialization } from "../hooks/useAppInitialization";

function AppContent() {
  useAppInitialization();
  return <AppRoutes />;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeConfigProvider>
        <AppContent />
      </ThemeConfigProvider>
    </AuthProvider>
  );
}
