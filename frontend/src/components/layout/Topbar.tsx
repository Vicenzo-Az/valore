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
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10"
      style={{
        background: "rgba(9,11,10,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — só mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/80"
        >
          <Menu size={18} />
        </button>

        {/* Avatar + saudação */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 transition-all duration-200"
            style={{
              boxShadow: "0 0 0 1.5px rgba(76,138,106,0.35)",
            }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "rgba(76,138,106,0.15)" }}
              >
                <User size={14} style={{ color: "#7DB99A" }} />
              </div>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] text-white/30 leading-none mb-1">
              Bem-vindo de volta
            </p>
            <p
              className="text-sm font-semibold leading-none transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {firstName}
            </p>
          </div>
        </button>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </Button>

        <div className="w-px h-4 mx-1 bg-white/10" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/35 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
          onClick={handleLogout}
          title="Sair"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
