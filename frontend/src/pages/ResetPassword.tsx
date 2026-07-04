import { ValoreLogo } from "@/components/brand/Logo";
import api from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength =
    newPassword.length === 0
      ? null
      : newPassword.length < 8
        ? "fraca"
        : newPassword.length < 12
          ? "média"
          : "forte";

  const strengthColor = {
    fraca: "#D98B7E",
    média: "#D9B36A",
    forte: "#8FC4A6",
  };
  const strengthWidth = { fraca: "33%", média: "66%", forte: "100%" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Link inválido. Solicite um novo link de recuperação.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail ?? "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

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
            Redefinir senha
          </p>
        </motion.div>

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
          {!token ? (
            /* Token ausente */
            <div className="text-center space-y-4 py-4">
              <p className="text-sm" style={{ color: "#D98B7E" }}>
                Link inválido ou expirado. Solicite um novo link de recuperação.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#4C8A6A", color: "#090B0A" }}
              >
                Solicitar novo link
              </button>
            </div>
          ) : success ? (
            /* Sucesso */
            <div className="text-center space-y-4 py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(76,138,106,0.15)" }}
              >
                <CheckCircle size={28} style={{ color: "#7DB99A" }} />
              </div>
              <div>
                <h1
                  className="font-display font-bold text-lg mb-2"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Senha redefinida
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Sua senha foi alterada com sucesso. Faça login com a nova
                  senha.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "#4C8A6A", color: "#090B0A" }}
              >
                Ir para o login
              </button>
            </div>
          ) : (
            /* Formulário */
            <>
              <h1
                className="font-display font-bold mb-2 text-lg"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Criar nova senha
              </h1>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Escolha uma senha forte para proteger sua conta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nova senha */}
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm text-white/85 placeholder:text-white/20 focus:outline-none transition-all duration-200"
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
                  {passwordStrength && (
                    <div className="mt-2">
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
                    </div>
                  )}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white/85 placeholder:text-white/20 focus:outline-none transition-all duration-200"
                    style={
                      confirmPassword && confirmPassword !== newPassword
                        ? {
                            ...inputStyle,
                            border: "1px solid rgba(201,74,63,0.5)",
                          }
                        : inputStyle
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs mt-1" style={{ color: "#D98B7E" }}>
                      As senhas não coincidem
                    </p>
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
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
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
                  {isLoading ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
