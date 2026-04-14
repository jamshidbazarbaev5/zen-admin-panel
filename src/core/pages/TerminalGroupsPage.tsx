import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { useGetTerminalGroups, type TerminalGroup } from '../api/terminalGroup';
import { useGetOrganizations } from '../api/organization';
import { Input } from '../../components/ui/input';

const columns = [
 
  {
    header: 'Название',
    accessorKey: 'name',
  },
  {
    header: 'Организация',
    accessorKey: 'organization_name',
  },
  {
    header: 'Адрес',
    accessorKey: 'address',
  },
  {
    header: 'Статус',
    accessorKey: 'is_alive',
    cell: (row: TerminalGroup) => (
      <span className={`px-2 py-1 rounded text-xs ${row.is_alive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
        {row.is_alive ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
];

export default function TerminalGroupsPage() {
  const [organizationFilter, setOrganizationFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const params: Record<string, any> = { 
    page: currentPage,
    search: searchQuery,
  };
  if (organizationFilter) params.organization = organizationFilter;

  const { data: terminalGroupsData, isLoading } = useGetTerminalGroups({ params });
  const { data: organizationsData } = useGetOrganizations({ params: { is_active: true } });

  useEffect(() => {
    setCurrentPage(1);
  }, [organizationFilter, searchQuery]);

  const terminalGroups = terminalGroupsData?.results || [];
  const totalCount = terminalGroupsData?.count || 0;
  const organizations = organizationsData?.results || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Терминальные группы</h1>
      </div>

      <div className="mb-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex gap-4">
          <select
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={organizationFilter}
            onChange={(e) => setOrganizationFilter(e.target.value)}
          >
            <option value="">Все организации</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
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
        data={terminalGroups}
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
