"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Settings, Mic, Video, Subtitles, ChevronRight, Send, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MMIInterviewInterface() {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              MMI Station: Ethics Scenario
            </h1>
            <span className="bg-[#635BFF] text-white px-2 py-1 rounded-full text-xs font-medium tracking-wide">
              Premium
            </span>
            <div className="text-gray-500 font-medium">{formatTime(timer)}</div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              variant={isCameraOn ? "default" : "secondary"}
              size="icon"
              onClick={() => setIsCameraOn(!isCameraOn)}
            >
              <Video className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 font-medium">Auto Scroll</span>
              <Switch checked={isAutoScroll} onCheckedChange={setIsAutoScroll} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full max-w-7xl mx-auto">
          {/* Video Feed */}
          <div className="w-2/3 p-4 relative">
            <div className="bg-[#635BFF] h-full rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oCLJ5wR6Iog98Wx2nd8Dn_163153a0f52b450fa9f303b40a03f91c-SXiIEwmTkLQaYadWuc7zAHuiJEZhXa.jpg"
                alt="Interviewer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 right-8 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSOkg1X87TNyk7wHygQGb_59a028134ee04a03942b8fb2e8693aba-2HHyhyWKJQNFXrfUGgo05BtD7tR8Kc.jpg"
                alt="Me"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm font-medium">Me</div>
            </div>
          </div>

          {/* Transcript and Co-pilot */}
          <div className="w-1/3 p-4 flex flex-col">
            <Card className="flex-1 mb-4 overflow-auto">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2 text-lg tracking-tight">
                  Interviewer Transcript
                </h2>
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">
                    <span className="text-gray-500 font-medium">00:00</span> Welcome to this MMI
                    station. In this scenario, we'll be discussing an ethical dilemma in healthcare.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <span className="text-gray-500 font-medium">00:10</span> A patient has refused a
                    life-saving treatment due to religious beliefs. As a doctor, how would you
                    approach this situation?
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="bg-white text-gray-900 py-2 flex justify-between items-center">
                <CardTitle className="text-lg flex items-center font-semibold tracking-tight">
                  Interview Co-pilot
                  <span className="ml-2 flex items-center bg-white border border-green-500 rounded-full px-2 py-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-green-500 font-medium tracking-wide">Ready</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-auto">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Here are some key points to consider in your response:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Respect for patient autonomy</li>
                    <li>Ethical obligation to preserve life</li>
                    <li>Importance of clear communication</li>
                    <li>Exploring alternative treatments</li>
                    <li>Involving ethics committee if necessary</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-4 font-medium">
                    Would you like me to elaborate on any of these points?
                  </p>
                </div>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask for advice or clarification..."
                    className="flex-1 text-sm"
                  />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button
            variant={isSubtitlesOn ? "default" : "secondary"}
            size="sm"
            onClick={() => setIsSubtitlesOn(!isSubtitlesOn)}
            className="text-xs font-medium tracking-wide"
          >
            <Subtitles className="h-4 w-4 mr-2" />
            Subtitles {isSubtitlesOn ? "On" : "Off"}
          </Button>
          <Button className="bg-[#635BFF] hover:bg-[#524ACC] text-white text-sm font-medium tracking-wide">
            Next question
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
