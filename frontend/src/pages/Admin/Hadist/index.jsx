import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { hadistThemeService } from "../../../services/baseCrudService";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import { Toggle } from "../../../components/common/Toggle";
import { Table } from "../../../components/common/Table";
import { Plus, Edit2, Trash2 } from "lucide-react";

export function HadistPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["hadistThemes"],
    queryFn: async () => {
      const data = await hadistThemeService.getAll();
      return data.map((item) => ({ ...item, id: item._id || item.id }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const id = formData.get("id");
      const payload = {
        name: formData.get("name"),
        is_active: formData.has("is_active"),
      };

      if (id) {
        return await hadistThemeService.update(id, payload);
      } else {
        return await hadistThemeService.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hadistThemes"] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || "Terjadi kesalahan ketika menyimpan data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => hadistThemeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hadistThemes"] });
    },
    onError: (error) => {
      alert(error.message || "Gagal menghapus data!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus tema ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { key: "name", label: "Nama Tema" },
    {
      key: "is_active",
      label: "Status Sync",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {row.is_active ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Hadist Harian
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola tema hadist yang akan ditarik dari API eksternal
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Tambah Tema
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table columns={columns} data={themes} renderActions={renderActions} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Tema" : "Tambah Tema Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ""} />

          <Input
            id="name"
            name="name"
            label="Nama Tema (Satu kata, misal: sedekah)"
            defaultValue={editingItem?.name || ""}
            required
          />

          <div className="pt-2">
            <Toggle
              id="is_active"
              name="is_active"
              label="Status Sync Aktif"
              defaultChecked={editingItem ? editingItem.is_active : true}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={saveMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
