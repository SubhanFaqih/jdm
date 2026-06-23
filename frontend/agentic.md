# React 19 & Frontend Best Practices (agentic.md)

Dokumen ini berisi aturan ketat dan panduan best practice untuk penulisan kode di folder `frontend` menggunakan **React 19 (react@latest)** dan **Tailwind CSS v4**. Semua modifikasi atau penambahan kode baru WAJIB mematuhi aturan ini.

---

## 1. Aturan Khusus React 19 (react@latest)

### 🚫 Jangan Gunakan `forwardRef`
* Di React 19, `ref` sekarang dilewatkan sebagai prop biasa. Jangan gunakan wrapper `forwardRef` lagi.
* **Salah (Legacy):**
  ```jsx
  const MyInput = forwardRef((props, ref) => {
    return <input {...props} ref={ref} />;
  });
  ```
* **Benar (React 19):**
  ```jsx
  function MyInput({ ref, ...props }) {
    return <input {...props} ref={ref} />;
  }
  ```

### ⚡ Gunakan Form Actions untuk Async Operations
* Jangan mengelola state loading/error secara manual di form menggunakan `useState` jika melakukan async operation. Gunakan fitur **Actions** bawaan React 19 dengan mengirim fungsi async langsung ke prop `action` pada `<form>`.
* Gunakan hook `useActionState` untuk mengelola state form, error, dan pending state secara otomatis.
* **Benar (React 19):**
  ```jsx
  import { useActionState } from 'react';

  async function updateProfile(prevState, formData) {
    try {
      const name = formData.get("username");
      await api.updateName(name);
      return { success: true, message: "Profile updated!" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function ProfileForm() {
    const [state, formAction, isPending] = useActionState(updateProfile, null);

    return (
      <form action={formAction}>
        <input name="username" type="text" required />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </button>
        {state?.error && <p className="text-red-500">{state.error}</p>}
      </form>
    );
  }
  ```

### 🔍 Gunakan `use` API untuk Context
* Hindari hook `useContext` yang kaku. Gunakan `use` API dari React untuk membaca context. `use` dapat dipanggil secara kondisional atau di dalam loop.
* **Benar (React 19):**
  ```jsx
  import { use } from 'react';
  import { ThemeContext } from './ThemeContext';

  function Button() {
    const theme = use(ThemeContext); // Lebih fleksibel dibanding useContext
    return <button className={theme.className} />;
  }
  ```

### 🌟 Gunakan `useOptimistic` untuk UI Responsif
* Untuk interaksi instan seperti Like button atau menambahkan item ke list, gunakan `useOptimistic` agar UI ter-update sebelum request server selesai.

### 📄 Metadata Hoisting
* Kamu bisa menulis tag `<title>`, `<meta>`, dan `<link>` langsung di komponen mana saja. React 19 akan memindahkannya (hoist) ke `<head>` dokumen secara otomatis.
* **Benar:**
  ```jsx
  function BlogPost({ post }) {
    return (
      <article>
        <title>{post.title}</title>
        <meta name="description" content={post.summary} />
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    );
  }
  ```

---

## 2. Tailwind CSS v4 Best Practices

