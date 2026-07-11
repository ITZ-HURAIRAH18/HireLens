import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    default: "border-transparent bg-[#2DC08D] text-white",
    secondary: "border-transparent bg-slate-100 text-slate-800",
    success: "border-transparent bg-green-100 text-green-700",
    warning: "border-transparent bg-amber-100 text-amber-700",
    error: "border-transparent bg-red-100 text-red-700",
    outline: "text-slate-600 border border-slate-200",
  }
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(badgeVariants.base, badgeVariants.variants[variant], className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }