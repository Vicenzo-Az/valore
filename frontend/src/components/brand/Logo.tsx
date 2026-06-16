interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Marca Valore — chevrons aninhados formando um "V",
 * representando camadas de organização financeira.
 */
export function ValoreMark({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 22 L37 22 C39.2 22 41.2 23.2 42.3 25.1 L50 38 L57.7 25.1 C58.8 23.2 60.8 22 63 22 L86 22 L57.5 71.5 C56.4 73.4 54.3 74.6 52 74.6 L48 74.6 C45.7 74.6 43.6 73.4 42.5 71.5 L14 22 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M25.5 30.5 L37 30.5 C38.3 30.5 39.5 31.2 40.1 32.3 L50 49.5 L59.9 32.3 C60.5 31.2 61.7 30.5 63 30.5 L74.5 30.5 L53.8 63.8 C53.1 65 51.8 65.7 50.4 65.7 L49.6 65.7 C48.2 65.7 46.9 65 46.2 63.8 L25.5 30.5 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ValoreLogo({ size = 28, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ValoreMark size={size} />
      <span
        className="font-display font-bold tracking-tight lowercase"
        style={{ fontSize: size * 0.82 }}
      >
        valore
      </span>
    </div>
  );
}
