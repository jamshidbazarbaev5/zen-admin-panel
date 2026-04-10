import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetModifierGroups, useUpdateModifierGroup, type ModifierGroup } from '../api/modifierGroup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const columns = [
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru',
  },
  {
    header: 'Модификаторов',
    accessorKey: 'modifiers_count',
  },
  {
    header: 'Активность',
    accessorKey: 'is_active',
    cell: (row: ModifierGroup) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Активна' : 'Неактивна'}
      </span>
    ),
  },
  {
    header: 'Порядок',
    accessorKey: 'order',
  },
];

export default function ModifierGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;

  const { data: groupsData, isLoading } = useGetModifierGroups({ params });
  const updateGroup = useUpdateModifierGroup();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const groups = groupsData?.results || [];
  const totalCount = groupsData?.count || 0;

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Группы модификаторов</h1>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={groups}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
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
