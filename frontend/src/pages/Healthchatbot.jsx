import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Send, Bot, User, Loader2, Pill, ClipboardList, Trash2, Sparkles } from "lucide-react";

// ── Call Claude API via Anthropic ─────────────────────────────────────────────
const callClaude = async (messages, systemPrompt) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API error");
  }
  const data = await response.json();
  return data.content[0].text;
};

// ── Build system prompt with patient context ──────────────────────────────────
const buildSystemPrompt = (user, consultations, prescriptions) => {
  const rxList = prescriptions
    .flatMap((p) => p.medicines || [])
    .map((m) => `- ${m.name} ${m.dosage || ""} | ${m.frequency || ""} | ${m.duration || ""}`)
    .join("\n");

  const consultList = consultations
    .slice(0, 5) // last 5
    .map((c) => `- Symptoms: ${c.symptoms} | Diagnosis: ${c.diagnosis || "N/A"} | Notes: ${c.notes || "none"}`)
    .join("\n");

  return `You are HealthBot, a compassionate and knowledgeable AI health assistant built into MediTrack — a digital medical records platform.

You are speaking with ${user?.name || "a patient"} (Patient ID: ${user?.patientId || "unknown"}).

## Their Current Prescriptions:
${rxList || "No active prescriptions on file."}

## Their Recent Consultation History (last 5):
${consultList || "No consultations on file."}

## Your Role:
- Answer general health and medicine questions clearly and helpfully
- Help the patient understand their own prescriptions (dosage, side effects, interactions, timing)
- Explain their diagnoses and consultation notes in simple language
- Give practical medication timing advice based on their frequency (e.g. "3 times daily" = 8am, 2pm, 8pm)
- Remind them to always follow their doctor's instructions

## Important Rules:
- NEVER diagnose new conditions or replace professional medical advice
- Always encourage consulting their doctor for new symptoms or concerns
- Be warm, clear, and use simple non-technical language
- Keep responses concise but complete — use bullet points for medicine lists
- If asked about a medicine they're taking, reference it by name from their prescription list
- Add a gentle disclaimer when giving medical info: "Always confirm with your doctor"`;
};

// ── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser ? "bg-indigo-600" : "bg-emerald-600/80"}`}>
        {isUser
          ? <User size={15} className="text-white" />
          : <Bot size={15} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700"}`}>
        {/* Render markdown-lite: bold, bullets */}
        {msg.content.split("\n").map((line, i) => {
          if (line.startsWith("- ") || line.startsWith("• ")) {
            return (
              <div key={i} className="flex items-start gap-2 mt-1">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                <span>{line.replace(/^[-•]\s/, "")}</span>
              </div>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
          }
          if (line === "") return <div key={i} className="h-2" />;
          return <p key={i}>{line}</p>;
        })}
        <p className={`text-xs mt-2 ${isUser ? "text-indigo-200" : "text-gray-500"}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-emerald-600/80 flex items-center justify-center flex-shrink-0">
      <Bot size={15} className="text-white" />
    </div>
    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1.5 items-center h-5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What medicines am I currently taking?",
  "When should I take my medications today?",
  "What was my last diagnosis?",
  "Are there any side effects I should know about?",
  "Can I take my medicines with food?",
  "What does my prescription mean?",
];

export default function HealthChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm HealthBot, your personal AI health assistant.\n\nI have access to your prescription history and consultations, so I can help you understand your medicines, remind you when to take them, and answer general health questions.\n\nHow can I help you today?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch patient context
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get("/patient/consultations"),
          api.get("/patient/prescriptions"),
        ]);
        setConsultations(cRes.data);
        setPrescriptions(pRes.data);
      } catch (e) {
        console.error("Failed to load patient context", e);
      } finally {
        setLoadingContext(false);
      }
    };
    fetchContext();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError("VITE_ANTHROPIC_API_KEY is not set. Add it to your frontend .env file.");
      return;
    }

    setInput("");
    setError("");

    const userMsg = { role: "user", content, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Build API messages (exclude timestamp, only role+content)
      const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }));
      const systemPrompt = buildSystemPrompt(user, consultations, prescriptions);
      const reply = await callClaude(apiMessages, systemPrompt);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      setError("Failed to get a response. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, user, consultations, prescriptions]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Chat cleared! Hi again ${user?.name?.split(" ")[0] || "there"} 👋 What can I help you with?`,
      timestamp: Date.now(),
    }]);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                HealthBot
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-normal flex items-center gap-1">
                  <Sparkles size={10} /> AI
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                {loadingContext
                  ? "Loading your health context..."
                  : `${prescriptions.length} prescription${prescriptions.length !== 1 ? "s" : ""} · ${consultations.length} consultation${consultations.length !== 1 ? "s" : ""} loaded`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Context pills */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-gray-700">
                <Pill size={11} /> {prescriptions.length} Rx
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full border border-gray-700">
                <ClipboardList size={11} /> {consultations.length} visits
              </span>
            </div>
            <button onClick={clearChat}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Clear chat">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-lg mb-3 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 min-h-0">

          {/* Suggestion chips — only show at start */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-indigo-500/50 px-3 py-1.5 rounded-full transition-all duration-200">
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 pt-3 border-t border-gray-800">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your medicines, symptoms, health questions..."
                rows={1}
                style={{ resize: "none", maxHeight: "120px" }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition pr-12"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition flex-shrink-0">
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <Send size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            HealthBot can make mistakes. Always confirm medical advice with your doctor.
          </p>
        </div>
      </div>
    </Layout>
  );
}