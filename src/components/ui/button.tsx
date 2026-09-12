import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-semibold tracking-tight whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-100 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary-escuro)] hover:brightness-110 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--primary-escuro)]",
        coral:
          "bg-coral text-white shadow-[0_4px_0_0_var(--coral-escuro)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--coral-escuro)]",
        outline:
          "border-2 border-border bg-card text-foreground shadow-[0_3px_0_0_var(--border)] hover:border-primary/40 hover:text-primary active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_color-mix(in_srgb,var(--secondary-foreground)_25%,var(--secondary))] hover:brightness-[0.98] active:translate-y-[3px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--secondary-foreground)_25%,var(--secondary))]",
        ghost: "hover:bg-muted hover:text-foreground active:translate-y-px",
        destructive:
          "bg-destructive text-white shadow-[0_4px_0_0_color-mix(in_srgb,var(--destructive)_60%,black)] hover:brightness-110 active:translate-y-[3px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--destructive)_60%,black)]",
        link: "font-medium text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-5 text-[0.95rem]",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-lg px-3.5 text-sm",
        lg: "h-13 gap-2 px-7 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-13",
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
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
