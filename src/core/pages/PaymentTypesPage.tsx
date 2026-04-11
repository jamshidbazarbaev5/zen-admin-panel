import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetPaymentTypes, type PaymentType } from '../api/paymentType';
import { Input } from '../../components/ui/input';

const kindLabels: Record<PaymentType['payment_type_kind'], string> = {
  Cash: 'Наличные',
  Card: 'Карта',
  IikoCard: 'Iiko Карта',
};

const columns = [
 
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Код',
    accessorKey: 'code',
  },
  {
    header: 'Тип',
    accessorKey: 'payment_type_kind',
    cell: (row: PaymentType) => kindLabels[row.payment_type_kind],
  },
  {
    header: 'Статус',
    accessorKey: 'is_deleted',
    cell: (row: PaymentType) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        {row.is_deleted ? 'Удален' : 'Активен'}
      </span>
    ),
  },
];

export default function PaymentTypesPage() {
  const [kindFilter, setKindFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const params: Record<string, any> = { 
    page: currentPage,
    is_deleted: false,
    search: searchQuery,
  };
  if (kindFilter) params.kind = kindFilter;

  const { data: paymentTypesData, isLoading } = useGetPaymentTypes({ params });

  useEffect(() => {
    setCurrentPage(1);
  }, [kindFilter, searchQuery]);

  const paymentTypes = paymentTypesData?.results || [];
  const totalCount = paymentTypesData?.count || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Типы оплаты</h1>
      </div>

      <div className="mb-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex gap-4">
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">Все типы</option>
            {Object.entries(kindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Input
            type="text"
            placeholder="Поиск..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ResourceTable
        data={paymentTypes}
        columns={columns}
        isLoading={isLoading}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
