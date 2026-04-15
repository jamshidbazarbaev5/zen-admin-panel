import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAttendance, type Attendance } from '../api/attendance';
import { useGetStaff } from '../api/staff';
import { ResourceTable } from '../helpers/ResourceTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

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
    setFilters({ staff: '', event: '', date_from: '', date_to: '' });
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
      cell: (row: Attendance) => row.staff_position || '—',
    },
    {
      header: t('attendance.event'),
      accessorKey: 'event',
      cell: (row: Attendance) => {
        const isIn = row.event === 'in';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
            isIn
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25'
              : 'bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/25'
          }`}>
            {isIn ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
            {row.event_display}
          </span>
        );
      },
    },
    {
      header: t('attendance.timestamp'),
      accessorKey: 'timestamp',
      cell: (row: Attendance) => new Date(row.timestamp).toLocaleString('ru-RU'),
    },
    {
      header: t('attendance.createdAt'),
      accessorKey: 'created_at',
      cell: (row: Attendance) => new Date(row.created_at).toLocaleString('ru-RU'),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('attendance.title')}</h1>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">{t('attendance.staff')}</Label>
            <select
              value={filters.staff}
              onChange={(e) => { setFilters({ ...filters, staff: e.target.value }); setCurrentPage(1); }}
              className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground"
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
            <Label className="text-xs text-muted-foreground">{t('attendance.event')}</Label>
            <select
              value={filters.event}
              onChange={(e) => { setFilters({ ...filters, event: e.target.value }); setCurrentPage(1); }}
              className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="">{t('attendance.allEvents')}</option>
              <option value="in">{t('attendance.in')}</option>
              <option value="out">{t('attendance.out')}</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('attendance.dateFrom')}</Label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setCurrentPage(1); }}
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('attendance.dateTo')}</Label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setCurrentPage(1); }}
              className="mt-1 h-9"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleReset}>{t('attendance.resetFilters')}</Button>
          <p className="text-sm text-muted-foreground">
            {t('attendance.totalRecords')}: {totalCount}
          </p>
        </div>
      </div>

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
