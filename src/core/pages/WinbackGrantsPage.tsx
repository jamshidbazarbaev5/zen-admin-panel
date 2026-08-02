import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetWinbackGrants, type WinbackGrant } from '../api/winbackGrant';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Клиент (ID)',
    accessorKey: 'customer',
  },
  {
    header: 'Программа (ID)',
    accessorKey: 'program',
  },
  {
    header: 'Шаг',
    accessorKey: 'step_order',
  },
  {
    header: 'Ваучер (ID)',
    accessorKey: 'voucher',
  },
  {
    header: 'Дата выдачи',
    accessorKey: 'created_at',
    cell: (row: WinbackGrant) => new Date(row.created_at).toLocaleString(),
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
