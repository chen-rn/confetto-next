import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface QuestionPreviewProps {
  question: string;
  timeLeft: number | null;
  progress: number;
  onEnterEarly: () => void;
  tags: { id: string; name: string; type: string }[];
}

export function QuestionPreview({
  question,
  timeLeft,
  progress,
  onEnterEarly,
  tags,
}: QuestionPreviewProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center w-full max-w-2xl"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-neutral-400 mb-3"
      >
        You have 60 seconds to read and understand the question
      </motion.p>

      <Card className="w-full shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden rounded-3xl">
        <div
          className="absolute top-0 left-0 h-1 bg-[#635BFF] transition-all duration-200 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <CardHeader className="bg-gradient-to-r from-[#635BFF]/5 to-transparent border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Question</CardTitle>
          <div className="text-lg font-semibold text-[#635BFF]">
            {timeLeft === null ? "--" : `${timeLeft}s`}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-700 leading-relaxed text-lg font-medium"
          >
            {question}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Button
              onClick={onEnterEarly}
              className="w-full bg-[#635BFF] hover:bg-[#5a52f0] text-white transition-all duration-200 hover:shadow-lg rounded-xl"
              size="lg"
            >
              Enter Interview Room
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 w-full mb-16"
      >
        <Card className="bg-white/50 border-dashed hover:bg-white/80 transition-colors duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Ready</span>
              </div>
              <span className="text-neutral-400">Recording will start automatically</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
