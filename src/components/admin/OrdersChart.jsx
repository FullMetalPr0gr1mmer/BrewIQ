import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function OrdersChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('shop_id, total_amount, coffee_shops(name)');
        if (error) throw error;
        if (orders) {
          const grouped = {};
          orders.forEach((o) => {
            const name = o.coffee_shops?.name || 'Unknown';
            if (!grouped[name]) grouped[name] = { name, orders: 0, revenue: 0 };
            grouped[name].orders += 1;
            grouped[name].revenue += Number(o.total_amount);
          });
          setData(Object.values(grouped).sort((a, b) => b.orders - a.orders));
        }
      } catch (err) {
        console.warn('OrdersChart fetch error:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <h3 className="text-lg font-semibold text-brew-800 mb-4">Orders by Shop</h3>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-brew-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#B8844C' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#B8844C' }} width={120} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E8C9A0', fontSize: 13 }}
              formatter={(value, name) => [name === 'orders' ? value : `EGP ${value.toLocaleString()}`, name === 'orders' ? 'Orders' : 'Revenue']}
            />
            <Bar dataKey="orders" fill="#8B5E3C" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
