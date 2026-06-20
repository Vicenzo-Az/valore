interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Marca Valore — dois chevrons aninhados formando um "V",
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
        d="M10 20 L32 20 C34.8 20 37.4 21.5 38.8 24 L50 44 L61.2 24 C62.6 21.5 65.2 20 68 20 L90 20 L57.5 76.5 C56.2 78.7 53.9 80 51.4 80 L48.6 80 C46.1 80 43.8 78.7 42.5 76.5 L10 20 Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 38 L40 38 C41.4 38 42.7 38.8 43.4 40 L50 51.5 L56.6 40 C57.3 38.8 58.6 38 60 38 L70 38 L54 66 C53.3 67.2 52 68 50.6 68 L49.4 68 C48 68 46.7 67.2 46 66 L30 38 Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ValoreLogo({ size = 28, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 leading-none ${className}`}>
      <ValoreMark size={size} className="shrink-0" />
      <span
        className="font-display font-bold tracking-tight lowercase leading-none flex items-center"
        style={{ fontSize: size * 0.82, height: size }}
      >
        valore
      </span>
    </div>
  );
}
