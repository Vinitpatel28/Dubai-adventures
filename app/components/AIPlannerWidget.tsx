"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Star, Clock, Loader2, ChevronRight, X, User, Bot, Trash2, Compass, BrainCircuit } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import clsx from "clsx";

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  recommendations?: Recommendation[];
}

const SUGGESTIONS = [
  "Best adventure for families with kids",
  "Luxury evening experience with dinner",
  "Thrilling ATV and dune bashing",
  "Romantic night under the stars",
];

interface Props {
  onSelectActivity?: (id: string) => void;
}

export default function AIPlannerWidget({ onSelectActivity }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const { convert } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [interest, setInterest] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setInterest(localStorage.getItem("preferred_category"));
    }
  }, [open]);

  useEffect(() => {
    // Fetch AI config for greeting
    fetch("/api/settings/ai")
      .then(res => res.json())
      .then(data => setAiConfig(data))
      .catch(err => console.error("Error loading AI config", err));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || query;
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const currentInterest = localStorage.getItem("preferred_category");
      const res = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          interest: currentInterest
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: data.message,
          isTyping: true,
          recommendations: data.recommendations 
        };
        setMessages(prev => [...prev, assistantMsg]);
        
        // Disable typing after a delay
        setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, isTyping: false } : m));
        }, 1500);
      } else {
        const errorData = await res.json();
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorData.message || "I'm having trouble connecting to my neural core right now. Please try again.",
          isTyping: false
        }]);
      }
    } catch (e: any) {
      console.error("AI planner error", e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Connection error: ${e.message}`,
        isTyping: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const categoriesMap: Record<string, string> = {
    desert: "🏜",
    atv: "🏍",
    luxury: "✨",
    sky: "🎈",
    water: "⚓",
  };

  return (
    <>
      {/* Ambient glowing aura behind the button */}
      <div className="fixed bottom-6 right-6 z-30 w-48 h-14 bg-[#D4962A]/30 blur-2xl rounded-full animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />
      
      <button
        id="ai-planner-btn"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(212,150,42,0.4)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,150,42,0.6)] group overflow-hidden border border-[#ECC86A]/50"
        style={{ background: "linear-gradient(135deg, #D4962A, #ECC86A)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        
        <Bot size={20} className="text-[#06040A] group-hover:rotate-6 transition-all duration-500 ease-out" />
        <span className="text-[0.7rem] font-black tracking-[0.25em] uppercase text-[#06040A] hidden sm:block mt-0.5">AI Smart Guide</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-6" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          <div 
            className="w-full sm:w-[500px] h-full sm:h-[90vh] bg-[var(--s0)] sm:rounded-[3rem] border-l sm:border border-[var(--bw2)] shadow-2xl flex flex-col overflow-hidden relative animate-slide-in-right"
            style={{ boxShadow: "var(--shh)" }}
          >
            {/* 2026 Intelligence Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 opacity-30 select-none pointer-events-none">
               <span className="text-[0.5rem] font-black uppercase tracking-[0.5em] text-[#D4962A]">Neural Logic Core v4.2</span>
            </div>

            {/* Header */}
            <div className="p-8 border-b border-[var(--bw1)] bg-[var(--s1)]/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4962A] to-[#ECC86A] flex items-center justify-center shadow-[0_0_20px_rgba(212,150,42,0.3)] transform -rotate-3">
                  <Bot size={26} color="#000" />
                </div>
                <div>
                  <h3 className="fd text-xl text-[var(--t1)] font-medium">Adventure Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[0.65rem] text-[var(--t3)] uppercase tracking-widest font-bold">Online • Powered by Gemini</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                   onClick={() => setMessages([])}
                   className="p-2.5 rounded-full hover:bg-red-500/10 text-[var(--t3)] hover:text-red-500 transition-all"
                   title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                   onClick={() => setOpen(false)}
                   className="p-2.5 rounded-full hover:bg-[var(--bw1)] text-[var(--t2)] hover:text-[var(--t1)] transition-all"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,var(--bw4),transparent)]"
            >
              {messages.length === 0 && (
                <div className="space-y-10 py-4">
                  <div className="space-y-4">
                    <h4 className="fd text-3xl text-[var(--t1)] leading-tight">Salaam! I&apos;m your <br/><span className="gold-text italic">Dubai Expert.</span></h4>
                    
                    {interest ? (
                      <div className="p-5 rounded-2xl bg-[#D4962A]/5 border border-[#D4962A]/20 animate-in fade-in slide-in-from-left-4 duration-1000">
                        <p className="text-[var(--t2)] text-[0.88rem] leading-relaxed font-light">
                          I noticed your interest in <span className="text-[#ECC86A] font-bold uppercase tracking-widest">{interest}</span>. Would you like to explore our most exclusive {interest} safaris?
                        </p>
                      </div>
                    ) : (
                      <p className="text-[var(--t2)] text-[0.95rem] leading-relaxed font-light">
                        {aiConfig?.greetingMessage || "I can help you find the best desert safaris, luxury yachts, or thrills across the Emirates. What are you looking for today?"}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#D4962A] font-black opacity-80">Explore Possibilities:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {(interest ? [`Best ${interest} adventure`, "Surprise me with something new"] : SUGGESTIONS).map(s => (
                        <button 
                          key={s} 
                          onClick={() => handleSend(s)}
                          className="text-left p-5 rounded-2xl bg-[var(--s1)] border border-[var(--bw2)] hover:border-[#D4962A]/40 hover:bg-[#D4962A]/5 text-[0.9rem] text-[var(--t2)] hover:text-[var(--t1)] transition-all duration-300 hover:shadow-lg flex items-center justify-between group/btn"
                        >
                          <span>{s}</span>
                          <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={clsx("flex flex-col", m.role === 'user' ? "items-end" : "items-start animate-fade-in")}>
                  <div className={clsx(
                    "max-w-[90%] p-5 rounded-[1.8rem] text-[0.95rem] leading-relaxed",
                    m.role === 'user' 
                      ? "bg-[#D4962A] text-black font-semibold rounded-br-none shadow-lg shadow-[#D4962A]/20" 
                      : "bg-[var(--s1)] text-[var(--t2)] border border-[var(--bw2)] rounded-bl-none shadow-sm whitespace-pre-line"
                  )}>
                    {m.isTyping ? <Typewriter text={m.content} /> : m.content}
                  </div>
                  
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-6 w-full space-y-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#D4962A] font-black">Top Curated Matches:</p>
                      {m.recommendations.map(rec => (
                        <div key={rec.id} className="group p-5 rounded-[2.2rem] bg-gradient-to-br from-[var(--s2)] to-[var(--s1)] border border-[var(--bw2)] hover:border-[#D4962A]/40 transition-all duration-500 shadow-xl overflow-hidden relative">
                          
                          {/* 2026 Smart Badge */}
                          {rec.category === interest && (
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#D4962A] text-black text-[0.55rem] font-black uppercase tracking-[0.2em] rounded-bl-2xl z-20 shadow-lg">
                              Match for You
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <div>
                               <div className="flex items-center gap-2 mb-1.5">
                                 <span className="text-sm">{categoriesMap[rec.category] || "✴️"}</span>
                                 <span className="text-[0.6rem] uppercase font-bold tracking-widest text-[var(--t3)]">{rec.category}</span>
                               </div>
                               <h5 className="font-bold text-[var(--t1)] text-lg group-hover:text-[#D4962A] transition-colors">{rec.title}</h5>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black gold-text">{convert(rec.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-[0.7rem] text-[var(--t3)] mb-4 relative z-10">
                             <span className="flex items-center gap-1.5"><Clock size={12}/> {rec.duration}</span>
                             <span className="flex items-center gap-1.5"><Star size={12} fill="#D4962A" className="text-[#D4962A]"/> {rec.rating} • {rec.reviewCount} reviews</span>
                          </div>
                          <button 
                            onClick={() => { onSelectActivity?.(rec.id); setOpen(false); }}
                            className="w-full py-3.5 rounded-2xl bg-[var(--bw1)] hover:bg-[#D4962A] hover:text-black text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 border border-[var(--bw2)] relative z-10 group/explore"
                          >
                            Explore This Activity <ChevronRight size={14} className="group-hover/explore:translate-x-1 transition-transform"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bw1)] flex items-center justify-center">
                    <Loader2 size={18} className="text-[#D4962A] animate-spin" />
                  </div>
                  <div className="space-y-2">
                     <div className="h-2 w-20 bg-[var(--bw1)] rounded-full"/>
                     <div className="h-2 w-32 bg-[var(--bw1)] rounded-full opacity-50"/>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-8 bg-[var(--s1)]/80 backdrop-blur-xl border-t border-[var(--bw1)]">
              <div className="relative group/input">
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about Dubai..."
                  className="w-full bg-[var(--s2)] border border-[var(--bw2)] group-hover/input:border-[var(--bw3)] rounded-2xl py-5 pl-6 pr-16 text-sm text-[var(--t1)] focus:border-[#D4962A] focus:outline-none transition-all shadow-inner placeholder:text-[var(--t4)]"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!query.trim() || loading}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#D4962A] text-black hover:bg-[#ECC86A] disabled:opacity-20 transition-all shadow-lg flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-center text-[0.63rem] text-[var(--t4)] mt-5 uppercase tracking-[0.3em] font-medium">Concierge AI • Verified Excellence</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i+=2; // speed up typing
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}
