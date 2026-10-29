import React from "react";
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
