/**
 * Base CRUD Service Factory
 * Fungsi ini membuat service CRUD standard yang bisa dipakai berulang kali.
 * 
 * @param {string} endpoint - Endpoint API tujuan (contoh: '/api/ustadz')
 * @param {string} entityName - Nama entitas untuk pesan error (contoh: 'ustadz')
 * @returns {Object} Kumpulan fungsi CRUD
 */
export const createCrudService = (endpoint, entityName = 'data') => {
  return {
    /**
     * Mengambil semua data
     */
    async getAll() {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Gagal mengambil ${entityName}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || `Gagal mengambil ${entityName}`);
      return json.data;
    },

    /**
     * Mengambil detail satu data berdasarkan ID
     */
    async getById(id) {
      const res = await fetch(`${endpoint}/${id}`);
      if (!res.ok) throw new Error(`Gagal mengambil detail ${entityName}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || `Gagal mengambil detail ${entityName}`);
      return json.data;
    },

    /**
     * Menambahkan data baru
     */
    async create(data) {
      const isFormData = data instanceof FormData;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      let json;
      try {
        json = await res.json();
      } catch (err) {
        throw new Error(`Gagal menyimpan ${entityName}`);
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Gagal menyimpan ${entityName}`);
      }
      return json.data;
    },

    /**
     * Mengupdate data
     */
    async update(id, data) {
      const isFormData = data instanceof FormData;
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      let json;
      try {
        json = await res.json();
      } catch (err) {
        throw new Error(`Gagal mengubah ${entityName}`);
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Gagal mengubah ${entityName}`);
      }
      return json.data;
    },

    /**
     * Menghapus data
     */
    async delete(id) {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Gagal menghapus ${entityName}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || `Gagal menghapus ${entityName}`);
      return true;
    },

    /**
     * Toggle status aktif (jika didukung oleh backend)
     */
    async toggleActive(id) {
      const res = await fetch(`${endpoint}/${id}/toggle-active`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`Gagal mengubah status aktif ${entityName}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || `Gagal mengubah status aktif ${entityName}`);
      return json.data;
    }
  };
};

export const ustadzService = createCrudService('/api/ustadz', 'ustadz');
export const profileMasjidService = createCrudService('/api/profile-masjid', 'profile masjid');
export const hadistThemeService = createCrudService('/api/hadist/themes', 'tema hadist');
export const jadwalKhotibService = {
  ...createCrudService('/api/jadwal-khotib', 'jadwal khotib'),
  async importExcel(schedules) {
    const res = await fetch('/api/jadwal-khotib/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ schedules })
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Gagal meng-import jadwal dari Excel');
    }
    const json = await res.json();
    return json.data;
  }
};
export const programDonasiService = createCrudService('/api/program-donasi', 'program donasi');
export const hadistAcitveService = createCrudService('/api/hadist/', 'hadist aktif');

export const kasService = {
  ...createCrudService('/api/kas', 'laporan kas'),
  async getStats() {
    const res = await fetch('/api/kas/stats');
    if (!res.ok) throw new Error('Gagal mengambil statistik kas');
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal mengambil statistik kas');
    return json.data;
  }
};

export const auditLogService = createCrudService('/api/audit-logs', 'audit log');

export const jwsService = {
  async getDailySchedule(profileId, tanggal) {
    let url = `/api/jws?tanggal=${tanggal}`;
    if (profileId) {
      url += `&profile_id=${profileId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil jadwal sholat');
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal mengambil jadwal sholat');
    return json.data;
  }
};
