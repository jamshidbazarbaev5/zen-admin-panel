import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { Users, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';

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
      pending: number;
      paid: number;
      confirmed: number;
      preparing: number;
      ready: number;
      completed: number;
      cancelled: number;
    };
  };
}

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await api.get('/dashboard/');
  return response.data;
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={data?.customers.total || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Customers"
          value={data?.customers.active || 0}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="New Today"
          value={data?.customers.new_today || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="New This Week"
          value={data?.customers.new_week || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueCard
          title="Today"
          orders={data?.orders.today.count || 0}
          revenue={formatCurrency(data?.orders.today.revenue || '0')}
          color="blue"
        />
        <RevenueCard
          title="This Week"
          orders={data?.orders.week.count || 0}
          revenue={formatCurrency(data?.orders.week.revenue || '0')}
          color="green"
        />
        <RevenueCard
          title="This Month"
          orders={data?.orders.month.count || 0}
          revenue={formatCurrency(data?.orders.month.revenue || '0')}
          color="purple"
        />
      </div>

      {/* Order Status Today */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Today's Orders by Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data?.orders.by_status_today && Object.entries(data.orders.by_status_today).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize mt-1">
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">{data?.orders.active || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RevenueCard({ title, orders, revenue, color }: {
  title: string;
  orders: number;
  revenue: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Orders</span>
          <span className="text-xl font-bold text-gray-900">{orders}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Revenue</span>
          <span className="text-xl font-bold text-gray-900">{revenue}</span>
        </div>
      </div>
    </div>
  );
}
