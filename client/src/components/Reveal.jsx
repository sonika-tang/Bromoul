import React from 'react';
import useReveal from '../hooks/useReveal';

/**
 * Fades + slides children into view on scroll.
 * `delay` (ms) staggers a group of items.
 */
const Reveal = ({ children, className = '', delay = 0, ...props }) => {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`${className} reveal ${visible ? 'reveal-in' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Reveal;
