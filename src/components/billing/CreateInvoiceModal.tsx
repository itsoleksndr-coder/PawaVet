import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { InvoiceItem } from "../../types";
import { X, CreditCard, Plus, Trash2 } from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { pets, addInvoice } = useData();

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "item-1", description: "Comprehensive Physical Exam (DVM)", quantity: 1, unitPrice: 75.0, total: 75.0, category: "Consultation" },
  ]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(50);
  const [itemCategory, setItemCategory] = useState<InvoiceItem["category"]>("Consultation");

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!itemDesc) return;
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: itemDesc,
        quantity: itemQty,
        unitPrice: itemPrice,
        total: itemQty * itemPrice,
        category: itemCategory,
      },
    ]);
    setItemDesc("");
    setItemQty(1);
    setItemPrice(50);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, curr) => acc + curr.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
    if (!selectedPet) return;

    addInvoice({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerId: selectedPet.ownerId,
      ownerName: selectedPet.ownerName,
      ownerEmail: "client@example.com",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      items,
      subtotal: totalAmount,
      tax: 0,
      discount: 0,
      total: totalAmount,
      amountPaid: 0,
      status: "Pending",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Generate Itemized Invoice</h3>
              <p className="text-xs text-slate-400">Veterinary charge slip & client statement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Select Patient *</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-semibold"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} • Parent: {p.ownerName}
                </option>
              ))}
            </select>
          </div>

          {/* Line items list */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="font-bold text-slate-300">Invoice Line Items</div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">{it.description}</span>
                    <span className="text-slate-400 text-[11px] block">
                      {it.quantity} × ${it.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold font-mono text-teal-400">${it.total.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item input row */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Item Description"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
              />
              <input
                type="number"
                placeholder="Qty"
                value={itemQty}
                onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white text-center font-mono"
              />
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono w-20"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-slate-300">Total Balance Due:</span>
              <span className="text-teal-400 font-mono">${totalAmount.toFixed(2)}</span>
            </div>
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
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
