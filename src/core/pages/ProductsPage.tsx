import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetProducts, useUpdateProduct, type Product } from '../api/product';
import { useGetCategories } from '../api/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const columns = [
  {
    header: 'Название (RU)',
    accessorKey: 'name_ru',
  },
  {
    header: 'Категория',
    accessorKey: 'category_name',
  },
  {
    header: 'Цена',
    accessorKey: 'price',
    cell: (row: Product) => `${parseFloat(row.price).toFixed(2)} сум`,
  },
  {
    header: 'Время приготовления',
    accessorKey: 'prep_minutes',
    cell: (row: Product) => row.prep_minutes ? `${row.prep_minutes} мин` : '-',
  },
  {
    header: 'Доступность',
    accessorKey: 'is_available',
    cell: (row: Product) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_available ? 'Доступен' : 'Недоступен'}
      </span>
    ),
  },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isAvailableFilter, setIsAvailableFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (categoryFilter) params.category = categoryFilter;
  if (isAvailableFilter) params.is_available = isAvailableFilter;

  const { data: productsData, isLoading } = useGetProducts({ params });

  const categoriesParams: Record<string, any> = {};
  const { data: categoriesData } = useGetCategories({ params: categoriesParams });
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, isAvailableFilter]);

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  const categories = categoriesData?.results || [];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (!editingProduct?.id) return;

    const formData = new FormData();
    formData.append('name_uz', data.name_uz || '');
    formData.append('name_kaa', data.name_kaa || '');
    formData.append('name_en', data.name_en || '');
    formData.append('desc_uz', data.desc_uz || '');
    formData.append('desc_kaa', data.desc_kaa || '');
    formData.append('desc_en', data.desc_en || '');
    formData.append('is_available', data.is_available ? 'true' : 'false');
    if (data.prep_minutes) formData.append('prep_minutes', data.prep_minutes.toString());
    formData.append('order', data.order?.toString() || '0');
    
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }

    updateProduct.mutate(
      { formData, id: editingProduct.id },
      {
        onSuccess: () => {
          toast.success('Продукт успешно обновлен');
          setIsEditDialogOpen(false);
          setEditingProduct(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении продукта');
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
      name: 'desc_uz',
      label: 'Описание (UZ)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на узбекском',
    },
    {
      name: 'desc_kaa',
      label: 'Описание (KAA)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на каракалпакском',
    },
    {
      name: 'desc_en',
      label: 'Описание (EN)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на английском',
    },
    {
      name: 'image',
      label: 'Изображение',
      type: 'file' as const,
      existingImage: editingProduct?.image as string,
    },
    {
      name: 'is_available',
      label: 'Доступен',
      type: 'checkbox' as const,
    },
    {
      name: 'prep_minutes',
      label: 'Время приготовления (мин)',
      type: 'number' as const,
      placeholder: '10',
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
        <h1 className="text-2xl font-bold">Продукты</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_ru}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={isAvailableFilter}
          onChange={(e) => setIsAvailableFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="true">Доступные</option>
          <option value="false">Недоступные</option>
        </select>
      </div>

      <ResourceTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0 bg-gray-50">
            <DialogTitle className="text-gray-900">Редактировать продукт</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-white">
            <ResourceForm
              fields={formFields}
              onSubmit={handleUpdate}
              defaultValues={editingProduct || {}}
              isSubmitting={updateProduct.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
