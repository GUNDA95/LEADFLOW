import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import { Users, DollarSign, TrendingUp, CalendarCheck, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Skeleton } from './ui/Skeleton';
import { Badge } from './ui/Badge';
import { Lead } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { listGoogleEvents } from '../services/googleCalendarService';
import { startOfWeek, endOfWeek, subDays, format, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    totalLeads: 0,
    revenue: 0,
    conversion: 0,
    appointments: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Leads
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Calculate KPIs
      const totalLeads = leads?.length || 0;
      const revenue = leads?.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0;
      const wonLeads = leads?.filter(l => l.status === 'Vinto').length || 0;
      const conversion = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      // 3. Fetch Appointments (Google Calendar + Supabase)
      let googleCount = 0;
      if (session?.provider_token) {
         const now = new Date();
         // Get events for this week
         const events = await listGoogleEvents(session.provider_token, startOfWeek(now), endOfWeek(now));
         googleCount = events.length;
      }
      
      const { count: sbApptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
      const totalAppointments = (sbApptCount || 0) + googleCount;

      setKpi({
        totalLeads,
        revenue,
        conversion,
        appointments: totalAppointments
      });

      // 4. Set Recent Leads
      if (leads) {
          // Map DB snake_case to CamelCase types if needed, currently Supabase returns snake_case but our types are Camel?
          // Let's assume standard mapping or update types. 
          // For now, let's map manually to be safe.
          const mappedLeads: Lead[] = leads.slice(0, 5).map((l: any) => ({
             id: l.id,
             name: l.name,
             company: l.company,
             email: l.email,
             status: l.status,
             value: l.value,
             lastContact: l.last_contact || l.created_at,
             notes: l.notes,
             createdAt: l.created_at
          }));
          setRecentLeads(mappedLeads);

          // 5. Calculate Trend (last 7 days creation)
          const last7Days = Array.from({length: 7}, (_, i) => {
              const d = subDays(new Date(), 6 - i);
              return { 
                  date: d, 
                  label: format(d, 'dd/MM'),
                  count: 0
              };
          });

          leads.forEach((l: any) => {
              const d = new Date(l.created_at);
              const dayStat = last7Days.find(day => day.date.getDate() === d.getDate() && day.date.getMonth() === d.getMonth());
              if (dayStat) dayStat.count++;
          });

          setTrendData(last7Days.map(d => ({ name: d.label, leads: d.count })));
      }

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Nuovo': return 'info';
      case 'Contattato': return 'warning';
      case 'In Negoziazione': return 'secondary';
      case 'Vinto': return 'success';
      case 'Perso': return 'destructive';
      default: return 'outline';
    }
  };

  const KPICard = ({ title, value, icon: Icon, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Lead Totali" value={kpi.totalLeads.toString()} icon={Users} trend={5.2} />
        <KPICard title="Revenue" value={`€${kpi.revenue.toLocaleString()}`} icon={DollarSign} trend={8.2} />
        <KPICard title="Conversione" value={`${kpi.conversion.toFixed(1)}%`} icon={TrendingUp} trend={-2.1} />
        <KPICard title="Appuntamenti (Wk)" value={kpi.appointments.toString()} icon={CalendarCheck} trend={4.5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Trend Lead</h3>
            <p className="text-sm text-gray-500">Nuovi lead acquisiti negli ultimi 7 giorni</p>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="leads" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Leads Table */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Ultimi Lead</h3>
            <button className="text-sm text-primary-600 font-medium hover:underline">Vedi tutti</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3 text-right">Valore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                            Nessun lead recente
                        </td>
                    </tr>
                ) : (
                    recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.company}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <p className="font-medium text-gray-900">€{lead.value?.toLocaleString()}</p>
                        <Badge variant={getStatusVariant(lead.status || '')} className="mt-1 text-[10px] px-1.5 py-0">
                            {lead.status}
                        </Badge>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;