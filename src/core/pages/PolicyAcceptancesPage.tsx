import { useState } from 'react';
import { useGetPolicyAcceptances, type PolicyAcceptance } from '../api/policyAcceptance';
import { ResourceTable } from '../helpers/ResourceTable';

export default function PolicyAcceptancesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetPolicyAcceptances({
    params: { page: currentPage },
  });

  const acceptances = data?.results || [];
  const totalCount = data?.count || 0;

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const columns = [
    {
      header: 'ID клиента',
      accessorKey: 'customer' as const,
    },
    {
      header: 'Имя клиента',
      accessorKey: 'customer_name' as const,
    },
    {
      header: 'Телефон',
      accessorKey: 'customer_phone' as const,
    },
    {
      header: 'Дата принятия',
      accessorKey: (row: PolicyAcceptance) => formatDate(row.accepted_at),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Принятие политики</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Список клиентов, принявших политику
        </p>
      </div>

      <ResourceTable<PolicyAcceptance>
        data={acceptances}
        columns={columns}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
