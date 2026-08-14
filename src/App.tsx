import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import logoImg from './assets/logo_trans.png';
import { useStore } from './store'
import { Patient, Role, Priority, MonitoringEntry, DoctorNote } from './types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'login' | 'dashboard' | 'peringatan' | 'pasien' | 'patient-detail' | 'add-patient'
type PatientTab = 'ringkasan' | 'pathway' | 'monitoring' | 'dss' | 'timeline'

const dssTrajectory = [
  { day: 'Hari 3', risk: 8 }, { day: 'Hari 4', risk: 13 }, { day: 'Hari 5', risk: 21 }, { day: 'Hari 6', risk: 34 },
]
const shapFactors = [
  { name: 'Hematokrit maksimum ↑', value: 0.18, dir: 'up' },
  { name: 'Trombosit minimum ↓', value: 0.14, dir: 'up' },
  { name: 'Hari sakit', value: 0.09, dir: 'up' },
  { name: 'Usia', value: 0.04, dir: 'up' },
  { name: 'Tekanan nadi', value: -0.06, dir: 'down' },
  { name: 'Asupan oral', value: -0.03, dir: 'down' },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────

function PriorityBadge({ priority, size = 'md' }: { priority: Priority; size?: 'sm' | 'md' | 'lg' }) {
  const config: Record<Priority, { label: string; icon: string; cls: string }> = {
    critical: { label: 'Kritis', icon: '■', cls: 'bg-[#FEF2F2] text-[#C62828] border-[#FECACA]' },
    high: { label: 'Prioritas Tinggi', icon: '▲', cls: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]' },
    attention: { label: 'Perlu Evaluasi', icon: '◆', cls: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' },
    stable: { label: 'Stabil', icon: '●', cls: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' },
  }
  const c = config[priority]
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1.5 font-semibold' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-medium ${c.cls} ${sz}`}>
      <span className="text-[8px]">{c.icon}</span>{c.label}
    </span>
  )
}

function PathwayBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Belum Dimulai': 'bg-[#F8FAFB] text-[#6B7280] border-[#E2E8F0]',
    'Assessment Berjalan': 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    'Menunggu Validasi Dokter': 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    'Monitoring Aktif': 'bg-[#EAF2FF] text-[#2563FF] border-[#C7D7FE]',
    'Reassessment Due': 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
    'Escalated': 'bg-[#FEF2F2] text-[#C62828] border-[#FECACA]',
    'Discharge Review': 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    'Completed': 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cls[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  )
}

function DSSTrend({ value, change }: { value: number; change: number }) {
  const color = value >= 40 ? '#C62828' : value >= 25 ? '#C2410C' : value >= 15 ? '#B45309' : '#166534'
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→'
  return (
    <span className="font-clinical text-sm font-medium" style={{ color }}>
      {value}% <span className="text-xs">{arrow}{Math.abs(change)}%</span>
    </span>
  )
}

function TopBar({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: '#FFFFFF', borderColor: '#DBEAFE', minHeight: 68 }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: '#0D1326' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#4A8CF7' }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg text-xs" style={{ borderColor: '#DBEAFE' }}>
      <div className="font-semibold mb-1" style={{ color: '#0F172A' }}>{label}</div>
      <div className="font-clinical font-medium" style={{ color: payload[0].color }}>{payload[0].value} {unit}</div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ screen, setScreen, role, userName, onLogout }: { screen: Screen; setScreen: (s: Screen) => void; role: Role; userName: string; onLogout: () => void }) {
  const patients = useStore(s => s.patients)
  const alertCount = patients.filter(p => !p.doctorValidated && p.priority !== 'stable').length
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
    { id: 'peringatan', label: 'Peringatan', icon: BellIcon, badge: alertCount },
    { id: 'pasien', label: 'Pasien', icon: PatientIcon },
  ]

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col border-r" style={{ background: '#FFFFFF', height: '100vh', borderColor: '#DBEAFE' }}>
      {/* Logo */}
      <div className="px-2 py-5 border-b flex justify-center" style={{ borderColor: '#DBEAFE' }}>
        <img src={logoImg} alt="DENGUARD" style={{ width: '115%', height: 'auto', display: 'block', maxWidth: 'none' }} />
      </div>

      {/* Nav — 3 items only, seperti GSM */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map(item => {
          const Icon = item.icon
          const active = screen === item.id || (screen === 'patient-detail' && item.id === 'pasien')
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: active ? '#2563FF' : 'transparent',
                color: active ? '#FFFFFF' : '#0D1326',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'opacity-100' : 'opacity-50'}`} />
              <span className="text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold" style={{ background: active ? 'rgba(255,255,255,0.25)' : '#FEE2E2', color: active ? '#fff' : '#C62828' }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom: user card + settings + logout */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: '#DBEAFE' }}>
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl mb-1" style={{ background: '#EAF2FF' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#2563FF' }}>
            {userName ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : (role === 'doctor' ? 'BS' : 'RM')}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: '#0D1326' }}>
              {role === 'doctor' ? `dr. ${userName || 'Budi Santoso'}` : `Ns. ${userName || 'Rani Mulyani'}`}
            </div>
            <div className="text-xs truncate" style={{ color: '#4A8CF7' }}>
              {role === 'doctor' ? 'Dokter Sp. Anak' : 'Perawat Rawat Inap'}
            </div>
          </div>
        </div>
        {[{ label: 'Pengaturan', icon: '⚙' }, { label: 'Keluar', icon: '↗' }].map(item => (
          <button key={item.label} onClick={item.label === 'Keluar' ? onLogout : undefined} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors hover:bg-[#EAF2FF]" style={{ color: '#6B7280' }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (r: Role, name: string) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role>('doctor')

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const data = await userInfo.json()
        if (data.name) {
          onLogin(selectedRole, data.name)
        } else {
          onLogin(selectedRole, 'Pengguna Google')
        }
      } catch (err) {
        console.error("Gagal mendapatkan info user dari Google:", err)
        alert("Gagal memproses login Google.")
      }
    },
    onError: () => {
      alert("Login Google dibatalkan atau gagal.")
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EAF2FF' }}>
      <div className="w-full max-w-sm px-4">
        {/* Logo di atas card */}
        <div className="flex justify-center mb-6">
          <img src={logoImg} alt="DENGUARD" style={{ width: 280, height: 'auto', display: 'block' }} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-md border" style={{ borderColor: '#DBEAFE', boxShadow: '0 4px 24px rgba(37,99,255,0.10)' }}>
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#0F172A' }}>Masuk ke sistem</h2>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Clinical Decision Support for Dengue Care</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Email / ID Staf</label>
              <input type="email" placeholder="email@rumahsakit.id" className="w-full px-3 py-2.5 text-sm border rounded-lg outline-none" style={{ borderColor: '#DBEAFE' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Kata Sandi</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border rounded-lg outline-none" style={{ borderColor: '#DBEAFE' }} />
            </div>
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium" style={{ color: '#374151' }}>Pilih Peran Anda</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium" style={{ color: '#0F172A' }}>
                  <input type="radio" name="role" checked={selectedRole === 'doctor'} onChange={() => setSelectedRole('doctor')} className="accent-blue-600" />
                  Dokter
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium" style={{ color: '#0F172A' }}>
                  <input type="radio" name="role" checked={selectedRole === 'nurse'} onChange={() => setSelectedRole('nurse')} className="accent-blue-600" />
                  Perawat
                </label>
              </div>
            </div>
            <div className="pt-2 space-y-3">
              <button onClick={() => onLogin(selectedRole, 'Demo User')} className="w-full py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>
                Masuk dengan Email
              </button>
              <button onClick={() => handleGoogleAuth()} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: '#2563FF' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Lanjutkan dengan Google
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#94A3B8' }}>Hanya untuk tenaga kesehatan terotorisasi</p>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ setScreen, setPatient, role }: { setScreen: (s: Screen) => void; setPatient: (p: Patient) => void; role: Role }) {
  const patients = useStore(s => s.patients)
  const allAlerts = useStore(s => s.alerts)

  const counts = {
    active: patients.length,
    high: patients.filter(p => p.priority === 'critical' || p.priority === 'high').length,
    alerts: allAlerts.filter(a => !a.acked).length,
    overdue: patients.filter(p => p.nextMonitoring === 'Segera').length,
  }
  const urgent = [...patients].sort((a, b) => {
    const o: Record<Priority, number> = { critical: 0, high: 1, attention: 2, stable: 3 }
    return o[a.priority] - o[b.priority]
  }).filter(p => p.priority !== 'stable')

  const pathwayCounts = [
    { label: 'Belum Dimulai', count: patients.filter(p => p.pathwayStatus === 'Belum Dimulai').length },
    { label: 'Menunggu Validasi Dokter', count: patients.filter(p => p.pathwayStatus === 'Menunggu Validasi Dokter').length },
    { label: 'Monitoring Aktif', count: patients.filter(p => p.pathwayStatus === 'Monitoring Aktif').length },
    { label: 'Reassessment Due', count: patients.filter(p => p.pathwayStatus === 'Reassessment Due').length },
    { label: 'Escalated', count: patients.filter(p => p.pathwayStatus === 'Escalated').length },
    { label: 'Discharge Review', count: patients.filter(p => p.pathwayStatus === 'Discharge Review').length },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      <TopBar
        title="Dashboard"
        subtitle="Ringkasan kondisi pasien dengue aktif dan peringatan terbaru."
      >
        <span className="text-xs" style={{ color: '#94A3B8' }}>Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
      </TopBar>

      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pasien Aktif', value: counts.active, color: '#0F172A', bg: '#fff' },
            { label: 'Prioritas Tinggi / Kritis', value: counts.high, color: '#C2410C', bg: '#FFF7ED' },
            { label: 'Peringatan Aktif', value: counts.alerts, color: '#B45309', bg: '#FFFBEB' },
            { label: 'Monitoring Terlambat', value: counts.overdue, color: '#C62828', bg: '#FEF2F2' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border p-4" style={{ background: item.bg, borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
              <div className="text-3xl font-clinical font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Section 1: Patients needing attention */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Pasien Membutuhkan Perhatian</div>
            <button onClick={() => setScreen('pasien')} className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat semua →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F0F6FF', borderBottom: '1px solid #F1F5F9' }}>
                {['Prioritas', 'Pasien', 'Hari Sakit', 'PNPK', 'Perubahan Terbaru', 'Risiko DSS', 'Monitoring Terakhir', 'Aksi'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold px-4 py-3" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {urgent.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#F1F5F9' }} onClick={() => { setPatient(p); setScreen('patient-detail') }}>
                  <td className="px-4 py-3"><PriorityBadge priority={p.priority} size="sm" /></td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{p.name}</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>{p.bed}</div>
                  </td>
                  <td className="px-4 py-3 font-clinical text-sm" style={{ color: '#374151' }}>Hari {p.illnessDay}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded border" style={{ background: '#EAF2FF', color: '#2563FF', borderColor: '#BFDBFE' }}>{p.pnpkGroup}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.warningSign === '—' ? <span className="text-xs" style={{ color: '#94A3B8' }}>—</span>
                      : <span className="text-xs font-medium" style={{ color: '#C2410C' }}>{p.warningSign}</span>}
                  </td>
                  <td className="px-4 py-3"><DSSTrend value={p.dssRisk} change={p.dssChange} /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{p.lastMonitoring}</td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); setPatient(p); setScreen('patient-detail') }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#2563FF' }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Recent alerts */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Peringatan Terbaru</div>
            <button onClick={() => setScreen('peringatan')} className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat semua →</button>
          </div>
          <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
            {allAlerts.filter(a => !a.acked).slice(0, 3).map((a, i) => {
              const patient = patients.find(p => p.id === a.patientId);
              if (!patient) return null;
              return (
              <div key={a.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer" onClick={() => { setPatient(patient); setScreen('patient-detail') }}>
                <PriorityBadge priority={a.priority} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{patient.name} · {patient.bed}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{a.title} — {a.trigger.join(', ')}</div>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>{a.time}</span>
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg border flex-shrink-0" style={{ borderColor: '#DBEAFE', color: '#2563FF' }}>Review</button>
              </div>
            )})}
            {allAlerts.filter(a => !a.acked).length === 0 && (
              <div className="p-4 text-xs text-center text-gray-500">Tidak ada peringatan baru</div>
            )}
          </div>
        </div>

        {/* Section 3: Clinical Pathway status */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <div className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Status Clinical Pathway</div>
          <div className="grid grid-cols-3 gap-3">
            {pathwayCounts.filter(pc => pc.count > 0 || ['Menunggu Validasi Dokter', 'Monitoring Aktif', 'Escalated'].includes(pc.label)).map(pc => (
              <div key={pc.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg border" style={{ borderColor: '#F1F5F9', background: '#F4F8FF' }}>
                <PathwayBadge status={pc.label} />
                <span className="font-clinical font-semibold text-base ml-2" style={{ color: '#0F172A' }}>{pc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PERINGATAN ───────────────────────────────────────────────────────────────

function PeringatanPage({ patients, setScreen, setPatient }: { patients: Patient[]; setScreen: (s: Screen) => void; setPatient: (p: Patient) => void }) {
  const [filter, setFilter] = useState<'semua' | 'critical' | 'high' | 'review'>('semua')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('all')
  const alerts = useStore(s => s.alerts)
  const markAlertReviewed = useStore(s => s.markAlertReviewed)

  const visible = alerts.filter(a => {
    if (filter !== 'semua' && a.priority !== filter) return false
    if (statusFilter === 'unreviewed' && a.acked) return false
    if (statusFilter === 'reviewed' && !a.acked) return false
    return true
  })

  const counts = { critical: alerts.filter(a => a.priority === 'critical').length, high: alerts.filter(a => a.priority === 'high').length, reviewed: alerts.filter(a => a.acked).length }

  return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      <TopBar title="Peringatan Klinis" subtitle="Pantau dan tinjau perubahan kondisi pasien yang memerlukan perhatian.">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg border font-medium" style={{ background: '#FEF2F2', color: '#C62828', borderColor: '#FECACA' }}>Critical {counts.critical}</span>
          <span className="px-2.5 py-1 rounded-lg border font-medium" style={{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA' }}>Prioritas Tinggi {counts.high}</span>
          <span className="px-2.5 py-1 rounded-lg border font-medium" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>Ditinjau {counts.reviewed}</span>
        </div>
      </TopBar>

      {/* Filters */}
      <div className="px-6 py-3 border-b bg-white flex items-center gap-4" style={{ borderColor: '#DBEAFE' }}>
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
          {[['semua', 'Semua'], ['critical', 'Critical'], ['high', 'Tinggi'], ['review', 'Perlu Ditinjau']].map(([v, label]) => (
            <button key={v} onClick={() => setFilter(v as any)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: filter === v ? '#fff' : 'transparent', color: filter === v ? '#0F172A' : '#6B7280', boxShadow: filter === v ? '0 1px 2px rgba(0,0,0,0.06)' : undefined }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
          {[['all', 'Semua Status'], ['unreviewed', 'Belum Ditinjau'], ['reviewed', 'Sudah Ditinjau']].map(([v, label]) => (
            <button key={v} onClick={() => setStatusFilter(v as any)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: statusFilter === v ? '#fff' : 'transparent', color: statusFilter === v ? '#0F172A' : '#6B7280', boxShadow: statusFilter === v ? '0 1px 2px rgba(0,0,0,0.06)' : undefined }}>
              {label}
            </button>
          ))}
        </div>
        <input className="ml-auto px-3 py-2 text-xs border rounded-lg w-52 outline-none" placeholder="Cari nama pasien / MRN..." style={{ borderColor: '#DBEAFE' }} />
      </div>

      <div className="flex-1 overflow-auto px-6 py-5 space-y-3">
        {visible.map(alert => {
          const isAcked = alert.acked
          const borderCol = alert.priority === 'critical' ? '#FECACA' : '#FED7AA'
          const bgCol = alert.priority === 'critical' ? '#FEF2F2' : '#FFF7ED'
          const patient = patients.find(p => p.id === alert.patientId)
          if (!patient) return null
          return (
            <div key={alert.id} className="rounded-xl border p-5 transition-opacity" style={{ borderColor: isAcked ? '#DBEAFE' : borderCol, background: isAcked ? '#F4F8FF' : bgCol, opacity: isAcked ? 0.65 : 1 }}>
              <div className="flex items-start gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <PriorityBadge priority={alert.priority} size="sm" />
                    <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{alert.title}</span>
                    {isAcked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F0FDF4', color: '#15803D' }}>Ditinjau</span>}
                  </div>
                  <div className="text-xs mb-3" style={{ color: '#6B7280' }}>
                    {patient.name} · {patient.mrn} · {patient.bed} · {alert.time} WIB
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-semibold mb-1.5" style={{ color: '#374151' }}>Pemicu:</div>
                      <ul className="space-y-1">
                        {alert.trigger.map(t => <li key={t} className="flex gap-1.5"><span style={{ color: '#94A3B8' }}>•</span><span style={{ color: '#374151' }}>{t}</span></li>)}
                      </ul>
                    </div>
                    {alert.change.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1.5" style={{ color: '#374151' }}>Perubahan Status:</div>
                        {alert.change.map(c => (
                          <div key={c.label}>
                            <div style={{ color: '#6B7280' }}>{c.label}</div>
                            <div className="font-medium mt-0.5" style={{ color: '#0F172A' }}>{c.from} → {c.to}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>Sumber: {alert.source}</span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>·</span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>Riwayat: {alert.lifecycle.join(' · ')}</span>
                  </div>
                </div>

                {!isAcked && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => { setPatient(patient); setScreen('patient-detail') }}
                      className="text-sm font-semibold px-4 py-2 rounded-lg text-white whitespace-nowrap" style={{ background: '#2563FF' }}>
                      Buka Pasien
                    </button>
                    <button onClick={() => markAlertReviewed(alert.id)}
                      className="text-sm font-medium px-4 py-2 rounded-lg border whitespace-nowrap" style={{ borderColor: '#DBEAFE', color: '#374151', background: '#fff' }}>
                      Tandai Ditinjau
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="text-sm font-medium mb-1" style={{ color: '#0F172A' }}>Tidak ada peringatan aktif</div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>Semua peringatan sudah ditinjau atau belum ada perubahan klinis.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PASIEN LIST ──────────────────────────────────────────────────────────────

function PasienPage({ patients, setScreen, setPatient, role }: { patients: Patient[]; setScreen: (s: Screen) => void; setPatient: (p: Patient) => void; role: Role }) {
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [pathwayFilter, setPathwayFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const visible = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.mrn.includes(search) && !p.bed.toLowerCase().includes(search.toLowerCase())) return false
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false
    if (pathwayFilter !== 'all' && p.pathwayStatus !== pathwayFilter) return false
    return true
  })

  return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      <TopBar title="Pasien" subtitle="Kelola pasien confirmed dengue dan status clinical pathway.">
        {role !== 'nurse' && (
          <button onClick={() => setScreen('add-patient')} className="text-sm font-semibold px-4 py-2 rounded-lg text-white flex items-center gap-1.5" style={{ background: '#2563FF' }}>
            + Tambah Pasien
          </button>
        )}
      </TopBar>

      {/* Filters bar */}
      <div className="px-6 py-3 border-b bg-white flex items-center gap-3 flex-wrap" style={{ borderColor: '#DBEAFE' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 text-xs border rounded-lg w-56 outline-none" placeholder="Cari nama / MRN / bed..." style={{ borderColor: '#DBEAFE' }} />
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="text-xs border rounded-lg px-2.5 py-2 outline-none" style={{ borderColor: '#DBEAFE', color: '#374151' }}>
          <option value="all">Semua Prioritas</option>
          <option value="critical">Kritis</option>
          <option value="high">Prioritas Tinggi</option>
          <option value="attention">Perlu Evaluasi</option>
          <option value="stable">Stabil</option>
        </select>
        <select value={pathwayFilter} onChange={e => setPathwayFilter(e.target.value)} className="text-xs border rounded-lg px-2.5 py-2 outline-none" style={{ borderColor: '#DBEAFE', color: '#374151' }}>
          <option value="all">Semua Status Pathway</option>
          {['Belum Dimulai', 'Assessment Berjalan', 'Menunggu Validasi Dokter', 'Monitoring Aktif', 'Reassessment Due', 'Escalated', 'Discharge Review', 'Completed'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>{visible.length} pasien</span>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F0F6FF', borderBottom: '1px solid #DBEAFE' }}>
                {['Pasien', 'Tgl Masuk', 'Hari Sakit', 'PNPK', 'Prioritas', 'Clinical Pathway', 'Risiko DSS', 'Monitoring', 'Aksi'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold px-4 py-3" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#F1F5F9' }} onClick={() => { setPatient(p); setScreen('patient-detail') }}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{p.name}</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>{p.mrn} · {p.bed}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#374151' }}>{p.admissionDate} {p.admissionTime}</td>
                  <td className="px-4 py-3 font-clinical text-sm" style={{ color: '#374151' }}>Hari {p.illnessDay}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded border" style={{ background: '#EAF2FF', color: '#2563FF', borderColor: '#BFDBFE' }}>{p.pnpkGroup}</span>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={p.priority} size="sm" /></td>
                  <td className="px-4 py-3"><PathwayBadge status={p.pathwayStatus} /></td>
                  <td className="px-4 py-3"><DSSTrend value={p.dssRisk} change={p.dssChange} /></td>
                  <td className="px-4 py-3">
                    <div className="text-xs" style={{ color: '#6B7280' }}>{p.lastMonitoring}</div>
                    <div className="text-xs font-medium" style={{ color: p.nextMonitoring === 'Segera' ? '#C62828' : '#374151' }}>
                      Berikutnya: {p.nextMonitoring}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); setPatient(p); setScreen('patient-detail') }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#2563FF' }}>
                      Buka
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── ADD PATIENT FLOW ─────────────────────────────────────────────────────────

function AddPatient({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)
  const addPatient = useStore(s => s.addPatient)
  const [patientData, setPatientData] = useState<Partial<Patient>>({
    mrn: '', name: '', age: '28 thn', ageMo: 336, weight: '', bed: '', ward: '', 
    illnessDay: 1, admissionDate: '', admissionTime: '', pnpkGroup: 'Belum Dinilai',
    dssRisk: 0, dssChange: 0, lastMonitoring: 'Belum ada', nextMonitoring: '—',
    priority: 'attention', warningSign: '—', doctorValidated: false, pathwayStatus: 'Belum Dimulai', gender: 'Laki-laki'
  })

  if (saved) return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      <TopBar title="Tambah Pasien" />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm w-full shadow-sm border" style={{ borderColor: '#DBEAFE' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ background: '#F0FDF4' }}>✓</div>
          <div className="text-base font-semibold mb-1" style={{ color: '#0F172A' }}>Pasien berhasil ditambahkan.</div>
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>Clinical Pathway:</div>
          <div className="mb-6"><PathwayBadge status="Belum Dimulai" /></div>
          <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mb-2" style={{ background: '#2563FF' }}>Mulai PNPK Assessment</button>
          <button onClick={onDone} className="w-full py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Kembali ke Daftar Pasien</button>
        </div>
      </div>
    </div>
  )

  const steps = ['Identitas', 'Episode Dengue', 'Review']
  return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      <TopBar title="Tambah Pasien Baru">
        <button onClick={onDone} className="text-sm border rounded-lg px-3 py-1.5" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
      </TopBar>

      {/* Step indicator */}
      <div className="bg-white border-b px-6 py-3" style={{ borderColor: '#DBEAFE' }}>
        <div className="flex items-center gap-0 max-w-md">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${i + 1 <= step ? 'text-white' : 'text-gray-400'}`}
                  style={{ background: i + 1 <= step ? '#2563FF' : '#E2E8F0' }}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: i + 1 === step ? '#2563FF' : '#94A3B8' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="w-12 h-0.5 mx-3" style={{ background: i + 1 < step ? '#2563FF' : '#E2E8F0' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        <div className="max-w-xl">
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Identitas Pasien</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'MRN / Nomor Rekam Medis', field: 'mrn', placeholder: '24-08-006', full: true },
                    { label: 'Nama Lengkap', field: 'name', placeholder: 'An. / Tn. / Ny. ...', full: true },
                    { label: 'Tanggal Lahir', field: 'dob', placeholder: 'DD/MM/YYYY', type: 'date' },
                    { label: 'Jenis Kelamin', field: 'gender', placeholder: '', select: true, options: ['Laki-laki', 'Perempuan'] },
                    { label: 'Berat Badan', field: 'weight', placeholder: '—', unit: 'kg' },
                    { label: 'Tanggal Masuk', field: 'admissionDate', placeholder: '', type: 'date' },
                    { label: 'Jam Masuk', field: 'admissionTime', placeholder: '', type: 'time' },
                    { label: 'Ward', field: 'ward', placeholder: '', select: true, options: ['Rawat Inap Anak', 'Rawat Inap Dewasa', 'IGD', 'ICU'] },
                    { label: 'Nomor Bed', field: 'bed', placeholder: 'B-07' },
                  ].map(f => (
                    <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                      <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>{f.label}</label>
                      {f.select ? (
                        <select value={(patientData as any)[f.field] || ''} onChange={e => setPatientData({...patientData, [f.field]: e.target.value})} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#DBEAFE' }}>
                          <option value="">Pilih...</option>
                          {f.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type={f.type ?? 'text'} value={(patientData as any)[f.field] || ''} onChange={e => setPatientData({...patientData, [f.field]: e.target.value})} placeholder={f.placeholder} className="border rounded-lg px-3 py-2.5 text-sm flex-1 outline-none font-clinical" style={{ borderColor: '#DBEAFE' }} />
                          {f.unit && <span className="text-xs" style={{ color: '#94A3B8' }}>{f.unit}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Episode Dengue</h3>
                <div className="p-3 rounded-lg text-xs font-medium" style={{ background: '#EAF2FF', color: '#2563FF' }}>
                  Status: Confirmed Dengue
                </div>
                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: '#374151' }}>Metode Konfirmasi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['NS1', 'PCR', 'Serologi', 'Rekam Medis'].map(m => (
                      <label key={m} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer" style={{ borderColor: '#DBEAFE' }}>
                        <input type="radio" name="method" /> {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Tanggal Konfirmasi</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#DBEAFE' }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Tanggal Mulai Gejala</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#DBEAFE' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: '#F4F8FF', borderColor: '#DBEAFE' }}>
                  <div className="text-xs" style={{ color: '#6B7280' }}>Hari sakit dihitung otomatis:</div>
                  <div className="font-clinical text-lg font-semibold mt-0.5" style={{ color: '#0F172A' }}>Hari 1</div>
                  <div className="text-xs" style={{ color: '#94A3B8' }}>Dari tanggal mulai gejala</div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Review & Konfirmasi</h3>
                {[
                  { section: 'Identitas', rows: [['MRN', '24-08-006'], ['Nama', 'An. Contoh Pasien'], ['Usia', '10 tahun'], ['Berat', '32 kg'], ['Bed', 'B-09'], ['Ward', 'Rawat Inap Anak']] },
                  { section: 'Episode Dengue', rows: [['Status', 'Confirmed Dengue'], ['Metode', 'NS1'], ['Tgl Konfirmasi', '8 Agt 2024'], ['Tgl Mulai Gejala', '4 Agt 2024'], ['Hari Sakit', 'Hari 4']] },
                ].map(s => (
                  <div key={s.section}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>{s.section}</div>
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#DBEAFE' }}>
                      {s.rows.map(([k, v], i) => (
                        <div key={k} className={`flex items-center px-3 py-2 ${i < s.rows.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#F1F5F9' }}>
                          <span className="text-xs w-36" style={{ color: '#6B7280' }}>{k}</span>
                          <span className="text-xs font-medium" style={{ color: '#0F172A' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-xs p-3 rounded-lg" style={{ background: '#FFFBEB', color: '#B45309' }}>
                  PNPK Assessment belum dijalankan. Lakukan penilaian PNPK setelah pasien berhasil ditambahkan.
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <button onClick={() => step > 1 ? setStep(step - 1) : onDone()}
              className="text-sm font-medium px-5 py-2.5 rounded-lg border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>
              {step === 1 ? 'Batal' : 'Kembali'}
            </button>
            <button onClick={() => {
              if (step < 3) setStep(step + 1)
              else {
                addPatient({ ...patientData, id: 'p' + Date.now(), admissionDate: patientData.admissionDate || new Date().toISOString().split('T')[0], admissionTime: patientData.admissionTime || '12:00' } as Patient)
                setSaved(true)
              }
            }}
              className="text-sm font-semibold px-6 py-2.5 rounded-lg text-white" style={{ background: '#2563FF' }}>
              {step === 3 ? 'Tambahkan Pasien' : 'Lanjutkan →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PATIENT DETAIL (tabbed) ──────────────────────────────────────────────────

function PatientDetail({ patient, setScreen, role }: { patient: Patient; setScreen: (s: Screen) => void; role: Role }) {
  const [tab, setTab] = useState<PatientTab>('ringkasan')
  const [showMonModal, setShowMonModal] = useState(false)
  const [showCatatan, setShowCatatan] = useState(false)
  const notes = useStore(s => s.doctorNotes[patient.id] || [])
  const addNote = useStore(s => s.addNote)

  const tabs: { id: PatientTab; label: string }[] = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'pathway', label: 'Clinical Pathway' },
    { id: 'monitoring', label: 'Monitoring & Grafik' },
    { id: 'dss', label: 'Risiko DSS' },
    { id: 'timeline', label: 'Timeline & Dokumen' },
  ]

  const isOverdue = patient.nextMonitoring === 'Segera'

  return (
    <div className="flex flex-col h-full" style={{ background: '#EAF2FF' }}>
      {/* UC2.1 — Pengingat Monitoring Terlambat */}
      {isOverdue && (
        <div className="flex items-center gap-3 px-6 py-2.5 text-sm font-medium" style={{ background: '#FEF2F2', color: '#C62828', borderBottom: '1px solid #FECACA' }}>
          <span className="text-base">⚠</span>
          <span>Monitoring <strong>terlambat</strong> — jadwal pemantauan serial seharusnya sudah dilakukan. Segera input data monitoring terbaru.</span>
          <button onClick={() => setShowMonModal(true)} className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0" style={{ background: '#C62828' }}>
            + Input Sekarang
          </button>
        </div>
      )}

      {/* Sticky patient header */}
      <div className="bg-white border-b" style={{ borderColor: '#DBEAFE' }}>
        <div className="px-6 py-3 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => setScreen('pasien')} className="text-xs mt-1 flex-shrink-0" style={{ color: '#94A3B8' }}>← Pasien</button>
            <div>
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <span className="text-base font-semibold" style={{ color: '#0F172A' }}>{patient.name}</span>
                <PriorityBadge priority={patient.priority} />
                <PathwayBadge status={patient.pathwayStatus} />
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: '#6B7280' }}>
                {[patient.mrn, `${patient.age} · ${patient.weight}`, `${patient.bed} — ${patient.ward}`, 'Dengue Terkonfirmasi', `Hari Sakit ${patient.illnessDay}`, `Masuk ${patient.admissionDate} ${patient.admissionTime}`].map((item, i) => (
                  <span key={i} className="flex items-center gap-3">
                    {i > 0 && <span>·</span>}{item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowMonModal(true)} className="text-sm font-medium px-3 py-2 rounded-lg border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>+ Tambah Monitoring</button>
            {/* UC2 — Catatan Tindak Lanjut (dokter only) */}
            {role === 'doctor' && (
              <button onClick={() => setShowCatatan(true)} className="text-sm font-medium px-3 py-2 rounded-lg border" style={{ borderColor: '#DBEAFE', color: '#2563FF' }}>✎ Catatan Klinis</button>
            )}
            {role === 'doctor' && !patient.doctorValidated && (
              <button onClick={() => setTab('pathway')} className="text-sm font-semibold px-3 py-2 rounded-lg text-white" style={{ background: '#C2410C' }}>
                Validasi PNPK
              </button>
            )}
          </div>
        </div>

        {/* 4 key states */}
        <div className="px-6 pb-3 flex items-center gap-6 border-b" style={{ borderColor: '#F1F5F9' }}>
          {[
            { label: 'PRIORITAS', value: <PriorityBadge priority={patient.priority} size="sm" /> },
            { label: 'PNPK', value: <span className="text-xs font-semibold" style={{ color: '#2563FF' }}>{patient.pnpkGroup}</span> },
            { label: 'DSS RISK', value: <DSSTrend value={patient.dssRisk} change={patient.dssChange} /> },
            { label: 'MONITORING BERIKUTNYA', value: (
              <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: isOverdue ? '#C62828' : '#374151' }}>
                {isOverdue && <span>⚠</span>}{patient.nextMonitoring}
              </span>
            )},
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{item.label}</span>
              {item.value}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex px-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{ borderColor: tab === t.id ? '#2563FF' : 'transparent', color: tab === t.id ? '#2563FF' : '#6B7280' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'ringkasan' && <RingkasanTab patient={patient} setTab={setTab} role={role} notes={notes} />}
        {tab === 'pathway' && <PathwayTab patient={patient} />}
        {tab === 'monitoring' && <MonitoringTab patient={patient} role={role} />}
        {tab === 'dss' && <DSSTab patient={patient} />}
        {tab === 'timeline' && <TimelineTab patient={patient} notes={notes} />}
      </div>

      {showMonModal && <MonitoringModal patient={patient} onClose={() => setShowMonModal(false)} />}
      {showCatatan && <CatatanModal onClose={() => setShowCatatan(false)} onSave={(note) => { if (addNote) addNote(patient.id, note); setShowCatatan(false) }} />}
    </div>
  )
}

// ─── TAB: RINGKASAN ───────────────────────────────────────────────────────────

function RingkasanTab({ patient, setTab, role, notes }: { patient: Patient; setTab: (t: PatientTab) => void; role: Role; notes: DoctorNote[] }) {
  const history = useStore(s => s.monitoringHistory[patient.id] || [])
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  
  return (
    <div className="px-6 py-5">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Priority + PNPK summary */}
        <div className="col-span-2 space-y-4">
          {/* Validation banner */}
          {!patient.doctorValidated && role === 'doctor' && (
            <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <span className="text-amber-500 mt-0.5">◆</span>
              <div className="flex-1">
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#B45309' }}>Menunggu Validasi Dokter</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>Klasifikasi PNPK diperbarui berdasarkan data terbaru. Tinjauan diperlukan.</div>
              </div>
              <button onClick={() => setTab('pathway')} className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0" style={{ background: '#2563FF' }}>
                Tinjau
              </button>
            </div>
          )}

          {/* Latest vitals */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Status Klinis Terbaru</div>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{latest ? `${latest.time} — ${latest.actor}` : 'Belum ada data'}</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Tekanan Darah', value: latest ? `${latest.sbp}/${latest.dbp}` : '—', unit: 'mmHg', prev: prev ? `${prev.sbp}/${prev.dbp}` : '—', flag: latest && latest.sbp < 90 ? 'high' : 'normal' },
                { label: 'Nadi', value: latest?.hr || '—', unit: 'x/mnt', prev: prev?.hr || '—', flag: latest && latest.hr > 100 ? 'attention' : 'normal' },
                { label: 'Suhu', value: latest?.temp || '—', unit: '°C', prev: prev?.temp || '—', flag: latest && latest.temp > 38 ? 'attention' : 'normal' },
                { label: 'Diuresis', value: '0.8', unit: 'mL/kg/jam', prev: '1.2', flag: 'high' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg" style={{ background: item.flag === 'high' ? '#FEF2F2' : item.flag === 'attention' ? '#FFF7ED' : '#F8FAFB' }}>
                  <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{item.label}</div>
                  <div className="font-clinical text-lg font-semibold" style={{ color: item.flag === 'high' ? '#C62828' : item.flag === 'attention' ? '#C2410C' : '#0F172A' }}>{item.value}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{item.unit}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Sblm: {item.prev}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Laboratorium Terbaru</div>
              <button onClick={() => setTab('monitoring')} className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat tren →</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Hematokrit', value: latest?.hct || '—', unit: '%', prev: prev?.hct || '—', flag: latest && latest.hct >= 40 ? 'high' : 'normal' },
                { label: 'Trombosit', value: latest?.plt || '—', unit: '×10³/µL', prev: prev?.plt || '—', flag: latest && latest.plt < 100 ? 'low' : 'normal' },
                { label: 'Leukosit', value: '3.2', unit: '×10³/µL', prev: '4.1', flag: 'low' },
                { label: 'Hemoglobin', value: '13.8', unit: 'g/dL', prev: '13.2', flag: 'normal' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg" style={{ background: item.flag === 'high' ? '#FFF7ED' : item.flag === 'low' ? '#FEF2F2' : '#F8FAFB' }}>
                  <div className="text-xs mb-0.5" style={{ color: '#6B7280' }}>{item.label}</div>
                  <div className="font-clinical text-xl font-semibold" style={{ color: item.flag === 'high' ? '#C2410C' : item.flag === 'low' ? '#C62828' : '#0F172A' }}>{item.value}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{item.unit}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Sblm: {item.prev}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning signs */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Warning Signs</div>
            <div className="space-y-2">
              {[
                { sign: 'Muntah persisten (>3x)', time: '13:50', present: true },
                { sign: 'Hematokrit meningkat ≥20%', time: '14:20', present: true },
                { sign: 'Asupan oral berkurang', time: '13:50', present: true },
                { sign: 'Nyeri perut / nyeri tekan abdomen', time: '—', present: false },
                { sign: 'Perdarahan mukosa', time: '—', present: false },
              ].map(w => (
                <div key={w.sign} className="flex items-center gap-3 py-1.5 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px] ${w.present ? 'bg-[#FEF2F2]' : 'bg-[#F8FAFB]'}`}>
                    {w.present ? '✓' : '—'}
                  </div>
                  <span className="text-sm flex-1" style={{ color: w.present ? '#C62828' : '#94A3B8' }}>{w.sign}</span>
                  {w.present && <span className="text-xs" style={{ color: '#94A3B8' }}>{w.time}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* DSS summary */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Estimasi Risiko DSS</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-clinical text-3xl font-bold" style={{ color: patient.dssRisk >= 40 ? '#C62828' : '#C2410C' }}>{patient.dssRisk}%</span>
              <span className="text-sm font-medium" style={{ color: '#C2410C' }}>↑ +{patient.dssChange}%</span>
            </div>
            <div className="text-xs mb-3" style={{ color: '#6B7280' }}>Dari {patient.dssRisk - patient.dssChange}% (Hari {patient.illnessDay - 1})</div>
            <button onClick={() => setTab('dss')} className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat detail risiko →</button>
          </div>

          {/* Quick pathway */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Jalur Klinis</div>
            <div className="space-y-3">
              {[
                { time: '08:10', label: 'Pasien ditambahkan', done: true },
                { time: '08:28', label: 'Baseline Assessment', done: true },
                { time: '08:30', label: 'Penilaian PNPK — Grup B', done: true },
                { time: '14:20', label: 'Update Laboratorium', done: true },
                { time: 'Menunggu', label: 'Validasi Dokter', done: false, current: true },
                { time: '—', label: 'Monitoring Lanjutan', done: false },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full border-2 ${step.current ? 'border-[#B45309] bg-[#FDE68A]' : step.done ? 'border-[#2563FF] bg-[#2563FF]' : 'border-[#E2E8F0] bg-white'}`} />
                    {i < arr.length - 1 && <div className="w-0.5 h-4 mt-0.5" style={{ background: step.done ? '#2563FF' : '#E2E8F0' }} />}
                  </div>
                  <div className="pb-1">
                    <div className="text-xs font-medium" style={{ color: step.current ? '#B45309' : step.done ? '#0F172A' : '#94A3B8' }}>{step.label}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setTab('pathway')} className="mt-3 text-xs font-medium" style={{ color: '#2563FF' }}>Lihat detail pathway →</button>
          </div>

          {/* UC2 — Catatan Tindak Lanjut Klinis */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Catatan Tindak Lanjut</div>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{notes.length} catatan</span>
            </div>
            {notes.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: '#94A3B8' }}>Belum ada catatan klinis.</div>
            ) : (
              <div className="space-y-3">
                {notes.slice(-2).map(n => (
                  <div key={n.id} className="p-3 rounded-lg border" style={{ background: '#F4F8FF', borderColor: '#DBEAFE' }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="text-xs font-semibold" style={{ color: '#0F172A' }}>{n.title}</div>
                      <span className="font-clinical text-xs" style={{ color: '#94A3B8' }}>{n.time}</span>
                    </div>
                    <div className="text-xs mb-1" style={{ color: '#374151', lineHeight: 1.5 }}>{n.content}</div>
                    <div className="text-xs" style={{ color: '#4A8CF7' }}>{n.author}</div>
                  </div>
                ))}
              </div>
            )}
            {role === 'doctor' && (
              <button onClick={() => setTab('timeline')} className="mt-3 text-xs font-medium" style={{ color: '#2563FF' }}>Lihat semua catatan →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TAB: CLINICAL PATHWAY ────────────────────────────────────────────────────

function PathwayTab({ patient }: { patient: Patient }) {
  const [confirmed, setConfirmed] = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [overrideNote, setOverrideNote] = useState('')

  return (
    <div className="px-6 py-5">
      <div className="grid grid-cols-2 gap-4 max-w-5xl">
        {/* Pathway tracker */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Clinical Pathway Aktif</div>
            <div className="space-y-0">
              {[
                { time: '08:10', label: 'Pasien Ditambahkan', result: 'Confirmed Dengue', actor: 'Sistem', done: true },
                { time: '08:28', label: 'Baseline Assessment', result: 'Data klinis lengkap', actor: 'Dr. Budi S.', done: true },
                { time: '08:30', label: 'Penilaian PNPK', result: 'Grup B — Dengue dengan Warning Signs', actor: 'Dr. Budi S.', done: true },
                { time: '08:34', label: 'Divalidasi Dokter', result: 'Grup B dikonfirmasi', actor: 'Dr. Budi S.', done: true },
                { time: '—', label: 'Monitoring Aktif', result: 'Next assessment 16:00', actor: '', done: false, current: true, next: 'Next assessment: 16:00' },
                { time: '—', label: 'Reassessment', result: '', actor: '', done: false },
                { time: '—', label: 'Discharge Review', result: '', actor: '', done: false },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-1 ${step.current ? 'border-[#2563FF] bg-[#2563FF]' : step.done ? 'border-[#2563FF] bg-[#2563FF]' : 'border-[#E2E8F0] bg-white'}`}>
                      {step.done && <div className="w-full h-full rounded-full flex items-center justify-center"><span className="text-[7px] text-white">✓</span></div>}
                    </div>
                    {i < arr.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: step.done ? '#2563FF' : '#E2E8F0', minHeight: 20 }} />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium" style={{ color: step.current ? '#2563FF' : step.done ? '#0F172A' : '#94A3B8' }}>{step.label}</span>
                      {step.current && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#EAF2FF', color: '#2563FF' }}>Aktif</span>}
                    </div>
                    {step.result && <div className="text-xs" style={{ color: '#6B7280' }}>{step.result}</div>}
                    {step.actor && <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{step.time} · {step.actor}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PNPK result + validation */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
            <div className="px-6 py-5" style={{ background: '#2563FF' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Rekomendasi Berbasis PNPK</div>
              <div className="text-3xl font-bold text-white mb-0.5">GRUP B</div>
              <div className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Dengue dengan Warning Signs</div>
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#F0F6FF', borderBottom: '1px solid #DBEAFE' }}>
              <span className="text-xs" style={{ color: '#6B7280' }}>Sumber: <strong>PNPK Dengue Anak dan Remaja</strong></span>
              <button className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat seluruh dasar aturan →</button>
            </div>
            <div className="p-5">
              <div className="text-xs font-semibold mb-3" style={{ color: '#374151' }}>Dasar Rekomendasi</div>
              <div className="space-y-2.5">
                {[
                  { criterion: 'Muntah persisten (>3x)', detail: 'Dicatat pukul 13:50', matched: true },
                  { criterion: 'Hematokrit meningkat ≥20%', detail: '39% → 45% (+15.4%)', matched: true },
                  { criterion: 'Asupan oral berkurang', detail: 'Dicatat pukul 13:50', matched: true },
                  { criterion: 'Trombosit menurun cepat', detail: '120 → 58 ×10³/µL', matched: true },
                  { criterion: 'Perdarahan mukosa', detail: 'Tidak tercatat', matched: false },
                ].map(e => (
                  <div key={e.criterion} className="flex items-start gap-2.5 pb-2.5 border-b last:border-b-0" style={{ borderColor: '#F1F5F9' }}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] ${e.matched ? 'bg-[#F0FDF4]' : 'bg-[#F8FAFB]'}`}>{e.matched ? '✓' : '—'}</div>
                    <div>
                      <div className="text-sm" style={{ color: e.matched ? '#0F172A' : '#94A3B8' }}>{e.criterion}</div>
                      <div className="text-xs" style={{ color: e.matched ? '#6B7280' : '#94A3B8' }}>{e.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doctor validation */}
          {!confirmed ? (
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold" style={{ color: '#B45309' }}>Menunggu validasi dokter</span>
              </div>
              <p className="text-xs mb-4" style={{ color: '#6B7280' }}>DENGUARD memberikan dukungan keputusan. Keputusan klinis akhir tetap berada pada dokter.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmed(true)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#2563FF' }}>Konfirmasi</button>
                <button onClick={() => setShowOverride(true)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Clinical Override</button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-4" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm">✓</span>
                <span className="text-sm font-semibold" style={{ color: '#15803D' }}>Dikonfirmasi oleh dr. Budi Santoso</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Klasifikasi Grup B dikonfirmasi · {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Override Modal */}
      {showOverride && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-base font-semibold mb-1" style={{ color: '#0F172A' }}>Clinical Override</div>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Tindakan ini akan dicatat dalam audit trail. Diperlukan alasan klinis yang jelas.</p>
            <div className="mb-3">
              <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Klasifikasi alternatif dokter</label>
              <select className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: '#DBEAFE' }}>
                <option>Grup A — Dengue tanpa Warning Signs</option>
                <option>Grup B — Dengue dengan Warning Signs</option>
                <option>Grup C — Dengue Berat</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Alasan klinis <span style={{ color: '#C62828' }}>*</span></label>
              <textarea rows={3} value={overrideNote} onChange={e => setOverrideNote(e.target.value)} placeholder="Tuliskan alasan klinis..." className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none" style={{ borderColor: '#DBEAFE' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowOverride(false)} className="flex-1 py-2.5 rounded-lg text-sm border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
              <button onClick={() => { setShowOverride(false); setConfirmed(true) }} disabled={!overrideNote} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#C62828' }}>
                Konfirmasi Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: MONITORING & GRAFIK ─────────────────────────────────────────────────

function MonitoringTab({ patient, role }: { patient: Patient; role: Role }) {
  const [range, setRange] = useState<'12' | '24' | '48' | 'all'>('24')
  const [showHct, setShowHct] = useState(true)
  const [showPlt, setShowPlt] = useState(true)
  const history = useStore(s => s.monitoringHistory[patient.id] || [])
  const entries = history
  const [koreksiTarget, setKoreksiTarget] = useState<MonitoringEntry | null>(null)

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Perkembangan Klinis</div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg ml-auto" style={{ background: '#F1F5F9' }}>
          {(['12', '24', '48', 'all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: range === r ? '#fff' : 'transparent', color: range === r ? '#0F172A' : '#6B7280', boxShadow: range === r ? '0 1px 2px rgba(0,0,0,0.06)' : undefined }}>
              {r === 'all' ? 'Semua' : `${r} jam`}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter selector */}
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="text-xs font-semibold mb-3" style={{ color: '#374151' }}>Parameter</div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Hematokrit', checked: showHct, set: setShowHct, color: '#C2410C' },
            { label: 'Trombosit', checked: showPlt, set: setShowPlt, color: '#C62828' },
          ].map(p => (
            <label key={p.label} className="flex items-center gap-2 cursor-pointer text-xs font-medium" style={{ color: p.checked ? p.color : '#94A3B8' }}>
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${p.checked ? 'border-transparent' : ''}`}
                style={{ background: p.checked ? p.color : 'transparent', borderColor: p.checked ? p.color : '#DBEAFE' }}
                onClick={() => p.set(!p.checked)}>
                {p.checked && <span className="text-[8px] text-white">✓</span>}
              </div>
              {p.label}
            </label>
          ))}
          {['Sistolik', 'Diastolik', 'Nadi', 'Suhu', 'Urin Output', 'Hemoglobin', 'Leukosit'].map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer text-xs font-medium" style={{ color: '#94A3B8' }}>
              <div className="w-3.5 h-3.5 rounded border" style={{ borderColor: '#DBEAFE' }} />
              {p}
            </label>
          ))}
        </div>
      </div>

      {/* Charts — separate tracks */}
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <div className="text-sm font-semibold mb-1" style={{ color: '#0F172A' }}>Belum ada data grafik</div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Sistem membutuhkan minimal 1 entri monitoring untuk memproyeksikan tren.</p>
        </div>
      ) : (
        <>
          {showHct && (
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Tren Hematokrit</div>
                  {entries.length > 0 && (
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Terakhir: <span className="font-clinical font-semibold" style={{ color: entries[entries.length - 1].hct >= 40 ? '#C2410C' : '#0F172A' }}>{entries[entries.length - 1].hct}%</span></div>
                  )}
                </div>
                {entries.length > 0 && entries[entries.length - 1].hct >= 40 && <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: '#FFF7ED', color: '#C2410C' }}>Hct meningkat</span>}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={entries.map(e => ({ time: e.time, value: e.hct }))} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono' }} />
                  <YAxis domain={[35, 50]} tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono' }} tickFormatter={v => `${v}%`} width={38} />
                  <Tooltip content={<ChartTooltip unit="%" />} />
                  <ReferenceLine y={40} stroke="#FED7AA" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" stroke="#C2410C" strokeWidth={2} dot={{ fill: '#C2410C', r: 3.5 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {showPlt && (
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Tren Trombosit</div>
                  {entries.length > 0 && (
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Terakhir: <span className="font-clinical font-semibold" style={{ color: entries[entries.length - 1].plt < 100 ? '#C62828' : '#0F172A' }}>{entries[entries.length - 1].plt} ×10³/µL</span></div>
                  )}
                </div>
                {entries.length > 0 && entries[entries.length - 1].plt < 100 && <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: '#FEF2F2', color: '#C62828' }}>&lt; 100 ×10³/µL</span>}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={entries.map(e => ({ time: e.time, value: e.plt }))} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono' }} />
                  <YAxis domain={[40, 140]} tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono' }} width={38} />
                  <Tooltip content={<ChartTooltip unit="×10³/µL" />} />
                  <ReferenceLine y={100} stroke="#FED7AA" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" stroke="#C62828" strokeWidth={2} dot={{ fill: '#C62828', r: 3.5 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Vitals table */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Tanda Vital (24 jam terakhir)</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { param: 'Tekanan Darah', trend: '↓', current: '100/70', unit: 'mmHg', flag: 'attention' },
            { param: 'Nadi', trend: '↑', current: '96', unit: 'x/mnt', flag: 'attention' },
            { param: 'Suhu', trend: '→', current: '37.8', unit: '°C', flag: 'normal' },
            { param: 'Diuresis', trend: '↓', current: '0.8', unit: 'mL/kg/jam', flag: 'high' },
          ].map(v => (
            <div key={v.param} className="p-3 rounded-lg border" style={{ borderColor: v.flag === 'high' ? '#FECACA' : v.flag === 'attention' ? '#FED7AA' : '#DBEAFE', background: v.flag === 'high' ? '#FEF2F2' : v.flag === 'attention' ? '#FFF7ED' : '#F4F8FF' }}>
              <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{v.param}</div>
              <div className="font-clinical text-lg font-semibold" style={{ color: '#0F172A' }}>{v.current}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#94A3B8' }}>{v.unit}</span>
                <span className="text-xs font-medium" style={{ color: v.flag === 'high' ? '#C62828' : v.flag === 'attention' ? '#B45309' : '#166534' }}>{v.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UC3 + UC3.1 — Riwayat Monitoring Serial */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#DBEAFE' }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Riwayat Data Monitoring Serial</div>
            <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>UC3.1 — Koreksi data dengan riwayat perubahan</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: '#EAF2FF', color: '#2563FF' }}>{entries.length} entri</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#F0F6FF', borderBottom: '1px solid #DBEAFE' }}>
              {['Waktu', 'Petugas', 'Hct (%)', 'Plt (×10³)', 'TD', 'Nadi', 'Suhu', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: '#6B7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <>
                <tr key={e.id} className="border-b" style={{ borderColor: '#F1F5F9' }}>
                  <td className="px-4 py-2.5 font-clinical font-medium" style={{ color: '#0F172A' }}>{e.time}</td>
                  <td className="px-4 py-2.5" style={{ color: '#374151' }}>{e.actor}</td>
                  <td className="px-4 py-2.5 font-clinical" style={{ color: e.hct >= 40 ? '#C2410C' : '#0F172A' }}>{e.hct}</td>
                  <td className="px-4 py-2.5 font-clinical" style={{ color: e.plt < 100 ? '#C62828' : '#0F172A' }}>{e.plt}</td>
                  <td className="px-4 py-2.5 font-clinical">{e.sbp}/{e.dbp}</td>
                  <td className="px-4 py-2.5 font-clinical">{e.hr}</td>
                  <td className="px-4 py-2.5 font-clinical">{e.temp}</td>
                  <td className="px-4 py-2.5">
                    {e.corrected
                      ? <span className="px-2 py-0.5 rounded border text-xs" style={{ background: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' }}>Dikoreksi</span>
                      : <span className="px-2 py-0.5 rounded border text-xs" style={{ background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>Original</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {(role === 'nurse' || role === 'doctor') && (
                      <button onClick={() => setKoreksiTarget(e)} className="text-xs font-medium px-2.5 py-1 rounded-lg border" style={{ borderColor: '#DBEAFE', color: '#2563FF' }}>
                        Koreksi
                      </button>
                    )}
                  </td>
                </tr>
                {e.corrected && e.corrections && e.corrections.map((c, ci) => (
                  <tr key={`${e.id}-c${ci}`} style={{ background: '#FFFBEB' }}>
                    <td colSpan={9} className="px-4 py-1.5">
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#B45309' }}>
                        <span>↳ Koreksi {c.at}</span>
                        <span style={{ color: '#D97706' }}>·</span>
                        <span className="font-medium">{c.field}:</span>
                        <span className="font-clinical line-through" style={{ color: '#94A3B8' }}>{c.from}</span>
                        <span>→</span>
                        <span className="font-clinical font-semibold">{c.to}</span>
                        <span style={{ color: '#D97706' }}>·</span>
                        <span style={{ color: '#92400E' }}>{c.reason}</span>
                        <span style={{ color: '#D97706' }}>·</span>
                        <span style={{ color: '#6B7280' }}>{c.by}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {koreksiTarget && (
        <KoreksiModal
          entry={koreksiTarget}
          onClose={() => setKoreksiTarget(null)}
          onSave={(corrected) => {
            // Koreksi logic can be added to store if needed
            setKoreksiTarget(null)
          }}
        />
      )}
    </div>
  )
}

// ─── TAB: RISIKO DSS ──────────────────────────────────────────────────────────

function DSSTab({ patient }: { patient: Patient }) {
  const rc = patient.dssRisk >= 40 ? '#C62828' : patient.dssRisk >= 25 ? '#C2410C' : '#B45309'
  const dssTrajectory = [
    { day: 'H-3', risk: Math.max(0, patient.dssRisk - 15) }, 
    { day: 'H-2', risk: Math.max(0, patient.dssRisk - 8) }, 
    { day: 'H-1', risk: patient.dssRisk - patient.dssChange }, 
    { day: 'Hari Ini', risk: patient.dssRisk }
  ]
  const shapFactors = [
    { name: 'Hematokrit Harian', value: 0.18, dir: 'up' },
    { name: 'Trombosit Harian', value: 0.12, dir: 'up' },
    { name: 'Diuresis', value: 0.08, dir: 'up' },
    { name: 'Usia', value: 0.04, dir: 'up' },
    { name: 'Tekanan Darah Sistolik', value: 0.06, dir: 'down' }
  ]
  return (
    <div className="px-6 py-5 max-w-3xl space-y-4">
      {/* Hero */}
      <div className="rounded-xl border p-6" style={{ background: '#2563FF', borderColor: '#2563FF' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Estimasi Risiko DSS Saat Ini</div>
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="text-5xl font-clinical font-bold" style={{ color: '#FFFFFF' }}>{patient.dssRisk}%</span>
              <span className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>↑ +{patient.dssChange}%</span>
            </div>
            <div className="text-sm" style={{ color: '#EAF2FF' }}>Meningkat dari {patient.dssRisk - patient.dssChange}% — Hari {patient.illnessDay - 1}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Titik prediksi: Hari Sakit {patient.illnessDay} · 14:20 WIB · Model tersedia</div>
            <div className="mt-3 text-xs p-2.5 rounded-lg inline-block" style={{ background: 'rgba(255,255,255,0.15)', color: '#EAF2FF' }}>
              Estimasi berdasarkan data yang tersedia hingga titik penilaian ini.
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>Risiko meningkat</span>
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>Perubahan Risiko DSS</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dssTrajectory} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <YAxis domain={[0, 50]} tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'DM Mono' }} tickFormatter={v => `${v}%`} width={38} />
            <Tooltip content={<ChartTooltip unit="%" />} />
            <ReferenceLine y={30} stroke="#FECACA" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="risk" stroke={rc} strokeWidth={2.5} dot={{ fill: rc, r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>— Garis merah: ambang perhatian 30%</div>
      </div>

      {/* SHAP */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Faktor yang Berkontribusi terhadap Prediksi</div>
          <button className="text-xs font-medium" style={{ color: '#2563FF' }}>Lihat detail model →</button>
        </div>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Kontribusi menjelaskan pengaruh fitur terhadap keluaran model, bukan hubungan sebab-akibat.</p>
        <div className="space-y-4">
          {[{ label: 'Meningkatkan estimasi risiko', color: '#C2410C', dir: 'up' }, { label: 'Menurunkan estimasi risiko', color: '#15803D', dir: 'down' }].map(section => (
            <div key={section.label}>
              <div className="text-xs font-semibold mb-2" style={{ color: section.color }}>{section.label}</div>
              <div className="space-y-2">
                {shapFactors.filter(f => f.dir === section.dir).map(f => (
                  <div key={f.name} className="flex items-center gap-3">
                    <div className="text-xs w-40 flex-shrink-0" style={{ color: '#374151' }}>{f.name}</div>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded" style={{ width: `${Math.abs(f.value) * 400}%`, background: section.color, opacity: 0.65 }} />
                    </div>
                    <div className="font-clinical text-xs w-10 text-right" style={{ color: section.color }}>
                      {f.dir === 'up' ? '+' : ''}{(f.value * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model info */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
        <div className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Informasi Model</div>
        <div className="grid grid-cols-2 gap-3">
          {[['Versi Model', 'DENGUARD-DSS v1.2.1'], ['Timestamp Prediksi', '14:21 WIB'], ['Kelengkapan Data', '94% fitur tersedia'], ['Populasi Tervalidasi', 'Anak & Remaja (5–17 thn)']].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs" style={{ color: '#6B7280' }}>{k}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: '#374151' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: TIMELINE & DOKUMEN ──────────────────────────────────────────────────

function TimelineTab({ patient, notes }: { patient: Patient; notes: DoctorNote[] }) {
  const [showExport, setShowExport] = useState(false)
  const [logView, setLogView] = useState<'timeline' | 'notes' | 'log'>('timeline')
  const timelineEvents = useStore(s => s.timelineEvents[patient.id] || [])
  const monitoringHistory = useStore(s => s.monitoringHistory[patient.id] || [])

  const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    info: { label: 'Info', color: '#6B7280', bg: '#F4F8FF', border: '#DBEAFE' },
    validation: { label: 'Validasi', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    monitoring: { label: 'Monitoring', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    lab: { label: 'Laboratorium', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    'priority-change': { label: 'Perubahan Prioritas', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
    review: { label: 'Tinjauan Dokter', color: '#2563FF', bg: '#EAF2FF', border: '#C7D7FE' },
    pending: { label: 'Menunggu', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  }

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Timeline & Dokumen — {patient.name}</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
            {([['timeline', 'Timeline Klinis'], ['notes', 'Catatan Dokter'], ['log', 'Log Perubahan Data']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setLogView(v)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{ background: logView === v ? '#fff' : 'transparent', color: logView === v ? '#0F172A' : '#6B7280', boxShadow: logView === v ? '0 1px 2px rgba(0,0,0,0.06)' : undefined }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowExport(true)} className="text-sm font-medium px-4 py-2 rounded-lg border flex items-center gap-1.5" style={{ borderColor: '#DBEAFE', color: '#374151' }}>
            Export
          </button>
        </div>
      </div>

      {logView === 'timeline' && (
        <div className="max-w-2xl bg-white rounded-xl border p-6" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          {timelineEvents.map((evt, i) => {
            const cfg = typeConfig[evt.type] ?? typeConfig.info
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1" style={{ borderColor: cfg.color, background: evt.type === 'pending' ? '#FDE68A' : cfg.color }} />
                  {i < timelineEvents.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: '#E2E8F0', minHeight: 24 }} />}
                </div>
                <div className="pb-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-clinical text-xs font-medium" style={{ color: '#94A3B8' }}>{evt.time}</span>
                    <span className="text-xs px-2 py-0.5 rounded border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>
                  </div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: evt.type === 'pending' ? '#B45309' : '#0F172A' }}>{evt.title}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{evt.detail}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{evt.actor}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* UC2 — Catatan Tindak Lanjut Dokter */}
      {logView === 'notes' && (
        <div className="max-w-2xl space-y-3">
          {notes.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#DBEAFE' }}>
              <div className="text-sm" style={{ color: '#94A3B8' }}>Belum ada catatan klinis. Gunakan tombol "Catatan Klinis" di atas untuk menambahkan.</div>
            </div>
          ) : notes.map(n => (
            <div key={n.id} className="bg-white rounded-xl border p-5" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{n.title}</div>
                <span className="font-clinical text-xs flex-shrink-0 ml-3" style={{ color: '#94A3B8' }}>{n.time} WIB</span>
              </div>
              <div className="text-sm mb-3" style={{ color: '#374151', lineHeight: 1.6 }}>{n.content}</div>
              <div className="text-xs font-medium" style={{ color: '#4A8CF7' }}>{n.author}</div>
            </div>
          ))}
        </div>
      )}

      {/* UC8 — Log Perubahan Data Serial Monitoring */}
      {logView === 'log' && (
        <div className="max-w-3xl bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DBEAFE', boxShadow: '0 1px 4px rgba(37,99,255,0.07)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#DBEAFE', background: '#F0F6FF' }}>
            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>Log Perubahan Data Monitoring Serial</div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>UC8 — Audit trail semua koreksi data pemantauan</div>
          </div>
          {monitoringHistory.filter(e => e.corrected).length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: '#94A3B8' }}>Belum ada koreksi data monitoring.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#F8FAFB', borderBottom: '1px solid #DBEAFE' }}>
                  {['Waktu Koreksi', 'Data Monitoring', 'Parameter', 'Nilai Sebelum', 'Nilai Sesudah', 'Alasan', 'Oleh'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monitoringHistory.filter(e => e.corrected && e.corrections).flatMap(e =>
                  (e.corrections ?? []).map((c, ci) => (
                    <tr key={`${e.id}-${ci}`} className="border-b" style={{ borderColor: '#F1F5F9' }}>
                      <td className="px-4 py-3 font-clinical" style={{ color: '#374151' }}>{c.at}</td>
                      <td className="px-4 py-3" style={{ color: '#374151' }}>Monitoring {e.time}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#0F172A' }}>{c.field}</td>
                      <td className="px-4 py-3">
                        <span className="font-clinical line-through" style={{ color: '#94A3B8' }}>{c.from}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-clinical font-semibold" style={{ color: '#0F172A' }}>{c.to}</span>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#374151' }}>{c.reason}</td>
                      <td className="px-4 py-3" style={{ color: '#4A8CF7' }}>{c.by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-base font-semibold mb-1" style={{ color: '#0F172A' }}>Export Clinical Report</div>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Pilih konten dan rentang waktu laporan.</p>
            <div className="space-y-1.5 mb-4">
              {['Ringkasan Pasien', 'Riwayat Klasifikasi PNPK', 'Clinical Pathway', 'Warning Signs', 'Tabel Monitoring', 'Tren Hematokrit', 'Tren Trombosit', 'Risiko DSS', 'Penjelasan Model', 'Catatan Dokter', 'Clinical Override', 'Peringatan'].map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                  <input type="checkbox" defaultChecked className="w-4 h-4" /> {s}
                </label>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Rentang Waktu</label>
              <select className="w-full border rounded-lg px-3 py-2.5 text-sm" style={{ borderColor: '#DBEAFE' }}>
                <option>24 jam terakhir</option>
                <option>48 jam terakhir</option>
                <option>Seluruh perawatan</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExport(false)} className="flex-1 py-2.5 rounded-lg text-sm border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
              <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#2563FF' }}>Export PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UC2: CATATAN TINDAK LANJUT MODAL ────────────────────────────────────────

function CatatanModal({ onClose, onSave }: { onClose: () => void; onSave: (note: DoctorNote) => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    onSave({ id: `n${Date.now()}`, patientId: '', timestamp: Date.now(), time: now, author: 'Dr. Budi S.', title: title.trim(), content: content.trim() })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-base font-semibold mb-0.5" style={{ color: '#0F172A' }}>Catatan Tindak Lanjut Klinis</div>
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Dicatat sebagai dr. Budi Santoso · {now} WIB · akan muncul di Timeline</p>
        <div className="mb-3">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Judul Catatan <span style={{ color: '#C62828' }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="mis. Evaluasi pasca monitoring, Rencana eskalasi..."
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#DBEAFE' }} />
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Catatan Klinis <span style={{ color: '#C62828' }}>*</span></label>
          <textarea rows={5} value={content} onChange={e => setContent(e.target.value)}
            placeholder="Tuliskan observasi, rencana tatalaksana, atau instruksi klinis..."
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none" style={{ borderColor: '#DBEAFE' }} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
          <button onClick={handleSave} disabled={!title.trim() || !content.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#2563FF' }}>
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── UC3.1: KOREKSI DATA MONITORING MODAL ────────────────────────────────────

function KoreksiModal({ entry, onClose, onSave }: {
  entry: MonitoringEntry
  onClose: () => void
  onSave: (corrected: MonitoringEntry) => void
}) {
  const [field, setField] = useState('Hematokrit')
  const [newValue, setNewValue] = useState('')
  const [reason, setReason] = useState('')
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const fieldMap: Record<string, { key: keyof MonitoringEntry; current: string | number; unit: string }> = {
    'Hematokrit': { key: 'hct', current: entry.hct, unit: '%' },
    'Trombosit': { key: 'plt', current: entry.plt, unit: '×10³/µL' },
    'TD Sistolik': { key: 'sbp', current: entry.sbp, unit: 'mmHg' },
    'TD Diastolik': { key: 'dbp', current: entry.dbp, unit: 'mmHg' },
    'Nadi': { key: 'hr', current: entry.hr, unit: 'x/mnt' },
    'Suhu': { key: 'temp', current: entry.temp, unit: '°C' },
  }

  const selected = fieldMap[field]

  const handleSave = () => {
    if (!newValue.trim() || !reason.trim()) return
    const correction = { field, from: String(selected.current), to: newValue, reason, by: 'Ns. Rani M.', at: now }
    const updated: MonitoringEntry = {
      ...entry,
      [selected.key]: parseFloat(newValue),
      corrected: true,
      corrections: [...(entry.corrections ?? []), correction],
    }
    onSave(updated)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-base font-semibold mb-0.5" style={{ color: '#0F172A' }}>Koreksi Data Monitoring</div>
        <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Monitoring {entry.time} · {entry.actor}</p>
        <div className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: '#FFFBEB', color: '#B45309' }}>
          Koreksi ini akan dicatat dalam audit trail UC8. Diperlukan alasan yang jelas.
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Parameter yang dikoreksi</label>
          <select value={field} onChange={e => setField(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#DBEAFE' }}>
            {Object.keys(fieldMap).map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Nilai Saat Ini</label>
          <div className="font-clinical text-lg font-semibold px-3 py-2 rounded-lg" style={{ background: '#F4F8FF', color: '#0F172A' }}>
            {selected.current} <span className="text-sm font-normal" style={{ color: '#94A3B8' }}>{selected.unit}</span>
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Nilai Koreksi <span style={{ color: '#C62828' }}>*</span></label>
          <div className="flex items-center gap-2">
            <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="—"
              className="border rounded-lg px-3 py-2.5 text-sm font-clinical flex-1 outline-none" style={{ borderColor: '#DBEAFE' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>{selected.unit}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>Alasan Koreksi <span style={{ color: '#C62828' }}>*</span></label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="mis. Salah input, sesuai hasil lab fisik..."
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none" style={{ borderColor: '#DBEAFE' }} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
          <button onClick={handleSave} disabled={!newValue.trim() || !reason.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#C2410C' }}>
            Simpan Koreksi
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MONITORING MODAL ─────────────────────────────────────────────────────────

function MonitoringModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const [saved, setSaved] = useState(false)
  const addMonitoring = useStore(s => s.addMonitoring)
  const auth = useStore(s => s.auth)
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  
  const [data, setData] = useState({
    time: now, sbp: '', dbp: '', hr: '', temp: '', hct: '', plt: '', hb: '', wbc: ''
  })
  const [warningSigns, setWarningSigns] = useState<string[]>([])

  if (saved) return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-xl">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" style={{ background: '#F0FDF4' }}>✓</div>
        <div className="text-base font-semibold mb-1" style={{ color: '#0F172A' }}>Data monitoring berhasil disimpan.</div>
        <div className="text-sm mb-1" style={{ color: '#6B7280' }}>PNPK telah dievaluasi ulang berdasarkan data terbaru.</div>
        <div className="mt-3 p-3 rounded-lg border" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
          <div className="text-xs font-semibold mb-0.5" style={{ color: '#C2410C' }}>Perubahan Klinis Terdeteksi</div>
          <div className="text-xs text-left" style={{ color: '#374151' }}>Sebelum: Grup B · Prioritas Sedang</div>
          <div className="text-xs text-left" style={{ color: '#374151' }}>Sekarang: Grup B · Prioritas Tinggi</div>
          <div className="text-xs mt-1" style={{ color: '#B45309' }}>Menunggu evaluasi dokter.</div>
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#2563FF' }}>Tutup</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="ml-auto w-full max-w-lg bg-white h-full overflow-auto shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#DBEAFE' }}>
          <div>
            <div className="text-base font-semibold" style={{ color: '#0F172A' }}>Tambah Monitoring</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>{patient.name} · {patient.bed} · Hari Sakit {patient.illnessDay}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Waktu Pemeriksaan</div>
            <input type="time" defaultValue={now} className="border rounded-lg px-3 py-2.5 text-sm w-full font-clinical outline-none" style={{ borderColor: '#DBEAFE' }} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Hemodinamik</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tekanan Darah Sistolik', unit: 'mmHg', field: 'sbp' },
                { label: 'Tekanan Darah Diastolik', unit: 'mmHg', field: 'dbp' },
                { label: 'Frekuensi Nadi', unit: 'x/mnt', field: 'hr' },
                { label: 'Suhu', unit: '°C', field: 'temp' }
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={(data as any)[f.field]} onChange={e => setData({...data, [f.field]: e.target.value})} placeholder="—" className="border rounded-lg px-3 py-2 text-sm font-clinical flex-1 outline-none" style={{ borderColor: '#DBEAFE' }} />
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Laboratorium</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Hematokrit', unit: '%', field: 'hct' },
                { label: 'Trombosit', unit: '×10³/µL', field: 'plt' },
                { label: 'Hemoglobin', unit: 'g/dL', field: 'hb' },
                { label: 'Leukosit', unit: '×10³/µL', field: 'wbc' }
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#374151' }}>{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={(data as any)[f.field]} onChange={e => setData({...data, [f.field]: e.target.value})} placeholder="—" className="border rounded-lg px-3 py-2 text-sm font-clinical flex-1 outline-none" style={{ borderColor: '#DBEAFE' }} />
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Warning Signs</div>
            <div className="space-y-2">
              {['Muntah persisten (>3x)', 'Nyeri perut', 'Perdarahan mukosa', 'Lesu/lemah', 'Tidak mau minum'].map(s => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={warningSigns.includes(s)} onChange={e => setWarningSigns(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))} className="w-4 h-4 rounded" />
                  <span className="text-sm" style={{ color: '#374151' }}>{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B7280' }}>Catatan</div>
            <textarea rows={3} placeholder="Catatan perawat..." className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none" style={{ borderColor: '#DBEAFE' }} />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#DBEAFE' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#DBEAFE', color: '#374151' }}>Batal</button>
          <button onClick={() => {
            addMonitoring(patient.id, {
              time: data.time, actor: auth.userName || 'Perawat',
              sbp: Number(data.sbp), dbp: Number(data.dbp), hr: Number(data.hr), temp: Number(data.temp),
              hct: Number(data.hct), plt: Number(data.plt), warningSigns
            });
            setSaved(true);
          }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#2563FF' }}>Simpan Monitoring</button>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DashIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg>
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5a4.5 4.5 0 00-4.5 4.5v3l-1 1.5h11l-1-1.5V6A4.5 4.5 0 008 1.5z" /><path d="M6.5 11.5a1.5 1.5 0 003 0" /></svg>
}
function PatientIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="4.5" r="2.5" /><path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" /></svg>
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const auth = useStore(s => s.auth)
  const setAuth = useStore(s => s.setAuth)
  const logout = useStore(s => s.logout)
  const patients = useStore(s => s.patients)

  useEffect(() => {
    if (auth.role && screen === 'login') setScreen('dashboard')
  }, [auth.role, screen])

  const handleLogin = (r: Role, name: string) => { setAuth(r, name); setScreen('dashboard') }

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      setScreen('login');
    }
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]

  if (!auth.role || screen === 'login') return <LoginScreen onLogin={handleLogin} />

  return (
    <div className="flex" style={{ height: '100vh', background: '#EAF2FF' }}>
      <Sidebar screen={screen} setScreen={setScreen} role={auth.role} userName={auth.userName || ''} onLogout={handleLogout} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {screen === 'dashboard' && <Dashboard setScreen={setScreen} setPatient={p => setSelectedPatientId(p.id)} role={auth.role} />}
        {screen === 'peringatan' && <PeringatanPage patients={patients} setScreen={setScreen} setPatient={p => setSelectedPatientId(p.id)} />}
        {screen === 'pasien' && <PasienPage patients={patients} setScreen={setScreen} setPatient={p => setSelectedPatientId(p.id)} role={auth.role} />}
        {screen === 'add-patient' && <AddPatient onDone={() => setScreen('pasien')} />}
        {screen === 'patient-detail' && selectedPatient && <PatientDetail patient={selectedPatient} setScreen={setScreen} role={auth.role} />}
      </main>
    </div>
  )
}
