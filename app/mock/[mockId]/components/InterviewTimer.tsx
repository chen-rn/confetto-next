import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";

interface InterviewTimerProps {
  timeLeft: number;
  totalTime: number;
  formatTime: (seconds: number) => string;
}

export function InterviewTimer({ timeLeft, totalTime, formatTime }: InterviewTimerProps) {
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;
  const isWarning = timeLeft < 60;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-16 h-16"
    >
      <CircularProgressbar
        value={percentage}
        text={formatTime(timeLeft)}
        styles={buildStyles({
          textSize: "1rem",
          pathColor: isWarning ? "#ef4444" : "#635BFF",
          textColor: "#1f2937",
          pathTransition: "stroke-dashoffset 0.5s ease",
        })}
      />
    </motion.div>
  );
}
