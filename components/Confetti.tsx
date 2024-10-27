"use client";

import ReactConfetti from "react-confetti";
import { useEffect, useState } from "react";

export function Confetti() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });
  }, []);

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={200}
      recycle={false}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
    />
  );
}
