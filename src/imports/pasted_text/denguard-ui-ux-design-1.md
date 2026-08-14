Design a complete high-fidelity UI/UX for DENGUARD, a tablet-first responsive web-based Clinical Decision Support System for healthcare professionals managing CONFIRMED DENGUE patients.

IMPORTANT BRAND RULE:
Use the DENGUARD GSM, logo, typography, color palette, iconography, graphical elements, and visual identity already available in this Figma file as the PRIMARY visual reference.

Do not redesign the logo.
Do not invent a new brand identity.
Do not turn DENGUARD into a generic blue hospital dashboard.
Translate the existing GSM into a professional clinical UI design system.

If a UI rule is not specified in the GSM, derive it conservatively while prioritizing:
- clinical readability
- low cognitive load
- fast information scanning
- strong visual hierarchy
- accessibility
- traceability
- patient safety
- professional hospital workflow

The UI must feel:
clinical,
calm,
precise,
modern,
trustworthy,
evidence-oriented,
and human-centered.

Avoid:
- futuristic AI interface
- neon glow
- glassmorphism
- excessive gradients
- decorative charts
- unnecessary dashboard cards
- robot imagery
- consumer health app aesthetics
- marketing landing-page styling

==================================================
A. PRODUCT DEFINITION
==================================================

Product:
DENGUARD

Type:
Clinical Decision Support System.

Primary users:
1. Doctor
2. Nurse

Patient scope:
ONLY patients who have already been clinically confirmed as dengue.

DENGUARD IS NOT:
- a dengue diagnostic application
- a replacement for clinical judgment
- an automatic treatment decision engine
- an automatic discharge system
- an automatic prescription system

DENGUARD supports three main clinical questions:

1. Pasien mana yang perlu diprioritaskan sekarang?
2. Bagaimana kondisi pasien berubah selama perawatan?
3. Siapa yang menunjukkan peningkatan risiko Dengue Shock Syndrome?

The product contains two connected clinical functions:

MODULE 1
PNPK-Based Prioritization & Digital Clinical Pathway

MODULE 2
Dynamic DSS Risk Prediction

The modules must NEVER feel like separate applications.

The conceptual relationship is:

PNPK
= What is the patient’s CURRENT clinical state?

LONGITUDINAL MONITORING
= How is the patient changing over time?

DSS RISK
= How is the patient’s FUTURE risk changing?

==================================================
B. MAIN NAVIGATION
==================================================

The sidebar must contain ONLY THREE primary navigation buttons:

1. Dashboard
2. Peringatan
3. Pasien

Do NOT add:
- Clinical Pathway
- Monitoring
- DSS Risk
- Reports

to the main sidebar.

Those features belong inside each individual patient.

Sidebar structure:

DENGUARD Logo

Dashboard
Peringatan
Pasien

bottom:
User identity
Role
Settings
Logout

Example:

DENGUARD

[ Dashboard ]
[ Peringatan ]
[ Pasien ]

------------------

Dr. Rahma
Dokter Anak

Settings
Logout

==================================================
C. FIGMA FILE STRUCTURE
==================================================

Create the following pages:

00 — Brand Reference
01 — Foundations
02 — Components
03 — Information Architecture
04 — Doctor Flow
05 — Nurse Flow
06 — Dashboard
07 — Alerts
08 — Patient List
09 — Patient Detail
10 — Tablet Responsive
11 — Prototype
12 — UX Notes

Use:
- Auto Layout
- reusable components
- variants
- Figma variables
- consistent naming
- developer-friendly layers

Use an 8pt spacing system.

Primary frame:
1280 × 800 tablet landscape.

Secondary responsive frame:
1440 × 1024 desktop.

Tablet is the PRIMARY clinical environment.

Touch target minimum:
44 px.

==================================================
D. DESIGN SYSTEM
==================================================

Derive UI tokens from the existing GSM.

Create:

BRAND TOKENS
Brand / Primary
Brand / Secondary
Brand / Accent

SURFACE
Surface / Background
Surface / Primary
Surface / Secondary
Surface / Elevated

