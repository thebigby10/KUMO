import React from "react";

type BadgeVariant = "default" | "pink" | "green" | "yellow" | "red" | "blue" | "gray";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  pink:    "bg-pink-50 text-pink-700 border-pink-200",
  green:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow:  "bg-amber-50 text-amber-700 border-amber-200",
  red:     "bg-red-50 text-red-700 border-red-200",
  blue:    "bg-blue-50 text-blue-700 border-blue-200",
  gray:    "bg-gray-50 text-gray-600 border-gray-200",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  pink:    "bg-pink-500",
  green:   "bg-emerald-500",
  yellow:  "bg-amber-500",
  red:     "bg-red-500",
  blue:    "bg-blue-500",
  gray:    "bg-gray-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
          role="status"
        />
      )}
      {children}
    </span>
  );
}
