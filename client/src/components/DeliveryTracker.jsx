import React from 'react';
import styles from './DeliveryTracker.module.css';

const steps = [
    'យល់ព្រមទិញ',
    'កំពុងរៀបចំ',
    'រួចរាល់',
    'ដឹកជញ្ជូន',
    'ចេញដំណើរ',
    'ភាពជោគជ័យ'
];

const DeliveryTracker = ({ currentStep = 0 }) => {
    return (
        <div className={styles.trackerContainer}>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
            </div>
            <div className={styles.steps}>
                {steps.map((label, index) => (
                    <div key={index} className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}>
                        <div className={styles.circle}>
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className={styles.label}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryTracker;
