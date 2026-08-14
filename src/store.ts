import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, MonitoringEntry, TimelineEvent, Alert, PNPKAssessment, Role, DoctorNote } from './types';
import { evaluatePNPK } from './pnpkEngine';

interface AppState {
  // Auth state
  auth: { role: Role | null; userName: string | null };
  setAuth: (role: Role | null, userName: string | null) => void;
  logout: () => void;

  // Data
  patients: Patient[];
  monitoringHistory: Record<string, MonitoringEntry[]>;
  timelineEvents: Record<string, TimelineEvent[]>;
  alerts: Alert[];
  assessments: Record<string, PNPKAssessment[]>;
  doctorNotes: Record<string, DoctorNote[]>;

  // Actions
  addPatient: (patient: Patient) => void;
  addMonitoring: (patientId: string, entry: Omit<MonitoringEntry, 'id' | 'patientId' | 'timestamp'>) => void;
  confirmAssessment: (patientId: string, assessmentId: string) => void;
  overrideAssessment: (patientId: string, assessmentId: string, overrideReason: string) => void;
  markAlertReviewed: (alertId: string) => void;
  addNote: (patientId: string, note: DoctorNote) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: { role: null, userName: null },
      setAuth: (role, userName) => set({ auth: { role, userName } }),
      logout: () => set({ auth: { role: null, userName: null } }),

