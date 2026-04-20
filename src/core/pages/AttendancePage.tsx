import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAttendanceSessions, type AttendanceSession } from '../api/attendance';
import { useGetStaff } from '../api/staff';
import { ResourceTable } from '../helpers/ResourceTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, LogOut, ImageIcon } from 'lucide-react';

export default function AttendancePage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    staff: '',
    is_open: '',
    date_from: '',
    date_to: '',
  });
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);

  const params: Record<string, any> = { page: currentPage };
  if (filters.staff) params.staff = filters.staff;
  if (filters.is_open) params.is_open = filters.is_open;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;

  const { data: sessionsData, isLoading } = useGetAttendanceSessions({ params });
  const { data: staffData } = useGetStaff();

  const sessions = sessionsData?.results || [];
  const totalCount = sessionsData?.count || 0;

  const handleReset = () => {
    setFilters({ staff: '', is_open: '', date_from: '', date_to: '' });
    setCurrentPage(1);
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleString('ru-RU');

  const renderEventCell = (
    event: AttendanceSession['check_in'],
    variant: 'in' | 'out',
    labelWhenNull: string
  ) => {
    if (!event) {
      return <span className="text-xs text-muted-foreground">{labelWhenNull}</span>;
    }
    const isIn = variant === 'in';
    return (
      <div className="flex items-center gap-2">
        {event.photo ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewPhoto({
                url: event.photo!,
                label: isIn ? t('attendance.checkInPhoto') : t('attendance.checkOutPhoto'),
              });
            }}
            className="h-10 w-10 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-shadow shrink-0"
            title={t('attendance.viewPhoto')}
          >
            <img src={event.photo} alt="" className="h-full w-full object-cover" />
          </button>
        ) : (
          <div className="h-10 w-10 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold w-fit ${
              isIn
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25'
                : 'bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/25'
            }`}
          >
            {isIn ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
            {isIn ? t('attendance.in') : t('attendance.out')}
          </span>
          <span className="text-xs text-foreground whitespace-nowrap mt-0.5">
            {formatTime(event.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  const columns = [
    {
      header: t('attendance.staffName'),
      accessorKey: 'staff_name',
    },
    {
      header: t('attendance.position'),
      accessorKey: 'staff_position',
      cell: (row: AttendanceSession) => row.staff_position || '—',
    },
    {
      header: t('attendance.checkIn'),
      accessorKey: 'check_in',
      cell: (row: AttendanceSession) =>
        renderEventCell(row.check_in, 'in', t('attendance.noCheckIn')),
    },
    {
      header: t('attendance.checkOut'),
      accessorKey: 'check_out',
      cell: (row: AttendanceSession) =>
        renderEventCell(row.check_out, 'out', t('attendance.noCheckOut')),
    },
    {
      header: t('attendance.duration'),
      accessorKey: 'duration_display',
      cell: (row: AttendanceSession) => row.duration_display || '—',
    },
    {
      header: t('attendance.sessionStatus'),
      accessorKey: 'is_open',
      cell: (row: AttendanceSession) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
            row.is_open
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25'
              : 'bg-muted text-muted-foreground ring-1 ring-border'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              row.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
            }`}
          />
          {row.is_open ? t('attendance.sessionOpen') : t('attendance.sessionClosed')}
        </span>
      ),
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
              onChange={(e) => {
                setFilters({ ...filters, staff: e.target.value });
                setCurrentPage(1);
              }}
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
            <Label className="text-xs text-muted-foreground">{t('attendance.sessionStatus')}</Label>
            <select
              value={filters.is_open}
              onChange={(e) => {
                setFilters({ ...filters, is_open: e.target.value });
                setCurrentPage(1);
              }}
              className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="">{t('attendance.allSessions')}</option>
              <option value="true">{t('attendance.sessionOpen')}</option>
              <option value="false">{t('attendance.sessionClosed')}</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('attendance.dateFrom')}</Label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => {
                setFilters({ ...filters, date_from: e.target.value });
                setCurrentPage(1);
              }}
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t('attendance.dateTo')}</Label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => {
                setFilters({ ...filters, date_to: e.target.value });
                setCurrentPage(1);
              }}
              className="mt-1 h-9"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t('attendance.resetFilters')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('attendance.totalRecords')}: {totalCount}
          </p>
        </div>
      </div>

      <ResourceTable
        data={sessions}
        columns={columns}
        isLoading={isLoading}
        totalCount={totalCount}
        pageSize={20}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-card overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/50">
            <DialogTitle className="text-foreground">{previewPhoto?.label}</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="flex items-center justify-center bg-black/5 dark:bg-black/40 p-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.label}
                className="max-h-[70vh] w-auto rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