TEXT
Text / Primary
Text / Secondary
Text / Muted
Text / Inverse

BORDER
Border / Default
Border / Strong

CLINICAL STATUS
Status / Critical
Status / High
Status / Review
Status / Stable
Status / Information

IMPORTANT:
Never communicate clinical state through color alone.

Every important status must use:

ICON
+
TEXT LABEL
+
COLOR

Example:

[warning icon]
PRIORITAS TINGGI

not merely a red background.

Maintain WCAG AA contrast.

==================================================
E. CORE COMPONENTS
==================================================

Create reusable components:

Navigation:
- sidebar
- collapsed sidebar
- top bar
- breadcrumbs

Buttons:
- primary
- secondary
- ghost
- destructive
- icon
- confirm
- clinical override

Inputs:
- text
- number
- date
- time
- dropdown
- checkbox
- radio
- textarea
- measurement field + unit

Clinical status:
- Priority Badge
- PNPK Status Badge
- Warning Sign Badge
- Illness Day Badge
- DSS Risk Badge
- Monitoring Due Badge
- Doctor Validation Badge
- Clinical Override Badge

Cards:
- Patient Card
- Alert Card
- PNPK Recommendation Card
- Monitoring Card
- Trend Card
- DSS Risk Card
- Explainability Card
- Discharge Readiness Card

Data:
- patient table
- clinical timeline
- monitoring table
- audit log

Overlay:
- clinical alert drawer
- PNPK evidence drawer
- add monitoring drawer
- clinical override modal
- export report modal

System states:
- loading
- empty
- error
- unavailable
- insufficient data
- model out-of-scope

==================================================
F. DASHBOARD PAGE
==================================================

GOAL:

The doctor should immediately answer:

“Siapa yang membutuhkan perhatian saya sekarang?”

The Dashboard is NOT a hospital analytics page.

Do NOT prioritize:
- monthly dengue cases
- revenue
- hospital occupancy
- generic statistics

Top header:

Dashboard

Subtitle:
“Ringkasan kondisi pasien dengue aktif dan peringatan terbaru.”

Show compact summary cards:

Pasien Aktif
Prioritas Tinggi
Peringatan Aktif
Monitoring Terlambat

Example:

Pasien Aktif          24
Prioritas Tinggi       4
Peringatan Aktif       6
Monitoring Terlambat   2

Main section:

PASIEN MEMBUTUHKAN PERHATIAN

Patient rows:

PRIORITY
PATIENT
BED
ILLNESS DAY
PNPK STATUS
LATEST CHANGE
DSS RISK
LAST MONITORING
ACTION

Example:

HIGH

An. Nadira
Bed B-07

Hari Sakit 5

PNPK:
Grup B

Perubahan:
Hct meningkat
Platelet menurun

DSS Risk:
34% ↑

Monitoring:
12 menit lalu

[Review]

Doctor should be able to open the patient directly.

Second section:

PERINGATAN TERBARU

Example:

CRITICAL
An. Nadira
Severe dengue criteria identified
2 menit lalu
[Review]

HIGH
Tn. Bagus
Warning sign baru
5 menit lalu
[Review]

Third smaller section:

STATUS CLINICAL PATHWAY

Belum dimulai
Menunggu validasi dokter
Monitoring aktif
Reassessment due
Discharge review

==================================================
G. ALERT / PERINGATAN PAGE
==================================================

This page must answer:

WHAT changed?
WHO is affected?
WHY was the alert triggered?
WHEN did it happen?
WHAT needs doctor review?

Page title:
Peringatan Klinis

Summary:

Critical
High
Review Needed
Resolved

Filters:

Severity:
Semua
Critical
High
Review

Status:
Belum Ditinjau
Sudah Ditinjau
Resolved

Source:
PNPK
Monitoring
DSS Risk
Data Quality

Date:
Today
7 days
Custom

Search:
Cari nama pasien / MRN

==================================================
H. ALERT LIST DESIGN
==================================================

Every alert card must contain:

Severity
Patient
MRN
Bed
Alert title
Trigger reason
Timestamp
Source
Review action

Example:

CRITICAL

