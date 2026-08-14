import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Pet, Species } from "../../types";
import {
  PawPrint,
  Search,
  Filter,
  Plus,
  Heart,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Activity,
  Calendar,
  Building2,
} from "lucide-react";

interface PetListProps {
  onSelectPet: (pet: Pet) => void;
  onOpenAddPet: () => void;
}

export const PetList: React.FC<PetListProps> = ({
  onSelectPet,
  onOpenAddPet,
}) => {
  const { isPetOwner, activeClinic, hasPermission } = useAuth();
  const { pets } = useData();

  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      if (speciesFilter !== "all" && pet.species !== speciesFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          pet.name.toLowerCase().includes(q) ||
          pet.breed.toLowerCase().includes(q) ||
          pet.ownerName.toLowerCase().includes(q) ||
          pet.microchipNumber.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [pets, speciesFilter, search]);

  const canAddPet = hasPermission("pets:create");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              {isPetOwner ? "My Household" : "Patient Directory"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredPets.length} {filteredPets.length === 1 ? "Patient" : "Patients"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            {isPetOwner ? "My Pets & Health Records" : "Clinical Patient Registry"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isPetOwner
              ? "Comprehensive health profiles, microchip registry, and vaccine passports for your pets."
              : `Active patient roster isolated to ${activeClinic?.name}.`}
          </p>
        </div>

        {canAddPet && (
          <button
            onClick={onOpenAddPet}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isPetOwner ? "Register New Pet" : "Add Patient"}</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by pet name, breed, pet parent, or microchip #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 w-full sm:w-auto"
        >
          <option value="all">All Species</option>
          <option value="dog">Canine (Dogs)</option>
          <option value="cat">Feline (Cats)</option>
          <option value="rabbit">Exotic (Rabbits)</option>
          <option value="bird">Avian (Birds)</option>
        </select>
      </div>

      {/* Grid of Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => onSelectPet(pet)}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={pet.photoUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80"}
                    alt={pet.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-teal-400 transition-colors">
                      {pet.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {pet.breed} • {pet.age}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      {pet.sex}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    pet.vaccinationStatus === "Up to date"
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                      : pet.vaccinationStatus === "Due soon"
                      ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                      : "bg-rose-950/80 text-rose-300 border-rose-800/60"
                  }`}
                >
                  {pet.vaccinationStatus}
                </span>
              </div>

              {/* Patient Attributes */}
              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 my-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight:</span>
                  <span className="font-mono font-bold text-white">{pet.weightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Microchip:</span>
                  <span className="font-mono text-slate-400 text-[11px] truncate max-w-[140px]">
                    {pet.microchipNumber}
                  </span>
                </div>
                {!isPetOwner && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pet Parent:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[140px]">
                      {pet.ownerName}
                    </span>
                  </div>
                )}
              </div>

              {/* Allergies / Alerts */}
              {pet.allergies.length > 0 && (
                <div className="flex items-center space-x-1.5 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Allergy: {pet.allergies.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-bold">
              <span>Inspect Full Health Chart</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
          <PawPrint className="w-12 h-12 mx-auto text-slate-700 mb-2" />
          <p className="text-sm font-semibold">No patients found matching your search.</p>
        </div>
      )}
    </div>
  );
};
