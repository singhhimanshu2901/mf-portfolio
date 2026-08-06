import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import AddInvestment from "../pages/AddInvestment";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import FundDetails from "../pages/FundDetails";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/*
        CHANGE: "/" now shows the Landing/intro page instead of jumping
        straight to Login. Login moved to its own "/login" route.
      */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-investment"
        element={
          <ProtectedRoute>
            <AddInvestment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fund/:schemeCode"
        element={
          <ProtectedRoute>
            <FundDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
