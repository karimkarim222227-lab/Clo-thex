import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AppProvider, useApp } from "./contexts/AppContext";
import { ActivationScreen } from "./components/ActivationScreen";
import { AppShell } from "./components/AppShell";
import "./styles.css";

import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0f0f0f" });
  } catch {}
  await SplashScreen.hide({ fadeOutDuration: 300 });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function AppContent() {
  const { isReady } = useApp();
  const [activated, setActivated] = useState(() =>
    localStorage.getItem("ssm_activated") === "1"
  );
  useEffect(() => { initCapacitor(); }, []);
  if (!isReady) return <div style={{ minHeight: "100vh", background: "#0f0f0f" }} />;
  if (!activated) return <ActivationScreen onActivated={() => setActivated(true)} />;
  return <AppShell />;
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Sonner position="top-center" richColors />
          <AppContent />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
);
