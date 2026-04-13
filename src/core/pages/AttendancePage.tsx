import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAttendance, type Attendance } from '../api/attendance';
import { useGetStaff } from '../api/staff';
import { ResourceTable } from '../helpers/ResourceTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AttendancePage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    staff: '',
    event: '',
    date_from: '',
    date_to: '',
  });

  const params: Record<string, any> = { page: currentPage };
  if (filters.staff) params.staff = filters.staff;
  if (filters.event) params.event = filters.event;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;

  const { data: attendanceData, isLoading } = useGetAttendance({ params });
  const { data: staffData } = useGetStaff();

  const attendance = attendanceData?.results || [];
  const totalCount = attendanceData?.count || 0;

  const handleReset = () => {
    setFilters({
      staff: '',
      event: '',
      date_from: '',
      date_to: '',
    });
    setCurrentPage(1);
  };

  const columns = [
    {
      header: t('attendance.staffName'),
      accessorKey: 'staff_name',
    },
    {
      header: t('attendance.position'),
      accessorKey: 'staff_position',
      cell: (row: Attendance) => t(`staff.positions.${row.staff_position}`),
    },
    {
      header: t('attendance.event'),
      accessorKey: 'event',
      cell: (row: Attendance) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.event === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.event_display}
        </span>
      ),
    },
    {
      header: t('attendance.timestamp'),
      accessorKey: 'timestamp',
      cell: (row: Attendance) => new Date(row.timestamp).toLocaleString(),
    },
    {
      header: t('attendance.createdAt'),
      accessorKey: 'created_at',
      cell: (row: Attendance) => new Date(row.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('attendance.title')}</h1>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('attendance.filters')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>{t('attendance.staff')}</Label>
            <select
              value={filters.staff}
              onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{t('attendance.allStaff')}</option>
              {staffData?.results.map((staff) => (
                <option key={staff.id} value={staff.id!.toString()}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{t('attendance.event')}</Label>
            <select
              value={filters.event}
              onChange={(e) => setFilters({ ...filters, event: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{t('attendance.allEvents')}</option>
              <option value="in">{t('attendance.in')}</option>
              <option value="out">{t('attendance.out')}</option>
            </select>
          </div>
          <div>
            <Label>{t('attendance.dateFrom')}</Label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('attendance.dateTo')}</Label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleReset}>{t('attendance.resetFilters')}</Button>
          <p className="text-sm text-muted-foreground">
            {t('attendance.totalRecords')}: {totalCount}
          </p>
        </div>
      </div>

      {/* Results Table */}
      <ResourceTable
        data={attendance}
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
