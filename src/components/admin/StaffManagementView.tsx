import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { UserRole, ROLE_CONFIGS, ROLE_PERMISSIONS } from "../../types";
import { RoleBadge } from "../common/RoleBadge";
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Edit2,
  Check,
  X,
  Lock,
  Building2,
} from "lucide-react";

export const StaffManagementView: React.FC = () => {
  const { isSuperAdmin, isClinicAdmin, currentUser, activeClinic } = useAuth();
  const { staffMembers, inviteStaffMember, updateStaffRole, toggleStaffStatus } = useData();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("TECHNICIAN");
  const [inviteTitle, setInviteTitle] = useState("Veterinary Nurse");

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [selectedRoleToUpdate, setSelectedRoleToUpdate] = useState<UserRole>("TECHNICIAN");

  const [showMatrix, setShowMatrix] = useState(true);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteStaffMember({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      title: inviteTitle,
    });
    setInviteName("");
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleSaveRole = (staffId: string) => {
    updateStaffRole(staffId, selectedRoleToUpdate);
    setEditingStaffId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 uppercase font-mono">
              Staff & RBAC Administration
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {staffMembers.length} Team {staffMembers.length === 1 ? "Member" : "Members"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Staff Roster & Role Permissions</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage practice employees, assign granular role-based access control, and enforce 2FA compliance.
          </p>
        </div>

        {(isSuperAdmin || isClinicAdmin) && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Active Practice Personnel</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tenant: <strong className="text-slate-200">{activeClinic?.name || "Global"}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Role & Privileges</th>
                <th className="p-4">2FA Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">License / Credentials</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={staff.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                        alt={staff.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{staff.name}</span>
                          {staff.id === currentUser?.id && (
                            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.2 rounded font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{staff.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {editingStaffId === staff.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedRoleToUpdate}
                          onChange={(e) => setSelectedRoleToUpdate(e.target.value as UserRole)}
                          className="bg-slate-950 border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="CLINIC_ADMIN">Clinic Admin</option>
                          <option value="VETERINARIAN">Veterinarian (DVM)</option>
                          <option value="TECHNICIAN">Veterinary Technician</option>
                          <option value="RECEPTIONIST">Receptionist</option>
                        </select>
                        <button
                          onClick={() => handleSaveRole(staff.id)}
                          className="p-1 rounded bg-purple-600 hover:bg-purple-500 text-white"
                          title="Save Role"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStaffId(null)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RoleBadge role={staff.role} size="sm" />
                        {(isSuperAdmin || (isClinicAdmin && staff.id !== currentUser?.id)) && (
                          <button
                            onClick={() => {
                              setEditingStaffId(staff.id);
                              setSelectedRoleToUpdate(staff.role);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-purple-400 transition-colors"
                            title="Modify Role & Permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {staff.isTwoFactorEnabled ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enabled (TOTP)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Disabled</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        staff.status === "Active"
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                          : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {staff.licenseNumber || "N/A"}
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    {(isSuperAdmin || (isClinicAdmin && staff.id !== currentUser?.id)) && (
                      <button
                        onClick={() => toggleStaffStatus(staff.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          staff.status === "Active"
                            ? "bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                            : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60"
                        }`}
                      >
                        {staff.status === "Active" ? "Suspend Account" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">RBAC Privilege Matrix Comparison</h3>
              <p className="text-xs text-slate-400">Role-Based Access Control matrix enforced across all API and UI routes</p>
            </div>
          </div>
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="text-xs text-purple-400 hover:underline font-semibold"
          >
            {showMatrix ? "Hide Matrix" : "Show Full Matrix"}
          </button>
        </div>

        {showMatrix && (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Functional Capability</th>
                  <th className="p-3.5 text-center text-amber-400">Super Admin</th>
                  <th className="p-3.5 text-center text-purple-400">Clinic Admin</th>
                  <th className="p-3.5 text-center text-teal-400">Veterinarian</th>
                  <th className="p-3.5 text-center text-blue-400">Technician</th>
                  <th className="p-3.5 text-center text-emerald-400">Receptionist</th>
                  <th className="p-3.5 text-center text-rose-400">Pet Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {/* 1 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Cross-Clinic Multi-Tenancy Switch</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Full</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Isolated</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Isolated</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Isolated</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Isolated</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Isolated</td>
                </tr>
                {/* 2 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Sign DEA Prescriptions & Rx Refills</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                </tr>
                {/* 3 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Create & Chart Clinical SOAP Records</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-blue-400 font-semibold">Vitals only</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                </tr>
                {/* 4 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Manage Practice Staff & Invite Members</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Full</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Full</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Read only</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                </tr>
                {/* 5 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">View Clinic Security Audit Logs</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Global</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Clinic</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                </tr>
                {/* 6 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Schedule & Check-in Appointments</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-rose-400 font-semibold">Own pets only</td>
                </tr>
                {/* 7 */}
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-200">Process Billing & Payments</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Invoicing only</td>
                  <td className="p-3.5 text-center text-slate-600">✗ Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Yes</td>
                  <td className="p-3.5 text-center text-rose-400 font-semibold">Pay own only</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Invite Practice Staff Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Maya Patel or Chris Evans"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="maya.patel@oakwoodvet.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assigned Role (RBAC) *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CLINIC_ADMIN">Clinic Administrator (Practice Manager)</option>
                  <option value="VETERINARIAN">Veterinarian (DVM Surgeon)</option>
                  <option value="TECHNICIAN">Veterinary Technician / Nurse</option>
                  <option value="RECEPTIONIST">Front Desk Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinical Position / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Veterinarian or Lead RVT"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
