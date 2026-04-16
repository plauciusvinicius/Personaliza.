"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-jurua-accent disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-jurua-primary text-white hover:bg-jurua-medium active:bg-jurua-dark shadow-sm",
      secondary: "bg-jurua-pale text-jurua-primary border border-jurua-accent/30 hover:bg-jurua-pale/80",
      ghost: "text-jurua-primary hover:bg-jurua-pale",
      danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
      success: "bg-success text-white hover:bg-green-600 shadow-sm",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
