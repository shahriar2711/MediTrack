import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { FileText } from "lucide-react";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patient/prescriptions")       // ✅
      .then(({ data }) => setPrescriptions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Prescriptions</h1>
          <p className="text-gray-400 text-sm mt-1">Medications prescribed by your doctors</p>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
              <FileText size={28} className="text-gray-700" />No prescriptions yet
            </div>
          ) : (
            prescriptions.map((p) => (
              <div key={p._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Dr. {p.doctor?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full">Prescription</span>
                </div>
                <div className="space-y-2">
                  {p.medicines?.map((m, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl px-4 py-3 flex flex-wrap gap-4">
                      <span className="text-sm text-white font-medium">{m.name}</span>
                      <span className="text-xs text-gray-400">{m.dosage}</span>
                      <span className="text-xs text-gray-400">{m.frequency}</span>
                      <span className="text-xs text-gray-400">{m.duration}</span>
                    </div>
                  ))}
                </div>
                {p.notes && <p className="text-xs text-gray-400 mt-3 border-t border-gray-800 pt-3">{p.notes}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientPrescriptions;