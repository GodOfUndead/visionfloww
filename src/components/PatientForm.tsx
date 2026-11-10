import React, { useState, useEffect, useRef } from 'react';
import { PatientRecord } from '../types';
import { cn, formatINR } from '../utils/formatters';
import { parseMoney } from '../services/recordStorage';
import { Camera, Calendar, Image as ImageIcon, X, Check, ArrowLeft, Upload } from 'lucide-react';

interface PatientFormProps {
  onSubmit: (record: Omit<PatientRecord, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: PatientRecord | null;
  onCancel?: () => void;
}

interface FormState {
  date: string;
  patientName: string;
  mobileNumber: string;
  address: string;
  re: string;
  le: string;
  add: string;
  glass: string;
  frame: string;
  drop: string;
  totalBill: number | string;
  receivedPayment: number | string;
  profit: number | string;
  glassesDelivered: boolean;
  deliveryDate: string | null;
  imageUrl: string | null;
  clinicName: string;
}

const getDefaultDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => {
    if (initialData) {
      return {
        date: initialData.date || getDefaultDate(),
        patientName: initialData.patientName || '',
        mobileNumber: initialData.mobileNumber || '',
        address: initialData.address || '',
        re: initialData.re || '',
        le: initialData.le || '',
        add: initialData.add || '',
        glass: initialData.glass || '',
        frame: initialData.frame || '',
        drop: initialData.drop || '',
        totalBill: initialData.totalBill !== undefined ? initialData.totalBill : '',
        receivedPayment: initialData.receivedPayment !== undefined ? initialData.receivedPayment : '',
        profit: initialData.profit !== undefined ? initialData.profit : '',
        glassesDelivered: Boolean(initialData.glassesDelivered),
        deliveryDate: initialData.deliveryDate || null,
        imageUrl: initialData.imageUrl || null,
        clinicName: initialData.clinicName || 'VisionFlow Clinic',
      };
    }
    return {
      date: getDefaultDate(),
      patientName: '',
      mobileNumber: '',
      address: '',
      re: '',
      le: '',
      add: '',
      glass: '',
      frame: '',
      drop: '',
      totalBill: '',
      receivedPayment: '',
      profit: '',
      glassesDelivered: false,
      deliveryDate: null,
      imageUrl: null,
      clinicName: 'VisionFlow Clinic',
    };
  });

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date || getDefaultDate(),
        patientName: initialData.patientName || '',
        mobileNumber: initialData.mobileNumber || '',
        address: initialData.address || '',
        re: initialData.re || '',
        le: initialData.le || '',
        add: initialData.add || '',
        glass: initialData.glass || '',
        frame: initialData.frame || '',
        drop: initialData.drop || '',
        totalBill: initialData.totalBill !== undefined ? initialData.totalBill : '',
        receivedPayment: initialData.receivedPayment !== undefined ? initialData.receivedPayment : '',
        profit: initialData.profit !== undefined ? initialData.profit : '',
        glassesDelivered: Boolean(initialData.glassesDelivered),
        deliveryDate: initialData.deliveryDate || null,
        imageUrl: initialData.imageUrl || null,
        clinicName: initialData.clinicName || 'VisionFlow Clinic',
      });
    }
  }, [initialData]);

  // Handle standard input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Quick 1-tap "Fully Paid" helper
  const handleSetFullPayment = () => {
    const bill = Number(form.totalBill) || 0;
    setForm(prev => ({ ...prev, receivedPayment: bill }));
  };

  // Image Upload handler
  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim()) {
      alert('Please enter the patient name.');
      return;
    }

    const totalBillNum = parseMoney(form.totalBill);
    const receivedNum = parseMoney(form.receivedPayment);
    const profitNum = parseMoney(form.profit);

    await onSubmit({
      date: form.date || getDefaultDate(),
      patientName: form.patientName.trim(),
      mobileNumber: form.mobileNumber.trim(),
      address: form.address.trim(),
      re: form.re.trim(),
      le: form.le.trim(),
      add: form.add.trim(),
      glass: form.glass.trim(),
      frame: form.frame.trim(),
      drop: form.drop.trim(),
      totalBill: totalBillNum,
      receivedPayment: receivedNum,
      profit: profitNum,
      glassesDelivered: form.glassesDelivered,
      deliveryDate: form.glassesDelivered ? form.deliveryDate || getDefaultDate() : null,
      imageUrl: form.imageUrl,
      clinicName: form.clinicName,
    });
  };

  const totalBillVal = Number(form.totalBill) || 0;
  const receivedVal = Number(form.receivedPayment) || 0;
  const balanceDue = Math.max(0, totalBillVal - receivedVal);

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hidden inputs for Android Camera capture vs Gallery selection */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => e.target.files && handleImageFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files && handleImageFile(e.target.files[0])}
      />

      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tighter italic">
              {initialData ? 'Edit Patient Record' : 'New Patient Record'}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-600 font-bold uppercase tracking-tight">
              {initialData ? 'Update optical & billing record' : 'Enter patient prescription & billing'}
            </p>
          </div>
        </div>

        {/* Date chip */}
        <div className="bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-brutal-sm flex items-center gap-1.5 shrink-0">
          <Calendar size={13} className="text-zinc-600" />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="bg-transparent text-xs font-black outline-none cursor-pointer"
          />
        </div>
      </header>

      {/* Main Neo-Brutalist Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-black shadow-brutal p-3 sm:p-5 md:p-8 space-y-5 md:space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
          {/* SECTION 1: Patient Basics & Prescription */}
          <div className="space-y-4">
            {/* Patient Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-black uppercase mb-1">
                  PATIENT NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.patientName}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-black uppercase mb-1">
                  MOBILE NUMBER
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  name="mobileNumber"
                  placeholder="e.g. 9876543210"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-black text-black uppercase mb-1">
                ADDRESS
              </label>
              <textarea
                name="address"
                rows={2}
                placeholder="Street address, colony, city..."
                value={form.address}
                onChange={handleChange}
                className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            {/* Power Grid (R E, L E, ADD) */}
            <div className="p-3.5 bg-[#fcf9f1] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  EYE PRESCRIPTION POWER
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  (Sph / Cyl / Axis)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* R E */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-700 uppercase mb-1 text-center">
                    R E (RIGHT)
                  </label>
                  <input
                    type="text"
                    name="re"
                    placeholder="-1.25"
                    value={form.re}
                    onChange={handleChange}
                    className="w-full border-2 border-black p-2 text-base sm:text-sm font-black bg-white text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* L E */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-700 uppercase mb-1 text-center">
                    L E (LEFT)
                  </label>
                  <input
                    type="text"
                    name="le"
                    placeholder="-1.00"
                    value={form.le}
                    onChange={handleChange}
                    className="w-full border-2 border-black p-2 text-base sm:text-sm font-black bg-white text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* ADD */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-700 uppercase mb-1 text-center">
                    ADD (NEAR)
                  </label>
                  <input
                    type="text"
                    name="add"
                    placeholder="+2.00"
                    value={form.add}
                    onChange={handleChange}
                    className="w-full border-2 border-black p-2 text-base sm:text-sm font-black bg-white text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Glass and Frame */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-black uppercase mb-1">
                  GLASS (LENS TYPE)
                </label>
                <input
                  type="text"
                  name="glass"
                  placeholder="e.g. Blue-Cut Progressive"
                  value={form.glass}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-black uppercase mb-1">
                  FRAME (MODEL / BRAND)
                </label>
                <input
                  type="text"
                  name="frame"
                  placeholder="e.g. Aviator Gunmetal"
                  value={form.frame}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>

            {/* Drop */}
            <div>
              <label className="block text-[11px] font-black text-black uppercase mb-1">
                DROP (EYE DROPS / MEDICINE)
              </label>
              <input
                type="text"
                name="drop"
                placeholder="e.g. Moxifloxacin 0.5% Drops"
                value={form.drop}
                onChange={handleChange}
                className="w-full border-2 border-black p-2.5 text-base sm:text-sm font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>

          {/* SECTION 2: Android Camera / Photo, Financials, Delivery */}
          <div className="space-y-4">
            {/* Photo & Android Camera Capture */}
            <div>
              <label className="block text-[11px] font-black text-black uppercase mb-1">
                PATIENT PHOTO / PRESCRIPTION SLIP
              </label>

              {form.imageUrl ? (
                <div className="relative aspect-[16/8] sm:aspect-video w-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group">
                  <img
                    src={form.imageUrl}
                    alt="Patient preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-white text-black px-3 py-1.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-sm active:bg-zinc-100"
                    >
                      <Camera size={14} /> Retake
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, imageUrl: null }))}
                      className="bg-red-500 text-white px-3 py-1.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-sm active:bg-red-600"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-black bg-[#fcf9f1] p-3 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-3 px-2 bg-accent text-black border-2 border-black font-black uppercase text-xs flex flex-col items-center justify-center gap-1 shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      <Camera size={20} strokeWidth={2.5} />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-2 bg-[#e1fff3] text-black border-2 border-black font-black uppercase text-xs flex flex-col items-center justify-center gap-1 shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      <Upload size={20} strokeWidth={2.5} />
                      <span>From Gallery</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Financials & Billing Container */}
            <div className="p-3.5 sm:p-4 bg-white border-2 border-black shadow-brutal space-y-3.5">
              <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-tight text-black">
                  BILLING &amp; PAYMENT DETAILS
                </h4>
                <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#e1f4ff] border border-black uppercase">
                  INR (₹)
                </span>
              </div>

              {/* Total Bill & Received Payment */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Bill */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1">
                    TOTAL BILL (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-black text-black">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      name="totalBill"
                      required
                      placeholder="0"
                      value={form.totalBill}
                      onChange={handleChange}
                      className="w-full border-2 border-black pl-7 pr-2 py-2.5 text-base sm:text-sm font-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent text-right"
                    />
                  </div>
                </div>

                {/* Received Payment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black text-black uppercase">
                      RECEIVED (₹)
                    </label>
                    {totalBillVal > 0 && (
                      <button
                        type="button"
                        onClick={handleSetFullPayment}
                        className="text-[9px] font-black uppercase underline text-blue-700 hover:text-black cursor-pointer"
                      >
                        = Full
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-black text-black">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      name="receivedPayment"
                      placeholder="0"
                      value={form.receivedPayment}
                      onChange={handleChange}
                      className="w-full border-2 border-black pl-7 pr-2 py-2.5 text-base sm:text-sm font-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:outline-none focus:ring-2 focus:ring-accent text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Profit & Remaining Balance Preview */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Profit */}
                <div className="p-2.5 bg-[#e1fff3] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black text-emerald-950 uppercase">
                      PROFIT (₹)
                    </label>
                    <button
                      type="button"
                      title="Auto-estimate 45% standard optical margin"
                      onClick={() => {
                        const bill = Number(form.totalBill) || 0;
                        setForm(p => ({ ...p, profit: Math.round(bill * 0.45) }));
                      }}
                      className="text-[8px] font-black uppercase underline text-emerald-800 hover:text-black cursor-pointer"
                    >
                      ~45%
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-900">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      name="profit"
                      placeholder="0"
                      value={form.profit}
                      onChange={handleChange}
                      className="w-full bg-white border border-black pl-5 pr-2 py-1.5 text-sm font-black outline-none text-right text-emerald-950"
                    />
                  </div>
                </div>

                {/* Remaining Balance Due */}
                <div className={cn(
                  'p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between',
                  balanceDue > 0 ? 'bg-[#ffe1e1]' : 'bg-[#e1fff3]'
                )}>
                  <span className="text-[10px] font-black uppercase tracking-tight text-black">
                    BALANCE DUE (₹)
                  </span>
                  <p className={cn(
                    'text-base sm:text-lg font-black italic tracking-tight text-right',
                    balanceDue > 0 ? 'text-red-700' : 'text-emerald-800'
                  )}>
                    {formatINR(balanceDue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Status Card */}
            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-black text-black uppercase cursor-pointer flex items-center gap-2.5 select-none">
                <input
                  type="checkbox"
                  name="glassesDelivered"
                  checked={form.glassesDelivered}
                  onChange={e => {
                    const checked = e.target.checked;
                    setForm(prev => ({
                      ...prev,
                      glassesDelivered: checked,
                      deliveryDate: checked ? prev.deliveryDate || getDefaultDate() : null,
                    }));
                  }}
                  className="w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-accent cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-xs checked:after:font-black"
                />
                <span>Glasses Delivered?</span>
              </label>

              {form.glassesDelivered && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-zinc-600 uppercase">
                    Delivery Date:
                  </span>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate || getDefaultDate()}
                    onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
                    className="border-b-2 border-black bg-transparent text-xs font-black outline-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-4 border-t-2 border-black flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-accent text-black py-3.5 px-6 font-black uppercase tracking-tight border-2 border-black shadow-brutal hover:bg-white active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 text-sm text-center"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Save Patient Record'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 px-5 bg-white text-black font-black uppercase text-xs border-2 border-black shadow-brutal hover:bg-zinc-100 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
