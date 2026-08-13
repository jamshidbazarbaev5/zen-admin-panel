import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetWinbackGrants, type WinbackGrant } from '../api/winbackGrant';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Клиент',
    accessorKey: 'customer_name',
    cell: (row: WinbackGrant) => (
      <div>
        <div className="font-medium">{row.customer_name || '—'}</div>
        <div className="text-xs text-muted-foreground">{row.customer_phone}</div>
      </div>
    ),
  },
  {
    header: 'Программа',
    accessorKey: 'program_name',
  },
  {
    header: 'Шаг',
    accessorKey: 'step_order',
  },
  {
    header: 'Ваучер (Код)',
    accessorKey: 'voucher_code',
  },
  {
    header: 'Статус ваучера',
    accessorKey: 'voucher_status',
    cell: (row: WinbackGrant) => {
      let colorClass = 'bg-gray-100 text-gray-800';
      let label = row.voucher_status;
      
      if (row.voucher_status === 'active') { colorClass = 'bg-green-100 text-green-800'; label = 'Активен'; }
      else if (row.voucher_status === 'redeemed') { colorClass = 'bg-blue-100 text-blue-800'; label = 'Погашен'; }
      else if (row.voucher_status === 'expired') { colorClass = 'bg-red-100 text-red-800'; label = 'Истек'; }
      else if (row.voucher_status === 'pending_payment') { colorClass = 'bg-yellow-100 text-yellow-800'; label = 'Ожидает оплаты'; }
      else if (row.voucher_status === 'voided' || row.voucher_status === 'cancelled') { colorClass = 'bg-gray-200 text-gray-600'; label = 'Отменен'; }
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${colorClass}`}>
          {label}
        </span>
      );
    },
  },
  {
    header: 'Дата выдачи',
    accessorKey: 'granted_at',
    cell: (row: WinbackGrant) => new Date(row.granted_at).toLocaleString(),
  },
];

export default function WinbackGrantsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: grantsData, isLoading } = useGetWinbackGrants({ params: { page: currentPage } });

  const grants = grantsData?.results || [];
  const totalCount = grantsData?.count || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Выдачи Win-back ваучеров</h1>
      </div>
      <p className="text-muted-foreground mb-4">
        История всех выданных ваучеров в рамках программ возврата клиентов.
      </p>

      <ResourceTable
        data={grants}
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
