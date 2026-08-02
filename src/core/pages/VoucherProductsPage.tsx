import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import {
  useGetVoucherProducts,
  useCreateVoucherProduct,
  useUpdateVoucherProduct,
  useDeleteVoucherProduct,
  type VoucherProduct,
} from '../api/voucherProduct';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const columns = [
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Цена покупки',
    accessorKey: 'sale_price',
    cell: (row: VoucherProduct) => `${parseFloat(row.sale_price).toFixed(2)} сум`,
  },
  {
    header: 'Номинал',
    accessorKey: 'face_value',
    cell: (row: VoucherProduct) => `${parseFloat(row.face_value).toFixed(2)} сум`,
  },
  {
    header: 'Срок действия',
    accessorKey: 'validity_days',
    cell: (row: VoucherProduct) => row.validity_days ? `${row.validity_days} дн.` : 'Бессрочный',
  },
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: VoucherProduct) => (
      <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
];

export default function VoucherProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<VoucherProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: productsData, isLoading } = useGetVoucherProducts({ params: { page: currentPage } });
  const createProduct = useCreateVoucherProduct();
  const updateProduct = useUpdateVoucherProduct();
  const deleteProduct = useDeleteVoucherProduct();

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;

  const handleCreate = (data: any) => {
    createProduct.mutate(
      {
        name: data.name,
        face_value: data.face_value,
        sale_price: data.sale_price,
        validity_days: data.validity_days || null,
        is_active: data.is_active ?? true,
      } as VoucherProduct,
      {
        onSuccess: () => {
          toast.success('Товар-ваучер успешно создан');
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при создании товара-ваучера');
        },
      }
    );
  };

  const handleUpdate = (data: any) => {
    if (!editingProduct?.id) return;

    updateProduct.mutate(
      {
        id: editingProduct.id,
        name: data.name,
        face_value: data.face_value,
        sale_price: data.sale_price,
        validity_days: data.validity_days || null,
        is_active: data.is_active ?? true,
      } as VoucherProduct,
      {
        onSuccess: () => {
          toast.success('Товар-ваучер успешно обновлен');
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error('Ошибка при обновлении товара-ваучера');
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот товар-ваучер?')) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast.success('Товар-ваучер успешно удален'),
        onError: () => toast.error('Ошибка при удалении'),
      });
    }
  };

  const openCreateDialog = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: VoucherProduct) => {
    setIsCreating(false);
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const formFields = [
    { name: 'name', label: 'Название', type: 'text' as const, required: true },
    { name: 'sale_price', label: 'Цена покупки (сум)', type: 'text' as const, required: true },
    { name: 'face_value', label: 'Номинал ваучера (сум)', type: 'text' as const, required: true },
    { name: 'validity_days', label: 'Срок действия (в днях)', type: 'text' as const, placeholder: 'Оставьте пустым для бессрочного' },
    { name: 'is_active', label: 'Активен', type: 'checkbox' as const },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Товары-ваучеры</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Создать
        </Button>
      </div>

      <ResourceTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">
              {isCreating ? 'Создать товар-ваучер' : 'Редактировать товар-ваучер'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              fields={formFields}
              onSubmit={isCreating ? handleCreate : handleUpdate}
              defaultValues={editingProduct || { is_active: true }}
              isSubmitting={isCreating ? createProduct.isPending : updateProduct.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
