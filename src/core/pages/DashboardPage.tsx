import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Package
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
    today: {
      count: number;
      revenue: string;
    };
    week: {
      count: number;
      revenue: string;
    };
    month: {
      count: number;
      revenue: string;
    };
    by_status_today: {
      confirmed?: number;
      pending?: number;
      [key: string]: number | undefined;
    };
  };
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  }
};

// --- Components ---
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, t }: any) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <TrendingUp size={16} className="mr-1" /> : <TrendingUp size={16} className="mr-1 rotate-180" />}
          {trendValue}
        </span>
        <span className="text-slate-400 ml-2">{t('dashboard.vsLastPeriod', 'vs last period')}</span>
      </div>
    )}
  </motion.div>
);

export default function App() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('dashboard.loading', 'Загрузка...')}</p>
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { name: t('dashboard.activeOrders'), value: dashboardData.orders.active, color: '#3b82f6' },
    { name: t('dashboard.confirmed'), value: dashboardData.orders.by_status_today.confirmed || 0, color: '#10b981' },
    { name: t('dashboard.pending'), value: dashboardData.orders.by_status_today.pending || 0, color: '#f59e0b' },
  ];

  // Derived data for charts
  const revenueData = [
    { name: t('dashboard.week1', 'Неделя 1'), revenue: 15000 },
    { name: t('dashboard.week2', 'Неделя 2'), revenue: 35000 },
    { name: t('dashboard.week3', 'Неделя 3'), revenue: 45000 },
    { name: t('dashboard.week4', 'Неделя 4'), revenue: Number(dashboardData.orders.today.revenue) },
  ];

  const customerGrowthData = [
    { day: t('dashboard.mon', 'Пн'), new: 0 },
    { day: t('dashboard.tue', 'Вт'), new: 1 },
    { day: t('dashboard.wed', 'Ср'), new: 0 },
    { day: t('dashboard.thu', 'Чт'), new: 2 },
    { day: t('dashboard.fri', 'Пт'), new: 0 },
    { day: t('dashboard.sat', 'Сб'), new: 0 },
    { day: t('dashboard.sun', 'Вс'), new: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-slate-500 mt-1">{t('dashboard.welcome', 'Добро пожаловать. Вот что происходит сегодня.')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">{t('dashboard.liveUpdates', 'Обновления в реальном времени')}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* KPIs */}
          <StatCard 
            title={`${t('dashboard.revenue')} (${t('dashboard.thisMonth')})`}
            value={`${Number(dashboardData.orders.month.revenue).toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="+12.5%"
            t={t}
          />
          <StatCard 
            title={t('dashboard.activeOrders')}
            value={dashboardData.orders.active}
            subtitle={`${dashboardData.orders.today.count} ${t('dashboard.newToday', 'новых сегодня')}`}
            icon={Package}
            trend="up"
            trendValue="+4.2%"
            t={t}
          />
          <StatCard 
            title={t('dashboard.totalCustomers')}
            value={dashboardData.customers.total}
            subtitle={`${dashboardData.customers.new_week} ${t('dashboard.newThisWeek', 'новых за неделю')}`}
            icon={Users}
            trend="up"
            trendValue="+100%"
            t={t}
          />
          <StatCard 
            title={`${t('dashboard.revenue')} (${t('dashboard.today')})`}
            value={`${Number(dashboardData.orders.today.revenue).toLocaleString()}`}
            subtitle={`${dashboardData.orders.by_status_today.confirmed || 0} ${t('dashboard.confirmedOrder', 'подтвержденных заказов')}`}
            icon={Activity}
            t={t}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Area Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">{t('dashboard.revenueOverview')}</h3>
              <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none">
                <option>{t('dashboard.thisMonth')}</option>
                <option>{t('dashboard.lastMonth', 'Прошлый месяц')}</option>
                <option>{t('dashboard.thisYear', 'Этот год')}</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, t('dashboard.revenue')]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Donut Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{t('dashboard.orderStatusDistribution')}</h3>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{dashboardData.orders.month.count}</span>
                <span className="text-xs text-slate-500">{t('dashboard.totalOrders', 'Всего заказов')}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {orderStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bar Chart - Customer Growth */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t('dashboard.customerGrowth')}</h3>
                <p className="text-sm text-slate-500">{t('dashboard.newCustomersThisWeek', 'Новые клиенты за эту неделю')}</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Users size={20} />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar 
                    dataKey="new" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    animationDuration={1500}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
