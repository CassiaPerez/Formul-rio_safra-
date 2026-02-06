import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  readOnlyHighlight?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, className, readOnlyHighlight, ...props }) => {
  const baseStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agro-500 focus:ring-agro-500 sm:text-sm px-3 py-2 border";
  const readOnlyStyles = "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed font-medium";
  const highlightStyles = "bg-yellow-50 border-yellow-200 text-gray-800"; // For autofilled fields highlighting

  let computedClass = baseStyles;
  if (props.readOnly) {
    computedClass += ` ${readOnlyStyles}`;
  } else if (readOnlyHighlight) {
    computedClass += ` ${highlightStyles}`;
  } else {
    computedClass += " bg-white text-gray-900";
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className={`${computedClass} ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agro-500 focus:ring-agro-500 sm:text-sm px-3 py-2 border bg-white text-gray-900"
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agro-500 focus:ring-agro-500 sm:text-sm px-3 py-2 border bg-white text-gray-900"
      />
    </div>
  );
};