An. Nadira
MR 220319
Bed B-07

Severe dengue criteria identified

Trigger:
• Poor peripheral perfusion
• Pulse pressure decreased
• Urine output decreased

Detected:
14:21

Source:
PNPK Rule Engine

[Review]

Never display vague alert copy such as:

“Patient critical.”

==================================================
I. ALERT DETAIL USER FLOW
==================================================

When doctor clicks Review:

open a detailed alert drawer or dedicated page.

Structure:

ALERT DETAIL

Patient:
An. Nadira
12 tahun
Bed B-07

Alert:
Clinical deterioration

Detected:
14:21

---------------------------------

APA YANG BERUBAH?

Pulse Pressure
32 → 18 mmHg

Urine Output
1.3 → 0.6 ml/kg/h

Perfusion
Normal → Poor

---------------------------------

DASAR SISTEM

Source:
PNPK Rule Engine

Matched criteria:
[show rule criteria]

---------------------------------

PERUBAHAN STATUS

Previous:
Group B

Current Recommendation:
Group C

---------------------------------

ACTIONS

[Open Patient]
[Mark as Reviewed]

If doctor disagrees:

[Clinical Override]

Clinical Override must require:

Alternative clinical decision
+
Clinical reason
+
Doctor note

==================================================
J. ALERT LIFECYCLE
==================================================

Alerts must have lifecycle:

NEW
↓
REVIEWED
↓
ACTION RECORDED
↓
RESOLVED

Store audit history.

Example:

14:21
Alert generated

14:24
Opened by Dr. Rahma

14:26
Marked reviewed

14:29
Clinical note added

IMPORTANT:

Do NOT generate duplicate alerts for the same active issue.

If an existing warning is updated:

Alert #12
Updated 3 times

instead of generating multiple duplicate alerts.

==================================================
K. ALERT SOURCES
==================================================

Create 4 alert categories:

1. PNPK / Clinical
Example:
new warning sign
classification change
severe dengue criteria

2. Monitoring
Example:
monitoring overdue
required parameter missing

3. DSS Risk
Example:
risk trajectory increased

4. System / Data
Example:
model unavailable
insufficient data

DSS risk must NOT automatically determine clinical priority.

Do not design:
“Risk >70% = Critical”

unless clinically validated.

Prefer:

“Risiko DSS meningkat — perlu ditinjau.”

==================================================
L. PATIENT PAGE
==================================================

Title:
Pasien

Top right:
[+ Tambah Pasien]

Subtitle:
“Kelola pasien confirmed dengue dan status clinical pathway.”

Search:

Cari nama / MRN / bed...

==================================================
M. PATIENT FILTERS
==================================================

Create filters:

STATUS PASIEN
Active
Discharged

TANGGAL MASUK
Hari ini
7 hari terakhir
Custom

PRIORITY
Critical
High
Review
Stable

PNPK
For pediatric/adolescent:
Group A
Group B
Group C

For adult:
show adult PNPK pathway categories implemented by the system.

Do NOT automatically reuse pediatric Group A/B/C terminology for adults.

CLINICAL PATHWAY STATUS

Belum Dimulai
Assessment Berjalan
Menunggu Validasi Dokter
Monitoring Aktif
Reassessment Due
Escalated
Discharge Review
Completed

MONITORING

Up to date
Due soon
Overdue

DSS PREDICTION

Available
Risk Increased
Unavailable

UNIT

IGD
Ward
ICU

==================================================
N. PATIENT SORTING
==================================================

Create sorting options:

Terbaru masuk
Terlama masuk
Nama A–Z
Nama Z–A
Prioritas tertinggi
Monitoring paling overdue
Illness day
Terakhir diperbarui

Optional if clinically validated:
DSS Risk tertinggi

==================================================
O. PATIENT TABLE
==================================================

Columns:

Patient
Admission
Illness Day
PNPK
Priority
Clinical Pathway
DSS Risk
Monitoring
Action

Example:

An. Nadira

Masuk:
8 Aug 08:12

Hari Sakit:
5

PNPK:
Group B

Priority:
High

