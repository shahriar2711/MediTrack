import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, ClipboardList, FileText,
  Search, LogOut, Stethoscope, UserPlus, ShieldCheck,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const doctorLinks = [
    { to: "/doctor",               label: "Dashboard",      icon: LayoutDashboard },
    { to: "/doctor/search",        label: "Search Patient", icon: Search },
    { to: "/doctor/consultations", label: "Consultations",  icon: ClipboardList },
    { to: "/doctor/prescriptions", label: "Prescriptions",  icon: FileText },
  ];

  const patientLinks = [
    { to: "/patient",                    label: "Dashboard",          icon: LayoutDashboard },
    { to: "/patient/consultations",      label: "My Consultations",   icon: ClipboardList },
    { to: "/patient/prescriptions",      label: "My Prescriptions",   icon: FileText },
  ];

  const adminLinks = [
    { to: "/admin",                      label: "Dashboard",          icon: LayoutDashboard },
    { to: "/admin/register-doctor",      label: "Register Doctor",    icon: UserPlus },
  ];

  const links =
    user?.role === "doctor" ? doctorLinks :
    user?.role === "admin"  ? adminLinks  :
    patientLinks;

  // Role display config
  const roleConfig = {
    doctor:  { label: "Doctor Portal",  color: "bg-indigo-600" },
    patient: { label: "Patient Portal", color: "bg-indigo-600" },
    admin:   { label: "Admin Panel",    color: "bg-rose-600"   },
  };
  const rc = roleConfig[user?.role] || roleConfig.patient;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
        <div className={`w-9 h-9 ${rc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {user?.role === "admin"
            ? <ShieldCheck size={18} className="text-white" />
            : <Stethoscope size={18} className="text-white" />}
        </div>
        <div>
          <p className="text-white font-bold text-sm">MediTrack</p>
          <p className="text-gray-400 text-xs">{rc.label}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split("/").length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? `${user?.role === "admin" ? "bg-rose-600" : "bg-indigo-600"} text-white`
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className={`w-8 h-8 ${rc.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;