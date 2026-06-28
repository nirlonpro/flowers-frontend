import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Choose from "./pages/Choose";
import Roseflower from "./pages/Roseflower";
import Lily from "./pages/Lily";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Protected Choose */}
      <Route
        path="/choose"
        element={
          <ProtectedRoute>
            <Choose />
          </ProtectedRoute>
        }
      />

      {/* Protected Rose */}
      <Route
        path="/rose"
        element={
          <ProtectedRoute>
            <Roseflower />
          </ProtectedRoute>
        }
      />

      {/* Protected Lily */}
      <Route
        path="/lily"
        element={
          <ProtectedRoute>
            <Lily />
          </ProtectedRoute>
        }
      />

      {/* Redirect Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}