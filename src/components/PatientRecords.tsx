import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types';
import { PatientDetailCard } from './PatientDetailCard';
import { formatINR, formatDateLabel, formatMonthLabel, cn } from '../utils/formatters';
import { parseMoney } from '../services/recordStorage';
import { 
  Download, 
  Search, 
  Calendar, 
  ChevronRight, 
  Users, 
  Inbox, 
  X,
  Plus
} from 'lucide-react';

interface PatientRecordsProps {
  records: PatientRecord[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (patient: PatientRecord) => void;
  onPrint: (patient: PatientRecord) => void;
  selectedPatientId?: string | null;
  onSelectPatient: (patient: PatientRecord | null) => void;
  onNavigateToEntry: () => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  records,
  onDelete,
  onEdit,
  onPrint,
  selectedPatientId,
  onSelectPatient,
  onNavigateToEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered list based on month and search
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        // Month filter
        if (selectedMonth !== 'all' && (!r.date || !r.date.startsWith(selectedMonth))) {
          return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (r.patientName && r.patientName.toLowerCase().includes(q)) ||
          (r.mobileNumber && r.mobileNumber.toLowerCase().includes(q)) ||
          (r.glass && r.glass.toLowerCase().includes(q)) ||
          (r.frame && r.frame.toLowerCase().includes(q)) ||
          (r.drop && r.drop.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [records, selectedMonth, searchQuery]);

  // Selected patient
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return filteredRecords[0] || records[0] || null;
    return records.find(r => r.id === selectedPatientId) || filteredRecords[0] || null;
  }, [selectedPatientId, records, filteredRecords]);

  // Handle patient card click
  const handleItemClick = (patient: PatientRecord) => {
    onSelectPatient(patient);
    setMobileDetailOpen(true);
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setMobileDetailOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV matching exact requested fields
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('No patient records to export.');
      return;
    }

    const headers = [
      'Date',
      'Patient Name',
      'Mobile Number',
      'Address',
      'R E',
      'L E',
      'ADD',
      'Glass',
      'Frame',
      'Drop',
      'Total Bill (INR)',
      'Received Payment (INR)',
      'Remaining Balance (INR)',
      'Profit (INR)',
      'Glasses Delivered',
      'Delivery Date',
    ];

