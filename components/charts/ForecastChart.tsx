"use client";

import type { ForecastPoint } from "@/lib/esg/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="forecast" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#13b7a6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#13b7a6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(16,34,49,.1)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "rgba(9,38,58,.14)" }} />
          <Area type="monotone" dataKey="score" stroke="#08776f" strokeWidth={3} fill="url(#forecast)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
