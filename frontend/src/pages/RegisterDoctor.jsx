import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import {
  Stethoscope, User, Mail, Lock, BadgeCheck,
  AlertCircle, CheckCircle, Eye, EyeOff,
} from "lucide-react";

const RegisterDoctor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", licenseNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null); // holds the created doctor object

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register-doctor", form);
      setSuccess(data.doctor);
      setForm({ name: "", email: "", password: "", licenseNumber: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register doctor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnother = () => setSuccess(null);

  return (
    <Layout>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Register Doctor</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create a new doctor account using their medical license number
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={30} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Doctor Registered!</h2>
            <p className="text-gray-400 text-sm mb-6">
              The doctor account has been created successfully.
            </p>

            {/* Doctor summary card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-left mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {success.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{success.name}</p>
                  <p className="text-gray-400 text-xs">{success.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-3 flex items-center gap-2">
                <BadgeCheck size={15} className="text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="text-white font-mono font-semibold text-sm">
                    {success.licenseNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAnother}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                Register Another Doctor
              </button>
              <button
                onClick={() => navigate("/admin")}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition border border-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Registration form */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            {/* Admin notice */}
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
              <Stethoscope size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-400">Admin Action</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Only verified medical license numbers should be registered.
                  The doctor will use their email and password to log in.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                <AlertCircle size={15} className="flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Ayesha Khan"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* License Number — the key new field */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Medical License Number
                </label>
                <div className="relative">
                  <BadgeCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text" required value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BMDC-12345 or GMC7654321"
                    maxLength={20}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition uppercase"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5 pl-1">
                  6–20 alphanumeric characters. Will be stored in uppercase. Must be unique.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required minLength={6} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5 pl-1">
                  Share this with the doctor. They should change it after first login.
                </p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2"
              >
                {loading ? "Registering Doctor..." : "Register Doctor"}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RegisterDoctor;