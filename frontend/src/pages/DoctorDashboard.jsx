import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { ClipboardList, FileText, Search, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-indigo-500/50 transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-3xl font-bold text-white group-hover:text-indigo-400 transition">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </Link>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ consultations: 0, prescriptions: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get("/doctor/consultations"),       // ✅ correct route
          api.get("/doctor/prescriptions"),       // ✅ correct route
        ]);
        setStats({ consultations: cRes.data.length, prescriptions: pRes.data.length });
        setRecent(cRes.data.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Good morning, <span className="text-indigo-400">Dr. {user?.name}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your practice overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={ClipboardList} label="Total Consultations" value={loading ? "—" : stats.consultations} color="bg-indigo-600" to="/doctor/consultations" />
          <StatCard icon={FileText} label="Prescriptions Issued" value={loading ? "—" : stats.prescriptions} color="bg-emerald-600" to="/doctor/prescriptions" />
          <StatCard icon={Search} label="Search Patients" value="Find" color="bg-violet-600" to="/doctor/search" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Recent Consultations</h2>
            </div>
            <Link to="/doctor/consultations" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm gap-2">
              <ClipboardList size={24} className="text-gray-700" />No consultations yet
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recent.map((c) => (
                <div key={c._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition">
                  <div>
                    <p className="text-sm font-medium text-white">{c.patient?.name || "Unknown Patient"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.symptoms}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;