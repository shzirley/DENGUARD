Create a complete high-fidelity UI/UX design for DENGUARD, a tablet-first responsive web-based Clinical Decision Support System for doctors and nurses managing CONFIRMED DENGUE patients.

IMPORTANT:
Use the DENGUARD GSM, logo, color palette, typography, icon language, graphic elements, shapes, and visual identity already provided in this Figma file as the PRIMARY visual reference.

Do NOT redesign the brand.
Do NOT invent a new logo.
Do NOT recolor the logo outside GSM rules.
Do NOT create a generic blue hospital dashboard.

Translate the existing DENGUARD GSM into a professional clinical product design system.

If the GSM does not specify a UI rule, derive it conservatively from the existing visual identity while prioritizing:
- clinical readability
- accessibility
- fast scanning
- low cognitive load
- clear information hierarchy
- safety
- traceability
- professional hospital workflow

The product must feel like a serious Clinical Decision Support System, not a consumer health app, fintech dashboard, futuristic AI interface, or marketing website.

==================================================
1. PRODUCT CONTEXT
==================================================

Product name:
DENGUARD

Product type:
Clinical Decision Support System for dengue care.

Primary users:
1. Doctor
2. Nurse

Patient scope:
ONLY patients who have already been confirmed with dengue.

DENGUARD does NOT diagnose whether a patient has dengue.

DENGUARD supports three continuous clinical questions:

1. Which dengue patient needs attention first?
2. How is the patient's condition changing during care?
3. Which patient is showing increased future risk of Dengue Shock Syndrome (DSS)?

DENGUARD has TWO connected clinical modules:

MODULE 1
PNPK-Based Prioritization & Digital Clinical Pathway

MODULE 2
Dynamic DSS Risk Prediction

The system is ASSISTIVE.
The final clinical decision always belongs to the doctor.

Never use wording such as:
“AI Diagnosis”
“AI Decision”
“DSS Detected”
“System has decided”
“Treatment automatically selected”

Prefer:
“Rekomendasi sistem”
“Prioritas evaluasi”
“Estimasi risiko DSS”
“Dasar rekomendasi”
“Menunggu validasi dokter”
“Dikonfirmasi dokter”
“Clinical override”

==================================================
2. MAIN CLINICAL WORKFLOW
==================================================

Design the entire product around this workflow:

LOGIN
↓
CONFIRMED DENGUE PATIENT LIST
↓
PATIENT PRIORITY BOARD
↓
SELECT PATIENT
↓
PATIENT CLINICAL OVERVIEW
↓
PNPK ASSESSMENT
↓
AGE-APPROPRIATE PNPK RULE ENGINE
↓
PRIORITY + CLASSIFICATION + REASON
↓
DOCTOR CONFIRM / CLINICAL OVERRIDE
↓
DIGITAL CLINICAL PATHWAY
↓
SERIAL CLINICAL & LAB MONITORING
↓
LONGITUDINAL VISUALIZATION
↓
RE-RUN PNPK RULES AFTER NEW DATA
↓
UPDATED PRIORITY / WARNING SIGNS / ALERT
↓
DYNAMIC DSS RISK UPDATE
↓
EXPLAINABILITY
↓
DOCTOR REASSESSMENT
↓
CONTINUE MONITORING

The workflow must feel continuous.
Do NOT make PNPK, monitoring, and DSS prediction feel like three unrelated applications.

==================================================
3. USER ROLES
==================================================

DOCTOR can:
- view prioritized patient list
- review patient clinical condition
- review PNPK classification
- review evidence/rules behind classification
- confirm recommendation
- perform clinical override
- write reason for override
- review warning signs
- review longitudinal trends
- review DSS risk trajectory
- review model explainability
- acknowledge alert
- record clinical follow-up
- export clinical report

NURSE can:
- view assigned dengue patients
- see which patient monitoring is due
- enter serial clinical data
- enter laboratory results
- enter intake/output and diuresis
- record warning signs
- correct data with traceable history
- see monitoring status
- see alerts requiring doctor review

Nurse must NOT:
- confirm final clinical classification
- perform clinical override
- make final treatment decision

