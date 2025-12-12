import React from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  hideLabel?: boolean;
  inline?: boolean;
  children?: React.ReactNode;
  numericOnly?: boolean;
  [key: string]: any;
}

const sanitizeNumericValue = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return undefined;

  let formatted = typeof value === 'number' ? value.toString() : value;
  formatted = formatted.replace(/[^\d]/g, '');

  if (formatted.length > 1) {
    formatted = formatted.replace(/^0+/, '');
  } else if (formatted === '0') {
    formatted = '';
  }

  return formatted;
};

export default function FormField({
  label,
  error,
  required,
  textarea,
  placeholder,
  helperText,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  hideLabel = false,
  inline = false,
  children,
  numericOnly = false,
  ...rest
}: InputProps) {
  const {
    onChange,
    value,
    defaultValue,
    inputMode,
    pattern,
    type,
    ...inputProps
  } = rest;

  const baseInputClasses =
    "w-full border rounded-md p-3 text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition";

  const resolvedValue =
    numericOnly ? sanitizeNumericValue(value ?? undefined) : typeof value === 'number' ? value.toString() : value;

  const resolvedDefaultValue =
    numericOnly ? sanitizeNumericValue(defaultValue ?? undefined) : typeof defaultValue === 'number' ? defaultValue.toString() : defaultValue;

  if (resolvedValue !== undefined) {
    inputProps.value = resolvedValue;
  }

  if (resolvedDefaultValue !== undefined && inputProps.value === undefined) {
    inputProps.defaultValue = resolvedDefaultValue;
  }

  if (!numericOnly && typeof value === 'number' && inputProps.value === undefined) {
    inputProps.value = value.toString();
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (numericOnly && event.target instanceof HTMLInputElement) {
      const sanitized = sanitizeNumericValue(event.target.value) ?? '';
      event.target.value = sanitized;
      onChange?.({
        ...event,
        target: {
          ...event.target,
          value: sanitized,
        },
      } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    onChange?.(event as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div
      className={`w-full ${inline ? "flex items-center gap-4" : "flex flex-col gap-1"} ${containerClassName}`}
    >
      {!hideLabel && (
        <label
          className={`text-sm font-medium text-gray-700 dark:text-slate-300 ${
            inline ? "w-32" : "mb-1"
          } ${labelClassName}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={inline ? "flex-1" : ""}>
        {children ? (
          children
        ) : textarea ? (
          <textarea
            placeholder={placeholder}
            {...rest}
            className={`${baseInputClasses} ${inputClassName} min-h-[48px] resize-y`}
          ></textarea>
        ) : (
          <input
            type={type || "text"}
            inputMode={numericOnly ? inputMode || 'numeric' : inputMode}
            pattern={numericOnly ? pattern || '[0-9]*' : pattern}
            onChange={handleChange}
            placeholder={placeholder}
            {...inputProps}
            className={`${baseInputClasses} ${inputClassName}`}
          />
        )}

        {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
