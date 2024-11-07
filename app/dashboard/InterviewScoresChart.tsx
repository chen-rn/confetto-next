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

interface Score {
  date: string;
  score: number;
}

interface Props {
  scores: Score[];
}

export function InterviewScoresChart({ scores }: Props) {
  if (scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-neutral-500">
        No scores available yet
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <LineChart data={scores}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border rounded-lg shadow-sm">
                    <p className="text-sm font-medium">
                      {new Date(payload[0].payload.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-neutral-500">Average: {payload[0].value}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#635BFF"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: "#635BFF",
              strokeWidth: 2,
              stroke: "#ffffff",
            }}
            activeDot={{
              r: 6,
              fill: "#635BFF",
              strokeWidth: 2,
              stroke: "#ffffff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
