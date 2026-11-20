# Git Workflow 

Dokumen ini menjelaskan alur kerja Git yang digunakan tim dalam pengembangan project.

---

# 🌳 Struktur Branch

| Branch                | Fungsi                                                            | Protected |
| --------------------- | ----------------------------------------------------------------- | :-------: |
| `main`                | Production-ready code                                             |     ✅     |
| `dev`                 | Integration branch tempat seluruh fitur digabungkan sebelum rilis |     ✅     |
| `feat/nama-fitur`     | Branch untuk pengembangan fitur baru (memicu CI)                 |     ❌     |
| `fix/nama-bug`        | Branch untuk perbaikan bug (memicu CI)                            |     ❌     |
| `hotfix/nama-masalah` | Perbaikan darurat langsung dari `main`                            |     ❌     |

---

# 📝 Penamaan Branch

Gunakan format yang dikenali oleh GitHub Actions CI:

```text
tipe/deskripsi-singkat
```

Contoh:

```text
feat/login-page
feat/checkout-flow
fix/navbar-overflow
hotfix/payment-gateway-down
```

---

# 🚀 Development Flow

## 1. Update branch `dev`

```bash
git checkout dev
git pull origin dev
```

---

## 2. Buat branch baru dari `dev`

```bash
git checkout -b feat/nama-fitur
```

---

## 3. Kerjakan perubahan

- Commit secara berkala
- Gunakan commit message yang jelas
- Pastikan project tetap berjalan sebelum commit

---

## 4. Push branch

```bash
git push origin feat/nama-fitur
```

---

## 5. Buat Pull Request

Target PR:

```text
dev
```

**Bukan** langsung ke `main`.

---

## 6. Code Review

- Tunggu review
- Minimal **1 approval**
- Pastikan seluruh CI Status Checks wajib (`backend-tests`, `frontend-build`, `pint`) lulus (Status Check Requirement - INF-02)
- Perbaiki jika ada request changes

---

## 7. Merge

Gunakan:

> ✅ **Squash and Merge**

Agar history repository tetap bersih.

---

## 8. Hapus Branch

Setelah berhasil merge:

### Hapus branch lokal

```bash
git branch -d feat/nama-fitur
```

### Hapus branch remote

```bash
git push origin --delete feat/nama-fitur
```

---

# 💬 Commit Message

Gunakan format **Conventional Commits**

```text
<type>: <deskripsi singkat>
```

## Tipe Commit

| Type | Kegunaan |
|------|----------|
| `feat` | Menambahkan fitur baru |
| `fix` | Memperbaiki bug |
| `docs` | Dokumentasi |
| `refactor` | Refactor tanpa mengubah fungsi |
| `test` | Menambah atau memperbaiki test |
| `chore` | Dependency, config, tooling, dll |

### Contoh

```text
feat(detailPage): tambah halaman detail produk
fix(cartPrice): perbaiki total harga keranjang
docs: update README instalasi
refactor(service): sederhanakan service checkout
chore: update eslint configuration
```

---

# 🔀 Pull Request Rules

- PR **wajib** menuju `dev`
- Hotfix darurat boleh menuju `main`
- Minimal **1 approval**
- **Wajib Lolos Status Check CI (INF-02):** Job `backend-tests`, `frontend-build`, dan `pint` harus berstatus hijau (`Passed`) sebelum tombol merge aktif.
- Isi template PR
    - Deskripsi perubahan
    - Cara testing
    - Screenshot (jika ada perubahan UI)
- Branch harus **up-to-date** dengan `dev`
- Resolve conflict sebelum merge
- Gunakan **Squash and Merge** kecuali merge besar yang memang perlu mempertahankan history commit

---

# 🚢 Release Flow

Hanya branch `dev` yang boleh di-merge ke `main`.

Alurnya:

```text
feat/*
      │
      ▼
dev
      │
      ▼
Pull Request
      │
      ▼
main
      │
      ▼
Release Tag
```

Setelah merge ke `main`, disarankan membuat **Git Tag** untuk versi rilis.

Contoh:

```text
v1.0.0
v1.1.0
v2.0.0
```

---

# ⚠️ Conflict Resolution

## Update branch menggunakan rebase

```bash
git pull origin dev --rebase
```

---

## Jika muncul conflict

Git akan menandai file seperti berikut:

```text
<<<<<<< HEAD
Perubahan branch saat ini
=======
Perubahan dari dev
>>>>>>> commit-hash
```

---

## Selesaikan conflict

- Pilih perubahan yang ingin dipakai
- Atau gabungkan keduanya
- Hapus seluruh marker:

```text
<<<<<<<
=======
>>>>>>>
```

---

## Lanjutkan rebase

```bash
git add <nama-file>
git rebase --continue
```

Ulangi sampai semua conflict selesai.

---

## Push kembali

```bash
git push origin feat/nama-fitur --force-with-lease
```

> Gunakan **`--force-with-lease`**, **jangan** `--force`, agar tidak menimpa perubahan anggota tim lain.

---

# 🚫 Larangan & Kebijakan Proteksi (INF-01)

- ❌ Push langsung ke `main`
- ❌ Push langsung ke `dev` tanpa Pull Request. **Aturan:** Branch `dev` dilindungi oleh Branch Protection Rules di GitHub. Pengecualian langsung (direct bypass) hanya diizinkan untuk perbaikan darurat hotfix yang disetujui langsung oleh Project Manager / Tech Lead dan wajib dicatat dalam log changelog.
- ❌ Force push ke branch bersama (`main` / `dev`)
- ❌ Merge Pull Request tanpa review dan approval
- ❌ Merge Pull Request yang status check CI-nya belum lulus (`backend-tests`, `frontend-build`, `pint`)
- ❌ Merge Pull Request yang masih conflict
- ❌ Commit file sensitif (`.env`, credential, secret key)

---

# 📌 Ringkasan Workflow

```text
Update dev
        │
        ▼
Buat feature branch
        │
        ▼
Coding + Commit
        │
        ▼
Push Branch
        │
        ▼
Pull Request
        │
        ▼
Code Review
        │
        ▼
Squash & Merge ke dev
        │
        ▼
Delete Branch
        │
        ▼
Release dev → main
        │
        ▼
Git Tag
```