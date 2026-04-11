import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetCategories, useUpdateCategory, useBulkUpdateCategories, type Category, type CategoryBulkUpdate } from '../api/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const createColumns = (
  editMode: boolean,
  editedData: Map<number, Partial<Category>>,
  onFieldChange: (id: number, field: keyof Category, value: any) => void
) => [
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru',
  },
  {
    header: 'Продуктов',
    accessorKey: 'products_count',
  },
  {
    header: 'Время приготовления',
    accessorKey: 'prep_minutes',
    cell: (row: Category) => {
      if (!editMode) return `${row.prep_minutes} мин`;
      const edited = editedData.get(row.id!);
      return (
        <Input
          type="number"
          value={edited?.prep_minutes ?? row.prep_minutes}
          onChange={(e) => onFieldChange(row.id!, 'prep_minutes', parseInt(e.target.value))}
          className="w-20"
        />
      );
    },
  },
  {
    header: 'Порядок',
    accessorKey: 'order',
    cell: (row: Category) => {
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
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: Category) => {
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

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Map<number, Partial<Category>>>(new Map());

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;

  const { data: categoriesData, isLoading } = useGetCategories({ params });

  const updateCategory = useUpdateCategory();
  const bulkUpdate = useBulkUpdateCategories();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const categories = categoriesData?.results || [];
  const totalCount = categoriesData?.count || 0;

  const handleFieldChange = (id: number, field: keyof Category, value: any) => {
    setEditedData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleBulkSave = () => {
    const updates: CategoryBulkUpdate[] = Array.from(editedData.entries()).map(([id, changes]) => {
      const original = categories.find(c => c.id === id)!;
      return {
        id,
        order: changes.order ?? original.order,
        is_active: changes.is_active ?? original.is_active,
        prep_minutes: changes.prep_minutes ?? original.prep_minutes,
      };
    });

    bulkUpdate.mutate(updates, {
      onSuccess: () => {
        toast.success('Категории успешно обновлены');
        setEditMode(false);
        setEditedData(new Map());
      },
      onError: () => {
        toast.error('Ошибка при обновлении категорий');
      },
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (!editingCategory?.id) return;

    updateCategory.mutate(
      {
        id: editingCategory.id,
        name_uz: data.name_uz,
        name_kaa: data.name_kaa,
        name_en: data.name_en,
        prep_minutes: data.prep_minutes,
        order: data.order,
        is_active: data.is_active,
      } as Category,
      {
        onSuccess: () => {
          toast.success('Категория успешно обновлена');
          setIsEditDialogOpen(false);
          setEditingCategory(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении категории');
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
      name: 'prep_minutes',
      label: 'Время приготовления (мин)',
      type: 'number' as const,
      placeholder: '15',
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      name: 'is_active',
      label: 'Активна',
      type: 'checkbox' as const,
    },
  ];

  const columns = createColumns(editMode, editedData, handleFieldChange);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
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
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={editMode}
        />
      </div>

      <ResourceTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        onEdit={editMode ? undefined : handleEdit}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0 bg-gray-50">
            <DialogTitle className="text-gray-900">Редактировать категорию</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-white">
            <ResourceForm
              fields={formFields}
              onSubmit={handleUpdate}
              defaultValues={editingCategory || {}}
              isSubmitting={updateCategory.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
