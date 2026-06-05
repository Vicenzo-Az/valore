import { Button } from "@/components/ui/button";
import { useUser } from "@/context";
import { LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

interface Props {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: Props) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/landing");
  }

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Botão hamburger — só mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Avatar + nome */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 group"
        >
          <div
            className="
            w-9 h-9 rounded-full overflow-hidden shrink-0
            ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/70
            transition-all duration-200
          "
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-emerald-500/15 flex items-center justify-center">
                <User size={16} className="text-emerald-500" />
              </div>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-muted-foreground leading-none mb-1.5">
              Bem-vindo de volta
            </p>
            <p className="text-base font-semibold leading-none group-hover:text-emerald-500 transition-colors">
              {firstName}
            </p>
          </div>
        </button>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <div className="w-px h-5 bg-border" />

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-red-500 transition-colors"
          onClick={handleLogout}
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
