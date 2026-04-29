import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/auth/auth";

import Home from "./pages/home/home";
import Settings from "./routes/settings-routes";
import { ProtectedView, useAuth } from "./context/AuthContext";
import "./App.css";
import CotizacionPanel from "./pages/quotes-panels/add-edit-quotes-panel";
import ExportQuotesPanel from "@/pages/quotes-panels/export-quotes-panel";
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route
        path="/home/quotes/add"
        element={
          <PrivateRoute>
            <CotizacionPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/home/quotes/edit/:id"
        element={
          <PrivateRoute>
            <CotizacionPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/home/quotes/export/:id"
        element={
          <PrivateRoute>
            <ExportQuotesPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/home*"
        element={
          <PrivateRoute>
            {" "}
            <Home />{" "}
          </PrivateRoute>
        }
      />
      <Route
        path="/settings*"
        element={
          <ProtectedView permission="canViewConfiguracion">
            <Settings />
          </ProtectedView>
        }
      />
    </Routes>
  );
}
