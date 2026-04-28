import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import {
  useGetModifiers,
  useUpdateModifier,
  useDeleteModifier,
  useBulkUpdateModifiers,
  useGetModifierGroups,
  type Modifier,
  type ModifierBulkUpdate,
} from '../api/modifierGroup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const createColumns = (
  editMode: boolean,
  editedData: Map<number, Partial<Modifier>>,
  onFieldChange: (id: number, field: keyof Modifier, value: any) => void,
) => [
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru' as keyof Modifier,
  },
  {
    header: 'Цена',
    accessorKey: 'price' as keyof Modifier,
    cell: (row: Modifier) => `${parseFloat(row.price || '0').toFixed(2)} сум`,
  },
  {
    header: 'Порядок',
    accessorKey: 'order' as keyof Modifier,
    cell: (row: Modifier) => {
      if (!editMode) return row.order;
      const edited = editedData.get(row.id!);
      return (
        <Input
          type="number"
          value={edited?.order ?? row.order}
          onChange={(e) => onFieldChange(row.id!, 'order', parseInt(e.target.value))}
          className="w-20"
        />
      );
    },
  },
  {
    header: 'Активность',
    accessorKey: 'is_active' as keyof Modifier,
    cell: (row: Modifier) => {
      if (!editMode) {
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {row.is_active ? 'Активен' : 'Неактивен'}
          </span>
        );
      }
      const edited = editedData.get(row.id!);
      return (
        <Checkbox
          checked={edited?.is_active ?? row.is_active}
          onCheckedChange={(checked) => onFieldChange(row.id!, 'is_active', checked)}
        />
      );
    },
  },
];

export default function ModifiersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Map<number, Partial<Modifier>>>(new Map());

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (groupFilter) params.modifier_group = groupFilter;

  const { data: modifiersData, isLoading } = useGetModifiers({ params });
  const { data: groupsData } = useGetModifierGroups({ params: {} });
  const updateModifier = useUpdateModifier();
  const deleteModifier = useDeleteModifier();
  const bulkUpdate = useBulkUpdateModifiers();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, groupFilter]);

  const modifiers = modifiersData?.results || [];
  const totalCount = modifiersData?.count || 0;
  const groups = groupsData?.results || [];

  const handleFieldChange = (id: number, field: keyof Modifier, value: any) => {
    setEditedData((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleBulkSave = () => {
    const updates: ModifierBulkUpdate[] = Array.from(editedData.entries()).map(([id, changes]) => {
      const original = modifiers.find((m) => m.id === id)!;
      return {
        id,
        order: changes.order ?? original.order,
        is_active: changes.is_active ?? original.is_active,
      };
    });

    bulkUpdate.mutate(updates, {
      onSuccess: () => {
        toast.success('Модификаторы успешно обновлены');
        setEditMode(false);
        setEditedData(new Map());
      },
      onError: () => {
        toast.error('Ошибка при обновлении модификаторов');
      },
    });
  };

  const handleEdit = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteModifier.mutate(id, {
      onSuccess: () => toast.success('Модификатор удалён'),
      onError: () => toast.error('Ошибка при удалении модификатора'),
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingModifier?.id) return;

    updateModifier.mutate(
      {
        ...editingModifier,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success('Модификатор успешно обновлён');
          setIsEditDialogOpen(false);
          setEditingModifier(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении модификатора');
        },
      },
    );
  };

  const formFields = [
    {
      name: 'name_ru',
      label: 'Название (RU)',
      type: 'text' as const,
      readOnly: true,
    },
    {
      name: 'name_uz',
      label: 'Название (UZ)',
      type: 'text' as const,
      placeholder: 'Введите название на узбекском',
    },
    {
      name: 'name_kaa',
      label: 'Название (KAA)',
      type: 'text' as const,
      placeholder: 'Введите название на каракалпакском',
    },
    {
      name: 'name_en',
      label: 'Название (EN)',
      type: 'text' as const,
      placeholder: 'Введите название на английском',
    },
    {
      name: 'price',
      label: 'Цена',
      type: 'text' as const,
      placeholder: '0.00',
    },
    {
      name: 'is_active',
      label: 'Активен',
      type: 'checkbox' as const,
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number' as const,
      placeholder: '0',
    },
  ];

  const columns = createColumns(editMode, editedData, handleFieldChange);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Модификаторы</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setEditedData(new Map());
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleBulkSave}
                disabled={editedData.size === 0 || bulkUpdate.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Редактировать таблицу</Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={editMode}
        />
        <select
          className="p-2 border rounded bg-background text-foreground"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          disabled={editMode}
        >
          <option value="">Все группы</option>
          {groups.map((g: any) => (
            <option key={g.id} value={g.id}>
              {g.name_ru}
            </option>
          ))}
        </select>
      </div>

      <ResourceTable
        data={modifiers}
        columns={columns}
        isLoading={isLoading}
        onEdit={editMode ? undefined : handleEdit}
        onDelete={editMode ? undefined : handleDelete}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать модификатор</DialogTitle>
          </DialogHeader>
          <ResourceForm
            fields={formFields}
            onSubmit={handleUpdate}
            defaultValues={editingModifier || {}}
            isSubmitting={updateModifier.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
