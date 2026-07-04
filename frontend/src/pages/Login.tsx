import { ValoreLogo } from "@/components/brand/Logo";
import api from "@/lib/api";
import type { UserResponse } from "@/types/finance";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface Props {
  onLogin: (user: UserResponse) => void;
}

export default function Login({ onLogin }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post<UserResponse>("/auth/login", {
        email,
        password,
      });
      onLogin(data);
      navigate("/");
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl text-sm
    text-white/85 placeholder:text-white/20
    focus:outline-none transition-all duration-200
  `;

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-white"
      style={{
        background:
          "radial-gradient(60% 50% at 18% 0%, rgba(76,138,106,0.10) 0%, transparent 70%), radial-gradient(50% 40% at 88% 12%, rgba(199,163,90,0.06) 0%, transparent 70%), #090B0A",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center mb-8 gap-3"
        >
          <button onClick={() => navigate("/landing")}>
            <ValoreLogo size={36} className="text-[#7DB99A]" />
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Bem-vindo de volta
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl p-7"
          style={{
            background: "#0F1612",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
          }}
        >
          <h1
            className="font-display font-bold mb-6 text-lg"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Entrar na conta
          </h1>

          <div className="text-right mt-1">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Esqueci minha senha
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(76,138,106,0.5)";
                  e.currentTarget.style.background = "rgba(76,138,106,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(76,138,106,0.5)";
                    e.currentTarget.style.background = "rgba(76,138,106,0.05)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm rounded-xl px-3 py-2"
                style={{
                  color: "#D98B7E",
                  background: "rgba(201,74,63,0.08)",
                  border: "1px solid rgba(201,74,63,0.2)",
                }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: "#4C8A6A",
                color: "#090B0A",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#5A9C78";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#4C8A6A";
              }}
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </motion.div>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center text-sm mt-5"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Não tem conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium transition-colors"
            style={{ color: "#7DB99A" }}
          >
            Criar conta
          </button>
        </motion.p>
      </div>
    </div>
  );
}
