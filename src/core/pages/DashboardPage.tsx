import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ShoppingCart,
  Coffee,
  CircleDot,
  TrendingUp,
  Wallet,
  Bike,
  ShoppingBag,
  Crown,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import api from '../api/api';

// --- Types ---
interface DashboardData {
  range: { from: string; to: string; days: number };
  revenue: {
    gross: string;
    paid_order_count: number;
    by_payment_method: {
      online_paid: string;
      deposit_used: string;
      cashback_used: string;
    };
  };
  cash_inflow: {
    total: string;
    online_paid: string;
    deposit_topups: string;
  };
  orders_by_status: Record<string, number>;
  channels: {
    pickup: { count: number; revenue: string };
    delivery: { count: number; revenue: string };
  };
  tiers: { name: string; customer_count: number }[];
  top_products: { name?: string; quantity?: number; revenue?: string }[];
  customers: { total: number; new_in_range: number };
}

// --- Animation ---
const bento = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cell = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 26 },
  },
};

// --- Helpers ---
function fmt(v: string | number) {
  return Number(v || 0).toLocaleString('ru-RU');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ожидает',     color: '#eab308' },
  paid:      { label: 'Оплачен',     color: '#3b82f6' },
  confirmed: { label: 'Подтвержден', color: '#8b5cf6' },
  preparing: { label: 'Готовится',   color: '#f97316' },
  ready:     { label: 'Готов',       color: '#10b981' },
  on_way:    { label: 'В пути',      color: '#06b6d4' },
  completed: { label: 'Завершён',    color: '#64748b' },
  cancelled: { label: 'Отменён',     color: '#ef4444' },
};

const PRESETS = [
  { label: 'Сегодня',   getRange: () => ({ from: todayISO(),    to: todayISO() }) },
  { label: '7 дней',    getRange: () => ({ from: daysAgoISO(6),  to: todayISO() }) },
  { label: '30 дней',   getRange: () => ({ from: daysAgoISO(29), to: todayISO() }) },
  { label: '90 дней',   getRange: () => ({ from: daysAgoISO(89), to: todayISO() }) },
];

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

function GradientGlow({ from, to }: { from: string; to: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-30 blur-3xl"
      style={{ background: `radial-gradient(circle, ${from}, ${to} 70%, transparent)` }}
    />
  );
}

function StatusBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const [hovered, setHovered] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        <Coffee className="h-5 w-5 mr-2 opacity-40" />
        Нет заказов в этом периоде
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {entries.map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ width: 0 }}
            animate={{ width: `${(value / total) * 100}%` }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
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
                <p className="text-[10px] text-muted-foreground">{value} · {Math.round((value / total) * 100)}%</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
            style={{ opacity: hovered !== null && hovered !== key ? 0.4 : 1 }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: STATUS_META[key]?.color || '#94a3b8' }} />
            <span className="text-muted-foreground">{STATUS_META[key]?.label || key}</span>
            <span className="font-semibold text-foreground tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelSplit({
  pickup, delivery,
}: {
  pickup: { count: number; revenue: string };
  delivery: { count: number; revenue: string };
}) {
  const total = pickup.count + delivery.count;
  const pickupPct = total === 0 ? 50 : (pickup.count / total) * 100;
  const deliveryPct = 100 - pickupPct;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
            Самовывоз
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            <AnimatedNumber value={pickup.count} />
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {fmt(pickup.revenue)} сум
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bike className="h-3.5 w-3.5" />
            Доставка
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            <AnimatedNumber value={delivery.count} />
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {fmt(delivery.revenue)} сум
          </p>
        </div>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pickupPct}%` }}
          transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          className="bg-amber-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${deliveryPct}%` }}
          transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
          className="bg-cyan-500"
        />
      </div>
    </div>
  );
}

