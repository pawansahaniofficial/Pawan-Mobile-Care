import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  FileText,
  User,
  Phone,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { RepairBooking } from '../types';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from '../components/InvoiceModal';

interface TrackRepairPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

const STATUS_ORDER = [
  'Pending',
  'Confirmed',
  'Device Received',
  'Under Diagnosis',
  'Awaiting Approval',
  'In Progress',
  'Ready for Pickup',
  'Completed'
];

export const TrackRepairPage: React.FC<TrackRepairPageProps> = ({ onNavigate, initialParams }) => {
  const { showToast } = useToast();

  const [bookingNumber, setBookingNumber] = useState(initialParams?.bookingNumber || '');
  const [phone, setPhone] = useState(initialParams?.phone || '');
  const [booking, setBooking] = useState<RepairBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingNumber.trim()) {
      showToast('error', 'Booking ID Required', 'Please enter your booking reference (e.g. PMR-2026-0814)');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      let url = `/api/bookings/track?bookingNumber=${encodeURIComponent(bookingNumber.trim())}`;
      if (phone.trim()) {
        url += `&phone=${encodeURIComponent(phone.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Not Found', data.error);
        setBooking(null);
      } else {
        setBooking(data.booking);
      }
    } catch (err: any) {
      showToast('error', 'Search Error', err.message);
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams?.bookingNumber) {
      handleSearch();
    }
  }, [initialParams]);

  const handleApproveQuote = async (approved: boolean) => {
    if (!booking) return;
    try {
      const res = await fetch(`/api/bookings/${booking.id}/approve-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });
      const data = await res.json();
      if (res.ok) {
        setBooking(data.booking);
        showToast('success', approved ? 'Quotation Accepted!' : 'Quotation Declined', data.message);
      }
    } catch (e: any) {
      showToast('error', 'Error', e.message);
    }
  };

  // Compute status step index
  const currentStatusIndex = booking ? STATUS_ORDER.indexOf(booking.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Phone Repair Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Enter your unique booking number (e.g. <strong>PMR-2026-0814</strong>) to inspect live lab progress.
        </p>
      </div>

      {/* Lookup Card */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
      >
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Repair Booking Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. PMR-2026-0814"
              value={bookingNumber}
              onChange={e => setBookingNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase focus:border-sky-500 focus:outline-hidden"
              required
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phone Number (Verification)
          </label>
          <input
            type="tel"
            placeholder="e.g. 9841234567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Live Booking Details Box */}
      {booking && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Repair Case
                </span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                  #{booking.bookingNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {booking.brand} {booking.model}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Service: {booking.serviceTitle}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                <span>Print Job Invoice</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold">
                {booking.status}
              </div>
            </div>
          </div>

          {/* Step-by-Step Visual Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Lab Workflow Progress:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATUS_ORDER.slice(0, 4).map((st, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div
                    key={st}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500/20'
                        : isPassed
                        ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <p className="font-bold">{st}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              {STATUS_ORDER.slice(4, 8).map((st, idx) => {
                const realIndex = idx + 4;
                const isPassed = currentStatusIndex >= realIndex;
                const isCurrent = currentStatusIndex === realIndex;

                return (
                  <div
                    key={st}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500/20'
                        : isPassed
                        ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold">0{realIndex + 1}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <p className="font-bold">{st}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quotation Approval Box (When status is Under Diagnosis or Awaiting Approval) */}
          {booking.quotedCost && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/60 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Official Repair Quotation
                  </span>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    NPR {booking.quotedCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Includes genuine replacement component and precision labor with 180-day warranty.
                  </p>
                </div>

                <div className="text-right">
                  {booking.customerApprovedQuote === true ? (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Approved by You</span>
                    </span>
                  ) : booking.customerApprovedQuote === false ? (
                    <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                      Declined
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold animate-pulse">
                      Action Required
                    </span>
                  )}
                </div>
              </div>

              {booking.customerApprovedQuote === undefined && (
                <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Please approve or decline so our technician knows whether to proceed:
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleApproveQuote(false)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-rose-300 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                    >
                      Decline Quote
                    </button>
                    <button
                      onClick={() => handleApproveQuote(true)}
                      className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      Approve & Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technician Diagnostic Notes */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-500" />
                <span>Lab Technician Notes:</span>
              </span>
              <span className="text-xs text-slate-500">
                Assigned Tech: <strong>{booking.assignedTechnician || 'Senior Lab Specialist'}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed">
              {booking.technicianNotes || 'Device safely logged in. Preparing optical microscope diagnostic evaluation.'}
            </p>
          </div>
        </div>
      )}

      {searched && !booking && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No booking record found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Please verify your booking reference format (e.g. <strong>PMR-2026-0814</strong>) or contact shop customer support.
          </p>
        </div>
      )}

      {invoiceModalOpen && booking && (
        <InvoiceModal
          booking={booking}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
