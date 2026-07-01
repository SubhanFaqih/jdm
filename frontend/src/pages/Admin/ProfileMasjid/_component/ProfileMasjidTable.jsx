import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { Table } from '../../../../components/common/Table';

export function ProfileMasjidTable({
  data,
  onEdit,
  onDelete,
  onToggleActive,
  isTogglePending,
  isDeletePending
}) {
  const columns = [
    { key: 'nama_masjid', label: 'Nama Masjid' },
    { key: 'provinsi', label: 'Provinsi' },
    { key: 'kota', label: 'Kota' },
    {
      key: 'logo_url',
      label: 'Logo Masjid',
      render: (row) => row.logo_url ? (
        <img src={row.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
      ) : (
        <span className="text-slate-400 italic">Belum ada logo</span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => onToggleActive(row.id)}
          disabled={isTogglePending || row.is_active}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            row.is_active
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={row.is_active ? "Profile Aktif" : "Klik untuk jadikan Profile Aktif"}
        >
          {row.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      )
    },
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        className="px-2"
        onClick={() => onEdit(row)}
      >
        <Edit2 className="w-4 h-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        className="px-2"
        onClick={() => onDelete(row.id)}
        disabled={isDeletePending}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <Table
      columns={columns}
      data={data}
      renderActions={renderActions}
    />
  );
}
