import React from "react";
export const TwoFactorSetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) =>
  isOpen ? (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md space-y-4">
        <h2 className="text-xl">Two-factor authentication</h2>
        <p>
          Authenticator setup is not available yet. Two-factor protection has
          not been enabled.
        </p>
        <button onClick={onClose} className="bg-teal-600 px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  ) : null;
