import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', padding = true }) => {
    return (
        <div className={`${styles.card} ${padding ? styles.padding : ''} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
