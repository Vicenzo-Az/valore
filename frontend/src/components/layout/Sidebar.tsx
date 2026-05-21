import {
  BarChart2,
  CreditCard,
  LayoutDashboard,
  Settings,
  User,
  Wallet,
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

export function Sidebar() {
  const baseStyle =
    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors";

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-emerald-50 border-r border-emerald-800/40 p-6">
      <h1 className="text-lg font-semibold tracking-tight mb-8">
        Finance Tracker
      </h1>
      <nav className="space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
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
