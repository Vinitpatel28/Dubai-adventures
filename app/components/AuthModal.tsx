"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { login: setGlobalUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setGlobalUser(data.user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl overflow-hidden glass-panel a-scale shadow-2xl"
        style={{ 
          background: "linear-gradient(145deg, var(--s2) 0%, var(--s1) 100%)",
          border: "1px solid var(--bw2)"
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--bw1)]">
          <h2 className="fd text-xl font-light tracking-wide text-[var(--t1)]">
            {mode === "login" ? "Welcome " : "Join "}
            <em className="gold-text not-italic font-medium">Back</em>
          </h2>
          <button 
            onClick={onClose}
            className="text-[var(--t3)] hover:text-[var(--t1)] transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-[var(--bw1)] rounded-lg p-1 mb-8">
            <button
              className={`flex-1 py-2 text-sm font-bold tracking-wide uppercase rounded-md transition-all ${
                mode === "login" 
                  ? "shadow-lg text-[#05030A]" 
                  : "text-[var(--t3)] hover:text-[var(--t2)]"
              }`}
              style={mode === "login" ? { background: "linear-gradient(90deg, var(--g400), var(--g300))" } : {}}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold tracking-wide uppercase rounded-md transition-all ${
                mode === "signup" 
                  ? "shadow-lg text-[#05030A]" 
                  : "text-[var(--t3)] hover:text-[var(--t2)]"
              }`}
              style={mode === "signup" ? { background: "linear-gradient(90deg, var(--g400), var(--g300))" } : {}}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--t2)] font-black mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={16} className="text-[var(--t3)]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-3 pl-11 pr-4 text-sm text-[var(--t1)] focus:outline-none focus:border-[var(--g300)] transition-colors placeholder:text-[var(--t3)]"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--t2)] font-black mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[var(--t3)]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-3 pl-11 pr-4 text-sm text-[var(--t1)] focus:outline-none focus:border-[var(--g300)] transition-colors placeholder:text-[var(--t3)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--t2)] font-black mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-[var(--t3)]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-3 pl-11 pr-12 text-sm text-[var(--t1)] focus:outline-none focus:border-[var(--g300)] transition-colors placeholder:text-[var(--t3)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--t3)] hover:text-[var(--t2)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] flex items-center justify-center cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ background: "linear-gradient(90deg, var(--g400), var(--g300))", color: "#06040A" }}
              >
                {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[0.75rem] text-[var(--t3)]">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                className="text-[var(--g300)] font-bold hover:underline inline-flex"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
