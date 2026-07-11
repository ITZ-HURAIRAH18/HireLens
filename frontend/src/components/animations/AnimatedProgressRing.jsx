import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedProgressRing({ percentage = 78, size = 112, strokeWidth = 8, duration = 1.2 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { once: true, margin: "-80px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2DC08D"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={inView || reduced ? percentage / 100 : 0}
          transition={reduced ? { duration: 0 } : { duration, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{percentage}</span>
        <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}
