import { ValoreLogo } from "@/components/brand/Logo";
import {
  BarChart2,
  CreditCard,
  LayoutDashboard,
  Settings,
  User,
  Wallet,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/accounts", icon: Wallet, label: "Contas" },
  { to: "/transactions", icon: CreditCard, label: "Transações" },
  { to: "/analytics", icon: BarChart2, label: "Análises" },
  { to: "/profile", icon: User, label: "Perfil" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

interface Props {
  onClose?: () => void;
}

export function Sidebar({ onClose }: Props) {
  return (
    <aside
      className="h-screen w-64 flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0D1511 0%, #0B1210 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 mb-2">
        <ValoreLogo size={32} className="text-[#7DB99A]" />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md transition-colors text-white/30 hover:text-white/60 hover:bg-white/5"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Divisor */}
      <div className="mx-5 h-px bg-white/[0.06] mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#4C8A6A]/20 text-[#8FC4A6] border border-[#4C8A6A]/20"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={isActive ? "text-[#7DB99A]" : ""}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer da sidebar */}
      <div className="px-5 py-5 mt-auto">
        <div className="h-px bg-white/[0.06] mb-4" />
        <p className="text-[10px] text-white/20 leading-relaxed">
          Valore · CSTSI / IFSul
          <br />© 2026
        </p>
      </div>
    </aside>
  );
}
