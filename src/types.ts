export type Role = 'doctor' | 'nurse';
export type Priority = 'critical' | 'high' | 'attention' | 'stable';

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: string;
  ageMo: number;
  weight: string;
  bed: string;
  ward: string;
  illnessDay: number;
  admissionTime: string;
  admissionDate: string;
  pnpkGroup: string;
  dssRisk: number;
  dssChange: number;
  lastMonitoring: string;
  nextMonitoring: string;
  priority: Priority;
  warningSign: string;
  doctorValidated: boolean;
  pathwayStatus: string;
  gender: 'Laki-laki' | 'Perempuan';
}

export interface MonitoringEntry {
  id: string;
  patientId: string;
  time: string;
  timestamp: number;
  actor: string;
  hct: number;
  plt: number;
  sbp: number;
  dbp: number;
  hr: number;
  temp: number;
  warningSigns: string[];
  corrected?: boolean;
  corrections?: Array<{ field: string; from: string; to: string; reason: string; by: string; at: string }>;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  time: string;
  timestamp: number;
  author: string;
  title: string;
  content: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  time: string;
  timestamp: number;
  actor: string;
  type: 'info' | 'validation' | 'monitoring' | 'lab' | 'priority-change' | 'review' | 'pending';
  title: string;
  detail: string;
}

export interface Alert {
  id: string;
  patientId: string;
  priority: Priority;
  title: string;
  source: string;
  trigger: string[];
  change: Array<{ label: string; from: string; to: string }>;
  time: string;
  timestamp: number;
  lifecycle: string[];
  acked: boolean;
}

export interface PNPKAssessment {
  id: string;
  patientId: string;
  timestamp: number;
  group: 'Grup A' | 'Grup B' | 'Grup C' | 'Belum Dinilai';
  priority: Priority;
  recommendation: string;
  triggeredCriteria: string[];
  doctorConfirmed: boolean;
  overrideReason?: string;
}
