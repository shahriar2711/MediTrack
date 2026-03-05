import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { ClipboardList } from "lucide-react";

const PatientConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patient/consultations")      // ✅
      .then(({ data }) => setConsultations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Consultations</h1>
          <p className="text-gray-400 text-sm mt-1">Your medical consultation history</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">{consultations.length} Records</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
              <ClipboardList size={28} className="text-gray-700" />No consultations yet
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {consultations.map((c) => (
                <div key={c._id} className="px-6 py-5">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-white">Dr. {c.doctor?.name}</p>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1"><span className="text-gray-500">Symptoms: </span>{c.symptoms}</p>
                  {c.diagnosis && (
                    <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-3 py-1 rounded-full mt-1">
                      {c.diagnosis}
                    </span>
                  )}
                  {c.notes && <p className="text-xs text-gray-400 mt-2">{c.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientConsultations;