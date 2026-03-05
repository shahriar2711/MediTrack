import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { FileText, Plus, X, Trash2, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const defaultMed = { name: "", dosage: "", frequency: "", duration: "" };

// ── PDF Generator ─────────────────────────────────────────────────────────────
const generateEPrescriptionPDF = (prescription, doctor, consultation) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  let y = 0;

  const colors = {
    primary:   [67, 56, 202],
    light:     [238, 242, 255],
    dark:      [17, 24, 39],
    muted:     [107, 114, 128],
    border:    [229, 231, 235],
    white:     [255, 255, 255],
  };

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, W, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...colors.white);
  doc.text("MediTrack", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(199, 210, 254);
  doc.text("Digital Health Records & E-Prescription Platform", margin, 22);

  // Rx badge
  doc.setFillColor(...colors.white);
  doc.roundedRect(W - margin - 22, 8, 22, 22, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text("Rx", W - margin - 14.5, 23);

  y = 38;

  // ── Doctor info bar ───────────────────────────────────────────────────────────
  doc.setFillColor(...colors.light);
  doc.rect(0, y, W, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.dark);
  doc.text(`Dr. ${doctor.name}`, margin, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text(`${doctor.email}`, margin, y + 16);

  const rxNum = `RX-${Date.now().toString().slice(-8)}`;
  const rxDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.dark);
  doc.text(`Prescription No: ${rxNum}`, W - margin, y + 9, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.muted);
  doc.text(`Date: ${rxDate}`, W - margin, y + 16, { align: "right" });

  y += 24;

  // Divider
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 6, W - margin, y + 6);
  y += 12;

  // ── Patient info ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.primary);
  doc.text("PATIENT INFORMATION", margin, y);
  y += 6;

  const patient = consultation?.patient || {};
  const patientFields = [
    ["Name",       patient.name      || "—"],
    ["Patient ID", patient.patientId || "—"],
    ["Email",      patient.email     || "—"],
  ];

  patientFields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.muted);
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.dark);
    doc.text(value, margin + 28, y);
    y += 6;
  });

  y += 4;

  // ── Consultation summary ──────────────────────────────────────────────────────
  if (consultation) {
    doc.setDrawColor(...colors.border);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, W - margin * 2, consultation.diagnosis ? 28 : 20, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.primary);
    doc.text("CONSULTATION SUMMARY", margin + 4, y + 7);

    doc.setFontSize(8.5);
    if (consultation.symptoms) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.muted);
      doc.text("Symptoms:", margin + 4, y + 14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      const sympLines = doc.splitTextToSize(consultation.symptoms, W - margin * 2 - 36);
      doc.text(sympLines, margin + 28, y + 14);
    }

    if (consultation.diagnosis) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.muted);
      doc.text("Diagnosis:", margin + 4, y + 21);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      doc.text(consultation.diagnosis, margin + 28, y + 21);
    }

    y += consultation.diagnosis ? 34 : 26;
  }

  // ── Medicines table ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.primary);
  doc.text("PRESCRIBED MEDICINES", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Medicine Name", "Dosage", "Frequency", "Duration"]],
    body: prescription.medicines.map((m, i) => [
      i + 1, m.name || "—", m.dosage || "—", m.frequency || "—", m.duration || "—",
    ]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: colors.dark },
    headStyles: { fillColor: colors.primary, textColor: colors.white, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 50, fontStyle: "bold" },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30 },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Notes ─────────────────────────────────────────────────────────────────────
  if (prescription.notes) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text("Special Instructions:", margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.dark);
    doc.text(doc.splitTextToSize(prescription.notes, W - margin * 2 - 8), margin + 4, y + 13);
    y += 24;
  }

  // ── Signature section ─────────────────────────────────────────────────────────
  y = Math.max(y, 230);

  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 6;

  const sigBoxW = 70;
  const sigBoxH = 30;
  const doctorSigX = margin;
  const patientSigX = W - margin - sigBoxW;

  // Doctor signature box
  doc.setDrawColor(...colors.border);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(doctorSigX, y, sigBoxW, sigBoxH, 3, 3, "FD");

  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.8);
  const sx = doctorSigX + 8;
  const sy = y + 14;
  doc.lines([[8, -6], [8, 6], [8, -4], [8, 4], [6, -2], [4, 2]], sx, sy, [1, 1], "S");
  doc.setLineWidth(0.4);
  doc.line(sx, sy + 5, sx + 50, sy + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.dark);
  doc.text(`Dr. ${doctor.name}`, doctorSigX + sigBoxW / 2, y + sigBoxH - 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.muted);
  doc.text("Doctor's Signature", doctorSigX + sigBoxW / 2, y + sigBoxH + 5, { align: "center" });

  // Patient signature box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(patientSigX, y, sigBoxW, sigBoxH, 3, 3, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.muted);
  doc.text("Patient's Signature", patientSigX + sigBoxW / 2, y + sigBoxH + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.dark);
  doc.text(patient.name || "_______________", patientSigX + sigBoxW / 2, y + sigBoxH - 5, { align: "center" });

  // MediTrack stamp
  const stampX = W / 2;
  const stampY = y + sigBoxH / 2;
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(1);
  doc.circle(stampX, stampY, 16, "S");
  doc.setLineWidth(0.4);
  doc.circle(stampX, stampY, 14, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...colors.primary);
  doc.text("MEDITRACK", stampX, stampY - 4, { align: "center" });
  doc.text("VERIFIED", stampX, stampY + 1, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(rxDate, stampX, stampY + 6, { align: "center" });

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setFillColor(...colors.primary);
  doc.rect(0, 281, W, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...colors.white);
  doc.text(
    "This is a digitally generated prescription from MediTrack. Valid only with doctor's authorization.",
    W / 2, 287, { align: "center" }
  );

  const fileName = `MediTrack_Rx_${patient.name?.replace(/\s+/g, "_") || "Patient"}_${rxNum}.pdf`;
  doc.save(fileName);
};

// ── Main Component ────────────────────────────────────────────────────────────
const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState("");
  const [medicines, setMedicines] = useState([{ ...defaultMed }]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(null);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/doctor/prescriptions"),
        api.get("/doctor/consultations"),
      ]);
      setPrescriptions(pRes.data);
      setConsultations(cRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addMed = () => setMedicines([...medicines, { ...defaultMed }]);
  const removeMed = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, field, value) => {
    const updated = [...medicines];
    updated[i][field] = value;
    setMedicines(updated);
  };

  const selectedConsultObj = consultations.find((c) => c._id === selectedConsultation);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("prescriptions", {
        consultationId: selectedConsultation,
        medicines,
        notes,
      });
      setShowForm(false);
      setSelectedConsultation("");
      setMedicines([{ ...defaultMed }]);
      setNotes("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create prescription.");
    } finally { setSubmitting(false); }
  };

  const handleDownloadPdf = (prescription) => {
    setGeneratingPdf(prescription._id);
    try {
      const consultation = consultations.find(
        (c) => c._id === prescription.consultation?._id || c._id === prescription.consultation
      );
      generateEPrescriptionPDF(prescription, user, consultation || null);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setTimeout(() => setGeneratingPdf(null), 1200);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
            <p className="text-gray-400 text-sm mt-1">Issue and manage e-prescriptions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
            <Plus size={16} /> New Prescription
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-semibold text-white">New Prescription</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Consultation dropdown */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Select Consultation</label>
                <select required value={selectedConsultation}
                  onChange={(e) => setSelectedConsultation(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                  <option value="" disabled className="text-gray-500">— Choose a consultation —</option>
                  {consultations.map((c) => (
                    <option key={c._id} value={c._id} className="bg-gray-800">
                      {c.patient?.name || "Unknown"} — {new Date(c.createdAt).toLocaleDateString()} — {c.symptoms?.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient preview */}
              {selectedConsultObj && (
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-indigo-400 mb-1">Patient Preview</p>
                  <p className="text-sm text-white font-medium">{selectedConsultObj.patient?.name}</p>
                  <p className="text-xs text-gray-400">{selectedConsultObj.patient?.patientId} · {selectedConsultObj.patient?.email}</p>
                  {selectedConsultObj.diagnosis && (
                    <p className="text-xs text-indigo-300 mt-1">Diagnosis: {selectedConsultObj.diagnosis}</p>
                  )}
                </div>
              )}

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Medicines</label>
                  <button type="button" onClick={addMed} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Plus size={12} /> Add medicine
                  </button>
                </div>
                <div className="space-y-3">
                  {medicines.map((med, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 relative">
                      {medicines.length > 1 && (
                        <button type="button" onClick={() => removeMed(i)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {["name", "dosage", "frequency", "duration"].map((field) => (
                          <input key={field} value={med[field]}
                            onChange={(e) => updateMed(i, field, e.target.value)}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Special Instructions</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="E.g. Take after meals, avoid alcohol..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {submitting ? "Issuing..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prescriptions list */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">All Prescriptions ({prescriptions.length})</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
              <FileText size={28} className="text-gray-700" />No prescriptions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {prescriptions.map((p) => (
                <div key={p._id} className="px-6 py-5 hover:bg-gray-800/30 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.patient?.name || "Unknown Patient"}</p>
                      <p className="text-xs text-gray-500 font-mono">{p.patient?.patientId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(p)}
                      disabled={generatingPdf === p._id}
                      className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-600 text-emerald-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {generatingPdf === p._id
                        ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                        : <><Download size={13} /> Download Rx PDF</>
                      }
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.medicines?.map((m, i) => (
                      <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full">
                        {m.name} · {m.dosage}
                      </span>
                    ))}
                  </div>
                  {p.notes && <p className="text-xs text-gray-400 mt-2 italic">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Prescriptions;