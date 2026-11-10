import React from 'react';
import { PatientRecord } from '../types';
import { formatINR, formatDateLabel, cn } from '../utils/formatters';
import { 
  Eye, 
  Printer, 
  Edit2, 
  Trash2, 
  Phone, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock
} from 'lucide-react';

interface PatientDetailCardProps {
  patient: PatientRecord;
  onEdit: (patient: PatientRecord) => void;
  onDelete: (id: string) => Promise<void>;
  onPrint: (patient: PatientRecord) => void;
  isDeleting: boolean;
  isMobile?: boolean;
}

export const PatientDetailCard: React.FC<PatientDetailCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onPrint,
  isDeleting,
  isMobile = false,
}) => {
  const total = Number(patient.totalBill) || 0;
  const paid = Number(patient.receivedPayment) || 0;
  const profit = Number(patient.profit) || 0;
  const remaining = Math.max(0, total - paid);

  const handleDelete = () => {
    if (window.confirm(`Delete record for "${patient.patientName}"? This cannot be undone.`)) {
      onDelete(patient.id);
    }
  };

  return (
    <div className={cn(
      'bg-white overflow-hidden',
      !isMobile && 'border-2 border-black shadow-brutal'
    )}>
      {/* Patient Photo or Optical Header */}
      {patient.imageUrl ? (
        <div className="aspect-video w-full border-b-2 border-black overflow-hidden relative">
          <img
            src={patient.imageUrl}
            alt={patient.patientName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/6] w-full bg-[#fcf9f1] flex flex-col items-center justify-center text-zinc-500 border-b-2 border-black">
          <div className="w-10 h-10 bg-accent border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] mb-1">
            <Eye size={20} className="text-black stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-black">
            Optical Prescription
          </span>
        </div>
      )}

      {/* Patient Information & Details */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Patient Name & Date */}
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tighter italic">
                {patient.patientName || 'Unnamed Patient'}
              </h3>
              <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">
                {patient.clinicName || 'VisionFlow Eye Care'}
              </p>
            </div>
            <span className={cn(
              'text-[9px] font-black tracking-widest px-2 py-0.5 uppercase border border-black italic shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
              remaining > 0 ? 'bg-[#ffe1e1] text-red-900' : 'bg-[#e1fff3] text-emerald-900'
            )}>
              {remaining > 0 ? 'DUE' : 'PAID'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 truncate">
              <Phone size={13} className="shrink-0 text-zinc-500" />
              <span className="truncate">{patient.mobileNumber || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-700 justify-end">
              <Calendar size={13} className="shrink-0 text-zinc-500" />
              <span>{formatDateLabel(patient.date)}</span>
            </div>
          </div>

          {patient.address && (
            <div className="flex items-start gap-1.5 font-bold text-zinc-700 text-xs mt-2">
              <MapPin size={13} className="shrink-0 mt-0.5 text-zinc-500" />
              <span className="break-words">{patient.address}</span>
            </div>
          )}
        </div>

        {/* Prescription Power Box (R E, L E, ADD) */}
        <div className="p-3 bg-[#fcf9f1] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-2">
          <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center justify-between">
            <span>Prescription Power</span>
            <span className="text-[9px] font-bold text-black">(Diopters)</span>
          </h4>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-black/15 pb-1">
              <span className="font-bold text-zinc-600 uppercase text-[10px]">R E (Right Eye)</span>
              <span className="font-black text-black">{patient.re || '-'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-black/15 pb-1">
              <span className="font-bold text-zinc-600 uppercase text-[10px]">L E (Left Eye)</span>
              <span className="font-black text-black">{patient.le || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-600 uppercase text-[10px]">ADD (Near)</span>
              <span className="font-black text-black">{patient.add || '-'}</span>
            </div>
          </div>
        </div>

        {/* Optical Items (Glass, Frame, Drop) */}
        <div className="space-y-2 text-xs">
          <div className="p-2 bg-white border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
              Glass (Lens)
            </span>
            <p className="font-black text-black mt-0.5">{patient.glass || '-'}</p>
          </div>

          <div className="p-2 bg-white border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
              Frame
            </span>
            <p className="font-black text-black mt-0.5">{patient.frame || '-'}</p>
          </div>

          <div className="p-2 bg-white border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
              Drop (Eye Drops)
            </span>
            <p className="font-black text-black mt-0.5">{patient.drop || '-'}</p>
          </div>
        </div>

        {/* Delivery Status */}
        <div className={cn(
          'p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between',
          patient.glassesDelivered ? 'bg-[#e1fff3]' : 'bg-[#ffe1e1]/60'
        )}>
          <div className="flex items-center gap-1.5">
            {patient.glassesDelivered ? (
              <CheckCircle size={15} className="text-emerald-800" />
            ) : (
              <Clock size={15} className="text-amber-800" />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider text-black">
              Delivery
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-black uppercase">
              {patient.glassesDelivered ? 'Delivered' : 'Pending'}
            </span>
            {patient.glassesDelivered && patient.deliveryDate && (
              <p className="text-[9px] font-bold text-zinc-600">
                {formatDateLabel(patient.deliveryDate)}
              </p>
            )}
          </div>
        </div>

        {/* Financial Breakdown (Total Bill, Received Payment, Balance Due, Profit) */}
        <div className="pt-3 border-t-2 border-black space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              Total Bill
            </span>
            <span className="text-sm font-black text-black">
              {formatINR(total)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              Received Payment
            </span>
            <span className="text-sm font-black text-black">
              {formatINR(paid)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              Balance Due
            </span>
            <span className={cn(
              'text-base font-black italic',
              remaining > 0 ? 'text-red-700' : 'text-emerald-700'
            )}>
              {formatINR(remaining)}
            </span>
          </div>

          <div className="flex justify-between items-center p-2 bg-[#e1fff3] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mt-1.5">
            <span className="text-[10px] text-emerald-950 font-black uppercase tracking-wider">
              Net Profit
            </span>
            <span className="text-sm font-black text-emerald-950">
              {formatINR(profit)}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t-2 border-black flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(patient)}
              className="py-3 bg-accent text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-brutal-sm hover:bg-white active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onPrint(patient)}
              className="py-3 bg-[#e1f4ff] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-brutal-sm hover:bg-white active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer size={13} />
              <span>Receipt</span>
            </button>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-2 bg-[#ffe1e1] text-red-900 hover:text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
