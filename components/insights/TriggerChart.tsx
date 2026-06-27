"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function TriggerChart({ data }: { data: { trigger: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Top Stress Triggers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="trigger" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{ backgroundColor: "#13161E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
              />
              <Bar dataKey="count" fill="#F87171" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
