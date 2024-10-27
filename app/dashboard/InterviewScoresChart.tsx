"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface InterviewScore {
  date: string;
  score: number;
}

interface InterviewScoresChartProps {
  scores: InterviewScore[];
}

export function InterviewScoresChart({ scores }: InterviewScoresChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={scores}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#6B7280" />
        <YAxis stroke="#6B7280" />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#635BFF" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
