import React from 'react';
import styles from './Button.module.css';

const Button = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    type = 'button',
    fullWidth = false
}) => {
    return (
        <button
            type={type}
            className={`${styles.btn} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
