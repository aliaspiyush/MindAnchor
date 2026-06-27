"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function MoodChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Mood Trend (Last 14 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#13161E", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                itemStyle={{ color: "#6C8EFF" }}
              />
              <Line type="monotone" dataKey="score" stroke="#6C8EFF" strokeWidth={3} dot={{ r: 4, fill: "#6C8EFF", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
