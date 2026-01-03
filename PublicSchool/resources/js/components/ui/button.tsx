import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-[color:var(--classical-accent)/40] focus-visible:ring-[color:var(--classical-accent)/30] focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[linear-gradient(135deg,#0ea5a4,#7c3aed)] text-white shadow-lg hover:brightness-105 hover:translate-y-[-2px] active:translate-y-0 transform transition",
        destructive:
          "bg-[var(--destructive)] text-white shadow-sm hover:brightness-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-[color:var(--classical-primary)/18] bg-transparent shadow-sm hover:bg-[color:var(--classical-primary)/8] hover:text-[var(--classical-primary)]",
        secondary:
          "bg-[var(--classical-secondary)] text-white shadow-md hover:brightness-105",
        ghost: "hover:bg-[var(--classical-accent)] hover:text-black",
        link: "text-[var(--classical-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), 'blinkable')}
      {...props}
    />
  )
}

export { Button, buttonVariants }
