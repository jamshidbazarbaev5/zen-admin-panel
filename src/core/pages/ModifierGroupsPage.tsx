import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetModifierGroups, useUpdateModifierGroup, useBulkUpdateModifierGroups, type ModifierGroup, type ModifierGroupBulkUpdate } from '../api/modifierGroup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const createColumns = (
  editMode: boolean,
  editedData: Map<number, Partial<ModifierGroup>>,
  onFieldChange: (id: number, field: keyof ModifierGroup, value: any) => void
) => [
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru',
  },
  {
    header: 'Модификаторов',
    accessorKey: 'modifiers_count',
  },
  {
    header: 'Порядок',
    accessorKey: 'order',
    cell: (row: ModifierGroup) => {
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
    accessorKey: 'is_active',
    cell: (row: ModifierGroup) => {
      if (!editMode) {
        return (
          <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {row.is_active ? 'Активна' : 'Неактивна'}
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

export default function ModifierGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Map<number, Partial<ModifierGroup>>>(new Map());

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;

  const { data: groupsData, isLoading } = useGetModifierGroups({ params });
  const updateGroup = useUpdateModifierGroup();
  const bulkUpdate = useBulkUpdateModifierGroups();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const groups = groupsData?.results || [];
  const totalCount = groupsData?.count || 0;

  const handleFieldChange = (id: number, field: keyof ModifierGroup, value: any) => {
    setEditedData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleBulkSave = () => {
    const updates: ModifierGroupBulkUpdate[] = Array.from(editedData.entries()).map(([id, changes]) => {
      const original = groups.find(g => g.id === id)!;
      return {
        id,
        order: changes.order ?? original.order,
        is_active: changes.is_active ?? original.is_active,
      };
    });

    bulkUpdate.mutate(updates, {
      onSuccess: () => {
        toast.success('Группы модификаторов успешно обновлены');
        setEditMode(false);
        setEditedData(new Map());
      },
      onError: () => {
        toast.error('Ошибка при обновлении групп модификаторов');
      },
    });
  };

  const handleEdit = (group: ModifierGroup) => {
    setEditingGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (!editingGroup?.id) return;

    updateGroup.mutate(
      {
        ...editingGroup,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success('Группа модификаторов успешно обновлена');
          setIsEditDialogOpen(false);
          setEditingGroup(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении группы модификаторов');
        },
      }
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
      name: 'is_active',
      label: 'Активна',
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
        <h1 className="text-2xl font-bold">Группы модификаторов</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setEditedData(new Map());
              }}>
                Отмена
              </Button>
              <Button onClick={handleBulkSave} disabled={editedData.size === 0 || bulkUpdate.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Редактировать таблицу
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={editMode}
        />
      </div>

      <ResourceTable
        data={groups}
        columns={columns}
        isLoading={isLoading}
        onEdit={editMode ? undefined : handleEdit}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать группу модификаторов</DialogTitle>
          </DialogHeader>
          <ResourceForm
            fields={formFields}
            onSubmit={handleUpdate}
            defaultValues={editingGroup || {}}
            isSubmitting={updateGroup.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
