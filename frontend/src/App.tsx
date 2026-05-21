import { useUser } from "@/context";
import type { UserResponse } from "@/types";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Accounts from "./pages/Accounts";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Component />
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { setUser } = useUser();

  function handleAuth(user: UserResponse) {
    setUser(user);
  }

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login onLogin={handleAuth} />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register onRegister={handleAuth} />
          </PublicRoute>
        }
      />

      <Route path="/" element={<AppRoute component={Dashboard} />} />
      <Route path="/accounts" element={<AppRoute component={Accounts} />} />
      <Route
        path="/transactions"
        element={<AppRoute component={Transactions} />}
      />
      <Route path="/analytics" element={<AppRoute component={Analytics} />} />
      <Route path="/profile" element={<AppRoute component={Profile} />} />
      <Route path="/settings" element={<AppRoute component={Settings} />} />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
