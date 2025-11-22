import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { getUser } from "../utils/auth";

interface NavbarProps {
  role?: string;
}

const Navbar = ({ role }: NavbarProps) => {
  const user = getUser();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          MaternalCare+
          {role === "health_worker" && (
            <span className="ml-3 text-sm font-normal text-gray-600">
              Health Worker Portal
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user?.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") || "U"}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
