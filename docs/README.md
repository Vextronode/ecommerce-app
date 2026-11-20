# Dokumentasi Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |

## 1. Jenis Dokumen

| Jenis | Isi | Dokumen |
|---|---|---|
| Kebutuhan produk | Tujuan, cakupan, metrik, dan kebutuhan non-fungsional | `PRD.md` |
| Kondisi aktual | Struktur data, proses bisnis, use case, dan urutan interaksi sistem yang berjalan | `data_dictionary/`, `business/business_workflow/`, `business/usecase/`, `diagram/sequence/`, `PANDUAN_AKUN_DAN_AUTENTIKASI.md` |
| Integrasi | Kontrak integrasi dengan SIDUTama | `sid-thirdparty.md`, `openapi.yaml` |
| Kebijakan dan legal | Syarat & Ketentuan, daftar produk terlarang, dan rancangan alur pajak | `S&K/` |
| Temuan | Kelemahan aplikasi, kebijakan, dan repositori beserta tingkat keparahan dan status | `findings/` |
| Panduan operasional | Deployment, inisialisasi admin dan seeder production, serta SEO | `DEPLOYMENT_GUIDE.md`, `deployment/`, `SEO_GUIDE.md` |
| Pedoman kerja | Alur kerja Git dan standar environment organisasi | `GIT_WORKFLOW.md`, `Environment Standardization.md` |

## 2. Struktur Folder

```
docs/
├── README.md                          Index dokumentasi
├── PRD.md                             Product Requirement Document
├── data_dictionary/                   Data Dictionary per domain dan ERD
├── business/
│   ├── business_workflow/             Business Workflow
│   └── usecase/                       Use Case
├── diagram/sequence/                  Sequence Diagram
├── findings/                          Temuan per modul aplikasi
├── S&K/                               Dokumen kebijakan dan rancangan pajak
├── deployment/                        SOP seeder dan admin production
├── DEPLOYMENT_GUIDE.md
├── PANDUAN_AKUN_DAN_AUTENTIKASI.md
├── SEO_GUIDE.md
├── sid-thirdparty.md
├── openapi.yaml
├── GIT_WORKFLOW.md
└── Environment Standardization.md
```

## 3. Urutan Acuan

| Pertanyaan | Acuan |
|---|---|
| Apa yang sedang berjalan? | Kode, lalu dokumen kondisi aktual |
| Apa tujuan dan cakupan produk? | `PRD.md` |
| Bagaimana struktur dan arti data? | `data_dictionary/` |
| Bagaimana proses bisnis berjalan? | `business/business_workflow/bw_cimart.md` |
| Siapa melakukan apa di sistem? | `business/usecase/` |
| Bagaimana urutan interaksi antarkomponen? | `diagram/sequence/` |
| Bagaimana integrasi dengan SIDUTama? | `sid-thirdparty.md`, `openapi.yaml` |
| Apa kebijakan yang berlaku bagi pengguna? | Halaman `/kebijakan/*` di aplikasi dan `S&K/` |
| Kelemahan apa yang sudah diketahui? | `findings/README.md` |
| Bagaimana menjalankan dan men-deploy aplikasi? | `../README.md`, `DEPLOYMENT_GUIDE.md` |
| Bagaimana alur kerja tim? | `GIT_WORKFLOW.md`, `Environment Standardization.md` |

## 4. Standar Penulisan

Berlaku untuk dokumen kondisi aktual, PRD, dan temuan.

- Ditulis formal dalam Bahasa Indonesia, tanpa emoji.
- Diawali tabel identitas: versi, tanggal, status, pemilik dokumen, dan dokumen terkait.
- Dokumen kondisi aktual hanya mencatat keadaan yang berlaku, tanpa rencana atau usulan.
- Setiap bagian mencantumkan sumber berupa file kode, konfigurasi, atau dokumen.
- Diagram ditulis dengan Mermaid di dalam file Markdown.
- Kelemahan yang ditemukan dicatat di `findings/`, bukan di dokumen kondisi aktual.
- Perubahan kode pada skema, alur bisnis, atau integrasi disertai pembaruan dokumen kondisi aktual pada pull request yang sama.
