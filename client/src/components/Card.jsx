import React from 'react';

const Card = ({ children, className = '', elevation = 'md', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;