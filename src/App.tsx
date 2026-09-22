import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { AuthModal } from "./components/auth/AuthModal";
import { ClinicWorkspace } from "./components/ClinicWorkspace";
import { LockScreenModal } from "./components/auth/LockScreenModal";
function SessionGate() {
  const { loading, isLoggedIn, error } = useAuth();
  if (loading) return <p className="p-8 text-white">Checking session…</p>;
  return (
    <>
      {error && (
        <p role="alert" className="p-4 bg-rose-950 text-white">
          {error}
        </p>
      )}
      {isLoggedIn ? (
        <DataProvider>
          <ClinicWorkspace />
          <LockScreenModal />
        </DataProvider>
      ) : (
        <AuthModal isOpen onClose={() => {}} />
      )}
      {import.meta.env.VITE_ENABLE_ANALYTICS === "true" && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <SessionGate />
    </AuthProvider>
  );
}
