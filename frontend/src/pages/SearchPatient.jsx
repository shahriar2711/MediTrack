import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import {
  Search, User, ClipboardList, FileText, ChevronDown, ChevronUp,
  Calendar, Stethoscope, AlertCircle
} from "lucide-react";

// Expandable consultation card
const ConsultationCard = ({ consultation }) => {
  const [open, setOpen] = useState(false);
  const c = consultation;

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-800 hover:bg-gray-750 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{c.diagnosis || "Consultation Record"}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Calendar size={11} />
              {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {c.prescription && (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <FileText size={10} /> Rx
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 py-4 bg-gray-900 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Symptoms</p>
            <p className="text-sm text-gray-300">{c.symptoms}</p>
          </div>
          {c.diagnosis && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Diagnosis</p>
              <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm px-3 py-1 rounded-lg">{c.diagnosis}</span>
            </div>
          )}
          {c.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Doctor's Notes</p>
              <p className="text-sm text-gray-300 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">{c.notes}</p>
            </div>
          )}
          {c.prescription && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prescription</p>
              <div className="space-y-2">
                {c.prescription.medicines?.map((m, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-1">
                    <span className="text-sm text-white font-medium">{m.name}</span>
                    {m.dosage && <span className="text-xs text-gray-400">{m.dosage}</span>}
                    {m.frequency && <span className="text-xs text-gray-400">{m.frequency}</span>}
                    {m.duration && <span className="text-xs text-gray-400">{m.duration}</span>}
                  </div>
                ))}
                {c.prescription.notes && <p className="text-xs text-gray-400 mt-1 italic">{c.prescription.notes}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main page
const SearchPatient = () => {
  const [query, setQuery] = useState("");
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setPatient(null);
    setConsultations([]);
    try {
      const [patientRes, consultRes] = await Promise.all([
        api.get(`/doctor/patient/${query.trim()}`),
        api.get(`/doctor/consultations/${query.trim()}`),
      ]);
      setPatient(patientRes.data);
      setConsultations(consultRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Patient not found.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery(""); setPatient(null); setConsultations([]); setError("");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Search Patient</h1>
          <p className="text-gray-400 text-sm mt-1">Look up a patient by their unique Patient ID to view their profile and consultation history</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Patient ID (e.g. P1718200000000)"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        {patient && (
          <div className="space-y-5">
            {/* Profile card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <User size={15} className="text-indigo-400" /> Patient Profile
                </h2>
                <button onClick={clearSearch} className="text-xs text-gray-500 hover:text-white transition">Clear ✕</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {patient.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{patient.name}</p>
                  <p className="text-gray-400 text-sm">{patient.email}</p>
                </div>
              </div>
              <div className="mt-5 bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-700">
                <Stethoscope size={14} className="text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-400">Patient ID</p>
                  <p className="text-sm text-white font-mono font-semibold">{patient.patientId}</p>
                </div>
              </div>
            </div>

            {/* Consultation history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <ClipboardList size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white">Consultation History</h2>
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">
                  {consultations.length} record{consultations.length !== 1 ? "s" : ""}
                </span>
              </div>
              {consultations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-500">
                  <ClipboardList size={30} className="text-gray-700" />
                  <p className="text-sm">No consultation records found for this patient</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {consultations.map((c) => <ConsultationCard key={c._id} consultation={c} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {!patient && !error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Search size={26} className="text-gray-700" />
            </div>
            <p className="text-sm text-gray-500">Enter a Patient ID to get started</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPatient;