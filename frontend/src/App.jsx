import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home                from "./pages/Home";
import Login               from "./pages/Login";
import Register            from "./pages/Register";
import AdminDashboard      from "./pages/AdminDashboard";
import RegisterDoctor      from "./pages/RegisterDoctor";
import DoctorDashboard     from "./pages/DoctorDashboard";
import PatientDashboard    from "./pages/PatientDashboard";
import Consultations       from "./pages/Consultations";
import Prescriptions       from "./pages/Prescriptions";
import PatientConsultations from "./pages/PatientConsultations";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import SearchPatient       from "./pages/SearchPatient";

export default function App() {
  return (
    
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/register-doctor" element={
            <ProtectedRoute roles={["admin"]}>
              <RegisterDoctor />
            </ProtectedRoute>
          } />

          {/* ── Doctor routes ── */}
          <Route path="/doctor" element={
            <ProtectedRoute roles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/consultations" element={
            <ProtectedRoute roles={["doctor"]}>
              <Consultations />
            </ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions" element={
            <ProtectedRoute roles={["doctor"]}>
              <Prescriptions />
            </ProtectedRoute>
          } />
          <Route path="/doctor/search" element={
            <ProtectedRoute roles={["doctor"]}>
              <SearchPatient />
            </ProtectedRoute>
          } />

          {/* ── Patient routes ── */}
          <Route path="/patient" element={
            <ProtectedRoute roles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/consultations" element={
            <ProtectedRoute roles={["patient"]}>
              <PatientConsultations />
            </ProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <ProtectedRoute roles={["patient"]}>
              <PatientPrescriptions />
            </ProtectedRoute>
          } />

          {/* Fallbacks */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center">
              <div>
                <p className="text-5xl font-bold text-red-400 mb-3">403</p>
                <p className="text-gray-400">You don't have access to this page.</p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      
  );
}