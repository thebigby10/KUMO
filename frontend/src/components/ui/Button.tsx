import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white shadow-sm hover:shadow-md border border-pink-500 hover:border-pink-600",
  secondary:
    "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-200 hover:border-gray-300",
  ghost:
    "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-900 border border-transparent",
  danger:
    "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border border-red-500 hover:border-red-600 shadow-sm",
  outline:
    "bg-white hover:bg-pink-50 text-pink-600 border border-pink-300 hover:border-pink-400 shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 cursor-pointer select-none
        focus-visible:outline-2 focus-visible:outline-pink-500 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
    >
      {loading ? (
        <svg
          className="animate-spin w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
