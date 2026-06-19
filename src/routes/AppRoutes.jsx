import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import AddInvestment from "../pages/AddInvestment";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import FundDetails from "../pages/FundDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/add-investment" element={<AddInvestment />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />

      <Route
        path="/fund/:schemeCode"
        element={<FundDetails />}
      />
    </Routes>
  );
}