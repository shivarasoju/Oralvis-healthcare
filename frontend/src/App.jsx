import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import TechnicianDashboard from "./components/TechnicianDashboard";
import DentistDashboard from "./components/DentistDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/technician"
              element={
                <ProtectedRoute requiredRole="technician">
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dentist"
              element={
                <ProtectedRoute requiredRole="dentist">
                  <DentistDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
