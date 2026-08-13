import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetVouchers, type Voucher } from '../api/voucher';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Покупатель',
    accessorKey: 'purchaser_name',
    cell: (row: Voucher) => (
      <div>
        <div className="font-medium">{row.purchaser_name || '—'}</div>
        <div className="text-xs text-muted-foreground">{row.purchaser_phone}</div>
      </div>
    ),
  },
  {
    header: 'Код',
    accessorKey: 'code',
  },
  {
    header: 'Продукт',
    accessorKey: 'product_name',
  },
  {
    header: 'Тип',
    accessorKey: 'voucher_kind',
    cell: (row: Voucher) => {
      switch (row.voucher_kind) {
        case 'purchased': return <span className="text-blue-600 dark:text-blue-400">Куплен</span>;
        case 'gift_received': return <span className="text-purple-600 dark:text-purple-400">Подарок (получен)</span>;
        case 'gift_from_us': return <span className="text-emerald-600 dark:text-emerald-400">От заведения</span>;
        default: return row.voucher_kind;
      }
    }
  },
  {
    header: 'Номинал',
    accessorKey: 'face_value',
    cell: (row: Voucher) => `${parseFloat(row.face_value).toFixed(2)} сум`,
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: (row: Voucher) => {
      let colorClass = 'bg-gray-100 text-gray-800';
      if (row.status === 'active') colorClass = 'bg-green-100 text-green-800';
      if (row.status === 'redeemed') colorClass = 'bg-blue-100 text-blue-800';
      if (row.status === 'expired') colorClass = 'bg-red-100 text-red-800';
      if (row.status === 'pending_payment') colorClass = 'bg-yellow-100 text-yellow-800';
      if (row.status === 'voided' || row.status === 'cancelled') colorClass = 'bg-gray-200 text-gray-600';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${colorClass}`}>
          {row.status_display}
        </span>
      );
    },
  },
  {
    header: 'Срок действия',
    accessorKey: 'expires_at',
    cell: (row: Voucher) => row.expires_at ? new Date(row.expires_at).toLocaleString() : 'Бессрочный',
  },
];

export default function VouchersPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: vouchersData, isLoading } = useGetVouchers({ params: { page: currentPage } });

  const vouchers = vouchersData?.results || [];
  const totalCount = vouchersData?.count || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ваучеры</h1>
      </div>

      <ResourceTable
        data={vouchers}
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