function PaymentMethods({ methods }: { methods: DashboardData['revenue']['by_payment_method'] }) {
  const entries = [
    { key: 'online_paid', label: 'Онлайн',   value: Number(methods.online_paid),   color: '#3b82f6' },
    { key: 'deposit_used', label: 'Депозит', value: Number(methods.deposit_used),  color: '#8b5cf6' },
    { key: 'cashback_used', label: 'Кэшбек', value: Number(methods.cashback_used), color: '#f59e0b' },
  ];
  const total = entries.reduce((s, e) => s + e.value, 0);

  return (
    <div className="space-y-3">
      {entries.map((e, i) => {
        const pct = total === 0 ? 0 : (e.value / total) * 100;
        return (
          <div key={e.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{e.label}</span>
              <span className="font-semibold text-foreground tabular-nums">{fmt(e.value)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: e.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TiersChart({ tiers }: { tiers: DashboardData['tiers'] }) {
  const total = tiers.reduce((s, t) => s + t.customer_count, 0);
  const palette = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const data = tiers.map((t, i) => ({
    name: t.name === '—' ? 'Без уровня' : t.name,
    value: t.customer_count,
    fill: palette[i % palette.length],
  }));

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, total || 1]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(120,120,120,0.12)' }} dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Всего</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProducts({ products }: { products: DashboardData['top_products'] }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-sm text-muted-foreground">
        <Sparkles className="mb-2 h-5 w-5 opacity-40" />
        Нет данных о продажах
      </div>
    );
  }
  const max = Math.max(...products.map((p) => Number(p.quantity || 0)), 1);
  return (
    <div className="space-y-2.5">
      {products.slice(0, 5).map((p, i) => {
        const qty = Number(p.quantity || 0);
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate font-medium text-foreground">{p.name || `Товар ${i + 1}`}</span>
              <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">×{qty}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(qty / max) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DateRangePicker({
  range, onChange,
}: {
  range: { from: string; to: string };
  onChange: (r: { from: string; to: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const activePreset = PRESETS.find((p) => {
    const r = p.getRange();
    return r.from === range.from && r.to === range.to;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-foreground/30"
      >
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="tabular-nums">
          {activePreset?.label || `${range.from} → ${range.to}`}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-xl"
            >
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => {
                  const r = p.getRange();
                  const isActive = r.from === range.from && r.to === range.to;
                  return (
                    <button
                      key={p.label}
                      onClick={() => { onChange(r); setOpen(false); }}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-foreground text-background'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2 border-t border-border pt-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">От</label>
                  <input
                    type="date"
                    value={range.from}
                    max={range.to}
                    onChange={(e) => onChange({ ...range, from: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">До</label>
                  <input
                    type="date"
                    value={range.to}
                    min={range.from}
                    max={todayISO()}
                    onChange={(e) => onChange({ ...range, to: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Page ---
export default function DashboardPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState({ from: todayISO(), to: todayISO() });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard/', { params: { from: range.from, to: range.to } })
      .then((res) => setData(res.data))
      .catch((err) => console.error('Dashboard fetch failed:', err))
      .finally(() => setLoading(false));
  }, [range.from, range.to]);

  const avgOrderValue = useMemo(() => {
    if (!data || data.revenue.paid_order_count === 0) return 0;
    return Math.round(Number(data.revenue.gross) / data.revenue.paid_order_count);
  }, [data]);

  if (loading && !data) {
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

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t('dashboard.title', 'Панель управления')}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Zen Coffee
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
            {data.range.from} — {data.range.to} · {data.range.days} {data.range.days === 1 ? 'день' : 'дн.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker range={range} onChange={setRange} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${range.from}-${range.to}`}
          variants={bento}
          initial="hidden"
          animate="visible"
          className="grid auto-rows-[minmax(120px,auto)] grid-cols-4 gap-3 md:gap-4 lg:grid-cols-6"
        >
          {/* --- Hero Revenue --- */}
          <motion.div
            variants={cell}
            className="relative col-span-4 row-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-card/80 p-6 lg:col-span-3"
          >
            <GradientGlow from="#10b981" to="#3b82f6" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Выручка за период
                </p>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight tabular-nums text-transparent md:text-6xl">
                  <AnimatedNumber value={Number(data.revenue.gross)} />
                </span>
                <span className="text-lg text-muted-foreground">сум</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3" />
                <span className="tabular-nums">{data.revenue.paid_order_count}</span> оплаченных заказов
                {avgOrderValue > 0 && (
                  <>
                    <span className="opacity-50">·</span>
                    средний чек <span className="font-semibold text-foreground tabular-nums">{fmt(avgOrderValue)}</span>
                  </>
                )}
              </p>
            </div>
            <div className="relative mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Способы оплаты
              </p>
              <PaymentMethods methods={data.revenue.by_payment_method} />
            </div>
          </motion.div>

          {/* --- Cash Inflow (tall) --- */}
          <motion.div
            variants={cell}
            className="relative col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 lg:col-span-3"
          >
            <GradientGlow from="#a855f7" to="#3b82f6" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Поступления
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground tabular-nums md:text-5xl">
                  <AnimatedNumber value={Number(data.cash_inflow.total)} />
                </span>
                <span className="text-base text-muted-foreground">сум</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Общий приток средств</p>
            </div>
            <div className="relative grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Онлайн</p>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">
                  {fmt(data.cash_inflow.online_paid)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Депозиты</p>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">
                  {fmt(data.cash_inflow.deposit_topups)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* --- Customers --- */}
          <motion.div
            variants={cell}
            className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <Users className="h-4 w-4 text-muted-foreground" />
              {data.customers.new_in_range > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  +{data.customers.new_in_range}
                </span>
              )}
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={data.customers.total} />
              </span>
              <p className="text-xs text-muted-foreground">Всего клиентов</p>
            </div>
          </motion.div>

          {/* --- Avg Order --- */}
          <motion.div
            variants={cell}
            className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
          >
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-3xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={avgOrderValue} />
              </span>
              <p className="text-xs text-muted-foreground">Средний чек, сум</p>
            </div>
          </motion.div>

          {/* --- Paid Orders --- */}
          <motion.div
            variants={cell}
            className="col-span-2 flex flex-col justify-between rounded-2xl border border-border bg-card p-5 lg:col-span-2"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <div>
              <span className="text-3xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={data.revenue.paid_order_count} />
              </span>
              <p className="text-xs text-muted-foreground">Оплачено заказов</p>
            </div>
          </motion.div>

          {/* --- Channels --- */}
          <motion.div
            variants={cell}
            className="col-span-4 rounded-2xl border border-border bg-card p-5 lg:col-span-3"
          >
            <div className="mb-4 flex items-center gap-2">
              <Bike className="h-4 w-4 text-cyan-500" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Каналы заказов
              </p>
            </div>
            <ChannelSplit pickup={data.channels.pickup} delivery={data.channels.delivery} />
          </motion.div>

          {/* --- Tiers --- */}
          <motion.div
            variants={cell}
            className="col-span-4 rounded-2xl border border-border bg-card p-5 lg:col-span-3"
          >
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Уровни клиентов
              </p>
            </div>
            <TiersChart tiers={data.tiers} />
          </motion.div>

          {/* --- Order Status (full width) --- */}
          <motion.div
            variants={cell}
            className="col-span-4 rounded-2xl border border-border bg-card p-5 lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Статусы заказов
              </p>
            </div>
            <StatusBar data={data.orders_by_status} />
          </motion.div>

          {/* --- Top Products --- */}
          <motion.div
            variants={cell}
            className="col-span-4 rounded-2xl border border-border bg-card p-5 lg:col-span-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Топ продаж
              </p>
            </div>
            <TopProducts products={data.top_products} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
