import React from 'react';
import { PatientRecord } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { parseMoney } from '../services/recordStorage';
import { Printer, X, Eye } from 'lucide-react';

interface PrintReceiptModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  patient,
  onClose,
}) => {
  if (!patient) return null;

  const total = parseMoney(patient.totalBill);
  const paid = parseMoney(patient.receivedPayment);
  const due = Math.max(0, total - paid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="relative bg-white border-4 border-black shadow-brutal max-w-lg w-full p-6 md:p-8 space-y-6 my-8 print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Close Button (hidden when printing) */}
        <button
          onClick={onClose}
          className="no-print absolute right-4 top-4 w-8 h-8 bg-black text-white hover:bg-red-600 flex items-center justify-center border-2 border-black transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Receipt Header */}
        <div className="text-center border-b-4 border-black pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 bg-accent border-2 border-black flex items-center justify-center">
              <Eye size={18} className="text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              VisionFlow Eye Care
            </h1>
          </div>
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
            Optical Prescription &amp; Invoice Receipt
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Contact: +91 98000 12345 | Reg: OPT/2026/894
          </p>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs border-b-2 border-black pb-4">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Patient Name</span>
            <p className="text-base font-black uppercase text-black">{patient.patientName}</p>
            {patient.mobileNumber && (
              <p className="font-bold text-zinc-700 mt-0.5">{patient.mobileNumber}</p>
            )}
            {patient.address && (
              <p className="text-[10px] text-zinc-600 mt-0.5">{patient.address}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase text-zinc-500 block">Receipt / Date</span>
            <p className="font-mono font-bold text-black">{formatDateLabel(patient.date)}</p>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">ID: #{patient.id.substring(0, 8)}</p>
            <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 border border-black uppercase ${due > 0 ? 'bg-[#ffe1e1]' : 'bg-[#e1fff3]'}`}>
              {due > 0 ? 'PARTIAL DUE' : 'FULLY PAID'}
            </span>
          </div>
        </div>

        {/* Prescription Power Table */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-black">
            Prescription Eye Power (Diopters)
          </h3>
          <table className="w-full border-2 border-black text-center text-xs">
            <thead>
              <tr className="bg-zinc-100 border-b-2 border-black font-black uppercase text-[10px]">
                <th className="p-2 border-r-2 border-black">Eye</th>
                <th className="p-2 border-r-2 border-black">Prescription</th>
                <th className="p-2">Near ADD</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-mono">
              <tr>
                <td className="p-2 font-black border-r-2 border-black bg-zinc-50">R E (Right)</td>
                <td className="p-2 font-bold border-r-2 border-black">{patient.re || 'PLANO'}</td>
                <td className="p-2 font-bold" rowSpan={2}>{patient.add || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 font-black border-r-2 border-black bg-zinc-50">L E (Left)</td>
                <td className="p-2 font-bold border-r-2 border-black">{patient.le || 'PLANO'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Optical & Medications Dispensed */}
        <div className="space-y-2 border-t-2 border-black pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-black">
            Dispensed Optical Products &amp; Drops
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between border-b border-dashed border-zinc-300 pb-1">
              <span className="font-bold text-zinc-600">Glass / Lens:</span>
              <span className="font-black text-black">{patient.glass || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-zinc-300 pb-1">
              <span className="font-bold text-zinc-600">Frame Model:</span>
              <span className="font-black text-black">{patient.frame || '-'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="font-bold text-zinc-600">Prescribed Eye Drops:</span>
              <span className="font-black text-black">{patient.drop || '-'}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-4 bg-zinc-50 border-2 border-black space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-zinc-600 uppercase">Total Bill Amount:</span>
            <span className="font-black text-black text-sm">{formatINR(total)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-zinc-600 uppercase">Received Payment:</span>
            <span className="font-black text-black text-sm">{formatINR(paid)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t-2 border-black">
            <span className="font-black uppercase">Balance Remaining:</span>
            <span className={`font-black ${due > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatINR(due)}
            </span>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="pt-6 flex items-end justify-between text-[10px] text-zinc-600">
          <div>
            <p className="font-bold">✓ Please retain this receipt for lens warranty.</p>
            <p>Ready for delivery within 2-3 working days.</p>
          </div>
          <div className="text-center">
            <div className="w-28 border-b-2 border-black mb-1"></div>
            <span className="font-black uppercase text-[9px] text-black">Authorized Signatory</span>
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="no-print pt-4 border-t-2 border-black flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-accent text-black font-black uppercase text-xs border-2 border-black shadow-brutal hover:bg-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Receipt Now</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-black font-black uppercase text-xs border-2 border-black shadow-brutal hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
