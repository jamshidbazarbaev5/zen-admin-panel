import { motion } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  Zap,
  UserPlus,
  Coffee,
  CircleDot,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import api from '../api/api';

// --- Types ---
interface DashboardData {
  customers: {
    total: number;
    active: number;
    new_today: number;
    new_week: number;
  };
  orders: {
    active: number;
    today: { count: number; revenue: string };
    week: { count: number; revenue: string };
    month: { count: number; revenue: string };
    by_status_today: Record<string, number>;
  };
}

// --- Animation ---
const bento = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const cell = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 24 },
  },
};

// --- Helpers ---
function fmt(v: string | number) {
  return Number(v).toLocaleString('ru-RU');
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ожидает',     color: '#eab308' },
  paid:      { label: 'Оплачен',     color: '#3b82f6' },
  confirmed: { label: 'Подтвержден', color: '#8b5cf6' },
  preparing: { label: 'Готовится',   color: '#f97316' },
  ready:     { label: 'Готов',       color: '#22c55e' },
  completed: { label: 'Завершён',    color: '#64748b' },
  cancelled: { label: 'Отменён',     color: '#ef4444' },
};

// --- Components ---

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 900;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{fmt(display)}{suffix}</>;
}

function StatusBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const [hovered, setHovered] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <Coffee className="h-5 w-5 mr-2 opacity-40" />
        Нет заказов сегодня
      </div>
    );
  }

  const barData = entries.map(([key, value]) => ({
    key,
    name: STATUS_META[key]?.label || key,
    value,
    color: STATUS_META[key]?.color || '#94a3b8',
  }));

  return (
    <div className="space-y-3">
      {/* Stacked horizontal bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {entries.map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ width: 0 }}
            animate={{ width: `${(value / total) * 100}%` }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
            className="relative h-full first:rounded-l-full last:rounded-r-full cursor-pointer transition-opacity"
            style={{
              background: STATUS_META[key]?.color || '#94a3b8',
              opacity: hovered !== null && hovered !== key ? 0.35 : 1,
            }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === key && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 shadow-lg">
                <p className="text-xs font-semibold text-foreground">{STATUS_META[key]?.label || key}</p>
                <p className="text-[10px] text-muted-foreground">{value} заказов · {Math.round((value / total) * 100)}%</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-border" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {barData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
            style={{ opacity: hovered !== null && hovered !== item.key ? 0.4 : 1 }}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="relative flex-1 flex items-end h-full"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
            className="w-full rounded-t-sm min-h-[3px] transition-opacity"
            style={{
              background: d.color,
              opacity: hovered !== null && hovered !== i ? 0.35 : 1,
            }}
          />
          {hovered === i && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 shadow-lg">
              <p className="text-xs font-semibold text-foreground">{fmt(d.value)} сум</p>
              <p className="text-[10px] text-muted-foreground">{d.label}</p>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Page ---
export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <Coffee className="h-8 w-8 text-muted-foreground" />
        </motion.div>
      </div>
    );
  }

  const revenueChartData = [
    { label: 'Сегодня', value: Number(data.orders.today.revenue), color: '#22c55e' },
    { label: 'Неделя', value: Number(data.orders.week.revenue), color: '#3b82f6' },
    { label: 'Месяц', value: Number(data.orders.month.revenue), color: '#8b5cf6' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t('dashboard.title', 'Панель управления')}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Zen Coffee
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={bento}
        initial="hidden"
        animate="visible"
        className="grid auto-rows-[minmax(120px,auto)] grid-cols-4 gap-3 md:gap-4 lg:grid-cols-6"
      >
        {/* --- Hero Revenue Cell (wide) --- */}
        <motion.div
          variants={cell}
          className="col-span-4 row-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-6 lg:col-span-3"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Выручка за месяц
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums md:text-6xl">
                <AnimatedNumber value={Number(data.orders.month.revenue)} />
              </span>
              <span className="text-lg text-muted-foreground">сум</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Сегодня</span>
              <span>Неделя</span>
              <span>Месяц</span>
            </div>
            <MiniBarChart data={revenueChartData} />
          </div>
        </motion.div>

        {/* --- Active Orders (tall) --- */}
        <motion.div
          variants={cell}
          className="col-span-2 row-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#f59e0b' }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: '#f59e0b' }} />
            </div>
          </div>
          <div>
            <span className="text-4xl font-bold text-foreground tabular-nums">
              <AnimatedNumber value={data.orders.active} />
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Активных заказов
            </p>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{data.orders.today.count}</span> новых сегодня
          </div>
        </motion.div>

        {/* --- Total Customers --- */}
        <motion.div
          variants={cell}
          className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-3xl font-bold text-foreground tabular-nums">
              <AnimatedNumber value={data.customers.total} />
            </span>
            <p className="text-xs text-muted-foreground">Клиентов</p>
          </div>
        </motion.div>

        {/* --- Revenue Today --- */}
        <motion.div
          variants={cell}
          className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Сегодня
          </p>
          <div>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedNumber value={Number(data.orders.today.revenue)} />
            </span>
            <span className="ml-1 text-sm text-muted-foreground">сум</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{data.orders.today.count}</span> заказов
          </p>
        </motion.div>

        {/* --- Revenue Week --- */}
        <motion.div
          variants={cell}
          className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Неделя
          </p>
          <div>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedNumber value={Number(data.orders.week.revenue)} />
            </span>
            <span className="ml-1 text-sm text-muted-foreground">сум</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{data.orders.week.count}</span> заказов
          </p>
        </motion.div>

        {/* --- Customer Breakdown (wide) --- */}
        <motion.div
          variants={cell}
          className="col-span-4 flex items-center gap-0 rounded-2xl border border-border bg-card lg:col-span-2"
        >
          {[
            { icon: Users, label: 'Активных', value: data.customers.active, color: '#22c55e' },
            { icon: Zap, label: 'Сегодня', value: data.customers.new_today, color: '#f59e0b' },
            { icon: UserPlus, label: 'За неделю', value: data.customers.new_week, color: '#8b5cf6' },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-1 flex-col items-center justify-center py-4 ${
                i > 0 ? 'border-l border-border' : ''
              }`}
            >
              <item.icon className="mb-2 h-4 w-4" style={{ color: item.color }} />
              <span className="text-xl font-bold text-foreground tabular-nums">{item.value}</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* --- Order Status Today (full width) --- */}
        <motion.div
          variants={cell}
          className="col-span-4 rounded-2xl border border-border bg-card p-5 lg:col-span-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Статусы заказов сегодня
            </p>
          </div>
          <StatusBar data={data.orders.by_status_today} />
        </motion.div>
      </motion.div>
    </div>
  );
}
