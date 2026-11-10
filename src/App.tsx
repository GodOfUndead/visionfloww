/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatientRecord, TabType } from './types';
import { recordStorage } from './services/recordStorage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientForm } from './components/PatientForm';
import { PatientRecords } from './components/PatientRecords';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [receiptPatient, setReceiptPatient] = useState<PatientRecord | null>(null);

  // Subscribe to storage
  useEffect(() => {
    const unsubscribe = recordStorage.subscribe(newRecords => {
      setRecords(newRecords);
    });
    return () => unsubscribe();
  }, []);

  // Show transient notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Form Submit
  const handleFormSubmit = async (recordData: Omit<PatientRecord, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      if (editingPatient) {
        await recordStorage.updateRecord(editingPatient.id, recordData);
        setSelectedPatientId(editingPatient.id);
        setEditingPatient(null);
        showToast(`Record for "${recordData.patientName}" updated successfully!`);
      } else {
        const newId = await recordStorage.addRecord(recordData);
        setSelectedPatientId(newId);
        showToast(`Patient record for "${recordData.patientName}" saved successfully!`);
      }
      setActiveTab('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error saving patient record:', err);
      showToast('Failed to save record. Please check your input.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Patient
  const handleEditPatient = (patient: PatientRecord) => {
    setEditingPatient(patient);
    setActiveTab('entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete Patient
  const handleDeletePatient = async (id: string) => {
    try {
      const patient = records.find(r => r.id === id);
      await recordStorage.deleteRecord(id);
      showToast(`Record for "${patient?.patientName || 'patient'}" deleted.`);
      if (selectedPatientId === id) {
        const remaining = records.filter(r => r.id !== id);
        setSelectedPatientId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete patient record.', 'error');
    }
  };

  // Handle Patient selection from Dashboard
  const handleSelectPatientFromDashboard = (patient: PatientRecord) => {
    setSelectedPatientId(patient.id);
    setActiveTab('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === 'entry' && activeTab !== 'entry') {
          // If switching to entry tab from menu, reset editing mode to new patient
          setEditingPatient(null);
        }
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      recordCount={records.length}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4">
          <div
            className={`p-4 border-2 border-black shadow-brutal flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-[#e1fff3] text-black'
                : 'bg-[#ffe1e1] text-red-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
            )}
            <p className="text-xs font-black uppercase tracking-tight flex-1">
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-500 hover:text-black font-black text-xs uppercase"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View Tabs */}
      {activeTab === 'dashboard' && (
        <Dashboard
          records={records}
          onSelectPatient={handleSelectPatientFromDashboard}
          onNavigateToEntry={() => {
            setEditingPatient(null);
            setActiveTab('entry');
          }}
        />
      )}

      {activeTab === 'entry' && (
        <PatientForm
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          initialData={editingPatient}
          onCancel={
            editingPatient
              ? () => {
                  setEditingPatient(null);
                  setActiveTab('list');
                }
              : undefined
          }
        />
      )}

      {activeTab === 'list' && (
        <PatientRecords
          records={records}
          onDelete={handleDeletePatient}
          onEdit={handleEditPatient}
          onPrint={(patient) => setReceiptPatient(patient)}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(p) => setSelectedPatientId(p?.id || null)}
          onNavigateToEntry={() => {
            setEditingPatient(null);
            setActiveTab('entry');
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        patient={receiptPatient}
        onClose={() => setReceiptPatient(null)}
      />
    </Layout>
  );
}
