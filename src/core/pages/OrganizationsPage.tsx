import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetOrganizations, type Organization } from '../api/organization';
import { Input } from '../../components/ui/input';

const columns = [
  
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Адрес',
    accessorKey: 'address',
  },
  {
    header: 'Координаты',
    accessorKey: 'latitude',
    cell: (row: Organization) => 
      row.latitude && row.longitude 
        ? `${row.latitude}, ${row.longitude}` 
        : '-',
  },
  {
    header: 'Статус',
    accessorKey: 'is_active',
    cell: (row: Organization) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {row.is_active ? 'Активна' : 'Неактивна'}
      </span>
    ),
  },
];

export default function OrganizationsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('true');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const params: Record<string, any> = { 
    page: currentPage,
    search: searchQuery,
  };
  if (activeFilter) params.is_active = activeFilter;

  const { data: organizationsData, isLoading } = useGetOrganizations({ params });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const organizations = organizationsData?.results || [];
  const totalCount = organizationsData?.count || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Организации</h1>
      </div>

      <div className="mb-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex gap-4">
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">Все</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
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
        data={organizations}
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
