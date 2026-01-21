import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {label}
          {required && <span style={{ color: '#d32f2f' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          borderColor: error ? '#d32f2f' : undefined
        }}
        {...props}
      />
      {helperText && (
        <small style={{ 
          color: error ? '#d32f2f' : '#757575',
          marginTop: '4px',
          display: 'block'
        }}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default Input;