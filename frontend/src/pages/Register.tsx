import api from "@/lib/api";
import type { UserResponse } from "@/types/finance";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
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
    fraca: "bg-red-400",
    média: "bg-yellow-400",
    forte: "bg-emerald-400",
  };

  const strengthWidth = {
    fraca: "w-1/3",
    média: "w-2/3",
    forte: "w-full",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-white py-12"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, #064e3b22 0%, transparent 60%), linear-gradient(180deg, #020f08 0%, #030d09 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="text-emerald-300 font-semibold text-lg tracking-tight hover:text-emerald-200 transition-colors"
          >
            Valore
          </button>
          <p className="text-white/40 text-sm mt-1">
            Crie sua conta gratuitamente
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8"
        >
          <h1 className="text-xl font-bold mb-6">Criar conta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-white/8 border border-white/10
                  text-white placeholder:text-white/25
                  focus:outline-none focus:border-emerald-500/60 focus:bg-white/10
                  transition-all duration-200
                "
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-white/8 border border-white/10
                  text-white placeholder:text-white/25
                  focus:outline-none focus:border-emerald-500/60 focus:bg-white/10
                  transition-all duration-200
                "
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="
                    w-full px-4 py-2.5 pr-10 rounded-xl text-sm
                    bg-white/8 border border-white/10
                    text-white placeholder:text-white/25
                    focus:outline-none focus:border-emerald-500/60 focus:bg-white/10
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Força da senha */}
              {passwordStrength && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="h-1 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: undefined }}
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor[passwordStrength]} ${strengthWidth[passwordStrength]}`}
                    />
                  </div>
                  <p className="text-xs text-white/35 mt-1">
                    Força da senha:{" "}
                    <span
                      className={`font-medium ${
                        passwordStrength === "forte"
                          ? "text-emerald-400"
                          : passwordStrength === "média"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {passwordStrength}
                    </span>
                  </p>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2.5 rounded-xl text-sm font-semibold
                bg-emerald-500 hover:bg-emerald-400
                text-slate-950 transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                hover:shadow-[0_0_24px_rgba(52,211,153,0.2)]
              "
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </motion.div>

        {/* Link para login */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center text-sm text-white/40 mt-6"
        >
          Já tem conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            Entrar
          </button>
        </motion.p>
      </div>
    </div>
  );
}
