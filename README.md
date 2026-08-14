# DENGUARD Clinical Decision Support System (CDSS)

DENGUARD adalah sebuah aplikasi sistem pendukung keputusan klinis (*Clinical Decision Support System* / CDSS) yang dirancang khusus untuk membantu tenaga medis (dokter dan perawat) dalam memonitor, mendiagnosis, serta memprediksi risiko perburukan pasien Demam Berdarah Dengue (DBD) di lingkungan rumah sakit.

## Fitur Utama
- **Dashboard Prioritas Pasien**: Pemantauan *real-time* status seluruh pasien aktif yang diklasifikasikan berdasarkan tingkat keparahan dan prioritas penanganan (Kritis, Prioritas Tinggi, Perlu Evaluasi, Stabil).
- **Penilaian PNPK Otomatis**: Integrasi klasifikasi otomatis berdasarkan Pedoman Nasional Pelayanan Kedokteran (PNPK) untuk Dengue.
- **Prediksi Risiko DSS (Dengue Shock Syndrome)**: Estimasi persentase risiko terjadinya syok berbasis algoritma dengan penjabaran kontribusi parameter klinis (*warning signs*, perubahan hematokrit, dsb).
- **Manajemen Clinical Pathway**: Roadmap pemantauan pasien yang membantu perawat mengetahui kapan jadwal monitoring selanjutnya (seperti pemeriksaan tanda vital dan laboratorium berkala).
- **Log & Audit Trail**: Dokumentasi catatan dokter, riwayat pemantauan perawat, dan otomatisasi *alert* yang diarsipkan dalam bentuk *timeline* terintegrasi.

## Teknologi Utama
- **Frontend**: React.js dengan Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Visualisasi Data**: Recharts (untuk grafik klinis)

## Cara Menjalankan Aplikasi Secara Lokal
Aplikasi ini sudah dipersiapkan untuk bisa dijalankan di *local development environment*.

1. Pastikan Anda telah menginstal Node.js di komputer Anda.
2. Buka terminal dan arahkan ke direktori proyek ini.
3. Instal semua dependensi:
   ```bash
   npm install
   ```
4. Jalankan server *development*:
   ```bash
   npm run dev
   ```
5. Akses aplikasi melalui *browser* pada alamat localhost yang muncul di terminal (biasanya `http://localhost:5173` atau `http://localhost:8443`).

## Kontribusi & Tim
Proyek prototipe DENGUARD ini dikembangkan dalam rangka GEMASTIK 2026 (Divisi Pengembangan Perangkat Lunak / PPL) untuk meningkatkan keselamatan pasien Dengue di Indonesia.
