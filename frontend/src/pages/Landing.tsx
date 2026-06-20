import { ValoreLogo, ValoreMark } from "@/components/brand/Logo";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CreditCard,
  EyeOff,
  Lock,
  Shield,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const steps = [
  {
    number: "01",
    title: "Registre",
    desc: "Receitas, despesas e transferências em segundos. Categorias se sugerem sozinhas com o tempo.",
  },
  {
    number: "02",
    title: "Entenda",
    desc: "Veja para onde seu dinheiro vai mês a mês, por categoria, por conta — sem somar nada na mão.",
  },
  {
    number: "03",
    title: "Planeje",
    desc: "Compromissos futuros e parcelas já calculados, para decidir com o que está por vir.",
  },
];

const allInstallments = Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  paid: i < 3,
}));

const honestPoints = [
  "Sem anúncios.",
  "Sem venda de dados.",
  "Sem sincronização bancária obrigatória.",
  "100% gratuito. Sem cartão de crédito.",
];

export default function Landing() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen text-[#F2F4F0] overflow-x-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ─── NAVBAR — bg: #090B0A ──────────────────────────── */}
      <div
        style={{
          background: scrolled ? "rgba(9,11,10,0.82)" : "rgba(9,11,10,0.25)",
          backdropFilter: scrolled ? "blur(16px)" : "blur(4px)",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(4px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid transparent",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "all 250ms ease",
          boxShadow: scrolled ? "0 12px 40px rgba(0,0,0,0.28)" : "none",
        }}
      >
        <motion.nav
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-6 md:px-10 py-5 max-w-6xl mx-auto"
        >
          <ValoreLogo size={30} className="text-[#7DB99A]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm text-white/55 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#4C8A6A] hover:bg-[#5A9C78] text-[#090B0A] transition-colors duration-200"
            >
              Criar conta
            </button>
          </div>
        </motion.nav>
      </div>

      {/* ─── HERO — bg: #090B0A ────────────────────────────── */}
      <section
        style={{
          background:
            "radial-gradient(70% 50% at 10% 0%, rgba(76,138,106,0.14) 0%, transparent 65%), radial-gradient(50% 40% at 90% 10%, rgba(199,163,90,0.09) 0%, transparent 65%), #090B0A",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 pt-28 md:pt-36 pb-20 md:pb-28">
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display font-bold tracking-tight leading-[1.08] text-4xl md:text-[64px] mb-7 max-w-3xl"
          >
            <span className="text-white">Organize suas finanças.</span>
            <br />
            <span className="text-white/40">Sem transformar sua vida</span>
            <br />
            <span className="text-white/40">em uma planilha.</span>
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-base md:text-lg text-white/50 max-w-xl mb-9 leading-relaxed"
          >
            Contas, cartão, patrimônio e parcelas em um só lugar. Descubra para
            onde seu dinheiro está indo sem depender de planilhas ou integrações
            bancárias invasivas.
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#4C8A6A] hover:bg-[#5A9C78] text-[#090B0A] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar gratuitamente
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4"
              >
                Já tenho conta
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {["Sem anúncios", "Sem venda de dados", "Sem sync bancário"].map(
                (item) => (
                  <div
                    key={item}
                    className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-xs text-white/45"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-16 flex items-center gap-3 text-white/20"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowDown size={14} />
            </motion.div>
            <span className="text-xs tracking-widest uppercase font-mono">
              Role para explorar
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── CARDS FLUTUANTES — bg: #0B1512 ───────────────── */}
      <section style={{ background: "#0B1512" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28"
        >
          {/* Label de seção */}
          <div className="flex items-center gap-3 mb-10">
            <span className="w-5 h-px bg-[#4C8A6A]/50" />
            <span className="text-xs text-[#8FC4A6]/60 tracking-widest uppercase font-mono">
              Produto
            </span>
          </div>

          {/* Grid assimétrico */}
          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* Card grande — Patrimônio */}
            <div className="col-span-2 md:col-span-1 md:row-span-2 rounded-2xl border border-white/[0.08] bg-[#0F1E18] p-6 flex flex-col justify-between min-h-[160px] md:min-h-[300px] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
              <div>
                <div className="flex items-center gap-2 mb-4 text-white/35">
                  <Wallet size={14} strokeWidth={1.5} />
                  <span className="text-xs">Patrimônio líquido</span>
                </div>
                <p className="font-display text-3xl md:text-4xl font-bold text-[#8FC4A6]">
                  R$ 24.830
                </p>
                <p className="text-xs text-[#D9B36A] mt-2">
                  ↑ 8,3% vs mês anterior
                </p>
              </div>
              <div className="mt-4 h-14 flex items-end gap-1">
                {[28, 42, 35, 54, 46, 60, 72].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    style={{ height: `${h}%`, originY: 1 }}
                    className="flex-1 rounded-t-sm bg-[#4C8A6A]/40"
                  />
                ))}
              </div>
            </div>

            {/* Card — Compra parcelada */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0F1E18] p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 mb-3 text-white/35">
                <CreditCard size={13} strokeWidth={1.5} />
                <span className="text-xs">Compra parcelada</span>
              </div>
              <p className="text-sm font-medium text-white/80 mb-1">Notebook</p>
              <p className="font-display text-xl font-bold text-[#D9B36A]">
                6x R$ 500
              </p>
              <div className="flex gap-1 mt-3">
                {[true, true, false, false, false, false].map((p, i) => (
                  <span
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${p ? "bg-[#4C8A6A]" : "bg-white/10"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-1.5">2 de 6 pagas</p>
            </div>

            {/* Card — Compromissos futuros */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0F1E18] p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 mb-3 text-white/35">
                <CalendarClock size={13} strokeWidth={1.5} />
                <span className="text-xs">Compromissos futuros</span>
              </div>
              <p className="font-display text-xl font-bold text-[#D9B36A]">
                R$ 2.000
              </p>
              <p className="text-xs text-white/35 mt-1.5">
                4 parcelas pendentes
              </p>
            </div>

            {/* Card — Análise mensal */}
            <div className="col-span-2 rounded-2xl border border-[#C7A35A]/12 bg-[#0F1E18] p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 mb-3 text-white/35">
                <BarChart3 size={13} strokeWidth={1.5} />
                <span className="text-xs">Evolução mensal</span>
              </div>
              <div className="flex items-end gap-1.5 h-12">
                {[40, 62, 48, 75, 52, 88, 68, 44, 80, 58, 72, 92].map(
                  (h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      style={{ height: `${h}%`, originY: 1 }}
                      className={`flex-1 rounded-t-sm ${i % 2 === 0 ? "bg-[#4C8A6A]/45" : "bg-[#C7A35A]/35"}`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── COMO FUNCIONA — bg: #0B1512 ──────────────────── */}
      <section style={{ background: "#0B1512" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-5 h-px bg-[#C7A35A]/50" />
              <span className="text-xs text-[#D9B36A]/60 tracking-widest uppercase font-mono">
                Como funciona
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Três passos. Sem curva de aprendizado.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="relative"
              >
                {/* Linha de conexão desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[72px] w-[calc(100%-48px)] h-px">
                    <div className="h-full bg-gradient-to-r from-[#4C8A6A]/45 via-[#C7A35A]/30 to-transparent" />
                  </div>
                )}

                {/* Linha vertical mobile */}
                {i < steps.length - 1 && (
                  <div className="md:hidden absolute left-6 top-14 bottom-[-36px] w-px bg-gradient-to-b from-[#4C8A6A]/40 to-transparent" />
                )}

                <div className="flex items-start gap-4">
                  <div
                    className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        i === 0
                          ? "rgba(76,138,106,0.15)"
                          : i === 1
                            ? "rgba(199,163,90,0.12)"
                            : "rgba(76,138,106,0.10)",
                      border:
                        i === 0
                          ? "1px solid rgba(76,138,106,0.3)"
                          : i === 1
                            ? "1px solid rgba(199,163,90,0.25)"
                            : "1px solid rgba(76,138,106,0.2)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: i === 1 ? "#D9B36A" : "#8FC4A6" }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className="pt-1">
                    <h3 className="font-display font-semibold text-lg text-white/90 mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-white/45 leading-relaxed max-w-xs">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARCELAMENTOS — bg: gradiente dourado-musgo ──── */}
      <section
        style={{
          background:
            "radial-gradient(60% 50% at 85% 20%, rgba(199,163,90,0.08) 0%, transparent 70%), radial-gradient(50% 40% at 10% 90%, rgba(76,138,106,0.06) 0%, transparent 70%), #0D1511",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-5 h-px bg-[#C7A35A]/50" />
                <span className="text-xs text-[#D9B36A]/60 tracking-widest uppercase font-mono">
                  Cartão de crédito
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
                Cada parcela.
                <br />
                Cada vencimento.
                <br />
                <span className="text-[#D9B36A]">Sem surpresas.</span>
              </h2>
              <p className="text-sm md:text-base text-white/50 leading-relaxed mb-8">
                Compras parceladas se distribuem automaticamente pelos meses
                certos. Você sabe exatamente o que falta pagar — e quando.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-[#D9B36A]">
                  R$ 4.500
                </span>
                <span className="text-sm text-white/40">
                  em compromissos futuros
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#C7A35A]/15 bg-[#121814] p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-white/85">
                    iPhone 16 Pro
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    12x de R$ 500,00
                  </p>
                </div>
                <span className="text-xs font-mono text-[#D9B36A] bg-[#C7A35A]/10 px-2 py-1 rounded-md border border-[#C7A35A]/15">
                  R$ 4.500 restante
                </span>
              </div>

              <div className="space-y-2.5">
                {allInstallments.map((inst) => (
                  <div key={inst.n} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                        inst.paid
                          ? "bg-[#4C8A6A] text-[#090B0A]"
                          : "border border-white/10 text-white/30"
                      }`}
                    >
                      {inst.n}
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      {inst.paid && (
                        <div
                          className="h-full rounded-full bg-[#4C8A6A]"
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-mono w-16 text-right ${
                        inst.paid ? "text-[#8FC4A6]" : "text-white/25"
                      }`}
                    >
                      {inst.paid ? "✓ pago" : "pendente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ANÁLISES — bg: #0B1512 ───────────────────────── */}
      <section style={{ background: "#0B1512" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto px-6 md:px-10 py-20 md:py-28"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-5 h-px bg-[#4C8A6A]/50" />
                <span className="text-xs text-[#8FC4A6]/60 tracking-widest uppercase font-mono">
                  Análises
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight max-w-sm">
                Entenda para onde seu dinheiro está indo
              </h2>
            </div>
            <p className="text-sm text-white/40 max-w-xs md:text-right leading-relaxed">
              Visualize receitas, despesas e tendências de gastos em um painel
              claro e útil.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0F1E18] p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-white/50">
                Receitas vs Despesas — 2026
              </p>
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4C8A6A]/70" />
                  Receita
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C7A35A]/60" />
                  Despesa
                </span>
              </div>
            </div>
            <div className="h-36 md:h-44 flex items-end gap-1.5 mb-3">
              {[35, 52, 44, 68, 50, 78, 60, 40, 72, 55, 66, 88].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.035,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ height: `${h}%`, originY: 1 }}
                  className={`flex-1 rounded-t-sm ${i % 2 === 0 ? "bg-[#4C8A6A]/50" : "bg-[#C7A35A]/35"}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/25 font-mono">
              {[
                "jan",
                "fev",
                "mar",
                "abr",
                "mai",
                "jun",
                "jul",
                "ago",
                "set",
                "out",
                "nov",
                "dez",
              ].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── NÚMEROS HONESTOS — bg: #090B0A ───────────────── */}
      <section style={{ background: "#090B0A" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center"
        >
          <ValoreMark size={32} className="text-[#4C8A6A]/40 mx-auto mb-10" />
          <div className="space-y-3 mb-6">
            {honestPoints.map((line, i) => (
              <motion.p
                key={line}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`font-display text-lg md:text-xl ${
                  i === honestPoints.length - 1
                    ? "text-[#D9B36A]/80 font-medium mt-4"
                    : "text-white/45"
                }`}
              >
                {line}
              </motion.p>
            ))}
          </div>
          <motion.p
            custom={honestPoints.length}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-xl md:text-2xl font-semibold text-white/90 mt-2"
          >
            Seus dados são seus.
          </motion.p>
          <div className="flex items-center justify-center gap-5 mt-7 text-white/20">
            <Lock size={15} />
            <EyeOff size={15} />
            <Shield size={15} />
          </div>
        </motion.div>
      </section>

      {/* ─── CTA FINAL — bg: #0B1512 ──────────────────────── */}
      <section style={{ background: "#0B1512" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center"
        >
          <div
            className="rounded-3xl border border-[#4C8A6A]/18 p-10 md:p-14 overflow-hidden relative"
            style={{
              background:
                "radial-gradient(ellipse 80% 100% at 50% 110%, rgba(76,138,106,0.07) 0%, transparent 70%), rgba(255,255,255,0.01)",
            }}
          >
            {/* Mini cards orbitando — sempre voltados para cima */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 pointer-events-none"
            >
              {[
                { label: "Patrimônio", value: "R$ 24.830", angle: 0 },
                { label: "Parcela", value: "R$ 500", angle: 120 },
                { label: "Receitas", value: "R$ 5.000", angle: 240 },
              ].map((card, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${card.angle}deg) translateX(170px)`,
                  }}
                >
                  {/* Contra-rotação: anula o giro do pai + o ângulo da órbita, mantendo o card sempre na vertical */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ transform: `rotate(${-card.angle}deg)` }}
                  >
                    <div className="rounded-xl border border-white/[0.08] bg-[#0F1E18]/90 px-4 py-3 shadow-xl backdrop-blur-sm">
                      <p className="text-[10px] text-white/30">{card.label}</p>
                      <p className="text-sm font-bold text-[#8FC4A6]">
                        {card.value}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.45, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(76,138,106,0.16), transparent 60%)",
              }}
            />

            {/* Conteúdo central */}
            <div className="relative z-10">
              {/* Logo animado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full bg-[#4C8A6A]/12 blur-xl pointer-events-none"
                    style={{ margin: "-14px" }}
                  />

                  <ValoreMark
                    size={44}
                    className="text-[#7DB99A] relative z-10"
                  />
                </div>
              </motion.div>

              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Veja seu dinheiro com clareza
              </h2>
              <p className="text-white/40 mb-8 text-sm max-w-xs mx-auto leading-relaxed">
                Sem planilhas. Sem anúncios. Sem vender seus dados.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-[#4C8A6A] hover:bg-[#5A9C78] text-[#090B0A] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Criar conta grátis
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER — bg: #090B0A ──────────────────────────── */}
      <footer style={{ background: "#090B0A" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <ValoreLogo size={22} className="text-[#7DB99A]" />

            <nav className="flex items-center gap-6 text-sm text-white/35">
              <button
                onClick={() => navigate("/login")}
                className="hover:text-white/70 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/register")}
                className="hover:text-white/70 transition-colors"
              >
                Criar conta
              </button>
              <a
                href="mailto:vicenzo.esc@gmail.com"
                className="hover:text-white/70 transition-colors"
              >
                Contato
              </a>
            </nav>

            <p className="text-xs text-white/20 text-center md:text-right leading-relaxed">
              © 2026 Valore
              <br />
              Desenvolvido no CSTSI - IFSul
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
