import { useEffect, useState } from "react";

export function AnimatedNumber({ value, duration = 1000, className = "" }) {
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (value - start) * progress;
      setDisplayedValue(current.toFixed(2));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayedValue} €</span>;
}