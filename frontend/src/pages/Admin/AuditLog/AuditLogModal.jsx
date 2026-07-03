import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { DataViewer } from '../../../components/common/DataViewer';
import { useQuery } from '@tanstack/react-query';
import { programDonasiService } from '../../../services/baseCrudService';

export function AuditLogModal({ isOpen, onClose, log }) {
  const { data: programDonasiList = [] } = useQuery({
    queryKey: ['programDonasiList'],
    queryFn: async () => {
      return await programDonasiService.getAll();
    },
    enabled: isOpen && !!log,
  });

  if (!log) return null;

  const transformData = (data) => {
    if (!data) return null;
    const result = { ...data };
    if (result.program_donasi_id) {
      const program = programDonasiList.find(p => (p._id || p.id) === result.program_donasi_id);
      if (program) {
        result.program_donasi_id = program.nama_program;
      }
    }
    return result;
  };

  const oldData = transformData(log.oldData);
  const newData = transformData(log.newData);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Detail Perubahan Audit Log"
      maxWidth="max-w-[95%] md:max-w-[70%]"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-slate-500">Aksi:</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {log.action}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Koleksi:</span>
            <span className="ml-2 font-medium">{log.collectionName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Pengguna:</span>
            <span className="ml-2 font-medium text-slate-700 dark:text-slate-300">
              {log.userId?.name || 'Unknown'}
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${oldData && newData ? 'md:grid-cols-2' : ''} gap-4`}>
          {oldData && (
            <div className="bg-red-50/30 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4 pb-2 border-b border-red-200/50 dark:border-red-900/50">
                Data Lama (Sebelum)
              </h4>
              <DataViewer data={oldData} />
            </div>
          )}
          
          {newData && (
            <div className="bg-green-50/30 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4 pb-2 border-b border-green-200/50 dark:border-green-900/50">
                Data Baru (Sesudah)
              </h4>
              <DataViewer data={newData} />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">Tutup</Button>
        </div>
      </div>
    </Modal>
  );
}
