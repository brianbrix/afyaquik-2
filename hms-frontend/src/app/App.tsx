import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeConfigProvider } from "./providers/ThemeConfigProvider";

export function App() {
  return (
    <AuthProvider>
      <ThemeConfigProvider>
        <AppRoutes />
      </ThemeConfigProvider>
    </AuthProvider>
  );
}
