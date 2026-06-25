import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Eye } from 'lucide-react';
import { auditLogService } from '../../../services/baseCrudService';
import { AuditLogModal } from './AuditLogModal';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export function AuditLogPage() {
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const data = await auditLogService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  const filteredLogs = filterAction === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(log => log.action === filterAction);

  const columns = [
    { 
      key: 'performedAt', 
      label: 'Waktu',
      render: (row) => formatDate(row.performedAt)
    },
    { 
      key: 'documentId', 
      label: 'ID Transaksi / Dokumen',
      render: (row) => {
        const kasId = row.newData?.kasId || row.oldData?.kasId;
        return kasId ? `TRX-${kasId}` : row.documentId;
      }
    },
    { 
      key: 'details', 
      label: 'Detail Perubahan',
      render: (row) => (
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedLog(row)}
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4 text-brand-primary" />
          </Button>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'CREATE', label: 'Create' },
    { id: 'UPDATE', label: 'Update' },
    { id: 'DELETE', label: 'Delete' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Audit Logs</h2>
          <p className="text-slate-500 dark:text-slate-400">Pencatatan riwayat perubahan data (Read-Only)</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-x-1">
          {tabs.map((tab) => {
            const isActive = filterAction === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterAction(tab.id)}
                className={`px-6 py-2.5 text-sm md:text-base font-semibold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat data log...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table 
            columns={columns}
            data={filteredLogs}
          />
        </div>
      )}

      <AuditLogModal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />
    </div>
  );
}
