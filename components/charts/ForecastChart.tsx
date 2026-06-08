"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ForecastChart({ data }: { data: Array<{ month: string; score: number }> }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#13b7a6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#13b7a6" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(9,38,58,.09)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={34} />
          <Tooltip />
          <Area type="monotone" dataKey="score" stroke="#08776f" strokeWidth={3} fill="url(#forecastFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
