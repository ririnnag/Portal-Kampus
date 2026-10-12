# KampusKita — Portal Akademik Demo

Portal kampus fiktif untuk latihan keamanan aplikasi web. Seluruh identitas, nilai, akun, dan aktivitas di dalam proyek ini adalah data sintetis.

## Fitur
- Login demo dengan peran mahasiswa, dosen, dan admin.
- Mahasiswa melihat nilai dan mencatat pengumpulan tugas simulasi.
- Dosen melihat data nilai sintetis, menambah nilai, dan berdiskusi.
- Admin melihat serta menambahkan akun demo.
- Mode rentan dan mode aman untuk membandingkan perilaku yang disimulasikan.
- Demonstrasi SQL Injection pada login, SQL Injection pada pencarian nilai, dan percobaan sandi tanpa pembatasan pada mode rentan.

## Akun demo
| Peran | Username | Password |
|---|---|---|
| Mahasiswa | `mahasiswa` | `mhs123` |
| Dosen | `dosen` | `dsn123` |
| Admin | `admin` | `adm123` |

## Jalankan lokal
Buka `index.html` di browser, atau jalankan server statis dari folder ini, misalnya:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Deploy ke Netlify
1. Buat repository GitHub baru dan unggah semua file di folder ini.
2. Di Netlify pilih **Add new site → Import an existing project**.
3. Hubungkan repository GitHub.
4. Build command dikosongkan; publish directory isi `.`.
5. Deploy site.

Alternatif untuk demo statis: drag-and-drop folder situs melalui Netlify Drop jika opsi itu tersedia di akunmu.

## Langkah uji
1. Biarkan toggle pada **Mode rentan**.
2. Coba login dengan username `' OR '1'='1` dan kata sandi bebas. Demo akan menunjukkan login yang dilewati secara simulasi.
3. Masuk sebagai mahasiswa, buka **Nilai akademik**, cari `' OR '1'='1`. Mode rentan menampilkan seluruh nilai sintetis, termasuk data mahasiswa lain.
4. Kembali ke login, aktifkan **Mode aman**. Input SQLi tidak lagi melewati pemeriksaan login/pencarian. Lima login gagal berturut-turut memicu penguncian sementara 30 detik.
5. Coba tugas, diskusi, dan peran dosen/admin untuk memeriksa fitur portal.

## Batasan penting
- Ini adalah **simulasi sisi browser**, bukan aplikasi yang menjalankan query SQL. Tidak ada database, API autentikasi, atau penyimpanan server.
- Berkas tugas tidak diunggah; halaman hanya mencatat nama file yang dipilih dalam memori.
- Data akun tambahan, diskusi, dan nilai baru hilang saat halaman dimuat ulang.
- Mode aman hanya mendemonstrasikan kontrol dasar. Untuk sistem nyata, gunakan backend, query terparameterisasi, hashing sandi yang benar, rate limiting di server, session yang aman, otorisasi per objek, validasi unggahan, dan logging.
- Jangan gunakan kata sandi atau informasi pribadi asli. Jangan menguji situs yang tidak kamu miliki atau tidak memiliki izin untuk diuji.
