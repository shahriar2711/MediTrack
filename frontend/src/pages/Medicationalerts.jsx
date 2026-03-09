import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Bell, BellOff, Check, Clock, Pill, RefreshCw, ShieldCheck, Sun, Sunset, Moon } from "lucide-react";

// ── Parse frequency string → daily times ─────────────────────────────────────
const parseFrequency = (freq = "") => {
  const f = freq.toLowerCase();
  if (f.includes("3") || f.includes("three") || f.includes("thrice") || f.includes("tid"))
    return ["08:00", "14:00", "20:00"];
  if (f.includes("2") || f.includes("two") || f.includes("twice") || f.includes("bid"))
    return ["08:00", "20:00"];
  if (f.includes("4") || f.includes("four") || f.includes("qid"))
    return ["08:00", "12:00", "16:00", "20:00"];
  if (f.includes("night") || f.includes("bed") || f.includes("qhs"))
    return ["21:00"];
  if (f.includes("morn") || f.includes("am"))
    return ["08:00"];
  return ["08:00"]; // default once daily
};

const timeIcon = (time) => {
  const h = parseInt(time);
  if (h < 12) return <Sun size={13} className="text-amber-400" />;
  if (h < 18) return <Sunset size={13} className="text-orange-400" />;
  return <Moon size={13} className="text-indigo-400" />;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

// ── Request push notification permission ─────────────────────────────────────
const requestPushPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  return result;
};

const sendPushNotification = (title, body) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }
};

// ── Schedule browser notifications for today ─────────────────────────────────
const scheduleNotifications = (medicines) => {
  const now = new Date();
  medicines.forEach(({ name, times }) => {
    times.forEach((time) => {
      const [h, m] = time.split(":").map(Number);
      const fireAt = new Date();
      fireAt.setHours(h, m, 0, 0);
      const delay = fireAt - now;
      if (delay > 0) {
        setTimeout(() => {
          sendPushNotification(
            "💊 Medication Reminder — MediTrack",
            `Time to take ${name} (${time})`
          );
        }, delay);
      }
    });
  });
};