      patients: [
        { id: 'p1', name: 'An. Naufal R.', mrn: '24-08-001', age: '12 thn', ageMo: 144, weight: '38 kg',
          bed: 'B-07', ward: 'Rawat Inap Anak', illnessDay: 5, admissionTime: '08:12', admissionDate: '8 Agt',
          pnpkGroup: 'Grup B', dssRisk: 34, dssChange: 13, lastMonitoring: '12 mnt lalu',
          nextMonitoring: '18 mnt lagi', priority: 'high', warningSign: 'Hct meningkat',
          doctorValidated: false, pathwayStatus: 'Menunggu Validasi Dokter', gender: 'Laki-laki' },
        { id: 'p2', name: 'Tn. Ridwan S.', mrn: '24-08-002', age: '28 thn', ageMo: 336, weight: '68 kg',
          bed: 'C-03', ward: 'Rawat Inap Dewasa', illnessDay: 4, admissionTime: '14:10', admissionDate: '7 Agt',
          pnpkGroup: 'Grup B', dssRisk: 21, dssChange: 8, lastMonitoring: '45 mnt lalu',
          nextMonitoring: '15 mnt lagi', priority: 'high', warningSign: 'Muntah persisten',
          doctorValidated: false, pathwayStatus: 'Monitoring Aktif', gender: 'Laki-laki' },
        { id: 'p4', name: 'An. Dita F.', mrn: '24-08-004', age: '8 thn', ageMo: 96, weight: '24 kg',
          bed: 'B-02', ward: 'Rawat Inap Anak', illnessDay: 6, admissionTime: '06:20', admissionDate: '6 Agt',
          pnpkGroup: 'Grup C', dssRisk: 58, dssChange: 24, lastMonitoring: '5 mnt lalu',
          nextMonitoring: 'Segera', priority: 'critical', warningSign: 'Hipotensi, CRT >2 dtk',
          doctorValidated: false, pathwayStatus: 'Escalated', gender: 'Perempuan' }
      ],
      monitoringHistory: {
        'p1': [
          { id: 'm1', patientId: 'p1', timestamp: Date.now() - 3600000, time: '08:00', actor: 'Ns. Rani M.', hct: 38, plt: 120, sbp: 110, dbp: 75, hr: 88, temp: 38.1, warningSigns: [] },
          { id: 'm2', patientId: 'p1', timestamp: Date.now() - 1800000, time: '12:00', actor: 'Ns. Rani M.', hct: 39, plt: 105, sbp: 108, dbp: 72, hr: 90, temp: 37.9, warningSigns: [] },
          { id: 'm3', patientId: 'p1', timestamp: Date.now() - 900000, time: '14:20', actor: 'Ns. Rani M.', hct: 45, plt: 58, sbp: 100, dbp: 70, hr: 96, temp: 37.8, warningSigns: ['Hct meningkat', 'Trombosit turun cepat'] }
        ],
        'p2': [
          { id: 'm4a', patientId: 'p2', timestamp: Date.now() - 14400000, time: '10:00', actor: 'Ns. Rani M.', hct: 39, plt: 115, sbp: 120, dbp: 80, hr: 82, temp: 37.8, warningSigns: [] },
          { id: 'm4b', patientId: 'p2', timestamp: Date.now() - 7200000, time: '12:00', actor: 'Ns. Rani M.', hct: 40, plt: 105, sbp: 118, dbp: 80, hr: 84, temp: 37.6, warningSigns: [] },
          { id: 'm4', patientId: 'p2', timestamp: Date.now() - 2700000, time: '13:00', actor: 'Ns. Rani M.', hct: 41, plt: 90, sbp: 115, dbp: 80, hr: 85, temp: 37.5, warningSigns: ['Muntah persisten'] }
        ],
        'p4': [
          { id: 'm4c', patientId: 'p4', timestamp: Date.now() - 14400000, time: '06:30', actor: 'Dr. Budi S.', hct: 43, plt: 70, sbp: 95, dbp: 65, hr: 110, temp: 37.2, warningSigns: [] },
          { id: 'm4d', patientId: 'p4', timestamp: Date.now() - 7200000, time: '08:30', actor: 'Ns. Rani M.', hct: 45, plt: 55, sbp: 90, dbp: 60, hr: 115, temp: 36.8, warningSigns: [] },
          { id: 'm5', patientId: 'p4', timestamp: Date.now() - 3600000, time: '10:00', actor: 'Dr. Budi S.', hct: 48, plt: 40, sbp: 80, dbp: 50, hr: 130, temp: 36.5, warningSigns: ['Hipotensi', 'CRT >2 dtk', 'Akral dingin'] },
          { id: 'm6', patientId: 'p4', timestamp: Date.now() - 300000, time: '14:55', actor: 'Ns. Rani M.', hct: 50, plt: 35, sbp: 75, dbp: 45, hr: 140, temp: 36.0, warningSigns: ['Hipotensi', 'Perdarahan mukosa'] }
        ]
      },
      timelineEvents: {
        'p1': [
          { id: 't1', patientId: 'p1', timestamp: Date.now() - 7200000, time: '08:10', actor: 'Sistem', type: 'info', title: 'Pasien ditambahkan', detail: 'Dikonfirmasi dengue. Status aktif.' },
          { id: 't2', patientId: 'p1', timestamp: Date.now() - 7100000, time: '08:30', actor: 'Dr. Budi S.', type: 'validation', title: 'Penilaian PNPK', detail: 'Klasifikasi: Grup A. Divalidasi dokter.' },
          { id: 't3', patientId: 'p1', timestamp: Date.now() - 3600000, time: '10:00', actor: 'Ns. Rani M.', type: 'monitoring', title: 'Monitoring diinput', detail: 'TD 110/70, HR 88, Hct 38%, Plt 120.' },
          { id: 't4', patientId: 'p1', timestamp: Date.now() - 900000, time: '14:20', actor: 'Ns. Rani M.', type: 'lab', title: 'Laboratorium diperbarui', detail: 'Hematokrit: 45% (↑6%), Trombosit: 58 ×10³/µL.' },
          { id: 't5', patientId: 'p1', timestamp: Date.now() - 890000, time: '14:21', actor: 'Sistem', type: 'priority-change', title: 'PNPK dievaluasi ulang', detail: 'Grup B dikonfirmasi. Warning signs baru terdeteksi.' }
        ],
        'p2': [
          { id: 't6', patientId: 'p2', timestamp: Date.now() - 2800000, time: '12:50', actor: 'Sistem', type: 'info', title: 'Pasien ditambahkan', detail: 'Dikonfirmasi dengue. Status aktif.' },
          { id: 't7', patientId: 'p2', timestamp: Date.now() - 2700000, time: '13:00', actor: 'Ns. Rani M.', type: 'monitoring', title: 'Monitoring awal', detail: 'Ditemukan muntah persisten.' }
        ],
        'p4': [
          { id: 't8', patientId: 'p4', timestamp: Date.now() - 4000000, time: '09:00', actor: 'Sistem', type: 'info', title: 'Pasien ditambahkan', detail: 'Rujukan IGD.' },
          { id: 't9', patientId: 'p4', timestamp: Date.now() - 3600000, time: '10:00', actor: 'Dr. Budi S.', type: 'priority-change', title: 'Kondisi Kritis Terdeteksi', detail: 'Syok terkompensasi. Klasifikasi: Grup C.' },
          { id: 't10', patientId: 'p4', timestamp: Date.now() - 300000, time: '14:55', actor: 'Ns. Rani M.', type: 'monitoring', title: 'Monitoring memburuk', detail: 'Syok dekompensasi.' }
        ]
      },
      alerts: [
        { id: 'a1', patientId: 'p1', priority: 'high', title: 'Perubahan kondisi — warning sign baru', source: 'PNPK Rule Engine', trigger: ['Hematokrit meningkat', 'Trombosit turun cepat'], change: [{label: 'Prioritas', from: 'Perlu Evaluasi', to: 'Prioritas Tinggi'}], time: '14:21', timestamp: Date.now() - 890000, lifecycle: ['14:21 Peringatan dibuat'], acked: false },
        { id: 'a2', patientId: 'p4', priority: 'critical', title: 'Kriteria dengue berat (DSS) teridentifikasi', source: 'PNPK Rule Engine', trigger: ['Hipotensi (TD 75/45)', 'Perdarahan mukosa'], change: [{label: 'Klasifikasi PNPK', from: 'Grup B', to: 'Grup C'}], time: '14:55', timestamp: Date.now() - 300000, lifecycle: ['14:55 Peringatan dibuat'], acked: false }
      ],
      assessments: {},
      doctorNotes: {
        'p1': [
          { id: 'n1', patientId: 'p1', timestamp: Date.now() - 7100000, time: '08:30', author: 'Dr. Budi S.', title: 'Tindak Lanjut Initial Assessment', content: 'Pasien dengan dengue warning signs. PNPK Grup B dikonfirmasi. Rencana: monitoring ketat setiap 4 jam.' },
          { id: 'n2', patientId: 'p1', timestamp: Date.now() - 1700000, time: '12:20', author: 'Dr. Budi S.', title: 'Evaluasi Setelah Update Laboratorium', content: 'Hct meningkat signifikan. Plt turun. Perketat monitoring setiap 2 jam.' }
        ]
      },

