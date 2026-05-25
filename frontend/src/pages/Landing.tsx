import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart2,
  Lock,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: BarChart2,
    title: "Dashboards interativos",
    desc: "Visualize receitas, despesas e saldo em tempo real com gráficos claros e responsivos.",
  },
  {
    icon: RefreshCw,
    title: "CRUD completo",
    desc: "Adicione, edite e remova transações instantaneamente, com dados persistidos em nuvem.",
  },
  {
    icon: Shield,
    title: "Autenticação segura",
    desc: "Seus dados protegidos com JWT em cookie httpOnly e senhas com hash bcrypt.",
  },
  {
    icon: Zap,
    title: "Análises inteligentes",
    desc: "Categorização automática de gastos e resumo mensal para entender seus padrões.",
  },
  {
    icon: Lock,
    title: "Privacidade total",
    desc: "Cada usuário acessa apenas as suas transações. Zero exposição de dados de terceiros.",
  },
  {
    icon: ArrowRight,
    title: "Simples de usar",
    desc: "Interface limpa e intuitiva — sem curva de aprendizado, pronto para usar no dia a dia.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      custom={index % 3}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="
        rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-md
        p-6 flex flex-col gap-4
        hover:border-emerald-500/40
        hover:bg-white/8
        transition-colors duration-300
      "
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
        <Icon size={20} className="text-emerald-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white/90 mb-1">{title}</h3>
        <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #064e3b33 0%, transparent 70%), linear-gradient(180deg, #020f08 0%, #030d09 60%, #020a06 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto"
      >
        <span className="text-lg font-semibold tracking-tight text-emerald-300">
          Valore
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={() => navigate("/register")}
            className="
              px-4 py-2 text-sm font-medium rounded-lg
              bg-emerald-500 hover:bg-emerald-400
              text-slate-950
              transition-colors duration-200
            "
          >
            Criar conta
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-32 text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="
            inline-flex items-center gap-2 px-3 py-1.5 mb-8
            rounded-full border border-emerald-500/30
            bg-emerald-500/10 text-emerald-300 text-xs font-medium
          "
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Domine suas finanças
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Suas finanças,{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
            }}
          >
            sob controle.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Registre receitas e despesas, visualize categorias e acompanhe seu
          histórico financeiro em dashboards interativos — tudo em um só lugar.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/register")}
            className="
              group flex items-center gap-2
              px-6 py-3 rounded-xl text-sm font-semibold
              bg-emerald-500 hover:bg-emerald-400
              text-slate-950 transition-all duration-200
              hover:shadow-[0_0_32px_rgba(52,211,153,0.25)]
            "
          >
            Começar gratuitamente
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="
              px-6 py-3 rounded-xl text-sm font-medium
              border border-white/15 hover:border-white/30
              text-white/70 hover:text-white
              transition-all duration-200
            "
          >
            Já tenho conta
          </button>
        </motion.div>

        {/* Decorative glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 600,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)",
          }}
        />
      </section>

      {/* Mock dashboard preview */}
      <motion.section
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-5xl mx-auto px-8 mb-32"
      >
        <div
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          {/* Fake topbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
            <span className="w-3 h-3 rounded-full bg-red-400/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/60" />
            <span className="ml-4 text-xs text-white/25 font-mono">
              finance-tracker.app/dashboard
            </span>
          </div>

          {/* Fake dashboard content */}
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              {
                label: "Saldo total",
                value: "R$ 8.420,00",
                color: "text-emerald-400",
              },
              {
                label: "Receitas",
                value: "R$ 12.500,00",
                color: "text-emerald-300",
              },
              {
                label: "Despesas",
                value: "R$ 4.080,00",
                color: "text-red-400",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/8 bg-white/5 p-4"
              >
                <p className="text-xs text-white/40 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Fake bar chart */}
          <div className="px-6 pb-6">
            <div className="rounded-xl border border-white/8 bg-white/5 p-4 h-32 flex items-end gap-2">
              {[40, 65, 50, 80, 55, 90, 70, 45, 85, 60, 75, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  style={{ height: `${h}%`, originY: 1 }}
                  className="flex-1 rounded-t-sm bg-emerald-500/50"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-32">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Tudo que você precisa
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            Um sistema completo para controle financeiro pessoal, do registro ao
            relatório.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* CTA final */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto px-8 pb-24 text-center"
      >
        <div
          className="rounded-3xl border border-emerald-500/20 p-16"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(16,185,129,0.08) 0%, transparent 70%), rgba(255,255,255,0.03)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Pronto para começar?
          </h2>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">
            Crie sua conta gratuitamente e tenha controle total das suas
            finanças.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="
              group inline-flex items-center gap-2
              px-8 py-3.5 rounded-xl font-semibold text-sm
              bg-emerald-500 hover:bg-emerald-400
              text-slate-950 transition-all duration-200
              hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]
            "
          >
            Criar conta grátis
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 py-8 text-center">
        <p className="text-xs text-white/25">
          © 2026 Valore · Desenvolvido como TCC — CSTSI / IFSul
        </p>
      </footer>
    </div>
  );
}
