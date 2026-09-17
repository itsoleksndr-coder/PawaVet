import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Pet } from "../../types";
export function EditPatient({
  pet,
  onClose,
}: {
  pet: Pet;
  onClose: () => void;
}) {
  const { updatePet } = useData();
  const [name, setName] = useState(pet.name),
    [weight, setWeight] = useState(String(pet.weightKg)),
    [notes, setNotes] = useState(pet.notes || ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3 border border-slate-700 p-4 rounded-xl"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await updatePet(pet.id, { name, weightKg: Number(weight), notes });
          onClose();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to save.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="font-bold">Edit patient</h3>
      <label className="block">
        Name
        <input
          required
          className="bg-slate-950 p-2 block w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block">
        Weight (kg)
        <input
          type="number"
          min="0"
          max="1500"
          step="0.01"
          required
          className="bg-slate-950 p-2 block w-full"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </label>
      <label className="block">
        Notes
        <textarea
          className="bg-slate-950 p-2 block w-full"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      <button disabled={busy} className="bg-teal-600 rounded p-2">
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