Clinical Pathway:
Monitoring Aktif

DSS:
34% ↑

Monitoring:
12 min ago

[Review]

Row click opens patient detail.

==================================================
P. ADD PATIENT FLOW
==================================================

Doctor clicks:

+ Tambah Pasien

Use a simple 3-step flow.

STEP 1
IDENTITAS

MRN
Nama
Tanggal lahir
Jenis kelamin
Berat badan
Ward
Bed
Tanggal / jam masuk

STEP 2
DENGUE EPISODE

Status:
Confirmed Dengue

Confirmation Method:
NS1
PCR
Serology
Medical Record

Confirmation Date

Symptom Onset Date

Automatically calculate:

Illness Day

STEP 3

Review

[Tambahkan Pasien]

After save:

“Pasien berhasil ditambahkan.”

Clinical Pathway:
BELUM DIMULAI

CTA:

[Mulai PNPK Assessment]

IMPORTANT:
Do not run PNPK classification before baseline assessment is sufficiently completed.

==================================================
Q. PATIENT DETAIL
==================================================

Patient Detail is the MAIN workspace.

Sticky patient header:

Patient Name
MRN
Age
Weight
Bed
Confirmed Dengue
Illness Day
Admission Time

Show four key states:

CURRENT PRIORITY
PNPK STATUS
DSS RISK
MONITORING STATUS

Example:

PRIORITAS
High

PNPK
Group B

DSS RISK
34% ↑

MONITORING
Due in 42 min

Internal patient tabs:

1. Ringkasan
2. Clinical Pathway
3. Monitoring & Grafik
4. Risiko DSS
5. Timeline & Dokumen

==================================================
R. RINGKASAN TAB
==================================================

Goal:
Doctor understands the CURRENT patient state within seconds.

Show:

Current priority
Current PNPK classification
Current phase
Current illness day
Current DSS risk
New warning signs
Latest vitals
Latest laboratory
Monitoring due
Doctor validation status

Highlight only clinically important changes.

Example:

Hematocrit
44%
Previous 40%
↑ +4%

Platelet
64 ×10³/µL
Previous 82
↓ 18

==================================================
S. CLINICAL PATHWAY — CORE CONCEPT
==================================================

Clinical Pathway must NOT be a static flowchart.

It must represent the ACTIVE journey of the patient.

The workflow is:

CONFIRMED DENGUE
↓
BASELINE ASSESSMENT
↓
PNPK CLASSIFICATION
↓
DOCTOR VALIDATION
↓
ACTIVE CLINICAL PATHWAY
↓
SERIAL MONITORING
↓
REASSESSMENT
↓
DSS RISK UPDATE
↓
CONTINUE / ESCALATE / DISCHARGE REVIEW
↓
COMPLETED

==================================================
T. CLINICAL PATHWAY STAGE 1 — BASELINE ASSESSMENT
==================================================

Collect structured information:

DEMOGRAPHIC
Age
Weight

EPISODE
Illness day
Admission

CLINICAL
Warning signs
Bleeding
Hydration
Oral intake
Perfusion
Consciousness
Diuresis

VITAL
BP
Pulse Pressure
Heart Rate
Respiratory Rate
Temperature

LABORATORY
Hemoglobin
Hematocrit
Platelet
Leukocyte

Show:

Clinical Pathway Status:
BELUM DINILAI

CTA:

[Mulai Penilaian PNPK]

==================================================
U. CLINICAL PATHWAY STAGE 2 — PNPK
==================================================

The system uses age-appropriate PNPK rule sets.

PEDIATRIC / ADOLESCENT:

Group A
Dengue without warning signs

Group B
Dengue with warning signs / inpatient monitoring required

Group C
Severe dengue

ADULT:

Use adult-specific PNPK logic implemented in the backend.

Do NOT automatically copy Group A/B/C terminology from pediatric PNPK into adult patients.

Show adult care-pathway labels according to the rules implemented by the clinical team.

==================================================
V. PNPK RESULT SCREEN
==================================================

Title:

Rekomendasi Berbasis PNPK

Example:

GRUP B

Dengue dengan Warning Signs

