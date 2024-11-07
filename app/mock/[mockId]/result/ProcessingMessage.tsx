"use client";
import { useState, useEffect } from "react";

export function ProcessingMessage() {
  const [message, setMessage] = useState("Analyzing submission...");

  const messages = [
    "Analyzing submission...",
    "Dissecting ethical assertions...",
    "Evaluating communication skills...",
    "Assessing professionalism...",
    "Reviewing legal considerations...",
    "Examining organizational structure...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage((prevMessage) => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return <p className="mt-4 text-lg font-medium text-neutral-600">{message}</p>;
}
