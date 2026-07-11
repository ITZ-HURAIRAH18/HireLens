import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";

export default function AnimatedCounter({ target, duration = 1.2, suffix = "" }) {
  const ref = useRef(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          count.set(0);
          const controls = animate(count, target, { duration, ease: "easeOut" });
          observer.disconnect();
          return () => controls.stop();
        }
      },
      { once: true, margin: "-80px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration, count, reduced]);

  if (reduced) {
    return <span>{target}{suffix}</span>;
  }

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
