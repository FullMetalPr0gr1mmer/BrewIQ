import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

const periods = [
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
];

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState(30);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - activePeriod);

        const { data: orders, error } = await supabase
          .from('orders')
          .select('order_date, total_amount')
          .gte('order_date', since.toISOString())
          .order('order_date');

        if (error) throw error;

        const grouped = {};
        (orders || []).forEach((o) => {
          const day = o.order_date.slice(0, 10);
          if (!grouped[day]) grouped[day] = { day, revenue: 0, orders: 0 };
          grouped[day].revenue += Number(o.total_amount);
          grouped[day].orders += 1;
        });
        setData(Object.values(grouped).sort((a, b) => a.day.localeCompare(b.day)));
      } catch (err) {
        console.warn('RevenueChart fetch error:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activePeriod]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brew-800">Revenue Trend</h3>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePeriod(p.value)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer border-none ${
                activePeriod === p.value
                  ? 'bg-brew-500 text-white'
                  : 'bg-brew-50 text-brew-600 hover:bg-brew-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-brew-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#B8844C' }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#B8844C' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E8C9A0', fontSize: 13 }}
              formatter={(value) => [`EGP ${value.toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line type="monotone" dataKey="revenue" stroke="#8B5E3C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
