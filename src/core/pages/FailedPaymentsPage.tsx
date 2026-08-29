import { useState, useEffect } from 'react';
import { useGetFailedPayments, useResolveFailedPayment, type FailedPayment } from '../api/failedPayment';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Search, Banknote, RotateCcw } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  order: 'Заказ',
  deposit: 'Пополнение',
  voucher: 'Ваучер',
};

const TYPE_BADGE: Record<string, string> = {
  order: 'bg-blue-100 text-blue-800',
  deposit: 'bg-purple-100 text-purple-800',
  voucher: 'bg-amber-100 text-amber-800',
};

export default function FailedPaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [resolvedFilter, setResolvedFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Resolve dialog
  const [resolveItem, setResolveItem] = useState<FailedPayment | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  const params: Record<string, any> = { page: currentPage };
  if (searchTerm) params.search = searchTerm;
  if (typeFilter) params.type = typeFilter;
  if (resolvedFilter) params.resolved = resolvedFilter;
  if (fromDate) params.from = fromDate;
  if (toDate) params.to = toDate;

  const { data, isLoading } = useGetFailedPayments(params);
  const resolveMutation = useResolveFailedPayment();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, resolvedFilter, fromDate, toDate]);

  const items = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleResolve = (method: 'balance_credit' | 'cash') => {
    if (!resolveItem) return;
    resolveMutation.mutate(
      { itemType: resolveItem.type, itemId: resolveItem.id, method },
      {
        onSuccess: () => {
          toast.success(method === 'balance_credit' ? 'Зачислено на баланс в iiko' : 'Отмечено как решённое (наличные)');
          setIsResolveDialogOpen(false);
          setResolveItem(null);
        },
        onError: () => {
          toast.error('Ошибка при решении проблемы');
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-foreground">Проблемные платежи</h1>
          {totalCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">
        Платежи, пополнения и ваучеры, с которых деньги списаны, но начисление в iiko не прошло.
      </p>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по заказу, имени, телефону..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="p-2 border rounded bg-background text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="order">Заказы</option>
          <option value="deposit">Пополнения</option>
          <option value="voucher">Ваучеры</option>
        </select>
        <select
          className="p-2 border rounded bg-background text-sm"
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="false">Нерешённые</option>
          <option value="true">Решённые</option>
        </select>
        <Input
          type="date"
          className="w-[160px]"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="С"
        />
        <Input
          type="date"
          className="w-[160px]"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="По"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="mx-auto h-8 w-8 mb-2 opacity-40" />
            Нет проблемных платежей
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/50">
                  <th className="py-3 px-4 font-medium">Тип</th>
                  <th className="py-3 px-4 font-medium">Ссылка</th>
                  <th className="py-3 px-4 font-medium">Клиент</th>
                  <th className="py-3 px-4 font-medium">Сумма</th>
                  <th className="py-3 px-4 font-medium">Причина</th>
                  <th className="py-3 px-4 font-medium">Дата ошибки</th>
                  <th className="py-3 px-4 font-medium">Статус</th>
                  <th className="py-3 px-4 font-medium">Действие</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${TYPE_BADGE[item.type] || 'bg-gray-100 text-gray-800'}`}>
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">{item.reference || '—'}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{item.customer?.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{item.customer?.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium">
                      {parseFloat(item.amount).toLocaleString('ru-RU')} сум
                    </td>
                    <td className="py-3 px-4 max-w-[250px]">
                      <span className="text-xs text-red-600 dark:text-red-400 line-clamp-2">{item.reason || '—'}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs">
                      {new Date(item.failed_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-3 px-4">
                      {item.resolved ? (
                        <div>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Решено
                          </span>
                          {item.resolved_by && (
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {item.resolved_by.username}
                              {item.resolution_method === 'cash' ? ' (наличные)' : ' (баланс)'}
                            </div>
                          )}
                          {item.resolved_at && (
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(item.resolved_at).toLocaleString('ru-RU')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Не решено
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {!item.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResolveItem(item);
                            setIsResolveDialogOpen(true);
                          }}
                        >
                          Решить
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Всего: {totalCount}
          </span>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted text-sm"
            >
              Назад
            </button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-muted text-sm"
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Решить проблему
            </DialogTitle>
          </DialogHeader>
          {resolveItem && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_BADGE[resolveItem.type]}`}>
                    {TYPE_LABELS[resolveItem.type]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Клиент:</span>
                  <span className="font-medium">{resolveItem.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Телефон:</span>
                  <span>{resolveItem.customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма:</span>
                  <span className="font-bold">{parseFloat(resolveItem.amount).toLocaleString('ru-RU')} сум</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ссылка:</span>
                  <span className="font-mono text-xs">{resolveItem.reference}</span>
                </div>
                {resolveItem.reason && (
                  <div>
                    <span className="text-muted-foreground">Причина:</span>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{resolveItem.reason}</p>
                  </div>
                )}
                {resolveItem.resolve_error && (
                  <div>
                    <span className="text-muted-foreground">Последняя ошибка:</span>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{resolveItem.resolve_error}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  className="flex items-center gap-2"
                  disabled={resolveMutation.isPending}
                  onClick={() => handleResolve('balance_credit')}
                >
                  <RotateCcw className="h-4 w-4" />
                  Зачислить в iiko
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={resolveMutation.isPending}
                  onClick={() => handleResolve('cash')}
                >
                  <Banknote className="h-4 w-4" />
                  Отдано наличными
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                «Зачислить в iiko» — повторная попытка зачисления на баланс.
                «Отдано наличными» — отметить решённым без обращения к iiko.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
