import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetOrders, type Order } from '../api/order';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  confirmed: 'Подтвержден',
  preparing: 'Готовится',
  ready: 'Готов',
  completed: 'Завершен',
  cancelled: 'Отменен',
};

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const columns = [
  {
    header: 'Номер',
    accessorKey: 'number',
  },
  {
    header: 'Клиент',
    accessorKey: 'customer_name',
  },
  {
    header: 'Телефон',
    accessorKey: 'customer_phone',
  },
  {
    header: 'Тип',
    accessorKey: 'order_type',
    cell: (row: Order) => (
      <span className="capitalize">
        {row.order_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
      </span>
    ),
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: (row: Order) => (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[row.status]}`}>
        {statusLabels[row.status]}
      </span>
    ),
  },
  {
    header: 'Сумма',
    accessorKey: 'total_amount',
    cell: (row: Order) => `${parseFloat(row.total_amount).toFixed(2)} сум`,
  },
  {
    header: 'Время получения',
    accessorKey: 'pickup_time',
    cell: (row: Order) => new Date(row.pickup_time).toLocaleString('ru-RU'),
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (statusFilter) params.status = statusFilter;
  if (orderTypeFilter) params.order_type = orderTypeFilter;

  const { data: ordersData, isLoading } = useGetOrders({ params });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orderTypeFilter]);

  const orders = ordersData?.results || [];
  const totalCount = ordersData?.count || 0;

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Заказы</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Поиск по номеру, клиенту..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
        <select
          className="p-2 border rounded"
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="pickup">Самовывоз</option>
          <option value="delivery">Доставка</option>
        </select>
      </div>

      <ResourceTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleRowClick}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали заказа {selectedOrder?.number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Клиент</p>
                  <p className="text-base">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Телефон</p>
                  <p className="text-base">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Тип заказа</p>
                  <p className="text-base capitalize">
                    {selectedOrder.order_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Статус</p>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Время получения</p>
                  <p className="text-base">{new Date(selectedOrder.pickup_time).toLocaleString('ru-RU')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Количество позиций</p>
                  <p className="text-base">{selectedOrder.items_count}</p>
                </div>
              </div>

              {selectedOrder.order_type === 'delivery' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Информация о доставке</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Адрес</p>
                      <p className="text-base">{selectedOrder.delivery_address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Квартира</p>
                      <p className="text-base">{selectedOrder.delivery_flat || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Подъезд</p>
                      <p className="text-base">{selectedOrder.delivery_entrance || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Этаж</p>
                      <p className="text-base">{selectedOrder.delivery_floor || '-'}</p>
                    </div>
                    {selectedOrder.delivery_comment && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Комментарий</p>
                        <p className="text-base">{selectedOrder.delivery_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Оплата</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Общая сумма</p>
                    <p className="text-base">{parseFloat(selectedOrder.total_amount).toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Использовано баланса</p>
                    <p className="text-base">{parseFloat(selectedOrder.balance_used).toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Оплачено онлайн</p>
                    <p className="text-base">{parseFloat(selectedOrder.online_paid).toFixed(2)} сум</p>
                  </div>
                </div>
              </div>

              {selectedOrder.cancel_reason && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500">Причина отмены</p>
                  <p className="text-base text-red-600">{selectedOrder.cancel_reason}</p>
                </div>
              )}

              <div className="border-t pt-4 text-sm text-gray-500">
                <p>Создан: {new Date(selectedOrder.created_at).toLocaleString('ru-RU')}</p>
                <p>Обновлен: {new Date(selectedOrder.updated_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
