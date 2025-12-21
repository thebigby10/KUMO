import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={`
            w-full px-3 py-2 text-sm text-gray-900 bg-white
            border rounded-lg transition-all duration-150
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${leftIcon ? "pl-9" : ""}
            ${error ? "border-red-400 focus:ring-red-300/40 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
            ${className}
          `.trim()}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={`
          w-full px-3 py-2 text-sm text-gray-900 bg-white
          border rounded-lg transition-all duration-150 resize-none
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:ring-red-300/40 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
          ${className}
        `.trim()}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}

    </div>
  );
}
