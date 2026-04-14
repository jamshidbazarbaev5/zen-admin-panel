import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetCustomers, useUpdateCustomer, type Customer } from '../api/customer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const columns = [
  {
    header: 'Имя',
    accessorKey: 'name',
  },
  {
    header: 'Телефон',
    accessorKey: 'phone',
  },
  {
    header: 'Telegram ID',
    accessorKey: 'telegram_id',
  },
  {
    header: 'Язык',
    accessorKey: 'lang',
    cell: (row: Customer) => row.lang.toUpperCase(),
  },
  {
    header: 'Заказов',
    accessorKey: 'orders_count',
  },
  {
    header: 'Баланс',
    accessorKey: 'balance',
    cell: (row: Customer) => `${parseFloat(row.balance).toFixed(2)} сум`,
  },
  {
    header: 'Потрачено',
    accessorKey: 'total_spent',
    cell: (row: Customer) => `${parseFloat(row.total_spent).toFixed(2)} сум`,
  },
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: Customer) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.is_active ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (isActiveFilter) params.is_active = isActiveFilter;

  const { data: customersData, isLoading } = useGetCustomers({ params });

  const updateCustomer = useUpdateCustomer();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isActiveFilter]);

  const customers = customersData?.results || [];
  const totalCount = customersData?.count || 0;

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (!editingCustomer?.id) return;

    updateCustomer.mutate(
      {
        id: editingCustomer.id,
        is_active: data.is_active,
      } as Customer,
      {
        onSuccess: () => {
          toast.success('Клиент успешно обновлен');
          setIsEditDialogOpen(false);
          setEditingCustomer(null);
        },
        onError: () => {
          toast.error('Ошибка при обновлении клиента');
        },
      }
    );
  };

  const formFields = [
    {
      name: 'name',
      label: 'Имя',
      type: 'text' as const,
      readOnly: true,
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'text' as const,
      readOnly: true,
    },
    {
      name: 'telegram_id',
      label: 'Telegram ID',
      type: 'text' as const,
      readOnly: true,
    },
    {
      name: 'is_active',
      label: 'Активен',
      type: 'checkbox' as const,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Клиенты</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Поиск по имени, телефону..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="true">Активные</option>
          <option value="false">Неактивные</option>
        </select>
      </div>

      <ResourceTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">Редактировать клиента</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-card">
            <ResourceForm
              fields={formFields}
              onSubmit={handleUpdate}
              defaultValues={editingCustomer || {}}
              isSubmitting={updateCustomer.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
