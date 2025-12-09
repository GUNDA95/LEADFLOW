import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { generateAnalyticsInsights } from '../services/geminiService';
import { Skeleton } from './ui/Skeleton';
import { Badge } from './ui/Badge';

const DATA_REVENUE = [
  { name: 'Gen', val: 4000 },
  { name: 'Feb', val: 3000 },
  { name: 'Mar', val: 2000 },
  { name: 'Apr', val: 2780 },
  { name: 'Mag', val: 1890 },
  { name: 'Giu', val: 2390 },
  { name: 'Lug', val: 3490 },
];

const DATA_SOURCE = [
  { name: 'Instagram', value: 400 },
  { name: 'LinkedIn', value: 300 },
  { name: 'Website', value: 300 },
  { name: 'Referral', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const getInsight = async () => {
    setLoadingInsight(true);
    const result = await generateAnalyticsInsights({
        conversionRate: "18.2%",
        noShowRate: "12.5%",
        revenue: "€42.5k",
        totalLeads: 145
    });
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Performance</h2>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
            Ultimi 30 Giorni
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="p-4">
            <p className="text-sm text-gray-500">Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">€42.5k</h3>
            <span className="text-xs text-green-600 font-medium flex items-center"><TrendingUp size={12} className="mr-1"/> +12%</span>
         </Card>
         <Card className="p-4">
            <p className="text-sm text-gray-500">Nuovi Lead</p>
            <h3 className="text-2xl font-bold text-gray-900">145</h3>
            <span className="text-xs text-green-600 font-medium flex items-center"><TrendingUp size={12} className="mr-1"/> +5%</span>
         </Card>
         <Card className="p-4">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">18.2%</h3>
            <span className="text-xs text-red-600 font-medium flex items-center"><TrendingUp size={12} className="mr-1 rotate-180"/> -2%</span>
         </Card>
         <Card className="p-4">
            <p className="text-sm text-gray-500">Appuntamenti</p>
            <h3 className="text-2xl font-bold text-gray-900">64</h3>
            <span className="text-xs text-green-600 font-medium flex items-center"><TrendingUp size={12} className="mr-1"/> +8%</span>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col h-[400px]">
            <h3 className="font-bold text-gray-900 mb-4">Andamento Revenue</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA_REVENUE}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="val" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* AI Insights Box */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-purple-700">
                <Sparkles size={20} />
                <h3 className="font-bold">AI Insights</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 text-sm text-gray-700 leading-relaxed">
                {loadingInsight ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[80%]" />
                    </div>
                ) : insight ? (
                    <div className="prose prose-sm prose-purple">
                        {insight.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Clicca il bottone per analizzare i dati di vendita con Gemini Flash Lite.</p>
                )}
            </div>

            <Button onClick={getInsight} disabled={loadingInsight} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {loadingInsight ? 'Analisi in corso...' : 'Analizza Performance'}
            </Button>
        </Card>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 h-[300px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4">Sorgente Lead</h3>
            <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={DATA_SOURCE} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {DATA_SOURCE.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
                {DATA_SOURCE.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                        {d.name}
                    </div>
                ))}
            </div>
        </Card>
        
        <Card className="p-0 overflow-hidden flex flex-col h-[300px]">
             <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Performance Oraria</h3>
             </div>
             <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 font-medium">Ora</th>
                            <th className="px-6 py-3 font-medium text-right">Conversioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[
                            {h: '09:00 - 10:00', v: 'High'},
                            {h: '10:00 - 11:00', v: 'Medium'},
                            {h: '11:00 - 12:00', v: 'High'},
                            {h: '14:00 - 15:00', v: 'Low'},
                            {h: '15:00 - 16:00', v: 'Medium'},
                            {h: '16:00 - 17:00', v: 'High'},
                        ].map((row, i) => (
                            <tr key={i}>
                                <td className="px-6 py-3 text-gray-700">{row.h}</td>
                                <td className="px-6 py-3 text-right">
                                    <Badge variant={row.v === 'High' ? 'success' : row.v === 'Medium' ? 'warning' : 'secondary'}>
                                        {row.v}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;