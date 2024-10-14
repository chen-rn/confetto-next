"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  History,
  Calendar as CalendarIcon,
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { name: "Dashboard", icon: Home },
  { name: "Calendar", icon: CalendarIcon },
  { name: "Analytics", icon: BarChart2 },
  { name: "Question Bank", icon: BookOpen },
  { name: "Practice History", icon: History },
];

const mmiCategories = [
  { name: "Ethics", color: "bg-blue-100 text-blue-800" },
  { name: "Communication", color: "bg-green-100 text-green-800" },
  { name: "Critical Thinking", color: "bg-yellow-100 text-yellow-800" },
  { name: "Teamwork", color: "bg-purple-100 text-purple-800" },
  { name: "Empathy", color: "bg-pink-100 text-pink-800" },
];

const mockInterviews = [
  { date: "2024-10-15", time: "10:00 AM", category: "Ethics", duration: "30 min" },
  { date: "2024-10-17", time: "2:00 PM", category: "Communication", duration: "30 min" },
  { date: "2024-10-20", time: "11:00 AM", category: "Critical Thinking", duration: "30 min" },
  { date: "2024-10-22", time: "3:00 PM", category: "Teamwork", duration: "30 min" },
  { date: "2024-10-25", time: "9:00 AM", category: "Empathy", duration: "30 min" },
];

const actualInterview = {
  date: "2024-11-05",
  time: "9:00 AM",
  category: "UBC MMI",
  duration: "2 hours",
  color: "bg-red-100 text-red-800",
};

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarPage() {
  const [activeNav, setActiveNav] = useState("Calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9, 1)); // October 2024
  const router = useRouter();

  const handleNavClick = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === "Dashboard") {
      router.push("/");
    } else if (navItem === "Practice History") {
      router.push("/advanced-interview-report");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);

  const renderCalendarDays = () => {
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="border p-2"></div>);
    }
    for (let day = 1; day <= days; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split("T")[0];
      const events = mockInterviews.filter((interview) => interview.date === dateString);
      const isActualInterview = actualInterview.date === dateString;

      calendarDays.push(
        <div key={day} className="border p-2 h-32 overflow-y-auto">
          <div className="font-semibold mb-1">{day}</div>
          {events.map((event, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`${
                mmiCategories.find((c) => c.name === event.category)?.color
              } text-xs mb-1 block`}
            >
              {event.category} - {event.time}
            </Badge>
          ))}
          {isActualInterview && (
            <Badge variant="secondary" className={`${actualInterview.color} text-xs mb-1 block`}>
              {actualInterview.category} - {actualInterview.time}
            </Badge>
          )}
        </div>
      );
    }
    return calendarDays;
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
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
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={activeNav === item.name ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                activeNav === item.name ? "bg-[#F0F4FF] text-[#635BFF]" : "text-gray-600"
              } hover:bg-[#F0F4FF] hover:text-[#635BFF]`}
              onClick={() => handleNavClick(item.name)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">Interview Schedule</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
                onValueChange={(value: string) => {
                  const [year, month] = value.split("-").map(Number);
                  setCurrentMonth(new Date(year, month, 1));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-9">October 2024</SelectItem>
                  <SelectItem value="2024-10">November 2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="font-semibold text-center">
                    {day}
                  </div>
                ))}
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">MMI Categories</h2>
              <div className="flex flex-wrap gap-2">
                {mmiCategories.map((category) => (
                  <Badge
                    key={category.name}
                    variant="secondary"
                    className={`${category.color} font-semibold`}
                  >
                    {category.name}
                  </Badge>
                ))}
                <Badge variant="secondary" className={`${actualInterview.color} font-semibold`}>
                  {actualInterview.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
