"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ConfidenceChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Confidence Level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13161E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
              />
              <Area type="monotone" dataKey="score" stroke="#4ADE80" fillOpacity={1} fill="url(#colorConfidence)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