* **Kustomisasi Tema:** Jangan mencari `tailwind.config.js`. Tailwind v4 dikonfigurasi langsung di dalam CSS menggunakan sintaks `@theme`. Semua warna brand, font, dan shadow baru didefinisikan di [src/index.css](file:///home/subhan/Documents/project-website/jdm/frontend/src/index.css).
* **Utility Classes:** Gunakan class Tailwind modern v4. Manfaatkan custom CSS variables yang dihasilkan otomatis oleh Tailwind v4 dari `@theme`.

---

## 3. Aturan Umum & Pencegahan Anti-Pattern

### 🚫 Jangan `import React` Jika Tidak Diperlukan
* React 17 ke atas sudah mendukung runtime JSX baru. Tidak perlu meng-import `React` di awal file kecuali jika membutuhkan function dari namespace `React` secara langsung.
* **Salah:** `import React, { useState } from 'react';`
* **Benar:** `import { useState } from 'react';`

### 🔑 Aturan `key` pada Rendering List
* **Dilarang keras** menggunakan indeks array (`index`) sebagai `key` pada `list.map()` jika list tersebut bersifat dinamis (bisa ditambah, dihapus, atau diurutkan ulang). Gunakan ID unik dari data (misal `item.id`).
* Penggunaan `index` hanya diperbolehkan untuk list statis yang tidak akan pernah berubah urutan atau jumlahnya.

### 🧼 Batasi & Bersihkan `useEffect`
* Jangan gunakan `useEffect` untuk menyinkronkan state yang bisa dihitung langsung dari state yang ada (Derived State). Gunakan variabel biasa atau `useMemo`.
* Jika menggunakan `useEffect` untuk event listener, interval, atau subscription, **wajib** mengembalikan cleanup function.
  ```jsx
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize); // Wajib!
  }, []);
  ```

### 📂 Strukturisasi & Peraturan Folder (`src/`)

Setiap folder di dalam `src/` memiliki peruntukan dan aturan ketat yang wajib dipatuhi untuk menjaga arsitektur kode tetap bersih (*clean architecture*):

#### 1. `assets/`
* **Peruntukan:** Menyimpan aset statis seperti gambar, logo, ikon (SVG/PNG), font kustom, atau dokumen statis lainnya.
* **Aturan:** 
  * Penamaan file wajib menggunakan format `kebab-case` (contoh: `app-logo.png`, `hero-banner.svg`).
  * Hindari menyimpan file biner berukuran sangat besar (di atas 1-2 MB). Untuk file besar, sebaiknya gunakan CDN atau cloud storage.

#### 2. `components/`
* **Peruntukan:** Tempat untuk komponen UI yang bersifat global, umum, dan reusable (*Shared/Common Components*).
* **Aturan:**
  * Komponen di sini harus berfokus pada UI (stateless atau seminimal mungkin mengelola state UI internal saja).
  * **Dilarang keras** meng-import file dari `services/` (pemanggilan API langsung) di dalam folder ini. Data wajib dialirkan melalui `props`.
  * Dibagi menjadi dua subfolder:
    * `components/common/`: Komponen atomik kecil seperti `Button.jsx`, `Input.jsx`, `Spinner.jsx`.
    * `components/layout/`: Komponen pembungkus tata letak global seperti `Navbar.jsx`, `Sidebar.jsx`, `Footer.jsx`.

#### 3. `context/`
* **Peruntukan:** Global State Management menggunakan React Context API (misalnya `AuthContext`, `ThemeContext`).
* **Aturan:**
  * Hanya digunakan untuk state global yang jarang berubah nilainya (seperti data profile user yang login, preferensi bahasa, atau tema).
  * **Dilarang** menyimpan state lokal yang sering berubah cepat (seperti input form realtime) untuk mencegah re-render masif yang merusak performa.
  * Disarankan membuat custom hook pembungkus (misal `useAuth`) agar pemanggilan context di komponen menjadi lebih ringkas.

#### 4. `hooks/`
* **Peruntukan:** Menyimpan Custom React Hooks yang membungkus logika stateful reusable (side-effect, event listener, dll).
* **Aturan:**
  * Nama file dan fungsi wajib diawali dengan prefix `use` (contoh: `useFetch.js`, `useDebounce.js`, `useLocalStorage.js`).
  * Custom hook hanya bertugas mengelola logika data/state dan mengembalikan nilai atau fungsi. **Tidak boleh** merender kode JSX/HTML di dalam hook.

#### 5. `pages/`
* **Peruntukan:** Halaman-halaman rute utama aplikasi (misalnya `Home.jsx`, `Login.jsx`, `Dashboard.jsx`).
* **Aturan:**
  * Logika pemanggilan API (melalui `services/` atau `hooks/`) dilakukan di tingkat ini, lalu datanya disalurkan ke komponen-komponen anak.
  * Jika sebuah halaman memiliki komponen internal yang sangat spesifik dan hanya dipakai di halaman tersebut, buat subfolder komponen di dalam folder halaman tersebut (contoh: `pages/Dashboard/components/SummaryCard.jsx`).

#### 6. `routes/`
* **Peruntukan:** Konfigurasi routing aplikasi (biasanya menggunakan React Router).
* **Aturan:**
  * Semua definisi path dan pemetaan komponen rute diletakkan di sini.
  * Komponen pembungkus keamanan rute (seperti `ProtectedRoute.jsx` untuk membatasi akses halaman admin) diletakkan di folder ini.

#### 7. `services/`
* **Peruntukan:** Modul HTTP Client (seperti Axios instance) dan fungsi pemanggilan API ke Express backend.
* **Aturan:**
  * Pisahkan file berdasarkan modul data (contoh: `authService.js`, `productService.js`, `transactionService.js`).
  * **Dilarang** menyimpan state React di dalam file service. File service hanya berupa fungsi murni yang mengirim request dan mengembalikan `Promise` (data/error).

#### 8. `utils/`
* **Peruntukan:** Fungsi pembantu murni (*pure helper functions*) yang independen dari React.
* **Aturan:**
  * Hanya berisi fungsi murni (*pure functions*): input tertentu selalu menghasilkan output yang sama, tanpa efek samping (*no side-effects*). Contoh: format mata uang (`formatCurrency.js`), manipulasi tanggal (`formatDate.js`), atau enkripsi token.
  * Jangan gunakan React hooks atau state di dalam folder ini.
