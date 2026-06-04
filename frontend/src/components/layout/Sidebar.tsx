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
  const baseStyle =
    "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors";

  return (
    <aside
      className="
      h-full w-64
      bg-gradient-to-b from-emerald-900 to-emerald-950
      text-emerald-50
      border-r border-emerald-800/40
      p-6 flex flex-col
    "
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold tracking-tight">Valore</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md hover:bg-emerald-800/60 transition-colors text-emerald-200"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="space-y-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `${baseStyle} ${
                isActive
                  ? "bg-emerald-700/70 text-white"
                  : "text-emerald-100 hover:bg-emerald-800/60"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
