import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

export const Input: React.FC<Props> = ({ label, prefix, suffix, tooltip, type, onChange, value, ...props }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'text' && prefix === '€') {
      let newValue = e.target.value.replace(/[^\d]/g, '');
      
      if (newValue) {
        const numericValue = Number(newValue) / 100;
        e.target.value = numericValue.toString().replace('.', ',');
      } else {
        e.target.value = '';
      }
    }
    
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const formattedValue = React.useMemo(() => {
    if (type === 'text' && prefix === '€' && value) {
      const numericValue = Number(value.toString().replace(',', '.'));
      if (!isNaN(numericValue)) {
        return new Intl.NumberFormat('pt-PT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(numericValue);
      }
    }
    return value;
  }, [value, type, prefix]);

  return (
    <div className="flex flex-col">
      <div className="relative">
        <label 
          className="mb-1 text-sm font-medium text-gray-700 cursor-help inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {label}
          {tooltip && showTooltip && (
            <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -bottom-2 left-0 transform translate-y-full w-48">
              {tooltip}
              <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-4 -top-1" />
            </div>
          )}
        </label>
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 select-none">
            {prefix}
          </span>
        )}
        <input
          {...props}
          type={type}
          value={formattedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-7' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};