'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Download, Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Input } from '@/components/ui/input';

interface DashboardData {
  stats: any;
  revenueData: any[];
  categoryDistribution: any[];
  featuredProducts: Array<{ name: string; type: string; price: number }>;
  topSuppliers: Array<{ supplier: string; products: number; contact: string; status: string }>;
  recentCustomerOrders: Array<{ orderId: string; customerName: string; total: number; orderStatus: string; createdAt?: string }>;
  recentRetailerOrders: Array<{ orderId: string; customerName: string; total: number; orderStatus: string; createdAt?: string }>;
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'vendor'>('admin');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('adminUser');
      if (userStr) {
        const parsed = JSON.parse(userStr) as { role?: string };
        if (parsed.role === 'vendor') setUserRole('vendor');
      }
    } catch {
      setUserRole('admin');
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const statsData = await response.json();
        
        const dashboardData: DashboardData = {
          stats: {
            totalOrders: Number(statsData?.totalOrders || 0),
            totalProducts: Number(statsData?.totalProducts || 0),
            revenue: Number(statsData?.revenue || 0),
            customers: Number(statsData?.customers || 0),
          },
          revenueData: [
            { month: 'Jan', income: 25000, expense: 18000 },
            { month: 'Feb', income: 32000, expense: 22000 },
            { month: 'Mar', income: 38000, expense: 28000 },
            { month: 'Apr', income: 45000, expense: 32000 },
            { month: 'May', income: 48000, expense: 35000 },
            { month: 'Jun', income: 41000, expense: 30000 },
            { month: 'Jul', income: 35000, expense: 25000 },
          ],
          categoryDistribution:
            Array.isArray(statsData?.productTypeDistribution) && statsData.productTypeDistribution.length > 0
              ? statsData.productTypeDistribution
              : [
                  { name: 'Gold', value: 40 },
                  { name: 'Silver', value: 25 },
                  { name: 'Platinum', value: 20 },
                  { name: 'Diamonds', value: 15 },
                ],
          featuredProducts:
            Array.isArray(statsData?.featuredProducts) && statsData.featuredProducts.length > 0
              ? statsData.featuredProducts
              : [],
          topSuppliers:
            Array.isArray(statsData?.topSuppliers) && statsData.topSuppliers.length > 0
              ? statsData.topSuppliers
              : [],
          recentCustomerOrders: Array.isArray(statsData?.recentCustomerOrders) ? statsData.recentCustomerOrders : [],
          recentRetailerOrders: Array.isArray(statsData?.recentRetailerOrders) ? statsData.recentRetailerOrders : [],
        };
        
        setData(dashboardData);
      } catch (error) {
        console.error('[v0] Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-yellow-500 animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-destructive">Failed to load dashboard</div>;
  }

  const formatNumber = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };
  const dashboardTitle = userRole === 'vendor' ? 'Vendor Dashboard' : 'Admin Dashboard';
  const PIE_COLORS = ['#a5f3fc', '#86efac', '#16a34a', '#fbbf24', '#60a5fa', '#f97316'];
  const totalCategoryCount = (data.categoryDistribution || []).reduce((sum: number, item: any) => sum + Number(item?.value || 0), 0);
  const categoryChartData = (data.categoryDistribution || []).map((item: any, index: number) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
    percent: totalCategoryCount > 0 ? Math.round((Number(item?.value || 0) / totalCategoryCount) * 100) : 0,
  }));
  const kpiStats = userRole === 'vendor'
    ? [
        { label: 'Total Products', value: formatNumber(data.stats.totalProducts || 0), change: 'Live', trend: 'up' },
        { label: 'Total Orders', value: formatNumber(data.stats.totalOrders || 0), change: 'Live', trend: 'up' },
        { label: 'Revenue (INR)', value: formatNumber(data.stats.revenue || 0), change: 'Live', trend: 'up' },
        { label: 'Customers', value: '—', change: 'Admin only', trend: 'down' },
      ]
    : [
        { label: 'Total Products', value: formatNumber(data.stats.totalProducts || 0), change: 'Live', trend: 'up' },
        { label: 'Total Orders', value: formatNumber(data.stats.totalOrders || 0), change: 'Live', trend: 'up' },
        { label: 'Revenue (INR)', value: formatNumber(data.stats.revenue || 0), change: 'Live', trend: 'up' },
        { label: 'Total Customers', value: formatNumber(data.stats.customers || 0), change: 'Live', trend: 'up' },
      ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-4">
          <p className="text-sm font-bold text-gray-900 mb-2">August25, 2025</p>
          <p className="text-sm text-green-600 font-semibold">Income ${formatNumber(payload[0]?.value || 0)}</p>
          <p className="text-sm text-yellow-600 font-semibold">Expend ${formatNumber(payload[1]?.value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Title and Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{dashboardTitle}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">This Month</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
          <button className="bg-[#22c55e] text-white px-4 cursor-pointer py-1.5 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiStats.map((stat, index) => (
          <Card key={index} className="bg-white p-4 hover:shadow-md transition-all duration-200 border-0">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              )}
              <span className={`text-xs font-semibold ${stat.trend === 'down' ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Performance Chart */}
        <Card className="bg-white border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600">Expend</span>
                </div>
              </div>
              <select className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none">
                <option>Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} label={{ value: '50k', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#fbbf24" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* jewellery Deals Pie Chart */}
        <Card className="bg-white border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">jewellery Deals</h3>
              <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="45%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categoryChartData.map((entry: any, index: number) => (
                <div key={`legend-${index}`} className="flex items-center gap-2 p-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-gray-700 font-medium">{entry.name}</span>
                  <span className="text-gray-900 font-bold ml-auto">{entry.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Supplier Info and Deals */}
      <div className="grid grid-cols-2 gap-6">
        {/* Supplier Info Table */}
        <Card className="bg-white border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <h3 className="text-base font-bold text-gray-900">Supplier Info</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500">Supplier Name</p>
                <p className="text-xs font-semibold text-gray-500">Products</p>
                <p className="text-xs font-semibold text-gray-500">Contact</p>
                <p className="text-xs font-semibold text-gray-500">Status</p>
              </div>
              {data.topSuppliers.map((supplier, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-2 hover:bg-gray-50 px-2 rounded transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{supplier.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{supplier.products} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{supplier.contact}</p>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{supplier.status}</span>
                  </div>
                </div>
              ))}
              {data.topSuppliers.length === 0 && (
                <div className="py-6 text-sm text-gray-500 text-center">No supplier data found.</div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 100 2h14a1 1 0 100-2H3zM3 12a1 1 0 100 2h14a1 1 0 100-2H3zM3 20a1 1 0 100 2h14a1 1 0 100-2H3z" />
                </svg>
                Filter
              </button>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* jewellery Deals Products */}
        <Card className="bg-white border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">jewellery Deals</h3>
              <Button variant="link" className="text-amber-600 hover:text-amber-700 p-0 h-auto text-sm font-medium">
                See all →
              </Button>
            </div>
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-xs font-semibold text-gray-500">Category</p>
                  <p className="text-xs font-semibold text-gray-500">Price</p>
                </div>
              </div>
              {(data.featuredProducts || []).slice(0, 6).map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 py-2 hover:bg-gray-50 px-2 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💍</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-semibold text-gray-900">₹{formatNumber(Number(item.price || 0))}</p>
                  </div>
                </div>
              ))}
              {(data.featuredProducts || []).length === 0 && (
                <p className="text-sm text-gray-500 py-2">No products found.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white border-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Customer Orders</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Order ID</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Customer</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Total</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentCustomerOrders || []).map((order, index) => (
                      <tr key={`cust-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-gray-900 font-medium text-sm">{order.orderId}</td>
                        <td className="py-2 px-3 text-gray-600 text-sm">{order.customerName}</td>
                        <td className="py-2 px-3 text-gray-900 font-medium text-sm">₹{formatNumber(Number(order.total || 0))}</td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-700 capitalize">
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(data.recentCustomerOrders || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 px-3 text-sm text-gray-500">No recent customer orders.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Retailer Orders</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Order ID</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Retailer</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Total</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-600 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentRetailerOrders || []).map((order, index) => (
                      <tr key={`ret-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-gray-900 font-medium text-sm">{order.orderId}</td>
                        <td className="py-2 px-3 text-gray-600 text-sm">{order.customerName}</td>
                        <td className="py-2 px-3 text-gray-900 font-medium text-sm">₹{formatNumber(Number(order.total || 0))}</td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-100 text-blue-700 capitalize">
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(data.recentRetailerOrders || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 px-3 text-sm text-gray-500">No recent retailer orders.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
