import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types';
import { formatINR, formatMonthLabel, formatDateLabel, cn } from '../utils/formatters';
import { parseMoney } from '../services/recordStorage';
import { Calendar, ChevronRight, TrendingUp, Users, AlertCircle, Plus, Eye, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  records: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
  onNavigateToEntry: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  onSelectPatient,
  onNavigateToEntry,
}) => {
  // Current month default: e.g. "2026-11"
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Extract all available months from records
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const current = new Date();
    const curMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    set.add(curMonth);

    records.forEach(r => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.substring(0, 7));
      }
    });

    return Array.from(set).sort().reverse();
  }, [records]);

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    if (selectedMonth === 'all') return records;
    return records.filter(r => r.date && r.date.startsWith(selectedMonth));
  }, [records, selectedMonth]);

  // Compute metrics: Total Revenue, Received Payment, Pending Due, Profit, and Patient count
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalProfit = 0;

    filteredRecords.forEach(r => {
      const bill = parseMoney(r.totalBill);
      const rec = parseMoney(r.receivedPayment);
      const prof = parseMoney(r.profit);
      const due = Math.max(0, bill - rec);

      totalRevenue += bill;
      totalReceived += rec;
      totalPending += due;
      totalProfit += prof;
    });

    return {
      total: Math.round(totalRevenue * 100) / 100,
      received: Math.round(totalReceived * 100) / 100,
      remaining: Math.round(totalPending * 100) / 100,
      profit: Math.round(totalProfit * 100) / 100,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // If no records in the entire app, render Android-first welcome and quick-start card
  if (records.length === 0) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-6">
        <div className="bg-white border-2 border-black p-6 sm:p-8 text-center shadow-brutal space-y-5">
          <div className="w-16 h-16 bg-accent border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Eye size={36} className="text-black stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">
              Welcome to VisionFlow
            </h2>
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-tight mt-1">
              Android Optical Clinic Management
            </p>
          </div>

          <div className="p-4 bg-[#fcf9f1] border-2 border-black text-left space-y-2 text-xs font-bold text-zinc-700">
            <p className="font-black text-black uppercase tracking-wider text-[11px]">
              Ready to manage:
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>Patient eye power prescriptions (R E, L E, ADD)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>Lenses (Glass), Frames &amp; Eye Drops</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>Total bill, received payments &amp; profit tracking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span>WhatsApp prescription sharing &amp; photo capture</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onNavigateToEntry}
            className="w-full py-4 bg-accent text-black font-black uppercase tracking-tight border-2 border-black shadow-brutal hover:bg-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Add First Patient</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header and Month Filter */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tighter italic">
            Clinic Overview
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-600 font-bold uppercase tracking-tight">
            Monthly patient and financial summary
          </p>
        </div>

        {/* Month Selector dropdown in Neo-Brutalist card */}
        <div className="bg-white border-2 border-black px-3 py-1.5 shadow-brutal flex items-center gap-2 self-start sm:self-auto">
          <Calendar size={16} className="text-zinc-600" />
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none appearance-none font-black uppercase tracking-tight text-xs outline-none cursor-pointer pr-5 text-black"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
              <ChevronRight size={13} className="rotate-90 text-black stroke-[3]" />
            </div>
          </div>
        </div>
      </header>

      {/* Metric Cards Grid - 2x2 on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-3.5 sm:p-5 border-2 border-black shadow-brutal bg-[#e1f4ff]">
          <div className="text-[10px] font-black text-black uppercase tracking-wider mb-1 truncate">
            {selectedMonth === 'all' ? 'Revenue' : `${formatMonthLabel(selectedMonth)} Rev`}
          </div>
          <p className="text-lg sm:text-2xl font-black tracking-tight uppercase italic text-black truncate">
            {formatINR(metrics.total)}
          </p>
        </div>

        {/* Received Payment */}
        <div className="p-3.5 sm:p-5 border-2 border-black shadow-brutal bg-white">
          <div className="text-[10px] font-black text-black uppercase tracking-wider mb-1 truncate">
            Received
          </div>
          <p className="text-lg sm:text-2xl font-black tracking-tight uppercase italic text-black truncate">
            {formatINR(metrics.received)}
          </p>
        </div>

        {/* Pending Balance */}
        <div className={cn(
          "p-3.5 sm:p-5 border-2 border-black shadow-brutal",
          metrics.remaining > 0 ? "bg-[#ffe1e1]" : "bg-zinc-100"
        )}>
          <div className="text-[10px] font-black text-black uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="truncate">Pending</span>
            {metrics.remaining > 0 && <AlertCircle size={12} className="text-red-600 shrink-0" />}
          </div>
          <p className={cn(
            "text-lg sm:text-2xl font-black tracking-tight uppercase italic truncate",
            metrics.remaining > 0 ? "text-red-700" : "text-zinc-600"
          )}>
            {formatINR(metrics.remaining)}
          </p>
        </div>

        {/* Total Profit */}
        <div className="p-3.5 sm:p-5 border-2 border-black shadow-brutal bg-[#e1fff3]">
          <div className="text-[10px] font-black text-black uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="truncate">Profit</span>
            <TrendingUp size={12} className="text-emerald-700 shrink-0" />
          </div>
          <p className="text-lg sm:text-2xl font-black tracking-tight uppercase italic text-emerald-900 truncate">
            {formatINR(metrics.profit)}
          </p>
        </div>
      </div>

      {/* Patient Count & Quick Action Strip */}
      <div className="bg-white border-2 border-black p-3 shadow-brutal flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase">
          <Users size={16} className="text-zinc-600" />
          <span>
            {metrics.count} Patient{metrics.count === 1 ? '' : 's'} {selectedMonth === 'all' ? 'Recorded' : `in ${formatMonthLabel(selectedMonth)}`}
          </span>
        </div>

        <button
          onClick={onNavigateToEntry}
          className="bg-accent text-black px-3 py-1.5 text-xs font-black uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} strokeWidth={3} />
          <span>New</span>
        </button>
      </div>

      {/* Recent Activity Table / List */}
      <section className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <div className="p-3 sm:p-4 border-b-2 border-black flex items-center justify-between bg-zinc-50">
          <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-tighter">
            Recent Patients
          </h3>
          <span className="text-[10px] font-black text-zinc-500 uppercase">
            {filteredRecords.length} in this period
          </span>
        </div>

        <div className="divide-y-2 divide-zinc-100">
          {filteredRecords.slice(0, 8).map((patient) => {
            const initial = patient.patientName?.trim() ? patient.patientName.trim()[0].toUpperCase() : '?';
            const due = Math.max(0, (patient.totalBill || 0) - (patient.receivedPayment || 0));

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#fcf9f1] active:bg-accent/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-accent flex items-center justify-center text-black font-black text-sm border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-black uppercase tracking-tight truncate">
                      {patient.patientName || 'Unnamed Patient'}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 truncate">
                      {formatDateLabel(patient.date)} {patient.mobileNumber ? `• ${patient.mobileNumber}` : ''}
                    </p>
                    {(patient.glass || patient.frame) && (
                      <p className="text-[9px] font-bold text-zinc-600 truncate mt-0.5">
                        {patient.frame ? `F: ${patient.frame} ` : ''}{patient.glass ? `G: ${patient.glass}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-black italic">
                      {formatINR(patient.totalBill)}
                    </p>
                    <span
                      className={cn(
                        'text-[8px] sm:text-[9px] font-black tracking-wider px-1.5 py-0.5 uppercase border border-black inline-block mt-0.5',
                        due > 0 ? 'bg-[#ffe1e1] text-red-900' : 'bg-[#e1fff3] text-emerald-900'
                      )}
                    >
                      {due > 0 ? `DUE ${formatINR(due)}` : 'PAID'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-400" />
                </div>
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center">
              <p className="font-black uppercase tracking-tight text-zinc-400 text-xs">
                No activity recorded for this period.
              </p>
              <button
                onClick={onNavigateToEntry}
                className="mt-3 px-3 py-1.5 bg-accent text-black font-black uppercase text-xs border-2 border-black shadow-brutal-sm hover:bg-white"
              >
                + Add Patient
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