    const rows = records.map(r => {
      const total = parseMoney(r.totalBill);
      const paid = parseMoney(r.receivedPayment);
      const due = Math.max(0, total - paid);
      const profit = parseMoney(r.profit);

      return [
        `"${r.date || ''}"`,
        `"${(r.patientName || '').replace(/"/g, '""')}"`,
        `"${(r.mobileNumber || '').replace(/"/g, '""')}"`,
        `"${(r.address || '').replace(/"/g, '""')}"`,
        `"${(r.re || '').replace(/"/g, '""')}"`,
        `"${(r.le || '').replace(/"/g, '""')}"`,
        `"${(r.add || '').replace(/"/g, '""')}"`,
        `"${(r.glass || '').replace(/"/g, '""')}"`,
        `"${(r.frame || '').replace(/"/g, '""')}"`,
        `"${(r.drop || '').replace(/"/g, '""')}"`,
        total,
        paid,
        due,
        profit,
        r.glassesDelivered ? 'YES' : 'NO',
        `"${r.deliveryDate || ''}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visionflow_optical_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header and Export Action */}
      <header className="flex flex-col gap-3 border-b-2 border-black pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tighter italic">
              Patient Records
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-600 font-bold">
              Complete clinical, optical &amp; financial history
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="bg-[#e1f4ff] text-black px-3 sm:px-4 py-2 font-black uppercase tracking-tight hover:bg-white transition-all shadow-brutal-sm border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={onNavigateToEntry}
              className="bg-accent text-black px-3 sm:px-4 py-2 font-black uppercase tracking-tight hover:bg-white transition-all shadow-brutal-sm border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus size={14} strokeWidth={3} />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white border-2 border-black p-2.5 sm:p-3 shadow-brutal">
          {/* Month selector */}
          <div className="w-full sm:w-48 relative shrink-0">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 bg-transparent border-none appearance-none font-black uppercase tracking-tight text-xs outline-none cursor-pointer"
            >
              <option value="all">All Records</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight size={14} className="rotate-90 stroke-[3]" />
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-zinc-300" />

          {/* Search box */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
            <input
              type="text"
              placeholder="Search patient, phone, lens, frame..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-transparent border-none font-bold text-xs sm:text-sm outline-none placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Two Column Layout: Records List & Detailed Patient Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Patient List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-black shadow-brutal flex flex-col h-full">
            {/* List Header */}
            <div className="p-3 border-b-2 border-black bg-zinc-50 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-tight text-xs italic">
                {selectedMonth === 'all' ? 'All Patients' : formatMonthLabel(selectedMonth)}
              </h3>
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5">
                {filteredRecords.length}
              </span>
            </div>

            {/* List of Patients */}
            <div className="divide-y-2 divide-zinc-100 overflow-y-auto max-h-[750px]">
              {filteredRecords.map(patient => {
                const isSelected = selectedPatient?.id === patient.id;
                const total = parseMoney(patient.totalBill);
                const paid = parseMoney(patient.receivedPayment);
                const due = Math.max(0, total - paid);
                const profit = parseMoney(patient.profit);
                const initial = patient.patientName?.trim() ? patient.patientName.trim()[0].toUpperCase() : '?';

                return (
                  <div
                    key={patient.id}
                    onClick={() => handleItemClick(patient)}
                    className={cn(
                      'p-3.5 sm:p-4 flex justify-between items-center cursor-pointer transition-all border-l-4 select-none',
                      isSelected
                        ? 'bg-accent/40 border-l-black'
                        : 'hover:bg-[#e1fff3] active:bg-[#e1fff3] border-l-transparent bg-white'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 shrink-0 bg-white border-2 border-black flex items-center justify-center font-black text-sm shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-black text-black uppercase tracking-tight truncate">
                            {patient.patientName || 'Unnamed Patient'}
                          </p>
                          {patient.glassesDelivered && (
                            <span className="shrink-0 text-[8px] font-black px-1 py-0.2 bg-[#e1fff3] border border-black uppercase text-emerald-900">
                              Delivered
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5 truncate">
                          {formatDateLabel(patient.date)} {patient.mobileNumber ? `• ${patient.mobileNumber}` : ''}
                        </p>

                        {/* Power & Optical tags */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {(patient.re || patient.le) && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-zinc-100 border border-black/30">
                              RE:{patient.re || '-'} | LE:{patient.le || '-'} {patient.add ? `| ADD:${patient.add}` : ''}
                            </span>
                          )}
                          {patient.frame && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#e1f4ff] border border-black/30 text-zinc-800 truncate max-w-[140px]">
                              {patient.frame}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side billing snapshot */}
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-black text-black italic">
                        {formatINR(total)}
                      </p>
                      <div className="flex flex-col items-end gap-0.5 mt-0.5">
                        <span
                          className={cn(
                            'text-[8px] sm:text-[9px] font-black tracking-wider px-1.5 py-0.5 uppercase border border-black italic',
                            due > 0 ? 'bg-[#ffe1e1] text-red-900' : 'bg-[#e1fff3] text-emerald-900'
                          )}
                        >
                          {due > 0 ? `DUE ${formatINR(due)}` : 'PAID'}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800">
                          + {formatINR(patient.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredRecords.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center">
                  <Inbox size={36} className="text-zinc-300 mb-2 stroke-1" />
                  <p className="font-black uppercase tracking-tight text-zinc-400 text-xs">
                    {searchQuery ? 'No matching records found' : 'No patient records recorded yet.'}
                  </p>
                  <button
                    onClick={onNavigateToEntry}
                    className="mt-3 px-3 py-1.5 bg-accent text-black font-black uppercase text-xs border-2 border-black shadow-brutal-sm hover:bg-white cursor-pointer"
                  >
                    + Add New Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Desktop Patient Detail View */}
        <div className="hidden lg:block">
          {selectedPatient ? (
            <div className="sticky top-6">
              <PatientDetailCard
                patient={selectedPatient}
                onEdit={onEdit}
                onDelete={handleDelete}
                onPrint={onPrint}
                isDeleting={isDeleting}
              />
            </div>
          ) : (
            <div className="bg-white border-2 border-black p-8 text-center shadow-brutal flex flex-col items-center justify-center min-h-[250px]">
              <Users size={32} className="text-zinc-300 mb-2 stroke-1" />
              <p className="text-xs font-black uppercase tracking-tight text-zinc-400">
                Select a patient to inspect prescription &amp; billing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Patient Details */}
      {mobileDetailOpen && selectedPatient && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0">
          <div className="bg-white border-t-4 border-black w-full max-h-[92vh] overflow-y-auto p-4 relative shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Drag / Dismiss Handle */}
            <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-3" />

            <button
              onClick={() => setMobileDetailOpen(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black cursor-pointer active:scale-95"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <PatientDetailCard
              patient={selectedPatient}
              onEdit={(p) => {
                setMobileDetailOpen(false);
                onEdit(p);
              }}
              onDelete={handleDelete}
              onPrint={(p) => {
                setMobileDetailOpen(false);
                onPrint(p);
              }}
              isDeleting={isDeleting}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
