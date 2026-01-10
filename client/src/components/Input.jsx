import React from 'react';
import styles from './Input.module.css';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    required = false,
    className = ''
}) => {
    return (
        <div className={`${styles.inputGroup} ${className}`}>
            {label && <label className={styles.label}>{label} {required && '*'}</label>}
            <input
                className={styles.input}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name}
                required={required}
            />
        </div>
    );
};

export default Input;