      addPatient: (patient) => set((state) => {
        const id = patient.id;
        const now = Date.now();
        const initialEvent: TimelineEvent = {
          id: generateId(), patientId: id, time: new Date(now).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
          timestamp: now, actor: 'Sistem', type: 'info',
          title: 'Pasien ditambahkan', detail: `Dikonfirmasi dengue. Status aktif.`
        };

        return {
          patients: [...state.patients, patient],
          timelineEvents: { ...state.timelineEvents, [id]: [initialEvent] },
          monitoringHistory: { ...state.monitoringHistory, [id]: [] },
          assessments: { ...state.assessments, [id]: [] },
        };
      }),

      addMonitoring: (patientId, entry) => set((state) => {
        const now = Date.now();
        const fullEntry: MonitoringEntry = {
          ...entry,
          id: generateId(),
          patientId,
          timestamp: now,
        };

        const patient = state.patients.find(p => p.id === patientId);
        if (!patient) return state;

        // Auto evaluate PNPK
        const pnpkResult = evaluatePNPK(patient, fullEntry);
        const assessmentId = generateId();
        const newAssessment: PNPKAssessment = {
          id: assessmentId,
          patientId,
          timestamp: now,
          group: pnpkResult.group,
          priority: pnpkResult.priority,
          recommendation: pnpkResult.recommendation,
          triggeredCriteria: pnpkResult.triggeredCriteria,
          doctorConfirmed: false
        };

        // Generate events
        const monEvent: TimelineEvent = {
          id: generateId(), patientId, time: entry.time, timestamp: now, actor: entry.actor,
          type: 'monitoring', title: 'Monitoring diinput', 
          detail: `TD ${entry.sbp}/${entry.dbp}, HR ${entry.hr}, Hct ${entry.hct}, Plt ${entry.plt}`
        };

        const assessEvent: TimelineEvent = {
          id: generateId(), patientId, time: entry.time, timestamp: now + 1, actor: 'Sistem',
          type: 'priority-change', title: 'Penilaian PNPK Otomatis',
          detail: `Klasifikasi: ${newAssessment.group}. Menunggu validasi dokter.`
        };

        // Create alert if priority is high or critical
        let newAlert = null;
        if (newAssessment.priority === 'high' || newAssessment.priority === 'critical') {
          newAlert = {
            id: generateId(), patientId, priority: newAssessment.priority,
            title: `Peringatan Klinis: ${newAssessment.group}`, source: 'PNPK Rule Engine',
            trigger: newAssessment.triggeredCriteria, change: [{ label: 'Klasifikasi PNPK', from: patient.pnpkGroup, to: newAssessment.group }],
            time: entry.time, timestamp: now, lifecycle: [`${entry.time} Peringatan dibuat otomatis`], acked: false
          };
        }

        return {
          monitoringHistory: { ...state.monitoringHistory, [patientId]: [...(state.monitoringHistory[patientId] || []), fullEntry] },
          assessments: { ...state.assessments, [patientId]: [...(state.assessments[patientId] || []), newAssessment] },
          timelineEvents: { ...state.timelineEvents, [patientId]: [...(state.timelineEvents[patientId] || []), monEvent, assessEvent] },
          alerts: newAlert ? [...state.alerts, newAlert] : state.alerts,
          patients: state.patients.map(p => p.id === patientId ? {
            ...p,
            lastMonitoring: 'Baru saja',
            pnpkGroup: newAssessment.group,
            priority: newAssessment.priority,
            doctorValidated: false,
            pathwayStatus: 'Menunggu Validasi Dokter',
            warningSign: fullEntry.warningSigns.length > 0 ? fullEntry.warningSigns[0] : '—'
          } : p)
        };
      }),