==================================================
4. INFORMATION ARCHITECTURE
==================================================

Create these main navigation items:

1. Dashboard
2. Pasien
3. Monitoring
4. Peringatan
5. Laporan

Secondary navigation inside a patient:

- Ringkasan
- PNPK & Prioritas
- Monitoring
- Risiko DSS
- Clinical Timeline
- Catatan Klinis
- Riwayat/Audit

Keep navigation shallow.

The doctor should be able to go from:
Dashboard → critical patient → clinical evidence
in maximum 2–3 interactions.

==================================================
5. FIGMA FILE STRUCTURE
==================================================

Create separate Figma pages:

00 — Brand Reference
01 — Foundations
02 — Components
03 — User Flow
04 — Doctor Screens
05 — Nurse Screens
06 — Responsive Tablet
07 — Prototype
08 — UX Notes

Use Auto Layout extensively.

Use reusable components and variants.

Use Figma variables for:
- colors
- spacing
- radius
- typography
- semantic status colors

Use an 8pt spacing system.

==================================================
6. DESIGN SYSTEM
==================================================

Derive visual design from the imported DENGUARD GSM.

Create semantic tokens instead of using raw brand colors everywhere.

Suggested token structure:

Brand:
Brand / Primary
Brand / Secondary
Brand / Accent
Brand / Dark
Brand / Light

Surface:
Surface / Background
Surface / Primary
Surface / Secondary
Surface / Elevated

Text:
Text / Primary
Text / Secondary
Text / Muted
Text / Inverse

Border:
Border / Default
Border / Strong

Clinical semantic:
Status / Critical
Status / High
Status / Attention
Status / Stable
Status / Info

Do NOT rely only on color.

Every important status must include:
ICON + TEXT LABEL + COLOR

Example:
[warning icon] Prioritas Tinggi
not merely a red circle.

Clinical colors should remain accessible even if they differ slightly from the decorative GSM palette.

Maintain WCAG AA contrast.

==================================================
7. TYPOGRAPHY
==================================================

Use the typography defined in the GSM.

If exact fonts are unavailable, use the closest visually compatible sans-serif font.

Prioritize readability.

Suggested hierarchy:

Display
Page Title
Section Title
Card Title
Body
Small Body
Label
Caption
Clinical Numeric Value

Clinical numbers such as:
“42%”
“38.5%”
“64.000/µL”
must be immediately readable.

Avoid excessive bold text.

==================================================
8. COMPONENT LIBRARY
==================================================

Create reusable components with variants for:

Navigation
- desktop sidebar
- tablet collapsed sidebar
- top bar
- breadcrumbs

Buttons
- Primary
- Secondary
- Ghost
- Destructive
- Icon button

Forms
- text input
- number input
- date/time
- dropdown
- segmented control
- checkbox
- radio
- textarea
- measurement input with unit

Clinical components
- Patient Priority Badge
- PNPK Classification Badge
- Warning Sign Chip
- Illness Day Badge
- DSS Risk Badge
- Monitoring Due Badge
- Doctor Validation Status
- Clinical Override Badge

Cards
- Patient Summary Card
- Priority Card
- PNPK Recommendation Card
- Monitoring Card
- Alert Card
- DSS Risk Card
- Trend Card
- Explainability Card

Data
- patient table
- monitoring table
- audit trail
- clinical timeline item

Overlays
- alert drawer
- PNPK evidence drawer
- clinical override modal
- add monitoring modal
- report/export modal

Feedback
- loading
- empty state
- success
- error
- warning
- out-of-model-scope state

==================================================
9. SCREEN 01 — LOGIN
==================================================

Create a clean healthcare login screen.

Elements:
- DENGUARD logo
- short subtitle:
  “Clinical Decision Support for Dengue Care”
- Email / ID
- Password
- Login button

Do not make a dramatic landing page.

The login screen should be simple and trustworthy.

==================================================
10. SCREEN 02 — PATIENT PRIORITY DASHBOARD
==================================================

THIS IS THE MOST IMPORTANT SCREEN.

