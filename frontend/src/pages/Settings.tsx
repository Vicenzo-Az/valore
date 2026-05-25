import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] =
  [
    { value: "light", label: "Claro", icon: <Sun size={18} /> },
    { value: "dark", label: "Escuro", icon: <Moon size={18} /> },
    { value: "system", label: "Sistema", icon: <Monitor size={18} /> },
  ];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      {/* Aparência */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Aparência</h2>
            <p className="text-sm text-muted-foreground">
              Escolha como o Finance Tracker aparece para você.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    theme === option.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-emerald-500/40 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Moeda */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Moeda</h2>
            <p className="text-sm text-muted-foreground">
              Moeda utilizada em todo o sistema.
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <span className="text-2xl font-bold text-emerald-500">R$</span>
            <div>
              <p className="font-medium text-sm">Real Brasileiro (BRL)</p>
              <p className="text-xs text-muted-foreground">
                Suporte a outras moedas em breve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sobre */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <h2 className="font-semibold mb-1">Sobre</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Valore v1.0</p>
            <p>Domine suas finanças</p>
            <p>CSTSI — IFSul · 2026</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
