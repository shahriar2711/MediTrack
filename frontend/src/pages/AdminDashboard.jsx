import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { UserPlus, Users, Stethoscope, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, patients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optional: fetch user stats if you have an admin stats endpoint
    // For now we'll just show the admin panel cards
    setLoading(false);
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, <span className="text-indigo-400 font-medium">{user?.name}</span>
          </p>
        </div>

        {/* Admin badge */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl px-6 py-4 flex items-center gap-4 mb-8">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="text-indigo-400 font-semibold text-sm">System Administrator</p>
            <p className="text-gray-400 text-xs mt-0.5">
              You have full access to manage doctors, patients, and system settings.
            </p>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">

          <Link to="/admin/register-doctor"
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group">
            <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              <UserPlus size={20} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition">
              Register Doctor
            </h3>
            <p className="text-gray-400 text-sm">
              Create a new doctor account with their verified medical license number.
            </p>
          </Link>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <Users size={20} className="text-gray-500" />
            </div>
            <h3 className="text-gray-400 font-semibold mb-1">
              Manage Users
              <span className="ml-2 text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            </h3>
            <p className="text-gray-500 text-sm">
              View and manage all registered patients and doctors.
            </p>
          </div>

        </div>

        {/* System info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <Stethoscope size={15} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">System Info</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {[
              ["Admin Account", user?.name],
              ["Email", user?.email],
              ["Role", "Administrator"],
              ["Access Level", "Full System Access"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-6 py-3.5">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;