Goal:
Doctor should know WHO NEEDS ATTENTION FIRST within seconds.

Do not start with generic analytics such as:
“Total Patient”
“Monthly Cases”
“Hospital Revenue”

The dashboard must be action-oriented.

Top section:

Title:
“Prioritas Pasien Dengue”

Subtitle:
“Pasien diurutkan berdasarkan kebutuhan evaluasi terkini.”

Summary:
- Perlu evaluasi segera
- Prioritas tinggi
- Perlu evaluasi
- Stabil

Add:
“Last updated: [time]”

Main table/list:

Columns:
- Priority
- Patient
- Age
- Location / Bed
- Illness Day
- PNPK Status
- Latest Warning
- DSS Risk
- Risk Change
- Last Monitoring
- Next Monitoring
- Action

Example:

PRIORITAS TINGGI
An. N
12 tahun
Bed B-07
Hari sakit 5
PNPK: Grup B
Warning: Hct meningkat
DSS Risk: 34% ↑
Monitoring: 20 min lalu
[Review]

Make priority visually stronger than patient demographics.

Include filters:
- Semua
- Perlu evaluasi segera
- Prioritas tinggi
- Stabil

Filter by:
- Unit/ward
- Age group
- Illness day
- PNPK group
- DSS risk trend
- Monitoring due

Search patient.

Allow sorting by:
- clinical priority
- DSS risk
- last assessment
- monitoring due

Priority should NEVER be determined by DSS score alone.

==================================================
11. SCREEN 03 — PATIENT CLINICAL OVERVIEW
==================================================

Create a patient-specific workspace.

Sticky patient header:

Patient name
Medical record ID
Age
Weight
Location / Bed
Confirmed Dengue
Illness Day
Admission Time

Then show three clearly separated summaries:

A. CURRENT PRIORITY
Example:
“Prioritas Tinggi”

B. PNPK CLASSIFICATION
For pediatric/adolescent:
“Grup B — Dengue dengan Warning Signs”

For adult:
show relevant PNPK care pathway output.

C. DSS RISK
Example:
“34% — meningkat dari 21%”

Never visually imply that DSS risk = PNPK classification.

Below:
- latest clinical status
- latest laboratory
- warning signs
- monitoring due
- doctor validation status

Primary actions:
[Tambah Monitoring]
[Review PNPK]
[Review Risiko DSS]

==================================================
12. SCREEN 04 — PNPK ASSESSMENT
==================================================

Create a structured PNPK assessment.

The system automatically uses the correct rule set according to patient age.

Divide assessment into meaningful sections:

A. Basic context
- illness day
- age
- weight
- current phase

B. Hemodynamic
- systolic BP
- diastolic BP
- pulse pressure
- heart rate
- capillary refill
- peripheral perfusion

C. Fluid status
- oral intake
- urine output
- diuresis
- dehydration

D. Warning signs
Use clear selectable cards/checks.

E. Bleeding
- none
- minor
- significant
etc., only according to implemented PNPK criteria.

F. Laboratory
- hemoglobin
- hematocrit
- platelet
- leukocyte

Show previous value beside latest value when available.

Example:
Hematocrit
43%
Previous: 39%
↑ +4%

Do not auto-save clinical decisions silently.

==================================================
13. SCREEN 05 — PNPK RESULT & EXPLAINABILITY
==================================================

After assessment, show:

“Rekomendasi Berbasis PNPK”

Large classification card.

Example pediatric:
GRUP B
Dengue dengan Warning Signs

Then:

“Dasar rekomendasi”

Show each matched criterion as an evidence row:

✓ Persistent vomiting
Recorded at 14:20

✓ Hematocrit increased
39% → 44%

✓ Reduced oral intake
Recorded at 13:50

Show:
Rule source:
“PNPK Dengue Anak dan Remaja”

Allow:
[Lihat seluruh aturan]

Doctor decision panel:

Status:
“Menunggu validasi dokter”

Actions:
[Konfirmasi]
[Clinical Override]

If override:
open modal requiring:
- selected alternative clinical decision
- reason
- doctor note