export default function MedicationAlerts() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifStatus, setNotifStatus] = useState(Notification?.permission ?? "unsupported");
  // checkedMap: { "medName_time_date": true }
  const [checkedMap, setCheckedMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("meditrack_checks") || "{}"); }
    catch { return {}; }
  });

  // Flatten all medicines from all prescriptions
  const medicines = prescriptions.flatMap((p) =>
    (p.medicines || []).map((m) => ({
      id: `${p._id}_${m.name}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      prescriptionDate: p.createdAt,
      times: parseFrequency(m.frequency),
    }))
  );

  const fetchPrescriptions = useCallback(async () => {
    try {
      const { data } = await api.get("/patient/prescriptions");
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Schedule notifications whenever medicines load
  useEffect(() => {
    if (notifStatus === "granted" && medicines.length > 0) {
      scheduleNotifications(medicines);
    }
  }, [medicines.length, notifStatus]);

  const handleEnableNotifs = async () => {
    const result = await requestPushPermission();
    setNotifStatus(result);
    if (result === "granted" && medicines.length > 0) {
      scheduleNotifications(medicines);
      sendPushNotification("MediTrack Alerts Enabled ✅", "You'll be reminded to take your medicines on time.");
    }
  };

  const toggleCheck = (key) => {
    const updated = { ...checkedMap, [key]: !checkedMap[key] };
    setCheckedMap(updated);
    localStorage.setItem("meditrack_checks", JSON.stringify(updated));
  };

  const isChecked = (name, time) => !!checkedMap[`${name}_${time}_${todayKey()}`];
  const checkKey = (name, time) => `${name}_${time}_${todayKey()}`;

  // Today's progress
  const totalDoses = medicines.reduce((acc, m) => acc + m.times.length, 0);
  const takenDoses = medicines.reduce(
    (acc, m) => acc + m.times.filter((t) => isChecked(m.name, t)).length, 0
  );
  const progress = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  // Group times into morning / afternoon / evening
  const timeGroups = [
    { label: "Morning", range: [0, 12], icon: <Sun size={15} className="text-amber-400" />, bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
    { label: "Afternoon", range: [12, 17], icon: <Sunset size={15} className="text-orange-400" />, bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
    { label: "Evening", range: [17, 24], icon: <Moon size={15} className="text-indigo-400" />, bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Medication Alerts</h1>
            <p className="text-gray-400 text-sm mt-1">
              Daily schedule based on your active prescriptions
            </p>
          </div>
          <button onClick={fetchPrescriptions}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Push notification banner */}
        <div className={`rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4 border
          ${notifStatus === "granted"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : notifStatus === "denied"
            ? "bg-red-500/10 border-red-500/20"
            : "bg-indigo-500/10 border-indigo-500/20"}`}>
          <div className="flex items-center gap-3">
            {notifStatus === "granted"
              ? <Bell size={18} className="text-emerald-400 flex-shrink-0" />
              : <BellOff size={18} className="text-gray-400 flex-shrink-0" />}
            <div>
              {notifStatus === "granted" && (
                <>
                  <p className="text-sm font-semibold text-emerald-400">Push notifications enabled</p>
                  <p className="text-xs text-gray-400 mt-0.5">You'll receive browser alerts at each scheduled time today.</p>
                </>
              )}
              {notifStatus === "default" && (
                <>
                  <p className="text-sm font-semibold text-white">Enable medication reminders</p>
                  <p className="text-xs text-gray-400 mt-0.5">Get browser push notifications when it's time to take your medicine.</p>
                </>
              )}
              {notifStatus === "denied" && (
                <>
                  <p className="text-sm font-semibold text-red-400">Notifications blocked</p>
                  <p className="text-xs text-gray-400 mt-0.5">Enable notifications in your browser settings to get reminders.</p>
                </>
              )}
              {notifStatus === "unsupported" && (
                <>
                  <p className="text-sm font-semibold text-gray-300">Push notifications not supported</p>
                  <p className="text-xs text-gray-400 mt-0.5">Use the checklist below to track your doses manually.</p>
                </>
              )}
            </div>
          </div>
          {notifStatus === "default" && (
            <button onClick={handleEnableNotifs}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
              Enable
            </button>
          )}
          {notifStatus === "granted" && (
            <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" />
          )}
        </div>

        {/* Today's progress */}
        {totalDoses > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Today's Progress</p>
              <p className="text-sm font-bold text-indigo-400">{takenDoses}/{totalDoses} doses</p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress === 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
            </div>
            {progress === 100 && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">
                🎉 All doses taken for today!
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            Loading your prescriptions...
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
            <Pill size={32} className="text-gray-700" />
            <p className="text-sm">No active prescriptions found.</p>
            <p className="text-xs text-gray-600">Medication reminders will appear here once your doctor issues a prescription.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {timeGroups.map(({ label, range, icon, bg, border, text }) => {
              // Collect all doses in this time group
              const doses = medicines.flatMap((med) =>
                med.times
                  .filter((t) => {
                    const h = parseInt(t);
                    return h >= range[0] && h < range[1];
                  })
                  .map((t) => ({ ...med, time: t }))
              );
              if (doses.length === 0) return null;

              return (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {/* Group header */}
                  <div className={`flex items-center gap-2 px-5 py-3 ${bg} border-b ${border}`}>
                    {icon}
                    <span className={`text-xs font-semibold uppercase tracking-wider ${text}`}>
                      {label}
                    </span>
                  </div>

                  {/* Doses */}
                  <div className="divide-y divide-gray-800">
                    {doses.map(({ name, dosage, frequency, time, id }) => {
                      const key = checkKey(name, time);
                      const done = isChecked(name, time);
                      return (
                        <div key={`${id}_${time}`}
                          className={`flex items-center gap-4 px-5 py-4 transition-all ${done ? "opacity-60" : ""}`}>
                          {/* Time badge */}
                          <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              {timeIcon(time)}
                              <span className="text-xs font-mono font-bold text-white">{time}</span>
                            </div>
                          </div>

                          {/* Medicine info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${done ? "line-through text-gray-500" : "text-white"}`}>
                              {name}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {dosage && <span className="text-xs text-gray-400">{dosage}</span>}
                              {frequency && <span className="text-xs text-gray-500">· {frequency}</span>}
                            </div>
                          </div>

                          {/* Check button */}
                          <button
                            onClick={() => toggleCheck(key)}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                              ${done
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-gray-600 text-transparent hover:border-indigo-400"}`}>
                            <Check size={16} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* All medicines summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
                <Pill size={14} className="text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  All Active Medicines
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {medicines.map((med) => (
                  <div key={med.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pill size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{med.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {med.dosage && (
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                        )}
                        {med.frequency && (
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                            {med.frequency}
                          </span>
                        )}
                        {med.duration && (
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
                            {med.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={11} className="text-gray-500" />
                        <span className="text-xs text-gray-500">
                          Scheduled: {med.times.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}