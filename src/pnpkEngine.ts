import { Patient, MonitoringEntry, PNPKAssessment, Priority } from './types';

export function evaluatePNPK(
  patient: Patient,
  observation: MonitoringEntry
): Omit<PNPKAssessment, 'id' | 'patientId' | 'timestamp' | 'doctorConfirmed'> {
  let group: 'Grup A' | 'Grup B' | 'Grup C' = 'Grup A';
  let priority: Priority = 'stable';
  let recommendation = 'Rawat jalan atau observasi rutin. Edukasi tanda bahaya.';
  const triggeredCriteria: string[] = [];

  // Group C Criteria (Severe Dengue)
  const isHypotensive = observation.sbp < 90 || (observation.sbp - observation.dbp < 20); // Narrow pulse pressure
  const isSevereTachycardia = observation.hr > 120;
  const isSevereBleeding = observation.warningSigns.some(s => s.toLowerCase().includes('perdarahan berat') || s.toLowerCase().includes('syok'));

  // Group B Criteria (Warning Signs)
  const hasWarningSigns = observation.warningSigns.length > 0;
  const isHctHigh = observation.hct >= 45;
  const isPltLow = observation.plt < 100;
  const isTachycardia = observation.hr > 100;

  if (isHypotensive || isSevereTachycardia || isSevereBleeding) {
    group = 'Grup C';
    priority = 'critical';
    recommendation = 'Resusitasi cairan segera (Syok/Perdarahan Berat). Pindahkan ke ICU/HCU. Evaluasi tiap 15-30 menit.';
    if (isHypotensive) triggeredCriteria.push('Hipotensi / Tekanan nadi sempit (<20 mmHg)');
    if (isSevereTachycardia) triggeredCriteria.push('Takikardia berat (>120x/mnt)');
    if (isSevereBleeding) triggeredCriteria.push('Tanda bahaya perdarahan berat/syok');
  } else if (hasWarningSigns || isHctHigh || isPltLow || isTachycardia) {
    group = 'Grup B';
    priority = 'high';
    recommendation = 'Rawat inap. Terapi cairan intravena rumatan. Observasi ketat tanda vital & diuresis tiap 2-4 jam. Pantau Hct/Plt serial.';
    if (isHctHigh) triggeredCriteria.push(`Hemokonsentrasi (Hct ${observation.hct}%)`);
    if (isPltLow) triggeredCriteria.push(`Trombositopenia (<100k)`);
    if (isTachycardia) triggeredCriteria.push(`Takikardia (${observation.hr}x/mnt)`);
    if (hasWarningSigns) triggeredCriteria.push(...observation.warningSigns);
  } else {
    // Default Group A
    priority = 'attention'; // Still needs attention for first few days
  }

  // Cap priority based on illness day (fase kritis)
  if (patient.illnessDay >= 3 && patient.illnessDay <= 6 && group === 'Grup A') {
    priority = 'attention';
    triggeredCriteria.push('Berada di fase kritis (Hari 3-6)');
    recommendation = 'Observasi rutin tiap 8-12 jam. Waspada fase kritis (Hari 3-6). Edukasi kecukupan cairan oral.';
  }

  return {
    group,
    priority,
    recommendation,
    triggeredCriteria
  };
}
