import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  HealthState, DoctorVisit, TestResult, SymptomEntry,
  WeightEntry, BodyMeasurement, SleepEntry, Medication
} from '../types'

const initialHealthState = {
  doctorVisits: [] as DoctorVisit[],
  testResults: [] as TestResult[],
  symptoms: [] as SymptomEntry[],
  weightEntries: [] as WeightEntry[],
  bodyMeasurements: [] as BodyMeasurement[],
  sleepEntries: [] as SleepEntry[],
  medications: [] as Medication[],
  testChecklist: {} as Record<string, boolean>,
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      ...initialHealthState,

      addDoctorVisit: (visit: DoctorVisit) =>
        set((s) => ({ doctorVisits: [...s.doctorVisits, visit] })),

      updateDoctorVisit: (id: string, updates: Partial<DoctorVisit>) =>
        set((s) => ({
          doctorVisits: s.doctorVisits.map(v => v.id === id ? { ...v, ...updates } : v),
        })),

      removeDoctorVisit: (id: string) =>
        set((s) => ({ doctorVisits: s.doctorVisits.filter(v => v.id !== id) })),

      addTestResult: (result: TestResult) =>
        set((s) => ({ testResults: [...s.testResults, result] })),

      removeTestResult: (id: string) =>
        set((s) => ({ testResults: s.testResults.filter(r => r.id !== id) })),

      addSymptomEntry: (entry: SymptomEntry) =>
        set((s) => ({
          symptoms: [...s.symptoms.filter(e => e.date !== entry.date), entry],
        })),

      addWeightEntry: (entry: WeightEntry) =>
        set((s) => ({
          weightEntries: [...s.weightEntries.filter(e => e.date !== entry.date), entry]
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      addBodyMeasurement: (entry: BodyMeasurement) =>
        set((s) => ({
          bodyMeasurements: [...s.bodyMeasurements.filter(e => e.date !== entry.date), entry]
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      addSleepEntry: (entry: SleepEntry) =>
        set((s) => ({
          sleepEntries: [...s.sleepEntries.filter(e => e.date !== entry.date), entry]
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

      addMedication: (med: Medication) =>
        set((s) => ({ medications: [...s.medications, med] })),

      updateMedication: (id: string, updates: Partial<Medication>) =>
        set((s) => ({
          medications: s.medications.map(m => m.id === id ? { ...m, ...updates } : m),
        })),

      removeMedication: (id: string) =>
        set((s) => ({ medications: s.medications.filter(m => m.id !== id) })),

      toggleMedicationDay: (medId: string, date: string) =>
        set((s) => ({
          medications: s.medications.map(m =>
            m.id === medId
              ? { ...m, takenDays: { ...m.takenDays, [date]: !m.takenDays[date] } }
              : m
          ),
        })),

      toggleTestChecklist: (testName: string) =>
        set((s) => ({
          testChecklist: { ...s.testChecklist, [testName]: !s.testChecklist[testName] },
        })),
    }),
    {
      name: 'path2026-health-storage',
    }
  )
)
