import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 min-h-screen p-5">
      <h2 className="text-2xl font-bold mb-8">
        MF Portfolio
      </h2>

      <div className="flex flex-col gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/add-investment">Add Investment</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
      </div>
    </div>
  );
}