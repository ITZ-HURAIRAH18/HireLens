import { useReducedMotion } from "framer-motion";

export default function MarqueeRow({ items, speed = 50 }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
        {items.map((item) => (
          <span
            key={item}
            className="text-lg font-bold text-slate-300 select-none"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full group">
      <div
        className="flex gap-16 animate-marquee group-hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-lg font-bold text-slate-300 select-none whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
