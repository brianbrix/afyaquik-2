import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeConfigProvider } from "./providers/ThemeConfigProvider";
import { useAppInitialization } from "../hooks/useAppInitialization";
import { useEffect } from "react";
import { serviceWorkerService } from "../services/serviceWorkerService";
import { memoryMonitor } from "../services/memoryMonitor";

function AppContent() {
  useAppInitialization();
  
  // Register service worker for offline functionality (production only)
  useEffect(() => {
    const registerServiceWorker = async () => {
      // Only register service worker in production
      if (import.meta.env.PROD) {
        try {
          await serviceWorkerService.register();
          console.log('Service Worker registered for offline functionality');
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      } else {
        console.log('Service Worker disabled in development mode for hot reload');
      }
    };

    registerServiceWorker();
  }, []);

  // Start memory monitoring
  useEffect(() => {
    memoryMonitor.startMonitoring();
    
    // Add memory alert listener
    const handleMemoryAlert = (alert: any) => {
      console.warn('Memory Alert:', alert.message);
      // You could show a toast notification here
    };
    
    memoryMonitor.addAlertListener(handleMemoryAlert);
    
    return () => {
      memoryMonitor.removeAlertListener(handleMemoryAlert);
      memoryMonitor.stopMonitoring();
    };
  }, []);
  
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
