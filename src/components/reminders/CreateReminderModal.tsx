import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { X, BellRing, MessageSquare, Mail, Phone, Sparkles } from "lucide-react";

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPetId?: string;
}

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  preselectedPetId,
}) => {
  const { pets, addReminder } = useData();
  const { currentClinic } = useAuth();

  const [petId, setPetId] = useState(preselectedPetId || pets[0]?.id || "");
  const [type, setType] = useState("Vaccine Due Booster");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
  const [deliveryMethod, setDeliveryMethod] = useState<"SMS" | "Email" | "WhatsApp" | "Push">("SMS");
  const [message, setMessage] = useState(
    "Hi {{owner_name}}! {{pet_name}} is due for their annual vaccine booster. Tap here to reserve your visit at {{clinic_name}}: https://pawfect.app/book"
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPet = pets.find((p) => p.id === petId) || pets[0];

    const renderedMessage = message
      .replace("{{owner_name}}", targetPet.ownerName)
      .replace("{{pet_name}}", targetPet.name)
      .replace("{{clinic_name}}", currentClinic.name)
      .replace("{{due_date}}", dueDate);

    addReminder({
      petId: targetPet.id,
      petName: targetPet.name,
      ownerId: targetPet.ownerId,
      ownerName: targetPet.ownerName,
      ownerPhone: targetPet.ownerPhone,
      ownerEmail: targetPet.ownerEmail,
      type,
      dueDate,
      deliveryMethod,
      status: "Scheduled",
      messageContent: renderedMessage,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create Automated Reminder</h3>
              <p className="text-xs text-slate-400">Schedule multi-channel patient preventative reminders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Target Patient *</label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}) — Owner: {p.ownerName} ({p.ownerPhone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Reminder Purpose</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Vaccine Due Booster">Vaccine Booster Due</option>
                <option value="Annual Wellness Exam">Annual Wellness Exam</option>
                <option value="Dental Cleaning Check">Dental Cleaning Check</option>
                <option value="Post-Op Follow-up">Post-Op Clinical Check</option>
                <option value="Medication Refill">Medication Refill</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Delivery Channel</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="SMS">SMS Text (98% Open Rate)</option>
                <option value="WhatsApp">WhatsApp Business</option>
                <option value="Email">Email Bulletin</option>
                <option value="Push">Push Notification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Scheduled Dispatch Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Message Template Content</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
              <span>Tags available:</span>
              <span className="font-mono text-teal-400">{"{{owner_name}}"}</span>
              <span className="font-mono text-teal-400">{"{{pet_name}}"}</span>
              <span className="font-mono text-teal-400">{"{{clinic_name}}"}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-700/30 transition-all cursor-pointer"
            >
              Schedule Automated Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
