import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DISPLAY_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

function getColor(value, max) {
  if (!max || value === 0) return '#FFF8F0';
  const intensity = value / max;
  if (intensity < 0.2) return '#F5E6D3';
  if (intensity < 0.4) return '#E8C9A0';
  if (intensity < 0.6) return '#D4A574';
  if (intensity < 0.8) return '#B8844C';
  return '#8B5E3C';
}

function formatHour(h) {
  if (h === 0) return '12AM';
  if (h < 12) return `${h}AM`;
  if (h === 12) return '12PM';
  return `${h - 12}PM`;
}

export default function PeakHoursHeatmap() {
  const [grid, setGrid] = useState({});
  const [maxVal, setMaxVal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: orders } = await supabase
        .from('orders')
        .select('order_date');

      if (orders) {
        const counts = {};
        let max = 0;
        orders.forEach((o) => {
          const d = new Date(o.order_date);
          const key = `${d.getDay()}-${d.getHours()}`;
          counts[key] = (counts[key] || 0) + 1;
          if (counts[key] > max) max = counts[key];
        });
        setGrid(counts);
        setMaxVal(max);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <h3 className="text-lg font-semibold text-brew-800 mb-4">Peak Hours</h3>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour labels */}
            <div className="flex ml-10 mb-1">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-brew-400">
                  {DISPLAY_HOURS.includes(h) ? formatHour(h) : ''}
                </div>
              ))}
            </div>
            {/* Grid rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1 mb-0.5">
                <span className="w-9 text-xs text-brew-500 text-right pr-1">{day}</span>
                <div className="flex flex-1 gap-0.5">
                  {HOURS.map((hour) => {
                    const val = grid[`${dayIdx}-${hour}`] || 0;
                    return (
                      <div
                        key={hour}
                        className="flex-1 aspect-square rounded-sm cursor-default transition-colors"
                        style={{ background: getColor(val, maxVal), minWidth: 12 }}
                        title={`${day} ${formatHour(hour)}: ${val} orders`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-brew-400">
              <span>Less</span>
              {['#FFF8F0', '#F5E6D3', '#E8C9A0', '#D4A574', '#B8844C', '#8B5E3C'].map((c) => (
                <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
