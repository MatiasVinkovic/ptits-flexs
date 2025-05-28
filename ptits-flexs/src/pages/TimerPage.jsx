import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(180); // 2 min = 120s
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
 
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700">Timer brosse à dents 🦷</h1>
        <p className="text-6xl font-mono text-gray-800">{formatTime(timeLeft)}</p>
        {!running && timeLeft === 0 && (
          <p className="text-green-600 text-xl">Bravo ! Brossage terminé 🥳</p>
        )}
        <button
          onClick={() => {
            setTimeLeft(180);
            setRunning(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow hover:bg-indigo-700 transition"
        >
          Lancer le timer
        </button>
      </div>
   
  );
}