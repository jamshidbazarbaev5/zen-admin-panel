import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetCustomers, useUpdateCustomer, type Customer } from '../api/customer';
import {
  useGetBalanceTransactions,
  type BalanceTransactionType,
} from '../api/balanceTransaction';
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

const TX_TYPE_LABELS: Record<BalanceTransactionType, string> = {
  deposit: 'Пополнение',
  cashback: 'Кэшбэк',
  spend: 'Списание',
};

const TX_TYPE_BADGE: Record<BalanceTransactionType, string> = {
  deposit: 'bg-green-100 text-green-800',
  cashback: 'bg-blue-100 text-blue-800',
  spend: 'bg-red-100 text-red-800',
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState<BalanceTransactionType | ''>('');
  const [txPage, setTxPage] = useState(1);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (isActiveFilter) params.is_active = isActiveFilter;

  const { data: customersData, isLoading } = useGetCustomers({ params });

  const updateCustomer = useUpdateCustomer();

  const txParams: Record<string, any> = { page: txPage };
  if (selectedCustomer?.id) txParams.customer = selectedCustomer.id;
  if (txTypeFilter) txParams.tx_type = txTypeFilter;

  const { data: txData, isLoading: isTxLoading } = useGetBalanceTransactions({
    params: txParams,
    enabled: isTxDialogOpen && !!selectedCustomer?.id,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isActiveFilter]);

  useEffect(() => {
    setTxPage(1);
  }, [txTypeFilter, selectedCustomer?.id]);

  const customers = customersData?.results || [];
  const totalCount = customersData?.count || 0;

  const transactions = txData?.results || [];
  const txTotalCount = txData?.count || 0;
  const txPageSize = 20;
  const txTotalPages = Math.max(1, Math.ceil(txTotalCount / txPageSize));

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setTxTypeFilter('');
    setTxPage(1);
    setIsTxDialogOpen(true);
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
        onRowClick={handleRowClick}
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

      <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 bg-muted/50">
            <DialogTitle className="text-foreground">
              Транзакции баланса
              {selectedCustomer && (
                <span className="text-muted-foreground font-normal ml-2">
                  — {selectedCustomer.name} ({selectedCustomer.phone})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 border-b border-border flex gap-2 flex-wrap">
            {(['', 'deposit', 'cashback', 'spend'] as const).map((type) => (
              <button
                key={type || 'all'}
                type="button"
                onClick={() => setTxTypeFilter(type as BalanceTransactionType | '')}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  txTypeFilter === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {type === '' ? 'Все' : TX_TYPE_LABELS[type as BalanceTransactionType]}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-4 bg-card">
            {isTxLoading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет транзакций</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Дата</th>
                      <th className="py-2 pr-4 font-medium">Тип</th>
                      <th className="py-2 pr-4 font-medium">Сумма</th>
                      <th className="py-2 pr-4 font-medium">Заказ</th>
                      <th className="py-2 pr-4 font-medium">Примечание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border">
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString('ru-RU')}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-1 rounded text-xs ${TX_TYPE_BADGE[tx.tx_type]}`}>
                            {TX_TYPE_LABELS[tx.tx_type] ?? tx.tx_type}
                          </span>
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap font-medium">
                          {parseFloat(tx.amount).toFixed(2)} сум
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {tx.order_number || '—'}
                        </td>
                        <td className="py-2 pr-4">{tx.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {txTotalCount > txPageSize && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
              <span className="text-sm text-muted-foreground">
                Всего: {txTotalCount}
              </span>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted"
                >
                  Назад
                </button>
                <span className="text-sm">
                  {txPage} / {txTotalPages}
                </span>
                <button
                  type="button"
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted"
                >
                  Далее
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
