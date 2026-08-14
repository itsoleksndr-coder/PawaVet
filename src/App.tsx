import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider, useData } from "./context/DataContext";
import { Header } from "./components/common/Header";
import { Sidebar, NavSection } from "./components/common/Sidebar";
import { RoleSwitcherModal } from "./components/common/RoleSwitcherModal";
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
  const { activeRole, isPetOwner } = useAuth();

  // Navigation State
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");

  // Modals State
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Feature Modals State
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
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
          {activeSection === "dashboard" && (
            <RoleAdaptiveDashboard
              onNavigate={(sec) => setActiveSection(sec)}
              onOpenCreateRecord={() => setIsCreateRecordOpen(true)}
              onOpenCreateApt={() => setIsCreateAptOpen(true)}
              onOpenAddPet={() => setIsAddPetOpen(true)}
            />
          )}

          {activeSection === "owner_portal" && (
            <PetOwnerPortal
              onOpenCreateApt={() => setIsCreateAptOpen(true)}
              onOpenAddPet={() => setIsAddPetOpen(true)}
              onSelectPet={(p) => setSelectedPet(p)}
            />
          )}

          {activeSection === "pets" && (
            <PetList
              onSelectPet={(p) => setSelectedPet(p)}
              onOpenAddPet={() => setIsAddPetOpen(true)}
            />
          )}

          {activeSection === "records" && (
            <MedicalRecordsList
              onSelectRecord={(r) => setSelectedRecord(r)}
              onOpenCreate={() => setIsCreateRecordOpen(true)}
            />
          )}

          {activeSection === "appointments" && (
            <AppointmentCalendar onOpenCreate={() => setIsCreateAptOpen(true)} />
          )}

          {activeSection === "reminders" && <RemindersView />}

          {activeSection === "billing" && (
            <BillingDashboard onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)} />
          )}

          {activeSection === "staff" && <StaffManagementView />}

          {activeSection === "audit" && <SecurityAuditView />}

          {activeSection === "telemed" && <TelemedAndAiView />}
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
            activeSection === "pets" || activeSection === "owner_portal" ? "text-teal-400 font-bold" : ""
          }`}
        >
          <span>{isPetOwner ? "My Pets" : "Patients"}</span>
        </button>
        <button
          onClick={() => setActiveSection("appointments")}
          className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
            activeSection === "appointments" ? "text-teal-400 font-bold" : ""
          }`}
        >
          <span>Visits</span>
        </button>
        <button
          onClick={() => setIsRoleSwitcherOpen(true)}
          className="p-2 rounded-xl flex flex-col items-center space-y-1 text-purple-400 font-bold"
        >
          <span>Roles</span>
        </button>
      </div>

      {/* Global Modals */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      <TwoFactorSetupModal
        isOpen={is2FAOpen}
        onClose={() => setIs2FAOpen(false)}
      />

      <ActiveSessionsManager
        isOpen={isSessionsOpen}
        onClose={() => setIsSessionsOpen(false)}
      />

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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
