import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCheckIns } from '../services/storage';
import { AestheticCheckIn, METRIC_LABELS } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Plus, Activity } from 'lucide-react';

const METRIC_GROUPS = [
    {
        title: "Body Stats",
        items: [
            { key: 'weight', label: 'Weight' }
        ]
    },
    {
        title: "Aesthetics (1-10)",
        items: [
            { key: 'muscleFullness', label: 'Muscle' },
            { key: 'skinClarity', label: 'Clarity' },
            { key: 'skinTexture', label: 'Texture' },
            { key: 'jawlineDefinition', label: 'Jawline' },
            { key: 'facialFullness', label: 'Face Bloat' },
            { key: 'inflammation', label: 'Inflammation' }
        ]
    },
    {
        title: "Vitality (1-10)",
        items: [
            { key: 'energy', label: 'Energy' },
            { key: 'sleepQuality', label: 'Sleep' },
            { key: 'libido', label: 'Libido' }
        ]
    }
];

export const Trends: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('weight');

  useEffect(() => {
    const rawCheckIns = getCheckIns().reverse(); 
    const formatted = rawCheckIns.map(c => ({
      date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(c.date).toLocaleDateString(),
      weight: c.weight || null,
      ...c.metrics
    }));
    setData(formatted);
  }, []);

  const getLabel = (key: string) => {
      for (const group of METRIC_GROUPS) {
          const found = group.items.find(i => i.key === key);
          if (found) return found.label;
      }
      return key;
  };

  const currentVal = data.length > 0 ? data[data.length - 1][selectedMetric] : 0;
  const startVal = data.length > 0 ? data[0][selectedMetric] : 0;
  const diff = (currentVal && startVal) ? (currentVal - startVal).toFixed(1) : 0;
  const isPositive = Number(diff) > 0;

  // Use the last 7 data points for the 7-day view
  const chartData = data.slice(-7);

  return (
    <div className="pt-6 pb-24 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 px-1">
        <div>
           <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Trends</h1>
           <p className="text-stone-400 dark:text-stone-500 font-medium mt-1">Track your journey</p>
        </div>
        <Link 
            to="/check-in" 
            className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-stone-200 dark:shadow-stone-900/50 active:scale-95 transition-transform flex items-center"
        >
            <Plus size={14} strokeWidth={3} className="mr-1.5" />
            Log Entry
        </Link>
      </div>

      {/* Metric Selector Grid (Moved Top) */}
      <div className="space-y-6 mb-8 px-1 animate-in slide-in-from-top duration-300">
        {METRIC_GROUPS.map((group) => (
            <div key={group.title}>
                <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 ml-1">{group.title}</h3>
                <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setSelectedMetric(item.key)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                                selectedMetric === item.key
                                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-lg shadow-stone-900/20 dark:shadow-stone-100/10 scale-105 ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100 dark:ring-offset-stone-950'
                                : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-transparent shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-stone-900 rounded-[40px] shadow-sm border border-stone-50 dark:border-stone-800 h-[400px] relative overflow-hidden mb-8 flex flex-col transition-colors">
        <div className="p-8 pb-0 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">{getLabel(selectedMetric)}</p>
                    <div className="flex items-baseline space-x-2">
                        <h2 className="text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                            {currentVal ? Math.round(Number(currentVal)) : '--'}
                        </h2>
                        {selectedMetric === 'weight' && <span className="text-lg font-bold text-stone-400 dark:text-stone-600">lbs</span>}
                        {selectedMetric !== 'weight' && <span className="text-lg font-bold text-stone-400 dark:text-stone-600">/ 10</span>}
                    </div>
                </div>
                
                {data.length > 1 && (
                    <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border border-stone-50 dark:border-stone-800 ${isPositive ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-200' : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400'}`}>
                        <span>{isPositive ? '+' : ''}{diff}</span>
                        <TrendingUp size={14} className={!isPositive ? "text-stone-400 dark:text-stone-500" : ""} />
                    </div>
                )}
            </div>
        </div>

        <div className="flex-1 w-full mt-4 pr-6">
            {data.length < 2 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 mb-10">
                    <Activity size={32} className="text-stone-300 dark:text-stone-600 mb-2" />
                    <p className="text-stone-400 dark:text-stone-600 text-sm font-bold">Log more entries to see your trend.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="currentColor" className="text-stone-900 dark:text-stone-100" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="currentColor" className="text-stone-900 dark:text-stone-100" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" className="stroke-stone-100 dark:stroke-stone-800" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#d6d3d1"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="#d6d3d1"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => Math.round(value).toString()} 
                        domain={selectedMetric === 'weight' ? ['dataMin - 5', 'dataMax + 5'] : [0, 10]}
                        allowDecimals={false}
                        width={30}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        itemStyle={{ fontSize: '14px', color: '#1c1917', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '10px', color: '#a8a29e', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}
                        cursor={{ stroke: '#e7e5e4', strokeWidth: 2 }}
                        formatter={(value: number) => Math.round(value)}
                    />
                    <Area 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke="currentColor" 
                        className="text-stone-900 dark:text-stone-100"
                        strokeWidth={3} 
                        fill="url(#colorMetric)"
                        activeDot={{ r: 6, fill: 'currentColor', className: 'text-stone-900 dark:text-stone-100', stroke: '#fff', strokeWidth: 3 }}
                    />
                </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
};