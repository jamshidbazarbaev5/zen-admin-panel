import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetCategories, useUpdateCategory, type Category } from '../api/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const columns = [
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
    cell: (row: Category) => `${row.prep_minutes} мин`,
  },
  {
    header: 'Порядок',
    accessorKey: 'order',
  },
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: Category) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Активна' : 'Неактивна'}
      </span>
    ),
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;

  const { data: categoriesData, isLoading } = useGetCategories({ params });

  const updateCategory = useUpdateCategory();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const categories = categoriesData?.results || [];
  const totalCount = categoriesData?.count || 0;

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
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
