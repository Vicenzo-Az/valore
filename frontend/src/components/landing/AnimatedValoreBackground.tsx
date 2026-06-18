import { motion } from "framer-motion";

export function AnimatedValoreBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {" "}
      {/* Glow base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 18% 12%, rgba(76,138,106,0.08), transparent 28%),
            radial-gradient(circle at 82% 18%, rgba(199,163,90,0.05), transparent 24%),
            radial-gradient(circle at 50% 85%, rgba(76,138,106,0.04), transparent 30%)
          `,
        }}
      />
      {/* Pattern animado */}
      <motion.svg
        animate={{
          x: [0, 12, -8, 0],
          y: [0, -10, 6, 0],
          opacity: [0.018, 0.032, 0.022, 0.018],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 1400"
        preserveAspectRatio="none"
      >
        <path
          d="M120 180 L280 340 L440 180 L600 340"
          stroke="#7DB99A"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M900 260 L1060 420 L1220 260 L1380 420"
          stroke="#C7A35A"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M220 860 L380 1020 L540 860 L700 1020"
          stroke="#7DB99A"
          strokeWidth="1.4"
          fill="none"
        />
      </motion.svg>
    </div>
  );
}
