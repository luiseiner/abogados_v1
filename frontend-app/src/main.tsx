import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./context/theme-context";
import { TimerProvider } from "./context/TimerContext";

//document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <WebSocketProvider>
              <Toaster />
              <App />
            </WebSocketProvider>
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
