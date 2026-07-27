import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/add-investment", label: "Add Investment" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" }
  ];

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div
      className="w-64 min-h-screen p-5 flex flex-col"
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRight: "1px solid var(--border-color)"
      }}
    >
      <h2 className="text-2xl font-bold mb-8">MF Portfolio</h2>

      <div className="flex flex-col gap-4 flex-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-2 py-1 rounded transition"
            style={{
              color:
                location.pathname === link.to
                  ? "#3B82F6"
                  : "var(--text-secondary)",
              fontWeight: location.pathname === link.to ? 600 : 400
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Logout — placed right below Settings, in red, as requested */}
      <button
        onClick={handleLogout}
        className="mt-4 text-left px-2 py-2 rounded font-semibold text-red-500 hover:bg-red-500/10 transition"
      >
        Logout
      </button>
    </div>
  );
}
