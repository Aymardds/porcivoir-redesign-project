import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp,
  Package,
  FileText,
  Loader2,
  AlertTriangle,
  Briefcase,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '@/lib/supabase';

const StatCard = ({ title, value, icon: Icon, trend, loading, variant = "default" }: any) => (
  <div className={`bg-card p-6 rounded-xl border border-border shadow-sm ring-1 ring-black/5 ${variant === 'primary' ? 'border-primary/30 bg-primary/5' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-[10px] font-black uppercase tracking-widest ${variant === 'primary' ? 'text-primary' : 'text-muted-foreground'}`}>{title}</h3>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${variant === 'primary' ? 'bg-primary/20' : 'bg-primary/10'}`}>
        <Icon className={`w-5 h-5 ${variant === 'primary' ? 'text-primary' : 'text-primary'}`} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
      ) : (
        <p className={`text-2xl font-black font-sans ${variant === 'primary' ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      )}
      {trend !== undefined && !loading && (
        <p className={`text-sm ${trend >= 0 ? 'text-emerald-500' : 'text-destructive'} flex items-center font-bold`}>
          {trend > 0 ? '+' : ''}{trend}%
          <TrendingUp className={`w-4 h-4 ml-1 ${trend < 0 && 'rotate-180'}`} />
        </p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenueGlobal: 0,
    revenueStore: 0,
    revenueServices: 0,
    ordersCount: 0,
    customersCount: 0,
    quotesCount: 0,
    stockAlerts: [] as any[],
    chartData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders (Store Revenue)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .neq('status', 'cancelled');
      
      const ordersRevenue = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
      const ordersCount = orders?.length || 0;

      // 2. Fetch Quotes (Services Revenue - 15% fixed rate)
      const { data: quotes } = await supabase
        .from('quote_requests')
        .select('total_amount')
        .neq('status', 'cancelled');
        
      const quotesTotalValue = quotes?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
      const servicesRevenue = quotesTotalValue * 0.15; // Commissions 15%
      const quotesCount = quotes?.length || 0;

      // 3. Fetch Customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 4. Fetch Stock Alerts (Stock < 6)
      const { data: stockAlerts } = await supabase
        .from('products')
        .select('title, stock_quantity')
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })
        .limit(5);

      // 5. Generate Chart Data (Last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
          date: d.toISOString().split('T')[0],
          boutique: 0,
          services: 0
        };
      });

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        const day = last7Days.find(d => d.date === orderDate);
        if (day) {
          day.boutique += Number(order.total_amount);
        }
      });

      setStats({
        revenueGlobal: ordersRevenue + servicesRevenue,
        revenueStore: ordersRevenue,
        revenueServices: servicesRevenue,
        ordersCount,
        customersCount: customersCount || 0,
        quotesCount,
        stockAlerts: stockAlerts || [],
        chartData: last7Days
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end border-b border-border/50 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black font-sans text-foreground uppercase tracking-tight">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Performance globale du département Porcivoire
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-secondary/50 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
        >
          {loading ? 'Sychronisation...' : 'Actualiser les Stats'}
        </button>
      </div>

      {/* --- SECTION REVENUS --- */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Analyses Financières</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Chiffre d'Affaire Global" 
                value={formatCurrency(stats.revenueGlobal)} 
                icon={PieChart} 
                loading={loading}
                variant="primary"
            />
            <StatCard 
                title="Ventes de Porc (Store)" 
                value={formatCurrency(stats.revenueStore)} 
                icon={CreditCard} 
                loading={loading}
            />
            <StatCard 
                title="Services Agri (Commissions)" 
                value={formatCurrency(stats.revenueServices)} 
                icon={Briefcase} 
                loading={loading}
            />
        </div>
      </div>

      {/* --- SECTION ACTIVITÉ --- */}
      <div className="space-y-4 mt-12">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Volume d'Activité</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Commandes Boutique" 
                value={stats.ordersCount} 
                icon={ShoppingCart} 
                loading={loading}
            />
            <StatCard 
                title="Demandes Devis" 
                value={stats.quotesCount} 
                icon={FileText} 
                loading={loading}
            />
            <StatCard 
                title="Base Clients" 
                value={stats.customersCount} 
                icon={Users} 
                loading={loading}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 bg-card border border-border shadow-sm rounded-2xl p-8 ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black font-sans uppercase tracking-tight">Historique Boutique (7J)</h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    Boutique
                </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 800 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 800 }}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--secondary) / 0.5)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenu']}
                />
                <Bar dataKey="boutique" fill="hsl(156 100% 31%)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-2xl p-8 ring-1 ring-black/5">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-black font-sans uppercase tracking-tight text-foreground">Alertes Stock</h2>
          </div>
          <div className="space-y-4">
            {stats.stockAlerts.length === 0 && !loading ? (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-400">Opérations fluides</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1 px-4">Tous vos produits sont correctement approvisionnés.</p>
                </div>
            ) : stats.stockAlerts.map((item, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-all p-2 rounded-lg">
                <div className="overflow-hidden mr-4">
                  <p className="font-bold font-sans text-sm truncate text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tight opacity-70">{item.stock_quantity} unités dispo</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  item.stock_quantity === 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                  item.stock_quantity < 3 ? 'bg-orange-500/10 text-orange-500 border border-orange-200/50' :
                  'bg-yellow-500/10 text-yellow-600 border border-yellow-200/50'
                }`}>
                  {item.stock_quantity === 0 ? 'Rupture' : item.stock_quantity < 3 ? 'Critique' : 'Bas'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Dashboard;
