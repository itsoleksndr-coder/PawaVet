import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { type Pet, type Species } from "../../types";
export const AddPetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addPet, addOwner, petOwners } = useData();
  const [name, setName] = useState(""),
    [species, setSpecies] = useState<Species>("dog"),
    [ownerId, setOwner] = useState(""),
    [ownerName, setOwnerName] = useState(""),
    [email, setEmail] = useState(""),
    [weight, setWeight] = useState(""),
    [notes, setNotes] = useState("");
  const [sex, setSex] = useState<Pet["sex"]>("Male (Intact)"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let id = ownerId;
      if (!id) {
        const owner = await addOwner({
          name: ownerName,
          email,
          phone: "",
          address: "",
          emergencyContact: "",
        });
        id = owner.id;
        setOwner(id);
      }
      await addPet({
        name,
        species,
        breed: "",
        age: "",
        dateOfBirth: "",
        sex,
        weightKg: Number(weight),
        color: "",
        microchipNumber: "",
        ownerId: id,
        ownerName: "",
        vaccinationStatus: "Unknown",
        allergies: [],
        currentMedications: [],
        notes,
      });
      setName("");
      setWeight("");
      setNotes("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save patient.");
    } finally {
      setBusy(false);
    }
  };
  const input =
    "block w-full bg-slate-950 border border-slate-700 rounded-xl p-3 mt-1";
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-slate-900 p-6 rounded-2xl space-y-4 overflow-auto max-h-[90vh]"
      >
        <h2 className="text-xl font-bold">Register patient</h2>
        <label className="block">
          Patient name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          Species
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value as Species)}
            className={input}
          >
            {["dog", "cat", "bird", "rabbit", "reptile", "other"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          Sex
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Pet["sex"])}
            className={input}
          >
            {[
              "Male (Intact)",
              "Male (Neutered)",
              "Female (Intact)",
              "Female (Spayed)",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          Weight (kg)
          <input
            type="number"
            min="0"
            max="1500"
            step="0.01"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          Owner
          <select
            value={ownerId}
            onChange={(e) => setOwner(e.target.value)}
            className={input}
          >
            <option value="">Register a new owner</option>
            {petOwners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        {!ownerId && (
          <>
            <label className="block">
              Owner name
              <input
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={input}
              />
            </label>
            <label className="block">
              Owner email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
            </label>
          </>
        )}
        <label className="block">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={input}
          />
        </label>
        {error && (
          <p role="alert" className="text-rose-300">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            disabled={busy}
            className="bg-teal-600 px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save patient"}
          </button>
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
