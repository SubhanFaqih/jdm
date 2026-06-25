import { useState, useOptimistic, useActionState } from 'react';
import { Table } from './Table';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function DummyCrudPage({ title, description, columns, initialData, formFields }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [optimisticData, addOptimisticData] = useOptimistic(
    data,
    (state, newItem) => {
      if (newItem.type === 'delete') {
        return state.filter(item => item.id !== newItem.id);
      }
      if (newItem.type === 'update') {
        return state.map(item => item.id === newItem.data.id ? newItem.data : item);
      }
      return [...state, newItem.data];
    }
  );

  async function saveData(prevState, formData) {
    const id = formData.get('id');
    const payload = { id: id || Date.now().toString() };
    
    formFields.forEach(field => {
      payload[field.name] = formData.get(field.name);
    });

    addOptimisticData({ type: id ? 'update' : 'add', data: payload });
    await new Promise(resolve => setTimeout(resolve, 600));

    if (id) {
      setData(prev => prev.map(item => item.id === id ? payload : item));
    } else {
      setData(prev => [...prev, payload]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    return { success: true };
  }

  const [, formAction, isPending] = useActionState(saveData, null);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      addOptimisticData({ type: 'delete', id });
      await new Promise(resolve => setTimeout(resolve, 600));
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" className="px-2" onClick={() => { setEditingItem(row); setIsModalOpen(true); }}>
        <Edit2 className="w-4 h-4 text-blue-500" />
      </Button>
      <Button variant="ghost" className="px-2" onClick={() => handleDelete(row.id)}>
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Tambah {title}
        </Button>
      </div>

      <Table columns={columns} data={optimisticData} renderActions={renderActions} />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem ? `Edit ${title}` : `Tambah ${title}`}>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          {formFields.map(field => (
            <Input 
              key={field.name}
              id={field.name}
              name={field.name}
              label={field.label}
              defaultValue={editingItem?.[field.name] || ''}
              required={field.required !== false}
              type={field.type || 'text'}
            />
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isPending}>Batal</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
