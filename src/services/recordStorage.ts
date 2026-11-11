import { PatientRecord } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';

const LOCAL_CACHE_KEY = 'visionflow_patients_v1';
const PATIENTS_COLLECTION = 'patients';

type Listener = (records: PatientRecord[]) => void;
const listeners = new Set<Listener>();

// In-memory cache
let currentRecords: PatientRecord[] = [];

// Helper to strictly sanitize money
export function parseMoney(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

// Load cached records from localStorage
function getLocalCache(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return [];
    const parsed: PatientRecord[] = JSON.parse(raw);
    return parsed.map(r => ({
      ...r,
      totalBill: parseMoney(r.totalBill),
      receivedPayment: parseMoney(r.receivedPayment),
      profit: parseMoney(r.profit),
    }));
  } catch (err) {
    console.error('Error reading local cache:', err);
    return [];
  }
}

// Save to localStorage cache
function setLocalCache(records: PatientRecord[]): void {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving local cache:', err);
  }
}

function notify(records: PatientRecord[]) {
  currentRecords = records;
  setLocalCache(records);
  listeners.forEach(fn => fn(records));
}

// Initialize memory with local cache first for instant UI rendering
currentRecords = getLocalCache();

// Set up active real-time Firestore listener across all devices
let isListenerActive = false;

function initRealtimeSync() {
  if (isListenerActive) return;
  isListenerActive = true;

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    
    // Check if initial local records need migration to Firestore
    getDocs(colRef).then(snapshot => {
      if (snapshot.empty) {
        const local = getLocalCache();
        if (local.length > 0) {
          // Sync existing local records to Firestore so they are visible on all other devices
          local.forEach(rec => {
            const docRef = doc(db, PATIENTS_COLLECTION, rec.id);
            setDoc(docRef, rec).catch(err => {
              console.error('Migration error:', err);
            });
          });
        }
      }
    }).catch(err => {
      console.warn('Initial check notice:', err);
    });

    // Real-time listener for multi-device sync
    onSnapshot(
      colRef,
      (snapshot) => {
        const remoteRecords: PatientRecord[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          remoteRecords.push({
            id: docSnap.id,
            date: data.date || '',
            patientName: data.patientName || '',
            mobileNumber: data.mobileNumber || '',
            address: data.address || '',
            re: data.re || '',
            le: data.le || '',
            add: data.add || '',
            glass: data.glass || '',
            frame: data.frame || '',
            drop: data.drop || '',
            totalBill: parseMoney(data.totalBill),
            receivedPayment: parseMoney(data.receivedPayment),
            profit: parseMoney(data.profit),
            glassesDelivered: Boolean(data.glassesDelivered),
            deliveryDate: data.deliveryDate || null,
            imageUrl: data.imageUrl || null,
            clinicName: data.clinicName || 'VisionFlow Clinic',
            createdAt: Number(data.createdAt) || Date.now(),
            updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
          });
        });

        // Sort by createdAt descending (newest first)
        remoteRecords.sort((a, b) => b.createdAt - a.createdAt);
        notify(remoteRecords);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, PATIENTS_COLLECTION);
      }
    );
  } catch (err) {
    console.error('Failed to setup Firestore listener:', err);
  }
}

// Start sync immediately
initRealtimeSync();

export const recordStorage = {
  subscribe(callback: Listener): () => void {
    listeners.add(callback);
    // Call immediately with current in-memory cache
    callback(currentRecords);
    return () => {
      listeners.delete(callback);
    };
  },

  async addRecord(record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<string> {
    const id = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newRecord: PatientRecord = {
      ...record,
      id,
      createdAt: Date.now(),
      totalBill: parseMoney(record.totalBill),
      receivedPayment: parseMoney(record.receivedPayment),
      profit: parseMoney(record.profit),
    };

    // Optimistic local update
    const updated = [newRecord, ...currentRecords];
    notify(updated);

    // Save to Firestore cloud database for instant multi-device sync
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    try {
      await setDoc(docRef, newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${PATIENTS_COLLECTION}/${id}`);
    }

    return id;
  },

  async updateRecord(id: string, updates: Partial<PatientRecord>): Promise<void> {
    const idx = currentRecords.findIndex(r => r.id === id);
    if (idx !== -1) {
      const merged: PatientRecord = {
        ...currentRecords[idx],
        ...updates,
        updatedAt: Date.now(),
        totalBill: updates.totalBill !== undefined ? parseMoney(updates.totalBill) : parseMoney(currentRecords[idx].totalBill),
        receivedPayment: updates.receivedPayment !== undefined ? parseMoney(updates.receivedPayment) : parseMoney(currentRecords[idx].receivedPayment),
        profit: updates.profit !== undefined ? parseMoney(updates.profit) : parseMoney(currentRecords[idx].profit),
      };

      // Optimistic local update
      const updated = [...currentRecords];
      updated[idx] = merged;
      notify(updated);

      // Cloud Firestore sync
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      try {
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Date.now(),
          totalBill: merged.totalBill,
          receivedPayment: merged.receivedPayment,
          profit: merged.profit,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${PATIENTS_COLLECTION}/${id}`);
      }
    }
  },

  async deleteRecord(id: string): Promise<void> {
    // Optimistic local removal
    const updated = currentRecords.filter(r => r.id !== id);
    notify(updated);

    // Cloud Firestore delete
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PATIENTS_COLLECTION}/${id}`);
    }
  },

  clearAllRecords(): void {
    currentRecords.forEach(r => {
      this.deleteRecord(r.id).catch(console.error);
    });
  },
};
