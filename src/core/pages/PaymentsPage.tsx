import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetPayments, type Payment } from '../api/payment';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const statusLabels: Record<Payment['status'], string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

const statusColors: Record<Payment['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const columns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Номер заказа',
    accessorKey: 'order_number',
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: (row: Payment) => (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[row.status]}`}>
        {statusLabels[row.status]}
      </span>
    ),
  },
  {
    header: 'Сумма',
    accessorKey: 'amount',
    cell: (row: Payment) => `${parseFloat(row.amount).toFixed(2)} сум`,
  },
  {
    header: 'Создан',
    accessorKey: 'created_at',
    cell: (row: Payment) => new Date(row.created_at).toLocaleString('ru-RU'),
  },
];

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (statusFilter) params.status = statusFilter;
  if (orderFilter) params.order = orderFilter;

  const { data: paymentsData, isLoading } = useGetPayments({ params });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, orderFilter]);

  const payments = paymentsData?.results || [];
  const totalCount = paymentsData?.count || 0;

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Платежи</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <select
          className="p-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Input
          type="text"
          placeholder="ID заказа"
          className="w-48"
          value={orderFilter}
          onChange={(e) => setOrderFilter(e.target.value)}
        />
      </div>

      <ResourceTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleRowClick}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали платежа #{selectedPayment?.id}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Номер заказа</p>
                  <p className="text-base">{selectedPayment.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Статус</p>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[selectedPayment.status]}`}>
                    {statusLabels[selectedPayment.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Сумма</p>
                  <p className="text-base">{parseFloat(selectedPayment.amount).toFixed(2)} сум</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID заказа</p>
                  <p className="text-base">{selectedPayment.order}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Информация Rahmat</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice ID</p>
                    <p className="text-base">{selectedPayment.rahmat_invoice_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-base">{selectedPayment.rahmat_trans_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment URL</p>
                    {selectedPayment.rahmat_payment_url ? (
                      <a
                        href={selectedPayment.rahmat_payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {selectedPayment.rahmat_payment_url}
                      </a>
                    ) : (
                      <p className="text-base">-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-sm text-gray-500">
                <p>Создан: {new Date(selectedPayment.created_at).toLocaleString('ru-RU')}</p>
                <p>Обновлен: {new Date(selectedPayment.updated_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
