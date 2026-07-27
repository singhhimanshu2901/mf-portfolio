import { Routes, Route } from "react-router-dom";

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
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*
        BUG FIX: these routes previously had no auth guard at all — an
        unauthenticated visitor could navigate to them directly and each
        page handled the "not logged in" case differently (usually just a
        stuck spinner). ProtectedRoute now redirects to Login consistently.
      */}

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