Add explicit text:
“DENGUARD memberikan dukungan keputusan. Keputusan klinis akhir tetap berada pada dokter.”

==================================================
14. SCREEN 06 — DIGITAL CLINICAL PATHWAY
==================================================

Create a longitudinal clinical pathway.

Not a static flowchart.

Show current care position and what has already happened.

Horizontal or vertical step/timeline:

Admission
↓
PNPK Assessment
↓
Monitoring
↓
Reassessment
↓
Current State

Each step should show:
- timestamp
- result
- doctor/nurse actor
- next monitoring due

Example:

08:10
Confirmed Dengue

08:30
PNPK Assessment
Grup B

12:15
Laboratory Update
Hct increased

12:16
Priority changed
Routine → High

12:20
Doctor reviewed alert

The user must be able to understand:
“What changed?”
“When?”
“Why?”

==================================================
15. SCREEN 07 — LONGITUDINAL MONITORING
==================================================

This is another core DENGUARD screen.

Header:
“Perkembangan Klinis”

Provide range controls:

12 jam
24 jam
48 jam
Semua

Provide parameter selector:

Clinical:
- Blood Pressure
- Pulse Pressure
- Heart Rate
- Temperature
- Perfusion
- Urine Output

Laboratory:
- Hematocrit
- Platelet
- Leukocyte
- Hemoglobin

Warning signs:
- display as timeline markers

X-axis:
TIME OF MEASUREMENT

Example:
08:00
12:00
16:00
20:00
00:00
04:00

Also show illness day context:
Hari Sakit 4
Hari Sakit 5

Do not fake measurements at regular intervals.
Only connect actual recorded measurements.

==================================================
16. HEMATOCRIT CHART
==================================================

Chart title:
“Tren Hematokrit”

X-axis:
Waktu pemeriksaan

Y-axis:
Hematokrit (%)

Show:
- actual points
- line connection
- value tooltip
- change from previous reading
- warning annotations

Tooltip example:
14:00
Hct 44%
Previous 40%
Change +4%

==================================================
17. PLATELET CHART
==================================================

Chart title:
“Tren Trombosit”

X-axis:
Waktu pemeriksaan

Y-axis:
Trombosit (×10³/µL)

Show actual recorded values.

Allow comparison mode.

IMPORTANT:
Do not put raw Hematocrit and Platelet values on a single Y-axis because units differ.

Comparison options:

Mode 1:
Separate synchronized charts.

Mode 2:
“Change from baseline (%)”

For normalized comparison:

X-axis:
Time

Y-axis:
Change from Baseline (%)

Allow:
Hematocrit
Platelet

==================================================
18. MONITORING DATA ENTRY
==================================================

Design a fast nurse workflow.

Button:
“Tambah Monitoring”

Use a right-side drawer or large modal optimized for tablet.

Sections:

Timestamp
Clinical
Hemodynamic
Fluid / Diuresis
Warning Signs
Laboratory
Notes

Pre-fill:
- current time
- patient
- illness day

Never pre-fill clinical values.

Show units clearly.

Make numeric input large and touch-friendly.

After save:

System should show:
“Data tersimpan.”

Then:
“PNPK telah dievaluasi ulang berdasarkan data terbaru.”

If state changes:
show a prominent but non-alarming alert.

==================================================
19. SCREEN 08 — DYNAMIC DSS RISK
==================================================

Title:
“Risiko Dengue Shock Syndrome”

Important:
Call it RISK PREDICTION, not DETECTION.

Hero card:

Current DSS Risk
34%

Trend:
↑ +13% from previous landmark

Prediction time:
Illness Day 5

Status:
“Model tersedia”

Show supporting text:
“Estimasi berdasarkan data yang tersedia hingga titik penilaian ini.”

Do NOT use a huge speedometer/gauge as the main visualization.

Use a clear numeric risk + trajectory.

==================================================
20. DSS RISK TRAJECTORY CHART
==================================================

Chart title:
“Perubahan Risiko DSS”

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

Day 3  → 8%
Day 4 → 13%
Day 5 → 34%

Emphasize changes over time.