      confirmAssessment: (patientId, assessmentId) => set((state) => {
        const now = Date.now();
        const timeStr = new Date(now).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
        
        const assessEvent: TimelineEvent = {
          id: generateId(), patientId, time: timeStr, timestamp: now, actor: state.auth.userName || 'Dokter',
          type: 'validation', title: 'Penilaian Dikonfirmasi', detail: `Penilaian disetujui dokter.`
        };

        return {
          assessments: {
            ...state.assessments,
            [patientId]: state.assessments[patientId].map(a => a.id === assessmentId ? { ...a, doctorConfirmed: true } : a)
          },
          timelineEvents: { ...state.timelineEvents, [patientId]: [...(state.timelineEvents[patientId] || []), assessEvent] },
          patients: state.patients.map(p => p.id === patientId ? { ...p, doctorValidated: true, pathwayStatus: 'Monitoring Aktif' } : p)
        };
      }),

      overrideAssessment: (patientId, assessmentId, overrideReason) => set((state) => {
        const now = Date.now();
        const timeStr = new Date(now).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
        
        const assessEvent: TimelineEvent = {
          id: generateId(), patientId, time: timeStr, timestamp: now, actor: state.auth.userName || 'Dokter',
          type: 'review', title: 'Clinical Override', detail: `Alasan: ${overrideReason}`
        };

        return {
          assessments: {
            ...state.assessments,
            [patientId]: state.assessments[patientId].map(a => a.id === assessmentId ? { ...a, doctorConfirmed: true, overrideReason } : a)
          },
          timelineEvents: { ...state.timelineEvents, [patientId]: [...(state.timelineEvents[patientId] || []), assessEvent] },
          patients: state.patients.map(p => p.id === patientId ? { ...p, doctorValidated: true, pathwayStatus: 'Monitoring Aktif' } : p)
        };
      }),

      markAlertReviewed: (alertId) => set((state) => ({
        alerts: state.alerts.map(a => a.id === alertId ? { ...a, acked: true } : a)
      })),

      addNote: (patientId, note) => set((state) => ({
        doctorNotes: { ...state.doctorNotes, [patientId]: [...(state.doctorNotes[patientId] || []), { ...note, id: generateId() }] }
      }))

    }),
    {
      name: 'denguard-storage-v4',
    }
  )
);
