import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Species, Pet } from "../../types";
import { X, PawPrint, CheckCircle2 } from "lucide-react";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({ isOpen, onClose }) => {
  const { isPetOwner, currentUser } = useAuth();
  const { addPet, petOwners } = useData();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("2 years");
  const [dob, setDob] = useState("2024-01-01");
  const [sex, setSex] = useState<Pet["sex"]>("Male (Neutered)");
  const [weightKg, setWeightKg] = useState<number>(12.5);
  const [color, setColor] = useState("Golden");
  const [microchip, setMicrochip] = useState(`98514100${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [ownerId, setOwnerId] = useState(isPetOwner ? currentUser?.id || "owner-1" : petOwners[0]?.id || "owner-1");
  const [ownerName, setOwnerName] = useState(isPetOwner ? currentUser?.name || "David Chen" : petOwners[0]?.name || "David Chen");
  const [allergiesText, setAllergiesText] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOwner = petOwners.find((o) => o.id === ownerId);

    addPet({
      name,
      species,
      breed: breed || (species === "dog" ? "Mixed Breed Canine" : "Domestic Shorthair"),
      age,
      dateOfBirth: dob,
      sex,
      weightKg: Number(weightKg) || 10,
      color: color || "Tan",
      microchipNumber: microchip,
      ownerId: isPetOwner ? currentUser?.id || "owner-1" : ownerId,
      ownerName: isPetOwner ? currentUser?.name || "David Chen" : selectedOwner?.name || ownerName,
      vaccinationStatus: "Up to date",
      allergies: allergiesText ? allergiesText.split(",").map((s) => s.trim()) : [],
      currentMedications: [],
      notes,
      photoUrl:
        species === "dog"
          ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80"
          : species === "cat"
          ? "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&auto=format&fit=crop&q=80",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Register Patient</h3>
              <p className="text-xs text-slate-400">Electronic patient medical chart creation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Copper or Bella"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Species *</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="dog">Canine (Dog)</option>
                <option value="cat">Feline (Cat)</option>
                <option value="rabbit">Lagomorph (Rabbit)</option>
                <option value="bird">Avian (Bird)</option>
                <option value="other">Other Exotic</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Breed</label>
              <input
                type="text"
                placeholder="e.g. Beagle / Labrador"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Sex & Reproductive Status</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Male (Neutered)">Male (Neutered)</option>
                <option value="Male (Intact)">Male (Intact)</option>
                <option value="Female (Spayed)">Female (Spayed)</option>
                <option value="Female (Intact)">Female (Intact)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Microchip Number</label>
              <input
                type="text"
                value={microchip}
                onChange={(e) => setMicrochip(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          {!isPetOwner && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Pet Parent / Owner</label>
              <select
                value={ownerId}
                onChange={(e) => {
                  setOwnerId(e.target.value);
                  const found = petOwners.find((o) => o.id === e.target.value);
                  if (found) setOwnerName(found.name);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                {petOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 mb-1">Known Allergies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Beef protein, Penicillin"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
            >
              Create Patient Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
