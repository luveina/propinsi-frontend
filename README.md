# Propinsi Frontend

Frontend application untuk project Propinsi menggunakan Vue 3 dengan Tailwind CSS.

## Backlog & Fitur (Azzahra)

Berikut adalah daftar **Product Backlog Item (PBI)** yang sedang dan akan saya kerjakan:

- [ ] **[R] Katalog Lomba** Fitur untuk menampilkan daftar lomba yang tersedia bagi peserta.
- [ ] **[R] Detail Lomba** Halaman untuk melihat informasi lengkap mengenai suatu lomba.
- [ ] **[R/U] Verifikasi Pembayaran Peserta** Fitur admin untuk melihat bukti bayar dan melakukan validasi (terima/tolak).
- [ ] **[U] Detail Lomba Juri** Fitur khusus Juri untuk memperbarui atau melengkapi data pada detail lomba.
- [ ] **[R] Pengumuman Hasil Akhir Lomba** Halaman untuk menampilkan hasil akhir atau pemenang lomba.
- [ ] **[R] Daftar Partisipan Lomba** Fitur untuk melihat daftar peserta yang sudah terdaftar di lomba tertentu.

*(Keterangan: [R] = Read/View, [U] = Update/Edit)*

## Prerequisites

Sebelum menjalankan aplikasi ini, pastikan Anda telah menginstall:

- **Node.js 20.19.0** atau **22.12.0** atau lebih tinggi
  - Download dari: https://nodejs.org/
  - Recommended: Gunakan LTS version
- **npm** (biasanya sudah include dengan Node.js)
- **Git** untuk clone repository
- **IDE** (Opsional): VS Code (Recommended), WebStorm, atau editor lainnya

## Cara Mengecek Versi Node.js dan npm

```bash
node --version
npm --version
```

Pastikan Node.js versi 20.19.0+ atau 22.12.0+.

## Instalasi dan Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd propinsi-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Proses install akan:
- Download semua dependencies yang dibutuhkan
- Setup Tailwind CSS dan PostCSS
- Prepare development environment

### 3. Menjalankan Aplikasi (Development Mode)

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 4. Verifikasi Aplikasi Berjalan

Buka browser dan akses:
```
http://localhost:5173
```

Anda akan melihat aplikasi Vue dengan Tailwind CSS sudah berjalan.

## Struktur Project (Standard, bisa disesuaikan dengan kebutuhan)

```
propinsi-frontend/
├── public/                     
├── src/
│   ├── assets/             
│   ├── components/            
│   ├── router/               
│   │   └── index.ts
│   ├── stores/                 
│   │   └── counter.ts
│   ├── views/                 
│   ├── __tests__/            
│   ├── App.vue                 
│   ├── main.ts                  
│   └── index.css                
├── e2e/                         
├── index.html                   
├── package.json                 
├── vite.config.ts              
├── tailwind.config.js          
├── postcss.config.js            
├── tsconfig.json                
└── README.md
```

## Scripts yang Tersedia

### Development
```bash
npm run dev              # Menjalankan development server
```

### Production Build
```bash
npm run build            # Build aplikasi untuk production
npm run preview          # Preview production build secara lokal
```

### Code Quality
```bash
npm run lint             # Menjalankan linter (oxlint & eslint)
npm run format           # Format code dengan oxfmt
npm run type-check       # Type checking dengan TypeScript
```

## Tech Stack

- **Vue 3.5.28** - Progressive JavaScript Framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool & development server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Vue Router 5.0.2** - Official router for Vue
- **Pinia 3.0.4** - State management
- **Vitest 4.0.18** - Unit testing framework
- **Playwright 1.58.2** - End-to-end testing
- **ESLint & Oxlint** - Code linting
- **Oxfmt** - Code formatting

## Git Workflow (Standard, bisa disesuaikan dengan kebutuhan)

```
main (production)
├── staging (pre-production)
│   ├── feature/nama-fitur-1
│   ├── feature/nama-fitur-2
│   └── fix/nama-bug
```

### Branch Naming Convention

- `feature/nama-fitur` - untuk fitur baru
- `fix/nama-bug` - untuk bug fixes
- `hotfix/nama-urgent-fix` - untuk urgent fixes di production
- `refactor/nama-refactor` - untuk refactoring code

Fitur & Backlog (Front-End Mapping)
Implementasi Frontend pada aplikasi SILOBUR-NG mengikuti Acceptance Criteria (FE) sebagai berikut:

3. Reservasi & Tiket (EPIC 03)

PBI-16 (Denah Gantangan): UI Layout Gantangan (grid 24 slot) dengan indikasi warna untuk status Available dan Booked/Disabled.

PBI-17 (Pembayaran): Komponen File Uploader untuk bukti transfer beserta penanganan pesan error jika nomor gantangan baru saja diambil orang lain.

PBI-19 (E-Ticket): Menu "My Ticket" yang menampilkan status pembayaran (Paid, Pending, Invalid) menggunakan label warna dan fitur unduh tiket.

## Khay 
Berikut adalah detail implementasi FE berdasarkan Product Backlog Item (PBI) SILOBUR-NG:

PBI-1: Registrasi Peserta
Halaman registrasi dengan validasi form real-time, toggle visibility password, dan integrasi API untuk pendaftaran akun baru.
PBI-2 & PBI-3: Login & Logout
Implementasi landing page berupa form Login dengan penanganan sesi lokal (local storage/cookie) serta fungsi pembersihan sesi saat Logout.
PBI-17: [C/U] Upload Bukti Pembayaran & Locking Seat
Komponen File Uploader untuk unggah bukti transfer yang dilengkapi dengan error handling reaktif jika slot gantangan sudah terisi oleh pengguna lain.
PBI-21: [R/U] Interactive Gantangan & Selection
Interface khusus juri untuk melakukan pemilihan burung secara visual melalui layout grid interaktif yang dioptimalkan untuk perangkat smartphone.