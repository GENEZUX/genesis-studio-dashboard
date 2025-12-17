'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertCircle, TrendingUp, Zap, DollarSign, Clock } from 'lucide-react';

interface MonitoringMetrics {
  timestamp: string;
  usage: number;
  cost: number;
  latency: number;
  errorRate: number;
  throughput: number;
}

interface DashboardStats {
  totalRequests: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
  uptime: number;
  activeModels: number;
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MonitoringMetrics[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0,
    uptime: 99.9,
    activeModels: 5
  });
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedModel, setSelectedModel] = useState('all');

  useEffect(() => {
    generateMockMetrics();
  }, [timeRange]);

  const generateMockMetrics = () => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      usage: Math.floor(Math.random() * 100) + 20,
      cost: Math.random() * 50 + 10,
      latency: Math.floor(Math.random() * 500) + 50,
      errorRate: Math.random() * 5,
      throughput: Math.floor(Math.random() * 1000) + 200
    }));
    setMetrics(data);
    setStats({
      totalRequests: Math.floor(Math.random() * 1000) + 5000,
      totalCost: Math.random() * 1000 + 500,
      avgLatency: Math.floor(Math.random() * 300) + 50,
      errorRate: Math.random() * 2,
      uptime: 99.9 + Math.random() * 0.1,
      activeModels: Math.floor(Math.random() * 8) + 3
    });
  };

  const modelDistribution = [
    { name: 'GPT-4', value: 35, color: '#10b981' },
    { name: 'Claude', value: 30, color: '#8b5cf6' },
    { name: 'Gemini', value: 20, color: '#f59e0b' },
    { name: 'Mistral', value: 15, color: '#06b6d4' }
  ];

  const costBreakdown = [
    { name: 'API Calls', cost: 450, percentage: 45 },
    { name: 'Storage', cost: 200, percentage: 20 },
    { name: 'Bandwidth', cost: 200, percentage: 20 },
    { name: 'Premium', cost: 150, percentage: 15 }
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Genesis Studio Monitoring
        </h1>
        <p className="text-slate-400">Real-time performance & analytics dashboard</p>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={<Zap className="w-5 h-5" />} title="Total Requests" value={stats.totalRequests.toLocaleString()} color="cyan" />
        <MetricCard icon={<DollarSign className="w-5 h-5" />} title="Total Cost" value={`$${stats.totalCost.toFixed(2)}`} color="purple" />
        <MetricCard icon={<Clock className="w-5 h-5" />} title="Avg Latency" value={`${Math.round(stats.avgLatency)}ms`} color="green" />
        <MetricCard icon={<AlertCircle className="w-5 h-5" />} title="Error Rate" value={`${stats.errorRate.toFixed(2)}%`} color="red" />
        <MetricCard icon={<TrendingUp className="w-5 h-5" />} title="Uptime" value={`${stats.uptime.toFixed(2)}%`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts here */}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: any) {
  return (
    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}
