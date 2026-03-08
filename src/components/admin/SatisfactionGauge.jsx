import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

const COLORS = ['#D4A574', '#B8844C', '#8B5E3C', '#6F4E31', '#523A25', '#3A2819', '#E8C9A0'];

export default function SatisfactionGauge() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('product_id, total_amount, products(name, category)');
        if (error) throw error;
        if (orders) {
          const grouped = {};
          orders.forEach((o) => {
            const name = o.products?.name || 'Unknown';
            if (!grouped[name]) grouped[name] = { name, value: 0, revenue: 0 };
            grouped[name].value += 1;
            grouped[name].revenue += Number(o.total_amount);
          });
          setData(Object.values(grouped).sort((a, b) => b.value - a.value).slice(0, 7));
        }
      } catch (err) {
        console.warn('SatisfactionGauge fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <h3 className="text-lg font-semibold text-brew-800 mb-4">Product Popularity</h3>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-brew-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E8C9A0', fontSize: 13 }}
              formatter={(value, name) => [`${value} orders`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-brew-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
