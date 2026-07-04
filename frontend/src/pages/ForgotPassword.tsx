import { ValoreLogo } from "@/components/brand/Logo";
import api from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch {
      setError("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

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
            Recuperação de senha
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
          {submitted ? (
            /* Estado de sucesso */
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
                  E-mail enviado
                </h1>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Se o e-mail estiver cadastrado, você receberá um link de
                  recuperação em breve. Verifique também a pasta de spam.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
                style={{ background: "#4C8A6A", color: "#090B0A" }}
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            /* Formulário */
            <>
              <h1
                className="font-display font-bold mb-2 text-lg"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Esqueceu sua senha?
              </h1>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Informe o e-mail cadastrado e enviaremos um link para redefinir
                sua senha.
              </p>

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
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white/85 placeholder:text-white/20 focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(76,138,106,0.5)";
                      e.currentTarget.style.background =
                        "rgba(76,138,106,0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(255,255,255,0.08)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                  />
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
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
            </>
          )}
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mt-5"
        >
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </button>
        </motion.div>
      </div>
    </div>
  );
}
