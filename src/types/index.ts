export interface PatientRecord {
  id: string;
  createdAt: number;
  updatedAt?: number;
  
  // Specific requested fields:
  date: string;               // YYYY-MM-DD
  patientName: string;        // Patient Name
  mobileNumber: string;       // Mobile Number
  address: string;            // Address
  re: string;                 // R E (Right Eye power)
  le: string;                 // L E (Left Eye power)
  add: string;                // ADD (Near vision addition)
  glass: string;              // Glass / Lens specification
  frame: string;              // Frame specification
  drop: string;               // Eye Drop / Medications
  totalBill: number;          // Total Bill amount
  receivedPayment: number;    // Received Payment amount
  profit: number;             // Profit amount

  // Companion workflow fields for full optical clinic operations:
  glassesDelivered?: boolean;
  deliveryDate?: string | null;
  imageUrl?: string | null;
  clinicName?: string;
  notes?: string;
}

export type TabType = 'dashboard' | 'entry' | 'list';
