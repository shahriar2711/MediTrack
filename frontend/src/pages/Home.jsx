import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── Floating particle canvas ─────────────────────────────────────────────── */
const Particles = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.4 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > W) d.dx *= -1;
        if (d.y < 0 || d.y > H) d.dy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${d.o})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 130) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${0.1 * (1 - dist / 130)})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

/* ── Animated number counter ──────────────────────────────────────────────── */
const Counter = ({ target, suffix = "", duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(tick); else setVal(target);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Scroll-reveal hook ────────────────────────────────────────────────────── */
const useReveal = (delay = 0) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ── Feature card ──────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, delay, accent }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group relative bg-white rounded-3xl p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-slate-100
        hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${accent}18, transparent 60%)` }} />
      <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
        style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}40)` }}>
        {icon}
      </div>
      <h3 className="text-slate-800 font-semibold text-[1.05rem] mb-2.5 leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

/* ── Testimonial card ──────────────────────────────────────────────────────── */
const TestimonialCard = ({ quote, name, role, avatar, avatarColor, delay }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white rounded-3xl p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-slate-100
        hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-base">★</span>)}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: avatarColor }}>
          {avatar}
        </div>
        <div>
          <p className="text-slate-800 font-semibold text-sm">{name}</p>
          <p className="text-slate-400 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN ──────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: "🩺", title: "Smart Consultations", desc: "Digitally record symptoms, diagnoses and clinical notes for every visit. Fully searchable, forever organized.", accent: "#0ea5e9", delay: 0 },
    { icon: "💊", title: "E-Prescriptions", desc: "Generate professional PDF prescriptions with a medicine table, doctor signature and MediTrack verification stamp.", accent: "#6366f1", delay: 100 },
    { icon: "🔍", title: "Instant Patient Lookup", desc: "Search any patient by their unique ID and access their complete consultation and prescription history instantly.", accent: "#10b981", delay: 200 },
    { icon: "🔐", title: "Role-Based Security", desc: "Military-grade access control. Patients see only their records. Doctors manage only their own practice data.", accent: "#f59e0b", delay: 300 },
    { icon: "📋", title: "Full Medical History", desc: "Longitudinal health records linking every consultation and prescription into a clean, readable timeline.", accent: "#ef4444", delay: 400 },
    { icon: "⚡", title: "Real-Time Sync", desc: "Records reflect instantly across all devices. No page refresh, no lag — live data, everywhere you are.", accent: "#8b5cf6", delay: 500 },
  ];

  const stats = [
    { value: 4200, suffix: "+", label: "Users Onboarded" },
    { value: 99, suffix: "%", label: "Uptime" },
    { value: 12000, suffix: "+", label: "Prescriptions Issued" },
    { value: 0, suffix: " papers", label: "Go Fully Digital" },
  ];

  const steps = [
    { num: "01", title: "Register & Get Your ID", desc: "Sign up as a patient in under a minute. You'll receive a unique Patient ID instantly.", color: "#0ea5e9" },
    { num: "02", title: "Visit Your Doctor", desc: "Your doctor logs symptoms and diagnosis directly into MediTrack during the consultation.", color: "#6366f1" },
    { num: "03", title: "Receive E-Prescription", desc: "Prescription issued digitally with full medicine details and a verified doctor signature.", color: "#10b981" },
    { num: "04", title: "Access Records Anytime", desc: "Log in from any device to view your full health history, consultations, and prescriptions.", color: "#f59e0b" },
  ];

  const testimonials = [
    { quote: "MediTrack completely transformed how I manage my patients. No more paper chaos — everything is instant and perfectly organized.", name: "Dr. Priya Sharma", role: "General Physician", avatar: "P", avatarColor: "linear-gradient(135deg,#0ea5e9,#6366f1)", delay: 0 },
    { quote: "I love having all my prescriptions in one place. My doctor sends them digitally and I can download a proper PDF anytime I want.", name: "Rafiq Ahmed", role: "Patient since 2024", avatar: "R", avatarColor: "linear-gradient(135deg,#10b981,#0ea5e9)", delay: 150 },
    { quote: "The patient search is incredible. Full consultation history in seconds. It's like a super-powered, always-organized filing cabinet.", name: "Dr. James Osei", role: "Cardiologist", avatar: "J", avatarColor: "linear-gradient(135deg,#f59e0b,#ef4444)", delay: 300 },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-1deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes badgePop { from{opacity:0;transform:scale(0.8) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .float-a { animation: floatA 5s ease-in-out infinite; }
        .float-b { animation: floatB 4.5s ease-in-out infinite; animation-delay: 1s; }
        .float-c { animation: floatC 3.8s ease-in-out infinite; animation-delay: 2s; }
        .grad-text {
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 45%, #10b981 100%);
          background-size: 200% 200%;
          animation: gradShift 4s ease infinite;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-bg {
          background:
            radial-gradient(ellipse 90% 70% at 50% -5%, rgba(14,165,233,0.12), transparent),
            radial-gradient(ellipse 60% 50% at 85% 75%, rgba(99,102,241,0.1), transparent),
            radial-gradient(ellipse 50% 60% at 5% 60%, rgba(16,185,129,0.08), transparent),
            #f8fafc;
        }
        .glass { background: rgba(255,255,255,0.82); backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.95); }
        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          background-size: 200% 200%;
          animation: gradShift 3.5s ease infinite;
          position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content:''; position:absolute; top:0; left:0; width:60%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: shimmer 2.5s infinite; transform: translateX(-100%);
        }
        .nav-glass { backdrop-filter: blur(22px); background: rgba(248,250,252,0.88); }
        .step-connector { background: linear-gradient(90deg, #0ea5e9, #6366f1, #10b981, #f59e0b); }
        .badge-anim { animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .sora { font-family: 'Sora', sans-serif; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${scrolled ? "nav-glass shadow-sm border-b border-slate-200/50" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shadow-sky-200"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
              ✚
            </div>
            <span className="sora font-bold text-slate-800 text-lg">MediTrack</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[["Features","#features"],["How It Works","#how-it-works"],["Testimonials","#testimonials"]].map(([label,href]) => (
              <a key={label} href={href}
                className="text-sm text-slate-500 hover:text-sky-600 transition-colors font-medium tracking-wide">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-white/80 transition-all">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-200/60 hover:shadow-sky-300/60 hover:scale-105 transition-all duration-300">
              Get Started Free
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-600">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                : <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden nav-glass border-t border-slate-200/50 px-6 py-5 space-y-3">
            {[["Features","#features"],["How It Works","#how-it-works"],["Testimonials","#testimonials"]].map(([label,href]) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-slate-600 py-1.5">{label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm border border-slate-200 py-2.5 rounded-xl font-medium text-slate-600 bg-white">Sign in</Link>
              <Link to="/register" className="flex-1 text-center btn-primary text-white text-sm font-semibold py-2.5 rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen hero-bg flex items-center pt-16 overflow-hidden">
        <Particles />

        {/* Background orbs */}
        <div className="absolute top-24 right-0 w-96 h-96 rounded-full opacity-30 blur-[80px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #0ea5e9, #6366f1)" }} />
        <div className="absolute bottom-16 -left-16 w-72 h-72 rounded-full opacity-20 blur-[70px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #10b981, #0ea5e9)" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10 blur-[60px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b, #ef4444)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* TEXT side */}
          <div>
            <div className={`transition-all duration-600 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className="badge-anim inline-flex items-center gap-2 bg-white text-sky-600 text-xs font-semibold px-4 py-2 rounded-full shadow-sm border border-sky-100/80 mb-7">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Trusted by 500+ healthcare providers
              </span>
            </div>

            <h1 className={`sora text-5xl xl:text-[3.6rem] font-bold leading-[1.1] mb-6 text-slate-800 transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Healthcare records,{" "}
              <span className="grad-text">reimagined</span>
              {" "}for the digital age
            </h1>

            <p className={`text-slate-500 text-lg leading-relaxed mb-8 max-w-md transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              MediTrack connects doctors and patients through a secure, role-based platform.
              Consultations, e-prescriptions and health records — beautifully organized.
            </p>

            <div className={`flex flex-col sm:flex-row gap-3.5 mb-10 transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Link to="/register"
                className="btn-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-sky-200/70 hover:shadow-sky-300/70 hover:scale-105 transition-all duration-300 text-center flex items-center justify-center gap-2">
                Start for Free →
              </Link>
              <Link to="/login"
                className="bg-white text-slate-700 font-semibold px-8 py-4 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:scale-105 transition-all duration-300 text-center">
                Sign in to account
              </Link>
            </div>

            <div className={`flex items-center gap-4 transition-all duration-700 delay-500 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex -space-x-2.5">
                {[["D","#0ea5e9","#6366f1"],["A","#6366f1","#8b5cf6"],["R","#10b981","#0ea5e9"],["S","#f59e0b","#ef4444"]].map(([l,c1,c2], i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 leading-tight">
                <span className="font-semibold text-slate-700">4,200+</span> patients & doctors<br />already using MediTrack
              </p>
            </div>
          </div>

          {/* MOCKUP side */}
          <div className={`relative hidden lg:flex items-center justify-center transition-all duration-900 delay-400 ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>

            {/* Main dashboard card */}
            <div className="glass rounded-3xl p-6 shadow-2xl shadow-slate-200/80 w-[320px] float-a">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>✚</div>
                <div>
                  <p className="sora font-semibold text-slate-800 text-sm">Doctor Dashboard</p>
                  <p className="text-xs text-slate-400">Dr. Priya Sharma</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[["12","Consultations","#eff6ff","#0ea5e9"],["8","Prescriptions","#f0fdf4","#10b981"]].map(([v,l,bg,cl]) => (
                  <div key={l} className="rounded-2xl p-4" style={{ background: bg }}>
                    <p className="sora font-bold text-slate-800 text-2xl">{v}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: cl }}>{l}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-3 font-medium">Recent Consultation</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>A</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Anika Rahman</p>
                    <p className="text-xs text-slate-400">Fever, headache · 10:20 AM</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-xs bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full font-medium">Fever</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Diagnosed</span>
                </div>
              </div>
            </div>

            {/* Floating Rx card */}
            <div className="glass rounded-2xl p-4 shadow-xl shadow-slate-200/60 absolute -bottom-5 -left-12 w-52 float-b">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💊</span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">E-Prescription</p>
                  <p className="text-xs text-emerald-600 font-medium">Verified ✓</p>
                </div>
              </div>
              {["Amoxicillin 500mg", "Paracetamol 1g", "Cetirizine 10mg"].map((m, i) => (
                <div key={m} className="flex items-center gap-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: ["#0ea5e9","#6366f1","#10b981"][i] }} />
                  <p className="text-xs text-slate-500">{m}</p>
                </div>
              ))}
            </div>

            {/* Floating notification */}
            <div className="glass rounded-2xl px-4 py-3 shadow-xl shadow-slate-200/60 absolute -top-5 -right-8 w-52 float-c">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">✓</div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">PDF Ready</p>
                  <p className="text-xs text-slate-400">Prescription generated</p>
                </div>
              </div>
            </div>

            {/* Floating patient ID chip */}
            <div className="glass rounded-xl px-3 py-2.5 shadow-md absolute top-1/2 -left-14 flex items-center gap-2 float-c" style={{ animationDelay: "1.5s" }}>
              <span className="text-xs text-slate-400">Patient ID</span>
              <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">P1718200001</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce opacity-60">
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Scroll</p>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, suffix, label }, i) => {
            const [ref, visible] = useReveal();
            return (
              <div key={label} ref={ref}
                className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="sora text-4xl font-bold text-slate-800 mb-1">
                  {visible ? <Counter target={value} suffix={suffix} /> : `0${suffix}`}
                </p>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {(() => {
            const [ref, visible] = useReveal();
            return (
              <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <span className="inline-block bg-sky-50 text-sky-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-sky-100">
                  ✦ Platform Features
                </span>
                <h2 className="sora text-4xl font-bold text-slate-800 mb-4">Everything your practice needs</h2>
                <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                  Built for real-world medical workflows — from first registration to ongoing prescription management.
                </p>
              </div>
            );
          })()}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f0f9ff, #f5f3ff 40%, #f0fdf4 80%, #fffbeb)" }}>
        <div className="max-w-5xl mx-auto px-6">
          {(() => {
            const [ref, visible] = useReveal();
            return (
              <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <span className="inline-block bg-white text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-indigo-100 shadow-sm">
                  ✦ Simple 4-Step Process
                </span>
                <h2 className="sora text-4xl font-bold text-slate-800 mb-4">How MediTrack works</h2>
                <p className="text-slate-500 max-w-md mx-auto">From signup to digital prescription in four seamless steps.</p>
              </div>
            );
          })()}

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-[2.6rem] left-[14%] right-[14%] h-0.5 step-connector rounded-full opacity-30" />

            {steps.map(({ num, title, desc, color }, i) => {
              const [ref, visible] = useReveal();
              return (
                <div key={num} ref={ref}
                  style={{ transitionDelay: `${i * 120}ms` }}
                  className={`text-center relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                  <div className="relative inline-flex mb-6">
                    <div className="w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center sora font-bold text-xl text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 8px 24px ${color}40` }}>
                      {num}
                    </div>
                    <span className="absolute inset-0 rounded-2xl animate-ping"
                      style={{ background: color, opacity: 0.15, animationDuration: "2.5s", animationDelay: `${i * 0.5}s` }} />
                  </div>
                  <h3 className="sora font-semibold text-slate-800 mb-2 text-[0.95rem]">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {(() => {
            const [ref, visible] = useReveal();
            return (
              <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <span className="inline-block bg-amber-50 text-amber-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-amber-100">
                  ✦ Real Stories
                </span>
                <h2 className="sora text-4xl font-bold text-slate-800 mb-4">Loved by healthcare professionals</h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  Hear from the doctors and patients using MediTrack every day.
                </p>
              </div>
            );
          })()}
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      {(() => {
        const [ref, visible] = useReveal();
        return (
          <section ref={ref} className="py-20 px-6">
            <div className={`max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] p-12 text-center transition-all duration-800 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)",
                boxShadow: "0 32px 80px rgba(14,165,233,0.3), 0 8px 32px rgba(99,102,241,0.2)"
              }}>
              {/* Inner glow blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

              <div className="relative">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/30">
                  ✦ Get Started Today — It's Free
                </span>
                <h2 className="sora text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
                  Your health records<br />deserve better
                </h2>
                <p className="text-white/75 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                  Join thousands of patients and doctors who've gone fully digital with MediTrack.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register"
                    className="bg-white text-indigo-600 font-bold px-9 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                    Create Patient Account
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link to="/login"
                    className="border-2 border-white/40 text-white font-semibold px-9 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
                    Already have an account
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  {["Free to register","No credit card","Instant access","Fully secure"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-white/70 text-sm">
                      <span className="text-emerald-300 font-bold">✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm shadow-sm"
              style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>✚</div>
            <span className="sora font-bold text-slate-700">MediTrack</span>
          </div>
          <p className="text-sm text-slate-400 text-center">
            © 2025 MediTrack. Secure digital health records platform.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-slate-400 hover:text-sky-600 transition">Sign in</Link>
            <Link to="/register" className="text-sm text-slate-400 hover:text-sky-600 transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}