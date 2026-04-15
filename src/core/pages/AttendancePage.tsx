import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAttendance, type Attendance } from '../api/attendance';
import { useGetStaff } from '../api/staff';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, ChevronLeft, ChevronRight, Filter, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffGroup {
  staffId: number;
  staffName: string;
  staffPosition: string;
  events: Attendance[];
}

function groupByStaff(records: Attendance[]): StaffGroup[] {
  const map = new Map<number, StaffGroup>();
  for (const r of records) {
    if (!map.has(r.staff)) {
      map.set(r.staff, {
        staffId: r.staff,
        staffName: r.staff_name,
        staffPosition: r.staff_position,
        events: [],
      });
    }
    map.get(r.staff)!.events.push(r);
  }
  return Array.from(map.values());
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function AttendancePage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
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
  const totalPages = Math.ceil(totalCount / 20);
  const staffGroups = groupByStaff(attendance);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleReset = () => {
    setFilters({ staff: '', event: '', date_from: '', date_to: '' });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('attendance.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} записей
          </p>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Фильтры
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Сотрудник</Label>
                  <select
                    value={filters.staff}
                    onChange={(e) => { setFilters({ ...filters, staff: e.target.value }); setCurrentPage(1); }}
                    className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground"
                  >
                    <option value="">Все</option>
                    {staffData?.results.map((staff) => (
                      <option key={staff.id} value={staff.id!.toString()}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Событие</Label>
                  <select
                    value={filters.event}
                    onChange={(e) => { setFilters({ ...filters, event: e.target.value }); setCurrentPage(1); }}
                    className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground"
                  >
                    <option value="">Все</option>
                    <option value="in">Приход</option>
                    <option value="out">Уход</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">С</Label>
                  <Input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setCurrentPage(1); }}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">По</Label>
                  <Input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setCurrentPage(1); }}
                    className="mt-1 h-9"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="mt-3 gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5" /> Сбросить
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <User className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Нет записей</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffGroups.map((group, gi) => (
            <motion.div
              key={group.staffId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              {/* Staff header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold text-sm">
                  {group.staffName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{group.staffName}</p>
                  {group.staffPosition && (
                    <p className="text-xs text-muted-foreground">{group.staffPosition}</p>
                  )}
                </div>
                <span className="ml-auto shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                  {group.events.length}
                </span>
              </div>

              {/* Events list */}
              <div className="space-y-1.5">
                {group.events.map((record) => {
                  const isIn = record.event === 'in';
                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: isIn ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isIn ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {isIn ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
                      </div>
                      <span className="text-xs text-foreground font-medium">
                        {record.event_display}
                      </span>
                      <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                        {formatDate(record.timestamp)}, {formatTime(record.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
