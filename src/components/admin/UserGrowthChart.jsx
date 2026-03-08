import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function UserGrowthChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at');
        if (error) throw error;
        if (profiles) {
          const grouped = {};
          profiles.forEach((p) => {
            const day = p.created_at.slice(0, 10);
            if (!grouped[day]) grouped[day] = { day, count: 0 };
            grouped[day].count += 1;
          });
          const sorted = Object.values(grouped).sort((a, b) => a.day.localeCompare(b.day));
          let cumulative = 0;
          sorted.forEach((d) => {
            cumulative += d.count;
            d.total = cumulative;
          });
          setData(sorted);
        }
      } catch (err) {
        console.warn('UserGrowthChart fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <h3 className="text-lg font-semibold text-brew-800 mb-4">User Growth</h3>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-brew-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5E3C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#B8844C' }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#B8844C' }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E8C9A0', fontSize: 13 }}
              formatter={(value) => [value, 'Total Users']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area type="monotone" dataKey="total" stroke="#8B5E3C" strokeWidth={2} fill="url(#growthGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