Include previous/current comparison.

Do not imply risk is causal.

==================================================
21. DSS EXPLAINABILITY / SHAP
==================================================

Under risk trajectory create:

“Faktor yang Berkontribusi terhadap Prediksi”

Use horizontal bars.

Separate:

Meningkatkan estimasi risiko
and
Menurunkan estimasi risiko

Example:

Hematocrit maximum ↑
Platelet minimum ↓
Illness day
Age

Do not display only raw SHAP numbers.

Allow:
[Lihat detail model]

Tooltip:
“Kontribusi menunjukkan pengaruh fitur terhadap keluaran model, bukan hubungan sebab-akibat.”

Add a small model information section:

Model version
Prediction timestamp
Data completeness
Applicable population

==================================================
22. MODEL SAFETY STATES
==================================================

Design explicit states for:

A. Model available
B. Insufficient data
C. Patient outside validated population
D. Model service unavailable

Example:

“Prediksi DSS belum tersedia”

Reason:
“Data longitudinal belum memenuhi kebutuhan model.”

Do NOT display 0% risk when prediction cannot be made.

==================================================
23. SCREEN 09 — ALERT CENTER
==================================================

Create alert types:

CRITICAL
HIGH
REVIEW NEEDED

Every alert should explain:
WHAT changed
WHEN it changed
WHY it was triggered
WHAT requires doctor review

Example:

PRIORITAS TINGGI
Perubahan kondisi pasien

Hematocrit:
39% → 45%

Platelet:
82 → 58 ×10³/µL

PNPK:
Grup A → Grup B

Recorded:
14:20

[Review Patient]
[Acknowledge]

Never use unexplained alerts such as:
“Patient critical!”

==================================================
24. SCREEN 10 — CLINICAL TIMELINE
==================================================

Create one chronological patient history.

Event types:

- Monitoring entered
- Laboratory result
- Warning sign
- PNPK reassessment
- Priority change
- DSS risk update
- Doctor validation
- Clinical override
- Clinical note

Timeline item example:

14:20
Lab updated by Nurse A

Hematocrit 45%
Platelet 58 ×10³/µL

14:21
PNPK reassessment

Priority changed:
Standard → High

14:25
Reviewed by Dr. B

==================================================
25. SCREEN 11 — REPORT / EXPORT
==================================================

Create report preview.

Report sections:

Patient Information
Confirmed Dengue Status
Illness Day
PNPK Classification History
Clinical Timeline
Clinical Monitoring
Laboratory Trends
DSS Risk Trajectory
Doctor Notes
Clinical Overrides
Audit Information

Actions:
[Export PDF]
[Print]

The exported report must be clear and professional.

==================================================
26. NURSE DASHBOARD
==================================================

Nurse dashboard should prioritize TASKS rather than DSS model analysis.

Show:

Monitoring due now
Monitoring overdue
Recently updated
Patients with alerts awaiting doctor review

Patient row:
Patient
Bed
Priority
Last Monitoring
Next Monitoring
Status
[Input Data]

Main CTA:
“Tambah Monitoring”

==================================================
27. DOCTOR DASHBOARD
==================================================

Doctor dashboard prioritizes decisions.

Show:

1. Needs Immediate Review
2. High Priority
3. New PNPK Changes
4. DSS Risk Increase
5. Awaiting Doctor Validation

Avoid unnecessary hospital analytics.

==================================================
28. RESPONSIVE BEHAVIOR
==================================================

Primary design:
Tablet landscape.

Design target:
1280 × 800

Also create desktop:
1440 × 1024

Tablet behavior:
- collapsible navigation
- touch targets minimum 44px
- data entry optimized for touch
- sticky patient header
- sticky primary actions

Do NOT optimize for phone as the primary clinical device.

==================================================
29. ACCESSIBILITY & CLINICAL SAFETY
==================================================

Use high contrast.

Never indicate:
critical/high/stable
only through color.

Use:
color + icon + text.

Avoid very light gray text.

Avoid tiny clinical values.

Avoid excessive animation.

Alerts must not continuously blink.

Important actions such as Clinical Override must require deliberate confirmation.

