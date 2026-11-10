import { PatientRecord } from '../types';

const STORAGE_KEY = 'visionflow_patients_v1';

type Listener = (records: PatientRecord[]) => void;
const listeners = new Set<Listener>();

function notify() {
  const records = getRecords();
  listeners.forEach(fn => fn(records));
}

export function parseMoney(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

export function getRecords(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: PatientRecord[] = JSON.parse(raw);
    // Sanitize any existing records to guarantee proper numbers
    return parsed.map(r => ({
      ...r,
      totalBill: parseMoney(r.totalBill),
      receivedPayment: parseMoney(r.receivedPayment),
      profit: parseMoney(r.profit),
    }));
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return [];
  }
}

export function saveRecords(records: PatientRecord[]): void {
  try {
    const sanitized = records.map(r => ({
      ...r,
      totalBill: parseMoney(r.totalBill),
      receivedPayment: parseMoney(r.receivedPayment),
      profit: parseMoney(r.profit),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    notify();
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

export const recordStorage = {
  subscribe(callback: Listener): () => void {
    listeners.add(callback);
    callback(getRecords());
    return () => {
      listeners.delete(callback);
    };
  },

  async addRecord(record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<string> {
    const records = getRecords();
    const id = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newRecord: PatientRecord = {
      ...record,
      id,
      createdAt: Date.now(),
      totalBill: parseMoney(record.totalBill),
      receivedPayment: parseMoney(record.receivedPayment),
      profit: parseMoney(record.profit),
    };
    records.unshift(newRecord);
    saveRecords(records);
    return id;
  },

  async updateRecord(id: string, updates: Partial<PatientRecord>): Promise<void> {
    const records = getRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        ...updates,
        updatedAt: Date.now(),
        totalBill: updates.totalBill !== undefined ? parseMoney(updates.totalBill) : parseMoney(records[idx].totalBill),
        receivedPayment: updates.receivedPayment !== undefined ? parseMoney(updates.receivedPayment) : parseMoney(records[idx].receivedPayment),
        profit: updates.profit !== undefined ? parseMoney(updates.profit) : parseMoney(records[idx].profit),
      };
      saveRecords(records);
    }
  },

  async deleteRecord(id: string): Promise<void> {
    const records = getRecords().filter(r => r.id !== id);
    saveRecords(records);
  },

  clearAllRecords(): void {
    saveRecords([]);
  },
};
