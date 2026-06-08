import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Field = ({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: string }) => (
  <label className="block">
    <div className="text-xs font-medium text-foreground/80 mb-1.5">{label}</div>
    {children}
    {hint && !error && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    {error && <div className="text-[11px] text-destructive mt-1">{error}</div>}
  </label>
);

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => (
    <input ref={ref} {...p} className={cn(
      "w-full h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition",
      className
    )} />
  )
);
TextInput.displayName = "TextInput";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => (
    <textarea ref={ref} {...p} className={cn(
      "w-full px-3 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition min-h-[80px]",
      className
    )} />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...p }, ref) => (
    <select ref={ref} {...p} className={cn(
      "w-full h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition",
      className
    )}>{children}</select>
  )
);
Select.displayName = "Select";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...p }, ref) => {
    const variants = {
      primary: "bg-gradient-primary text-primary-foreground hover:shadow-lift",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-muted text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      outline: "border bg-card hover:bg-muted",
    };
    const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-sm" };
    return (
      <button
        ref={ref} disabled={disabled || loading}
        {...p}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant], sizes[size], className
        )}
      >
        {loading && <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
