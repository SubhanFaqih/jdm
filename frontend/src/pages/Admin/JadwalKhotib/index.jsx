import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { jadwalKhotibService, ustadzService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Table } from '../../../components/common/Table';
import { Plus, Edit2, Trash2, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export function JadwalKhotibPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Excel Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);

  // Fetch Jadwal Khotib
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['jadwalKhotib'],
    queryFn: async () => {
      const data = await jadwalKhotibService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  // Fetch Ustadz for Dropdown
  const { data: ustadzList = [], isLoading: isLoadingUstadz } = useQuery({
    queryKey: ['ustadz'],
    queryFn: async () => {
      const data = await ustadzService.getAll();
      return data.filter(u => u.is_active).map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const id = formData.get('id');
      const payload = {
        tanggal: formData.get('tanggal'),
        ustadz_id: formData.get('ustadz_id'),
        tema: formData.get('tema')
      };

      if (id) {
        return await jadwalKhotibService.update(id, payload);
      } else {
        return await jadwalKhotibService.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalKhotib'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan ketika menyimpan data');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jadwalKhotibService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalKhotib'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal menghapus data!');
    }
  });

  const importMutation = useMutation({
    mutationFn: async (schedules) => {
      return await jadwalKhotibService.importExcel(schedules);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jadwalKhotib'] });
      queryClient.invalidateQueries({ queryKey: ['ustadz'] });
      setIsImportModalOpen(false);
      setImportData([]);
      setImportErrors([]);
      alert(data.message || 'Jadwal khotib berhasil di-import.');
    },
    onError: (error) => {
      alert(error.message || 'Gagal meng-import jadwal.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      deleteMutation.mutate(id);
    }
  };

  // Helper function to handle diverse Excel date representations
  const parseExcelDate = (excelDate) => {
    if (!excelDate) return '';
    if (excelDate instanceof Date) {
      return excelDate.toISOString().split('T')[0];
    }
    if (typeof excelDate === 'number') {
      const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    const dateStr = String(excelDate).trim();
    const dmyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const match = dateStr.match(dmyRegex);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateStr;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });
        
        if (rawRows.length === 0) {
          alert('File Excel kosong atau tidak terbaca.');
          return;
        }

        const parsedSchedules = [];
        const parsedErrors = [];

        rawRows.forEach((row, index) => {
          const rowKeys = Object.keys(row);
          const findValue = (keysToFind) => {
            const foundKey = rowKeys.find(k => 
              keysToFind.some(ktf => k.toLowerCase().trim() === ktf.toLowerCase())
            );
            return foundKey ? row[foundKey] : null;
          };

          const rawTanggal = findValue(['tanggal', 'date', 'tgl', 'hari']);
          const rawKhotib = findValue(['nama khotib', 'nama ustadz', 'khotib', 'ustadz', 'preacher', 'penceramah']);
          const rawTema = findValue(['tema', 'topik', 'topic', 'judul', 'theme', 'subject']);

          const cleanTanggal = rawTanggal ? parseExcelDate(rawTanggal) : '';
          const cleanKhotib = rawKhotib ? String(rawKhotib).trim() : '';
          const cleanTema = rawTema ? String(rawTema).trim() : '';

          const rowNum = index + 1;
          const rowErrors = [];

          if (!cleanTanggal) {
            rowErrors.push('Tanggal wajib diisi');
          } else {
            const tempDate = new Date(cleanTanggal);
            if (isNaN(tempDate.getTime())) {
              rowErrors.push(`Format tanggal "${cleanTanggal}" tidak valid`);
            }
          }

          if (!cleanKhotib) {
            rowErrors.push('Nama Khotib wajib diisi');
          }

          parsedSchedules.push({
            rowNum,
            tanggal: cleanTanggal,
            nama_khotib: cleanKhotib,
            tema: cleanTema,
            errors: rowErrors
          });

          if (rowErrors.length > 0) {
            parsedErrors.push(`Baris ${rowNum}: ${rowErrors.join(', ')}`);
          }
        });

        setImportData(parsedSchedules);
        setImportErrors(parsedErrors);
        setIsImportModalOpen(true);
      } catch (err) {
        console.error(err);
        alert('Gagal memproses file Excel: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    const payload = importData.map(item => ({
      tanggal: item.tanggal,
      nama_khotib: item.nama_khotib,
      tema: item.tema
    }));
    importMutation.mutate(payload);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const columns = [
    { 
      key: 'tanggal', 
      label: 'Tanggal',
      render: (row) => formatDate(row.tanggal)
    },
    { 
      key: 'ustadz_id', 
      label: 'Khotib / Ustadz',
      render: (row) => row.ustadz_id?.nama || <span className="text-slate-400 italic">Tidak diketahui</span>
    },
    { 
      key: 'tema', 
      label: 'Tema',
      render: (row) => row.tema || <span className="text-slate-400 italic">Tidak ada tema</span>
    }
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        className="px-2"
        onClick={() => {
          setEditingItem(row);
          setIsModalOpen(true);
        }}
      >
        <Edit2 className="w-4 h-4 text-blue-500" />
      </Button>
      <Button 
        variant="ghost" 
        className="px-2"
        onClick={() => handleDelete(row.id)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Jadwal Khotib</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola jadwal khotib sholat Jumat</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {isLoadingSchedules ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table 
          columns={columns}
          data={schedules}
          renderActions={renderActions}
        />
      )}

      {/* Main Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Jadwal Khotib' : 'Tambah Jadwal Khotib'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          <Input 
            type="date"
            id="tanggal" 
            name="tanggal" 
            label="Tanggal" 
            defaultValue={editingItem?.tanggal ? editingItem.tanggal.split('T')[0] : ''} 
            required 
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="ustadz_id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pilih Ustadz / Khotib
            </label>
            <select
              id="ustadz_id"
              name="ustadz_id"
              required
              defaultValue={editingItem?.ustadz_id?._id || editingItem?.ustadz_id || ''}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="" disabled>-- Pilih Ustadz --</option>
              {isLoadingUstadz ? (
                <option disabled>Memuat daftar ustadz...</option>
              ) : (
                ustadzList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input 
            id="tema" 
            name="tema" 
            label="Tema / Topik (Opsional)" 
            defaultValue={editingItem?.tema || ''} 
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Preview Import Excel */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setImportData([]); setImportErrors([]); }}
        title="Preview Import Jadwal Khotib"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Berikut adalah hasil pembacaan data dari file Excel. Silakan periksa kembali sebelum menyimpan ke database.
          </p>

          {importErrors.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-400 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Ditemukan kesalahan data pada file Excel:</p>
                <ul className="list-disc list-inside max-h-32 overflow-y-auto space-y-0.5">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="max-h-[350px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2">Baris</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Nama Khotib</th>
                  <th className="px-4 py-2">Tema</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {importData.map((item, idx) => (
                  <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{item.rowNum}</td>
                    <td className={`px-4 py-2 ${item.errors.some(e => e.includes('Tanggal')) ? 'text-red-500 font-medium' : ''}`}>
                      {item.tanggal || <span className="italic text-slate-400">Kosong</span>}
                    </td>
                    <td className={`px-4 py-2 ${item.errors.some(e => e.includes('Khotib')) ? 'text-red-500 font-medium' : ''}`}>
                      {item.nama_khotib || <span className="italic text-slate-400">Kosong</span>}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{item.tema || '-'}</td>
                    <td className="px-4 py-2 text-right">
                      {item.errors.length > 0 ? (
                        <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                          Error
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Total: {importData.length} baris ({importData.length - importErrors.length} siap, {importErrors.length} error)
            </span>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setIsImportModalOpen(false); setImportData([]); setImportErrors([]); }}
                disabled={importMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={importErrors.length > 0 || importData.length === 0 || importMutation.isPending}
              >
                {importMutation.isPending ? 'Mengimport...' : 'Konfirmasi & Simpan'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