---------------------------------

DASAR REKOMENDASI

✓ Persistent vomiting
Recorded 14:20

✓ Hematocrit increased
39% → 44%

✓ Oral intake reduced
Recorded 13:50

---------------------------------

Source:
PNPK Dengue Anak dan Remaja

[Lihat seluruh dasar aturan]

Doctor Validation:

Status:
MENUNGGU VALIDASI DOKTER

[Konfirmasi]
[Clinical Override]

Clinical Override requires reason.

Always show:

“DENGUARD memberikan dukungan keputusan. Keputusan klinis akhir tetap berada pada dokter.”

==================================================
W. CLINICAL PATHWAY ACTIVE VIEW
==================================================

Visualize the pathway as a clinical tracker:

✓ 08:15
Pasien ditambahkan

✓ 08:28
Baseline Assessment

✓ 08:30
PNPK Assessment
Group B

✓ 08:34
Divalidasi dokter

● Monitoring Aktif
Next assessment 12:00

○ Reassessment

○ Discharge Review

Each pathway event must show:

timestamp
event
result
actor
next expected action

==================================================
X. SERIAL MONITORING
==================================================

Nurse opens:

Tambah Monitoring

Use a tablet-friendly right-side drawer.

Do not force nurse to re-enter all baseline information.

Display previous value next to new input.

Example:

Blood Pressure

Previous:
110/70 mmHg

Current:
[____ / ____]

Heart Rate

Previous:
92 bpm

Current:
[____]

Hematocrit

Previous:
40%

Current:
[____] %

Platelet

Previous:
88 ×10³/µL

Current:
[____]

Warning Signs:
[checkboxes according to implemented PNPK]

Include:

Timestamp
Clinical
Hemodynamic
Fluid / Diuresis
Warning Signs
Laboratory
Notes

Pre-fill:
patient
current time
illness day

Do not pre-fill clinical measurement values.

==================================================
Y. AFTER MONITORING SAVE
==================================================

After save:

“Data monitoring berhasil disimpan.”

Then automatically:

“PNPK telah dievaluasi ulang berdasarkan data terbaru.”

If no change:
“Tidak terdapat perubahan klasifikasi.”

If state changes:

show:

PERUBAHAN KLINIS

Previous:
Group B
Priority Moderate

Current:
Group B
Priority High

Reason:
Hematocrit increased
Platelet decreased
New warning sign

CTA:

[Review]

==================================================
Z. REASSESSMENT
==================================================

New Data
↓
PNPK Rule Engine
↓
Compare current with previous
↓
Update priority
↓
Update pathway
↓
Generate alert only when necessary
↓
Doctor review

Show clinical change clearly.

Example:

SEBELUM

Group B
Priority Moderate

SEKARANG

Group B
Priority High

New factors:
• Hct ↑
• Platelet ↓
• New warning sign

==================================================
AA. DISCHARGE REVIEW
==================================================

Create:

Kesiapan Pulang Berdasarkan PNPK

Use checklist based on the age-appropriate PNPK rules implemented in the system.

Example UI:

✓ Bebas demam sesuai kriteria
✓ Perbaikan klinis
✓ Diuresis adekuat
✓ Hematokrit stabil
○ Platelet belum memenuhi kriteria
○ Observation duration belum terpenuhi

Display:

“4 dari 6 kriteria terpenuhi.”

Never display:

“Pasien boleh pulang.”

Use:

“Seluruh kriteria sistem telah terpenuhi — menunggu keputusan dokter.”

or:

“Kriteria pulang belum seluruhnya terpenuhi.”

==================================================
AB. MONITORING & GRAPH TAB
==================================================

Title:

Perkembangan Klinis

The key interaction is MULTI-PARAMETER COMPARISON.

Create a parameter checkbox panel.

LABORATORIUM

☑ Hematocrit
☑ Platelet
☐ Hemoglobin
☐ Leukocyte

HEMODYNAMIC

☐ Systolic BP
☐ Diastolic BP
☐ Pulse Pressure
☐ Heart Rate

OTHER

☐ Temperature
☐ Urine Output

