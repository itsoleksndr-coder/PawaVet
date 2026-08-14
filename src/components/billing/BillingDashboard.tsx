import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { Invoice } from "../../types";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  Building2,
  Lock,
} from "lucide-react";

interface BillingDashboardProps {
  onOpenCreateInvoice: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  onOpenCreateInvoice,
}) => {
  const { isPetOwner, activeClinic, hasPermission, isClinicAdmin, isReceptionist } = useAuth();
  const { invoices, payInvoice } = useData();

  const [search, setSearch] = useState("");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          inv.petName.toLowerCase().includes(q) ||
          inv.ownerName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [invoices, search]);

  const totalCollected = invoices.filter((i) => i.status === "Paid").reduce((acc, curr) => acc + curr.total, 0);
  const pendingTotal = invoices.filter((i) => i.status === "Pending").reduce((acc, curr) => acc + (curr.total - curr.amountPaid), 0);

  const canCreate = hasPermission("billing:create_invoice");

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessing(true);
    setTimeout(() => {
      payInvoice(payingInvoice.id, "Credit Card");
      setIsProcessing(false);
      setPayingInvoice(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60 font-mono uppercase">
              Financial Management & Checkout
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredInvoices.length} {filteredInvoices.length === 1 ? "Invoice" : "Invoices"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            {isPetOwner ? "My Billing & Statements" : "Practice Invoicing & Payment Gateways"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isPetOwner
              ? "View transparent itemized veterinary statements and settle invoices with secure payment."
              : `Point-of-sale checkout and itemized billing isolated to ${activeClinic?.name}.`}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenCreateInvoice}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Total Succeeded Collections</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${totalCollected.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">Processed via PCI-DSS encrypted card tokenization</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Pending Accounts Receivable</div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ${pendingTotal.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">Outstanding balance awaiting client checkout</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice ID, pet name, or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-teal-950 text-teal-400 border border-teal-800 font-mono text-xs font-bold">
                <CreditCard className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-bold">{inv.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-extrabold text-white text-sm">{inv.petName}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-medium">Client: {inv.ownerName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      inv.status === "Paid"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-amber-950 text-amber-300 border-amber-800"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Issued: <span className="text-slate-300">{inv.date}</span> • Due:{" "}
                  <span className="text-slate-300">{inv.dueDate}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inv.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-800 font-mono"
                    >
                      {item.description} (${item.unitPrice})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 self-end md:self-center">
              <div className="text-right">
                <div className="text-lg font-black text-white font-mono">
                  ${inv.total.toFixed(2)}
                </div>
                {inv.status === "Pending" && (
                  <div className="text-[11px] text-amber-400 font-mono">
                    Balance: ${(inv.total - inv.amountPaid).toFixed(2)}
                  </div>
                )}
              </div>

              {inv.status === "Pending" && (
                <button
                  onClick={() => setPayingInvoice(inv)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 cursor-pointer"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Processing Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 text-slate-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white">Point-of-Sale Checkout</h3>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invoice ID:</span>
                <span className="font-mono text-white font-bold">{payingInvoice.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Patient:</span>
                <span className="text-white font-bold">{payingInvoice.petName}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-200">Total Amount Due:</span>
                <span className="text-teal-400 font-mono">
                  ${(payingInvoice.total - payingInvoice.amountPaid).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Expires</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">CVC</label>
                  <input
                    type="text"
                    defaultValue="842"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isProcessing ? "Authorizing via Stripe Gateway..." : "Authorize & Settle Payment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
