"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Share2 } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const performanceData = [
  { name: "Communication", score: 85, fullMark: 100 },
  { name: "Ethical Reasoning", score: 78, fullMark: 100 },
  { name: "Problem Solving", score: 92, fullMark: 100 },
  { name: "Medical Knowledge", score: 88, fullMark: 100 },
  { name: "Empathy", score: 95, fullMark: 100 },
];

const timelineData = [
  { time: "00:00", event: "Interview Start" },
  { time: "00:05", event: "Ethical Scenario Discussion" },
  { time: "00:10", event: "Communication Skills Assessment" },
  { time: "00:15", event: "Medical Knowledge Quiz" },
  { time: "00:20", event: "Problem Solving Task" },
  { time: "00:25", event: "Interview Conclusion" },
];

export default function AdvancedInterviewReport() {
  const [communicationProgress, setCommunicationProgress] = useState(0);
  const [ethicalProgress, setEthicalProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCommunicationProgress(85), 500);
    const timer2 = setTimeout(() => setEthicalProgress(78), 500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Main Content */}
      <div className="p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Interview Report</h1>
              <p className="text-gray-500">MMI - October 9, 2024</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Add to Notion
              </Button>
              <Button className="bg-[#6B50FC] text-white hover:bg-[#5A43D6]">
                <Sparkles className="mr-2 h-4 w-4" />
                Smart Summary
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.6%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last practice</p>
                <Progress value={87.6} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Management</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24m 35s</div>
                <p className="text-xs text-muted-foreground">Average time per station</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Ethical Reasoning, Communication</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Interview Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="score"
                          stroke="#6B50FC"
                          fill="#6B50FC"
                          fillOpacity={0.9}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Score: 85/100</span>
                    <span className="text-sm font-medium text-gray-700">Excellent</span>
                  </div>
                  <Progress value={communicationProgress} className="h-2 mb-4" />
                  <p className="text-gray-600">
                    Strong verbal communication, but could improve on non-verbal cues. Practice
                    articulating complex medical concepts in a clear and concise manner. Focus on
                    active listening and empathetic responses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ethical Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Score: 78/100</span>
                    <span className="text-sm font-medium text-gray-700">Good</span>
                  </div>
                  <Progress value={ethicalProgress} className="h-2 mb-4" />
                  <p className="text-gray-600">
                    Demonstrated good understanding of basic ethical principles. To improve, study
                    more medical ethics case studies. Practice analyzing ethical dilemmas from
                    multiple perspectives and articulating your decision-making process.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-l border-gray-200 dark:border-gray-700">
                    {timelineData.map((item, index) => (
                      <li key={index} className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                          <svg
                            aria-hidden="true"
                            className="w-3 h-3 text-blue-800 dark:text-blue-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {item.event}
                          {index === timelineData.length - 1 && (
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3">
                              Latest
                            </span>
                          )}
                        </h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                          {item.time}
                        </time>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
