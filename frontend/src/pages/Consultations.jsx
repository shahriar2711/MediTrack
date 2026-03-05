import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { ClipboardList, Plus, X, CheckCircle } from "lucide-react";

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: "", symptoms: "", diagnosis: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchConsultations = async () => {
    try {
      const { data } = await api.get("/doctor/consultations");  // ✅
      setConsultations(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConsultations(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/doctor/consultation", form);             // ✅
      setSuccess("Consultation created successfully!");
      setForm({ patientId: "", symptoms: "", diagnosis: "", notes: "" });
      setShowForm(false);
      fetchConsultations();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create consultation.");
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Consultations</h1>
            <p className="text-gray-400 text-sm mt-1">Manage patient consultations</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            <Plus size={16} /> New Consultation
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-6">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">New Consultation</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Patient ID</label>
                <input required value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  placeholder="e.g. P1234567890"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Symptoms</label>
                <textarea required value={form.symptoms}
                  onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                  rows={3} placeholder="Describe patient symptoms..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Diagnosis</label>
                <input value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Diagnosis (optional)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Notes</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Additional notes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">All Consultations ({consultations.length})</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
              <ClipboardList size={28} className="text-gray-700" />No consultations found
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {consultations.map((c) => (
                <div key={c._id} className="px-6 py-5 hover:bg-gray-800/40 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{c.patient?.name || "Unknown Patient"}</p>
                      <p className="text-xs text-gray-500 font-mono">{c.patient?.patientId}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-300"><span className="text-gray-500">Symptoms: </span>{c.symptoms}</p>
                  {c.diagnosis && <p className="text-xs text-indigo-400 mt-1"><span className="text-gray-500">Diagnosis: </span>{c.diagnosis}</p>}
                  {c.notes && <p className="text-xs text-gray-400 mt-1"><span className="text-gray-500">Notes: </span>{c.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Consultations;