==================================================
AC. GRAPH EVENT OVERLAYS
==================================================

Allow optional event overlays:

☑ Warning Signs
☑ PNPK Change
☑ Alerts
☑ DSS Risk Update
☐ Doctor Notes

Show event markers directly on the timeline.

Example:

▼ Warning Sign

│
│
● Hct value

or:

PNPK:
Group A → Group B

==================================================
AD. GRAPH TIME FILTER
==================================================

Create:

12 Jam
24 Jam
48 Jam
Semua

X-axis:
Waktu pemeriksaan

Example:

08:00
12:00
16:00
20:00
00:00
04:00

Add contextual illness day labels:

Hari Sakit 4
|
Hari Sakit 5

Never generate fake measurements between actual recorded values.

Only display actual recorded data points.

==================================================
AE. GRAPH VIEW MODE
==================================================

Create two visualization modes:

1. NILAI AKTUAL

2. PERUBAHAN DARI BASELINE (%)

For NILAI AKTUAL:

Do NOT display Hematocrit and Platelet on a single shared Y-axis.

Use synchronized tracks.

Example:

HEMATOCRIT (%)
──────────── chart

PLATELET (×10³/µL)
──────────── chart

BLOOD PRESSURE (mmHg)
──────────── chart

All charts share the SAME X-axis.

==================================================
AF. NORMALIZED COMPARISON
==================================================

If doctor chooses:

PERUBAHAN DARI BASELINE (%)

allow parameters to be overlaid.

Example:

Hematocrit
+12%

Platelet
-34%

X-axis:
Time

Y-axis:
Change from Baseline (%)

This allows doctors to compare direction of change despite different measurement units.

==================================================
AG. HEMATOCRIT CHART
==================================================

Title:
Tren Hematokrit

X-axis:
Waktu pemeriksaan

Y-axis:
Hematokrit (%)

Tooltip:

14:00

Hematokrit:
44%

Previous:
40%

Change:
+4%

==================================================
AH. PLATELET CHART
==================================================

Title:
Tren Trombosit

X-axis:
Waktu pemeriksaan

Y-axis:
Trombosit (×10³/µL)

Show:
actual recorded values
previous comparison
timestamp

==================================================
AI. DYNAMIC DSS RISK TAB
==================================================

Title:

Risiko Dengue Shock Syndrome

Important:

Call this:

RISK PREDICTION

not:

DSS DETECTION

Hero:

ESTIMASI RISIKO DSS

34%

↑ +13% dibanding landmark sebelumnya

Prediction point:
Illness Day 5

Timestamp:
14:20

Text:

“Estimasi berdasarkan data yang tersedia hingga titik penilaian ini.”

==================================================
AJ. DSS RISK TRAJECTORY
==================================================

Chart title:

Perubahan Risiko DSS

X-axis:
Illness Day / Landmark

Example:

Hari 3
Hari 4
Hari 5
Hari 6

Y-axis:
Predicted DSS Risk (%)

Example:

Hari 3
8%

Hari 4
13%

Hari 5
34%

Emphasize risk trajectory.

Do not use a giant speedometer as the main visualization.

==================================================
AK. DSS SAFETY RULE
==================================================

DSS Risk must NOT override current PNPK emergency status.

If severe dengue / shock criteria are already active:

prioritize:

CURRENT CLINICAL EMERGENCY

instead of future prediction.

Example:

“Kondisi kegawatan aktif. Penilaian klinis saat ini menjadi prioritas utama.”

==================================================
AL. DSS EXPLAINABILITY
==================================================

Create:

Faktor yang Berkontribusi terhadap Prediksi

Use horizontal contribution bars.

Separate:

MENINGKATKAN ESTIMASI RISIKO

and

MENURUNKAN ESTIMASI RISIKO

Example:

Higher hematocrit
Lower platelet
Illness day
Age

Do not display only raw SHAP numbers.

Tooltip:

“Kontribusi menjelaskan pengaruh fitur terhadap keluaran model, bukan hubungan sebab-akibat.”

Show model details:

Model version
Prediction timestamp
Applicable population
Data completeness

