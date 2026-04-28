import { useState, useEffect, useRef } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetOrders, useGetOrder, type Order } from '../api/order';
import { useGetBranches } from '../api/branch';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { getAccessToken } from '../api/auth';
import { Clock, ChefHat } from 'lucide-react';

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
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25',
  paid: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500/25',
  confirmed: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/25',
  preparing: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/25',
  ready: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25',
  completed: 'bg-muted text-muted-foreground ring-1 ring-border',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/25',
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
      <div className="flex items-center gap-1.5">
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[row.status]}`}>
          {statusLabels[row.status]}
        </span>
        {row.should_cook && (
          <span className="relative flex h-6 w-6 items-center justify-center" title="Готовить">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
            <ChefHat className="relative h-4 w-4 text-orange-500" />
          </span>
        )}
        {row.is_overdue && (
          <span className="relative flex h-6 w-6 items-center justify-center" title="Просрочен">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />
            <Clock className="relative h-4 w-4 text-red-500" />
          </span>
        )}
      </div>
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
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [newOrderIndicator, setNewOrderIndicator] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pageSize = 20;
  const params: Record<string, any> = { 
    page: currentPage, 
    limit: pageSize,
    offset: (currentPage - 1) * pageSize 
  };
  if (searchTerm) params.search = searchTerm;
  if (statusFilter) params.status = statusFilter;
  if (orderTypeFilter) params.order_type = orderTypeFilter;
  if (branchFilter) params.branch = branchFilter;
  if (fromDate) params.from = fromDate;
  if (toDate) params.to = toDate;

  const { data: ordersData, isLoading, refetch } = useGetOrders({ params });
  const { data: branchesData } = useGetBranches({ params: { is_active: true } });
  const branches = branchesData?.results || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orderTypeFilter, branchFilter, fromDate, toDate]);

  // Initialize audio for notifications
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/sound.mp3');
    audioRef.current.volume = 0.7; // Set volume to 70%
    // Preload the audio
    audioRef.current.load();
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      // Reset audio to start if it was already playing
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error('[OrdersPage] Could not play notification sound:', err);
        // If autoplay is blocked, we can't do much about it
        // User needs to interact with the page first
      });
    }
  };

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const token = getAccessToken();
      if (!token) {
        console.log('[OrdersPage] No access token, skipping WebSocket connection');
        return;
      }

      const wsUrl = `wss://zen-coffee.uz/ws/orders/?token=${token}`;
      console.log('[OrdersPage] Connecting to WebSocket...');
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[OrdersPage] WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[OrdersPage] WebSocket message received:', data);

          if (data.type === 'order_created') {
            // Play notification sound
            playNotificationSound();
            
            // Show indicator
            setNewOrderIndicator(true);
            setTimeout(() => setNewOrderIndicator(false), 5000);

            // Increment new orders count
            setNewOrdersCount(prev => prev + 1);

            // Refetch orders data
            refetch();
          } else if (data.type === 'order_updated') {
            // Just refetch without sound for updates
            refetch();
          }
        } catch (error) {
          console.error('[OrdersPage] Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[OrdersPage] WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('[OrdersPage] WebSocket disconnected');
        setWsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[OrdersPage] Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [refetch]);

  const orders = ordersData?.results || [];
  const totalCount = ordersData?.count || 0;

  // Fetch full order detail (with items) when a row is selected
  const { data: orderDetail } = useGetOrder(
    isDetailDialogOpen && selectedOrder?.id ? selectedOrder.id : 0
  );
  const detailOrder = orderDetail ?? selectedOrder;

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Заказы</h1>
          {/* New orders count badge */}
          {newOrdersCount > 0 && (
            <button
              onClick={() => setNewOrdersCount(0)}
              className="relative flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
              title="Нажмите, чтобы сбросить счетчик"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-bold">{newOrdersCount}</span>
              <span className="text-xs">новых</span>
            </button>
          )}
          {/* Test sound button */}
          <button
            onClick={playNotificationSound}
            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-sm"
            title="Проверить звук уведомления"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            Тест звука
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* WebSocket connection indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {wsConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          
          {/* New order indicator */}
          {newOrderIndicator && (
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Новый заказ!</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          type="text"
          placeholder="Поиск по номеру, клиенту..."
          className="flex-1 min-w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="pickup">Самовывоз</option>
          <option value="delivery">Доставка</option>
        </select>
        <select
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="">Все филиалы</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Input
          type="date"
          className="w-[170px]"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          title="С даты"
        />
        <Input
          type="date"
          className="w-[170px]"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          title="По дату"
        />
        {(fromDate || toDate || branchFilter) && (
          <button
            type="button"
            onClick={() => {
              setFromDate('');
              setToDate('');
              setBranchFilter('');
            }}
            className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground hover:bg-muted"
          >
            Сбросить
          </button>
        )}
      </div>

      <ResourceTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleRowClick}
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали заказа {detailOrder?.number}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Клиент</p>
                  <p className="text-base">{detailOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                  <p className="text-base">{detailOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Тип заказа</p>
                  <p className="text-base capitalize">
                    {detailOrder.order_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Статус</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[detailOrder.status]}`}>
                      {statusLabels[detailOrder.status]}
                    </span>
                    {detailOrder.is_overdue && (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/25">Просрочен</span>
                    )}
                    {detailOrder.should_cook && (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500/25">Требует приготовления</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Время получения</p>
                  <p className="text-base">{new Date(detailOrder.pickup_time).toLocaleString('ru-RU')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Количество позиций</p>
                  <p className="text-base">{detailOrder.items_count ?? detailOrder.items?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Время приготовления</p>
                  <p className="text-base">{detailOrder.prep_minutes} мин</p>
                </div>
                {detailOrder.iiko_order_number && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Номер заказа iiko</p>
                    <p className="text-base">{detailOrder.iiko_order_number}</p>
                  </div>
                )}
              </div>

              {detailOrder.order_type === 'delivery' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Информация о доставке</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Адрес</p>
                      <p className="text-base">{detailOrder.delivery_address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Квартира</p>
                      <p className="text-base">{detailOrder.delivery_flat || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Подъезд</p>
                      <p className="text-base">{detailOrder.delivery_entrance || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Этаж</p>
                      <p className="text-base">{detailOrder.delivery_floor || '-'}</p>
                    </div>
                    {detailOrder.delivery_comment && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Комментарий</p>
                        <p className="text-base">{detailOrder.delivery_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailOrder.items && detailOrder.items.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Позиции заказа</h3>
                  <div className="space-y-3">
                    {detailOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border bg-card p-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                                ×{item.quantity}
                              </span>
                              <p className="font-medium">{item.product_name}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {parseFloat(item.price).toFixed(2)} сум за шт.
                            </p>
                            {item.modifiers && item.modifiers.length > 0 && (
                              <ul className="mt-2 space-y-1 pl-4">
                                {item.modifiers.map((mod) => (
                                  <li
                                    key={mod.id}
                                    className="flex items-center justify-between text-sm text-muted-foreground"
                                  >
                                    <span>
                                      + {mod.modifier_name}
                                      {mod.quantity > 1 && ` ×${mod.quantity}`}
                                    </span>
                                    {parseFloat(mod.price) > 0 && (
                                      <span>
                                        {parseFloat(mod.price).toFixed(2)} сум
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {parseFloat(item.subtotal).toFixed(2)} сум
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Оплата</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Общая сумма</p>
                    <p className="text-base">{parseFloat(detailOrder.total_amount || '0').toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Использовано баланса</p>
                    <p className="text-base">{parseFloat(detailOrder.balance_used || '0').toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Оплачено онлайн</p>
                    <p className="text-base">{parseFloat(detailOrder.online_paid || '0').toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Использовано кэшбэка</p>
                    <p className="text-base">{parseFloat(detailOrder.cashback_used || '0').toFixed(2)} сум</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Использовано депозита</p>
                    <p className="text-base">{parseFloat(detailOrder.deposit_used || '0').toFixed(2)} сум</p>
                  </div>
                </div>
              </div>

              {detailOrder.cancel_reason && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground">Причина отмены</p>
                  <p className="text-base text-red-600">{detailOrder.cancel_reason}</p>
                </div>
              )}

              <div className="border-t pt-4 text-sm text-muted-foreground">
                <p>Создан: {new Date(detailOrder.created_at).toLocaleString('ru-RU')}</p>
                <p>Обновлен: {new Date(detailOrder.updated_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
