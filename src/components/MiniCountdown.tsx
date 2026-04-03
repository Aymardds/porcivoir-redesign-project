import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function MiniCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      if (diff === 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1.5 px-2 backdrop-blur-md text-[10px] font-black tracking-widest text-white z-10
      ${isEndingSoon ? 'bg-red-600/90' : 'bg-primary/90'}`}
    >
      <Clock className="w-3 h-3" />
      <span>{timeLeft.days > 0 && `${timeLeft.days}j : `}{pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s</span>
    </div>
  );
}