==================================================
AM. DSS MODEL STATES
==================================================

Design explicit states:

MODEL AVAILABLE

INSUFFICIENT DATA

PATIENT OUTSIDE VALIDATED POPULATION

MODEL SERVICE UNAVAILABLE

Example:

“Prediksi DSS belum tersedia.”

Reason:

“Data longitudinal belum memenuhi kebutuhan model.”

Never display:

0% risk

when prediction is unavailable.

==================================================
AN. TIMELINE & DOCUMENT TAB
==================================================

Create one chronological clinical history.

Event types:

Patient added
Baseline assessment
Monitoring entered
Laboratory update
Warning sign
PNPK reassessment
Priority change
DSS risk update
Doctor validation
Clinical override
Clinical note
Discharge review

Example:

14:20
Lab updated by Nurse A

Hct 45%
Platelet 58 ×10³/µL

14:21
PNPK reassessment

Priority changed:
Moderate → High

14:25
Reviewed by Dr. Rahma

==================================================
AO. PDF EXPORT
==================================================

Inside Timeline & Dokumen:

Create button:

[Export Clinical Report]

Doctor can select:

☑ Patient Summary
☑ PNPK Classification History
☑ Clinical Pathway
☑ Warning Signs
☑ Monitoring Table
☑ Hematocrit Chart
☑ Platelet Chart
☑ Comparison Chart
☑ DSS Risk Trajectory
☑ Model Explanation
☑ Doctor Notes
☑ Clinical Override History
☑ Alerts

TIME RANGE:

Last 24h
48h
Entire Admission
Custom

==================================================
AP. PDF REPORT PREVIEW
==================================================

Create a professional medical report preview.

Header:

DENGUARD
Clinical Monitoring Report

Patient Information

Confirmed Dengue Episode

Current Clinical State

PNPK Classification History

Clinical Pathway

Longitudinal Monitoring

Laboratory Trends

DSS Risk History

Alerts

Doctor Decisions

Clinical Override

Audit Trail

Footer:

Generated At
Generated By
PNPK Version
Model Version

==================================================
AQ. DOCTOR USER FLOW
==================================================

Create an interactive prototype:

1. Doctor logs in.

2. Opens Dashboard.

3. Sees:
High Priority Patient.

4. Clicks patient.

5. Patient Overview shows:
Illness Day 5
PNPK Group B
Priority High
DSS Risk 34% ↑

6. Doctor opens Clinical Pathway.

7. Reviews PNPK recommendation.

8. Opens “Dasar Rekomendasi”.

9. Confirms PNPK classification.

10. Opens Monitoring & Grafik.

11. Selects:
Hematocrit
Platelet

12. Adds:
Warning Sign overlay.

13. Switches to:
Change from Baseline (%)

14. Reviews longitudinal trend.

15. Opens DSS Risk.

16. Reviews:
Day 3 → Day 4 → Day 5 risk trajectory.

17. Reviews model contribution.

18. Returns to alert.

19. Marks alert reviewed.

20. Adds clinical note.

21. Clinical Timeline records all actions.

22. Doctor exports a PDF clinical report.

==================================================
AR. NURSE USER FLOW
==================================================

Create nurse prototype:

1. Nurse logs in.

2. Dashboard shows:
Monitoring due.

3. Nurse opens patient.

4. Clicks:
Tambah Monitoring.

5. Enters:
BP
Heart Rate
Urine Output
Warning Signs
Hematocrit
Platelet

6. Saves data.

7. Timeline updates.

8. PNPK rule engine reassesses.

9. System detects:
clinical status changed.

10. Priority increases.

11. Alert created for doctor.

12. Nurse sees:

“Menunggu evaluasi dokter.”

Nurse cannot:
confirm final PNPK classification
perform clinical override
make final treatment decision

==================================================
AS. CLINICAL PATHWAY STATUS SYSTEM
==================================================

Use these pathway states:

BELUM DIMULAI

ASSESSMENT BERJALAN

MENUNGGU VALIDASI DOKTER

MONITORING AKTIF

REASSESSMENT DUE

ESCALATED

