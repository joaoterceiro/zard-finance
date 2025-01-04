"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const switchVariants = cva(
  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
  {
    variants: {
      checked: {
        true: "bg-blue-600",
        false: "bg-gray-200",
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
)

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
          {
            "bg-blue-600": checked,
            "bg-gray-200": !checked,
          },
          className
        )}
        onClick={() => onCheckedChange(!checked)}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
            {
              "translate-x-5": checked,
              "translate-x-0": !checked,
            }
          )}
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch } 