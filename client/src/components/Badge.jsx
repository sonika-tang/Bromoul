import React from 'react';

const Badge = ({ label, variant = 'success', children }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children || label}
    </span>
  );
};

export default Badge;