Destructive actions must require confirmation.

==================================================
30. COPYWRITING
==================================================

Interface language:
BAHASA INDONESIA

Clinical terminology may remain in English when commonly used:
Clinical Timeline
Clinical Override
Warning Signs
DSS Risk
SHAP

Use short direct sentences.

Prefer:
“Perlu evaluasi dokter”
instead of
“Sistem mendeteksi suatu kemungkinan kondisi yang mungkin memerlukan perhatian.”

Prefer:
“Dasar rekomendasi”
instead of
“AI Explanation”

Prefer:
“Terakhir diperbarui 14:20”
instead of
“Data last synchronization timestamp.”

==================================================
31. REQUIRED STATES
==================================================

Design every important screen in multiple states:

Normal
Stable
High Priority
Critical
Empty
Loading
Error
No monitoring data
Monitoring overdue
New warning sign
PNPK classification changed
DSS risk increased
Prediction unavailable
Doctor validated
Clinical override

==================================================
32. PROTOTYPE SCENARIO — DOCTOR
==================================================

Create an interactive prototype for this exact scenario:

1. Doctor logs in.
2. Dashboard shows several confirmed dengue patients.
3. One patient appears at high priority.
4. Doctor opens patient.
5. Patient Overview shows:
   - Illness Day 5
   - PNPK Group B
   - DSS Risk 34%, increasing
6. Doctor opens PNPK evidence.
7. System shows which clinical criteria triggered Group B.
8. Doctor confirms the recommendation.
9. Doctor reviews longitudinal Hct and platelet trends.
10. Doctor opens DSS Risk.
11. Doctor sees risk trajectory:
    Day 3 → Day 4 → Day 5.
12. Doctor reviews factors contributing to the model output.
13. Doctor acknowledges alert.
14. Doctor writes follow-up note.
15. Clinical timeline records all actions.

==================================================
33. PROTOTYPE SCENARIO — NURSE
==================================================

Create a second prototype:

1. Nurse logs in.
2. Sees patients requiring monitoring.
3. Opens one patient.
4. Clicks “Tambah Monitoring”.
5. Enters:
   - BP
   - heart rate
   - urine output
   - warning signs
   - hematocrit
   - platelet
6. Saves data.
7. Clinical timeline updates.
8. PNPK engine reassesses patient.
9. Priority increases.
10. Alert is sent for doctor review.
11. Nurse sees:
   “Menunggu evaluasi dokter.”

==================================================
34. VISUAL DIRECTION
==================================================

The interface should feel:

Clinical
Calm
Precise
Modern
Trustworthy
Evidence-oriented
Human-centered

Avoid:

neon AI aesthetics
excessive gradients
glassmorphism
glowing charts
too many cards
giant statistics without actions
decorative illustrations inside clinical workflow
robot/AI imagery
generic hospital stock photos
oversized mascot use

Use DENGUARD brand elements subtly:
- login
- navigation
- empty states
- selected brand accents
- report cover

The brand should support clinical usability, not overpower it.

==================================================
35. DELIVERABLE
==================================================

Produce:

1. Complete DENGUARD UI Design System
2. Component Library
3. Doctor User Flow
4. Nurse User Flow
5. High-fidelity tablet screens
6. Desktop responsive screens
7. PNPK assessment experience
8. Longitudinal monitoring dashboard
9. DSS Risk & Explainability dashboard
10. Alerts and clinical timeline
11. Report preview
12. Interactive clickable prototype

All frames must be:
- properly named
- editable
- built using Auto Layout
- based on reusable components
- internally consistent
- ready to hand off to frontend developers

Most important UX principle:

DENGUARD SHOULD NOT MAKE DOCTORS SEARCH FOR CLINICAL INFORMATION.

The interface should proactively organize the most relevant information based on:
current patient condition,
PNPK classification,
recent clinical changes,
monitoring status,
and updated DSS risk.

Final hierarchy should always answer:

1. WHO needs attention?
2. WHY do they need attention?
3. WHAT changed?
4. WHAT data supports it?
5. WHAT requires doctor review?