import { UrgentQueue } from "./components/urgent/UrgentQueue";
import React, { useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider, useData } from "./context/DataContext";
import { Header } from "./components/common/Header";
import { Sidebar, NavSection } from "./components/common/Sidebar";
import { TwoFactorSetupModal } from "./components/auth/TwoFactorSetupModal";
import { ActiveSessionsManager } from "./components/auth/ActiveSessionsManager";
import { LockScreenModal } from "./components/auth/LockScreenModal";
import { AuthModal } from "./components/auth/AuthModal";
import { RoleAdaptiveDashboard } from "./components/dashboard/RoleAdaptiveDashboard";
import { PetList } from "./components/pets/PetList";
import { PetDetailModal } from "./components/pets/PetDetailModal";
import { AddPetModal } from "./components/pets/AddPetModal";
import { MedicalRecordsList } from "./components/records/MedicalRecordsList";
import { CreateMedicalRecordModal } from "./components/records/CreateMedicalRecordModal";
import { RecordDetailModal } from "./components/records/RecordDetailModal";
import { AppointmentCalendar } from "./components/appointments/AppointmentCalendar";
import { CreateAppointmentModal } from "./components/appointments/CreateAppointmentModal";
import { BillingDashboard } from "./components/billing/BillingDashboard";
import { CreateInvoiceModal } from "./components/billing/CreateInvoiceModal";
import { StaffManagementView } from "./components/admin/StaffManagementView";
import { SecurityAuditView } from "./components/admin/SecurityAuditView";
import { PetOwnerPortal } from "./components/owner/PetOwnerPortal";
import { TelemedAndAiView } from "./components/telemedicine/TelemedAndAiView";
import { RemindersView } from "./components/reminders/RemindersView";
import { Pet, MedicalRecord } from "./types";

const MainAppContent: React.FC = () => {
  const { activeRole, isPetOwner, hasPermission } = useAuth();
  const { loading: dataLoading, error: dataError, refresh, pets } = useData();

  // Navigation State
  const [activeSection, setActiveSection] = useState<NavSection>("pets");

  // Modals State
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Feature Modals State
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [isCreateAptOpen, setIsCreateAptOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header */}
      <Header
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpen2FASetup={() => setIs2FAOpen(true)}
        onOpenSessions={() => setIsSessionsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(sec) => setActiveSection(sec)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {dataLoading && <p role="status">Loading clinic records…</p>}
          {dataError && (
            <div role="alert" className="p-4 bg-rose-950 rounded-xl mb-4">
              {dataError}
              <button onClick={() => void refresh()} className="ml-4 underline">
                Retry
              </button>
            </div>
          )}
          {activeSection === "dashboard" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Clinic workspace</h1>
              <p>{pets.length} saved patients</p>
              <button
                className="bg-teal-600 p-3 rounded-xl"
                onClick={() => setActiveSection("pets")}
              >
                View patients
              </button>
            </div>
          )}

          {activeSection === "owner_portal" && (
            <PetList
              onSelectPet={setSelectedPet}
              onOpenAddPet={() => setIsAddPetOpen(true)}
            />
          )}

          {activeSection === "pets" && (
            <PetList
              onSelectPet={(p) => setSelectedPet(p)}
              onOpenAddPet={() => setIsAddPetOpen(true)}
            />
          )}

          {activeSection === "urgent" && <UrgentQueue />}
          {activeSection === "staff" && hasPermission("staff:read") && (
            <StaffManagementView />
          )}
          {activeSection === "audit" &&
            hasPermission("clinic:audit_logs_read") && <SecurityAuditView />}
          {[
            "records",
            "appointments",
            "reminders",
            "billing",
            "telemed",
          ].includes(activeSection) && (
            <div className="bg-slate-900 p-6 rounded-xl space-y-3">
              <h2 className="text-xl font-bold">
                This workflow is not activated yet
              </h2>
              <p className="text-slate-300">
                Patient registration and updates are available. This section
                will open after its storage and service connections have been
                verified.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden bg-slate-900 border-t border-slate-800 p-2 flex items-center justify-around text-[10px] text-slate-400 sticky bottom-0 z-30">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
            activeSection === "dashboard" ? "text-teal-400 font-bold" : ""
          }`}
        >
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveSection(isPetOwner ? "owner_portal" : "pets")}
          className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
            activeSection === "pets" || activeSection === "owner_portal"
              ? "text-teal-400 font-bold"
              : ""
          }`}
        >
          <span>{isPetOwner ? "My Pets" : "Patients"}</span>
        </button>
        <button
          onClick={() => setActiveSection("urgent")}
          className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
            activeSection === "appointments" ? "text-teal-400 font-bold" : ""
          }`}
        >
          <span>Urgent care</span>
        </button>
      </div>

      {/* Global Modals */}

      <TwoFactorSetupModal
        isOpen={is2FAOpen}
        onClose={() => setIs2FAOpen(false)}
      />

      {isSessionsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 p-6 overflow-auto">
          <button className="p-3" onClick={() => setIsSessionsOpen(false)}>
            Close sessions
          </button>
          <ActiveSessionsManager />
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LockScreenModal />

      {/* Feature Modals */}
      <PetDetailModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        onOpenCreateRecord={() => setIsCreateRecordOpen(true)}
        onSelectRecord={(r) => {
          setSelectedPet(null);
          setSelectedRecord(r);
        }}
      />

      <AddPetModal
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
      />

      <CreateMedicalRecordModal
        isOpen={isCreateRecordOpen}
        onClose={() => setIsCreateRecordOpen(false)}
      />

      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      <CreateAppointmentModal
        isOpen={isCreateAptOpen}
        onClose={() => setIsCreateAptOpen(false)}
      />

      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />

      {/* Vercel Speed Insights */}
      <SpeedInsights />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
};

const SessionGate: React.FC = () => {
  const { loading, currentUser, isLocked } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8" role="status">
        Checking your session…
      </div>
    );
  if (!currentUser) return <AuthModal isOpen onClose={() => {}} />;
  if (isLocked) return <LockScreenModal />;
  return (
    <DataProvider key={currentUser.id + currentUser.role}>
      <MainAppContent />
    </DataProvider>
  );
};
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionGate />
    </AuthProvider>
  );
};

export default App;
