import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { ClipboardList, FileText, User } from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ consultations: 0, prescriptions: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get("/patient/consultations"),     // ✅ correct route
          api.get("/patient/prescriptions"),     // ✅ correct route
        ]);
        setStats({ consultations: cRes.data.length, prescriptions: pRes.data.length });
        setRecent(cRes.data.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Hello, <span className="text-indigo-400">{user?.name}</span> 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Your health records at a glance</p>
        </div>

        {user?.patientId && (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl px-6 py-4 flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Patient ID</p>
              <p className="text-white font-mono font-semibold">{user.patientId}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/patient/consultations" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition group">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white group-hover:text-indigo-400 transition">{loading ? "—" : stats.consultations}</p>
            <p className="text-sm text-gray-400 mt-1">Consultations</p>
          </Link>
          <Link to="/patient/prescriptions" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition group">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <FileText size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white group-hover:text-emerald-400 transition">{loading ? "—" : stats.prescriptions}</p>
            <p className="text-sm text-gray-400 mt-1">Prescriptions</p>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Consultations</h2>
            <Link to="/patient/consultations" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm gap-2">
              <ClipboardList size={24} className="text-gray-700" />No records yet
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recent.map((c) => (
                <div key={c._id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">Dr. {c.doctor?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.symptoms}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {c.diagnosis && (
                    <span className="inline-block text-xs text-indigo-400 bg-indigo-500/10 rounded px-2 py-1 mt-2">
                      {c.diagnosis}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;