DISCHARGE REVIEW

COMPLETED

These statuses should be filterable from the Patient page.

==================================================
AT. CLINICAL PRIORITY VS DSS RISK
==================================================

Do NOT treat these as the same thing.

Priority is based primarily on:
current clinical condition
PNPK state
warning signs
monitoring urgency

DSS Risk is:
future risk estimation.

Example UI:

CURRENT CLINICAL PRIORITY
HIGH

PNPK
GROUP B

DSS RISK
34% ↑

Keep these visually separate.

==================================================
AU. ACCESSIBILITY
==================================================

High contrast.

Minimum readable clinical text.

No tiny labels.

No blinking alerts.

Do not rely on red/green alone.

Use:
icon + label + color.

Large touch targets.

Clinical numbers must be easily readable.

==================================================
AV. COPYWRITING
==================================================

Interface language:
Bahasa Indonesia.

Use commonly accepted English clinical terms only where appropriate:

Clinical Pathway
Clinical Timeline
Clinical Override
Warning Signs
DSS Risk
SHAP

Prefer:

“Perlu evaluasi dokter.”

not:

“Sistem telah memutuskan pasien berada dalam kondisi kritis.”

Prefer:

“Dasar rekomendasi.”

not:

“AI Explanation.”

Prefer:

“Estimasi Risiko DSS.”

not:

“AI DSS Detection.”

Prefer:

“Menunggu validasi dokter.”

not:

“AI belum menyetujui.”

==================================================
AW. IMPORTANT UX PRINCIPLE
==================================================

DENGUARD SHOULD NOT MAKE DOCTORS SEARCH FOR CLINICAL INFORMATION.

The interface should proactively organize information according to:

current patient condition
latest clinical changes
PNPK status
monitoring status
DSS risk trajectory

Every patient screen must answer:

1. WHO is the patient?
2. WHAT is the current clinical state?
3. WHY is the patient prioritized?
4. WHAT changed?
5. WHAT data supports that change?
6. WHAT is the current clinical pathway status?
7. HOW is DSS risk changing?
8. WHAT requires doctor review?

==================================================
AX. FINAL PRODUCT HIERARCHY
==================================================

The final architecture should visually communicate:

DASHBOARD
“Siapa yang membutuhkan perhatian?”

PERINGATAN
“Apa yang berubah, mengapa, dan apa yang perlu ditinjau?”

PASIEN
“Bagaimana perjalanan lengkap pasien ini?”

Inside Patient:

RINGKASAN
“Apa kondisi sekarang?”

CLINICAL PATHWAY
“Pasien berada di tahap mana?”

MONITORING & GRAFIK
“Bagaimana datanya berubah?”

RISIKO DSS
“Bagaimana risiko berikutnya berubah?”

TIMELINE & DOKUMEN
“Apa yang telah terjadi dan dilakukan?”

==================================================
AY. FINAL DELIVERABLES
==================================================

Produce:

1. DENGUARD UI Design System
2. Component library
3. Three-button sidebar navigation
4. Doctor Dashboard
5. Clinical Alerts Center
6. Patient Management Page
7. Add Patient Flow
8. Patient Clinical Overview
9. PNPK Assessment
10. PNPK Recommendation & Doctor Validation
11. Digital Clinical Pathway
12. Serial Monitoring Form
13. Comparative Longitudinal Charts
14. Dynamic DSS Risk Page
15. DSS Explainability
16. Clinical Timeline
17. PDF Export & Report Preview
18. Nurse Flow
19. Doctor Flow
20. Tablet-first responsive version
21. Desktop responsive version
22. Clickable high-fidelity prototype

All screens must be:
editable,
component-based,
Auto Layout based,
developer-ready,
consistent with DENGUARD GSM,
and realistic for a healthcare workflow.

FINAL UX MESSAGE:

DENGUARD is not designed to replace clinical judgment.

DENGUARD organizes the evolving dengue clinical pathway into one continuous workflow:

PRIORITIZE
→ MONITOR
→ REASSESS
→ UNDERSTAND RISK
→ SUPPORT DOCTOR DECISION.