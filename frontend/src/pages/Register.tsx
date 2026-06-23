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
  onRegister: (user: UserResponse) => void;
}

export default function Register({ onRegister }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post<UserResponse>("/auth/register", {
        name,
        email,
        password,
      });
      onRegister(data);
      navigate("/");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        setError("Este e-mail já está cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const passwordStrength =
    password.length === 0
      ? null
      : password.length < 8
        ? "fraca"
        : password.length < 12
          ? "média"
          : "forte";

  const strengthColor = {
    fraca: "#D98B7E",
    média: "#D9B36A",
    forte: "#8FC4A6",
  };

  const strengthWidth = {
    fraca: "33%",
    média: "66%",
    forte: "100%",
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl text-sm
    text-white/85 placeholder:text-white/20
    focus:outline-none transition-all duration-200
  `;

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(76,138,106,0.5)";
    e.currentTarget.style.background = "rgba(76,138,106,0.05)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-white py-12"
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
            Crie sua conta gratuitamente
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
            Criar conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className={inputClass}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* E-mail */}
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
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Senha */}
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
                  placeholder="Mínimo 8 caracteres"
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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

              {/* Força da senha */}
              {passwordStrength && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: strengthWidth[passwordStrength],
                        background: strengthColor[passwordStrength],
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Senha{" "}
                    <span
                      className="font-medium"
                      style={{ color: strengthColor[passwordStrength] }}
                    >
                      {passwordStrength}
                    </span>
                  </p>
                </motion.div>
              )}
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
              {isLoading ? "Criando conta..." : "Criar conta"}
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
          Já tem conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium transition-colors"
            style={{ color: "#7DB99A" }}
          >
            Entrar
          </button>
        </motion.p>
      </div>
    </div>
  );
}
