"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  History,
  Calendar,
  BarChart2,
  BookOpen,
  ChevronUp,
  ChevronRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const recentScores = [
  { date: "Oct 5", score: 88 },
  { date: "Oct 2", score: 92 },
  { date: "Sep 28", score: 85 },
  { date: "Sep 25", score: 90 },
  { date: "Sep 21", score: 87 },
];

const upcomingInterviews = [
  { type: "MMI Practice", date: "Tomorrow", time: "2:00 PM" },
  { type: "Ethics Scenario", date: "Oct 15", time: "10:00 AM" },
  { type: "Panel Interview", date: "Oct 18", time: "3:30 PM" },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const router = useRouter();

  const handleNavClick = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === "Practice History") {
      router.push("/advanced-interview-report");
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      {/* Sidebar */}
      <div className="w-64 bg-white text-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-center mb-10">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-10-04%20at%2010.16.41%E2%80%AFPM-4hFlx0Az7EwTaqSDhnUPTjQmC0X8Cn.png"
            alt="Confetto Logo"
            className="h-16 w-auto"
          />
        </div>
        <nav className="space-y-1">
          {["Dashboard", "Calendar", "Analytics", "Question Bank", "Practice History"].map(
            (item) => (
              <Button
                key={item}
                variant={activeNav === item ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeNav === item ? "bg-[#F0F4FF] text-[#635BFF]" : "text-gray-600"
                } hover:bg-[#F0F4FF] hover:text-[#635BFF]`}
                onClick={() => handleNavClick(item)}
              >
                {item === "Dashboard" && <Home className="mr-2 h-4 w-4" />}
                {item === "Calendar" && <Calendar className="mr-2 h-4 w-4" />}
                {item === "Analytics" && <BarChart2 className="mr-2 h-4 w-4" />}
                {item === "Question Bank" && <BookOpen className="mr-2 h-4 w-4" />}
                {item === "Practice History" && <History className="mr-2 h-4 w-4" />}
                {item}
              </Button>
            )
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Welcome back, Dr. Smith</h1>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => router.push("/mmi-interview-interface")}
          >
            Start Interview
          </Button>
        </div>
        <p className="text-gray-500 mb-10 text-sm">
          Here's an overview of your interview practice progress
        </p>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "Total Interviews",
                value: "42",
                subtext: "3 this week",
                icon: <History className="h-5 w-5 text-[#635BFF]" />,
              },
              {
                title: "Current Streak",
                value: "7 days",
                subtext: "Keep it up!",
                icon: <Flame className="h-5 w-5 text-[#635BFF]" />,
              },
              {
                title: "Average Score",
                value: "88.4%",
                subtext: "2.5% from last week",
                icon: <TrendingUp className="h-5 w-5 text-[#635BFF]" />,
              },
            ].map((item, index) => (
              <Card key={index} className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{item.title}</CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                  <div className="flex items-center mt-1 text-sm text-[#635BFF]">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>{item.subtext}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Interview Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#635BFF"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Upcoming Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-[#635BFF] rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">{interview.type}</p>
                        <p className="text-sm text-gray-500">
                          {interview.date}, {interview.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="link" className="mt-4 text-[#635BFF] p-0">
                  View all scheduled interviews
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
