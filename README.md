# AKSARA

Prototipe interaktif sistem pengelolaan dokumen dan capaian SAKIP BPS Provinsi Kalimantan Timur.

## Menjalankan

`npm install` lalu `npm run dev`. Pemeriksaan produksi: `npm run build`. Uji aturan alur dan peran: `npm test` (Node.js 22.6+ dengan dukungan type stripping).

## Fitur demo

- Empat tampilan peran: Admin, Operator, Validator, Pimpinan.
- Sasaran, IKU, target triwulanan, capaian, bukti, dokumen, permintaan, pengguna, dan unit: tambah, edit, pencarian, filter, pengurutan, paginasi, serta unduhan CSV.
- Capaian: draft, pengajuan, pengembalian dengan catatan, persetujuan, penguncian, dan riwayat tindakan.
- Penyimpanan data lokal di localStorage; berkas di IndexedDB (maksimal 10 MB per berkas).
- Pratinjau PDF/gambar, unduhan berkas, klasifikasi dokumen, arsip dan pemulihan.
- Kalender bulanan interaktif dan penambahan kegiatan.
- Laporan berdasarkan data terkini, filter unit/status, CSV dan pencetakan ke PDF melalui browser.
- Profil, pengaturan, panduan per peran, pencarian global, audit aktivitas, dan notifikasi aktivitas.
- Operator dibatasi ke Fungsi Diseminasi; Pimpinan membaca data tanpa mengubahnya. Pembatasan ini merupakan simulasi antarmuka.
- Persentase capaian otomatis memakai realisasi ÷ target × 100%. Formula IKU khusus perlu disesuaikan pada pengembangan berikutnya.
- Monitoring memfilter unit/triwulan dan memakai capaian yang disetujui; ambang warna mengikuti pengaturan.
- Versi lampiran lama tetap dapat dibuka setelah unggahan pengganti. Ekspor CSV menyertakan rincian analisis yang tersedia.

## Alur demonstrasi

1. Klik avatar kanan atas, pilih Operator.
2. Buka Capaian kinerja → Isi capaian. Pilih IKU, isi target, realisasi, analisis dan lampiran bila tersedia.
3. Simpan, buka detail, lalu Ajukan validasi.
4. Ganti ke Validator. Periksa pengajuan; Setujui atau Kembalikan dengan catatan.
5. Ganti ke Pimpinan untuk meninjau Monitoring dan Laporan. CSV dapat dibuka di Excel, sedangkan Cetak / PDF memakai dialog cetak browser.
6. Admin dapat mengunci capaian final, mengelola master data, dan mengatur agenda.

## Pemeriksaan terakhir

Build produksi dan empat uji otomatis lulus. Uji browser mencakup pembatasan unit Operator, pengisian dan perhitungan 98/100, pengajuan, persetujuan Validator, filter triwulan termasuk periode kosong, unduhan CSV, persistensi setelah memuat ulang, serta tampilan Pimpinan baca saja. Tampilan desktop 1440 px dan ponsel 390 px diperiksa. Pemeriksaan ini belum menggantikan pengujian aksesibilitas dengan pembaca layar atau pengujian keamanan backend.

## Batas penggunaan

Data contoh bukan data resmi BPS. Login dan peran merupakan simulasi antarmuka. Belum ada backend, otorisasi server, sinkronisasi antarperangkat, pemindaian berkas, email, SSO, atau tanda tangan elektronik. Jangan gunakan untuk dokumen rahasia atau data produksi. Menghapus data situs pada browser akan menghapus data dan berkas lokal.

Logo bersumber dari portal PPID BPS: https://ppid.bps.go.id/app/konten/0000/Profil-BPS.html
