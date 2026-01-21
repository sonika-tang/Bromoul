import React from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'ជ្រើសរើស...',
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          {label}
        </label>
      )}
      <select value={value} onChange={onChange} {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.name_kh || opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;