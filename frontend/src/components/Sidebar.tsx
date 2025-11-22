import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

interface SidebarProps {
  role: string;
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();

  const motherMenuItems = [
    { path: "/mother-dashboard", label: "Dashboard" },
    { path: "/my-profile", label: "My Profile" },
    { path: "/my-appointments", label: "Appointments" },
    { path: "/vaccinations", label: "Vaccinations" },
  ];

  const workerMenuItems = [
    { path: "/worker-dashboard", label: "Dashboard" },
    { path: "/my-patients", label: "My Patients" },
    { path: "/record-visit", label: "Record Visit" },
    { path: "/record-vaccination", label: "Record Vaccination" },
    { path: "/appointments", label: "Appointments" },
    { path: "/search-records", label: "Search Records" },
  ];

  const menuItems =
    role === "health_worker" ? workerMenuItems : motherMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => authService.logout()}
        className="mt-8 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
