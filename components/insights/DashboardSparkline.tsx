"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function DashboardSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  
  const chartData = data.map((val, i) => ({ val, i }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <YAxis domain={[0, 10]} hide />
        <Line 
          type="monotone" 
          dataKey="val" 
          stroke="#6C8EFF" 
          strokeWidth={2} 
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
