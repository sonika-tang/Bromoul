
import React from 'react';
import styles from '../styles/CropAnalyticsCard.module.css';

const CropAnalyticsCard = ({ analytics, crop }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h4 className={styles.title}>{crop?.name || 'Unknown Crop'}</h4>
                <div className={styles.percentageBadge} title="Share">
                    {analytics.percentageShare}% Share
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>What is really in need?</h5>
                    <p className={styles.description}>
                        {analytics.needsDescription || "No specific requirements listed."}
                    </p>
                </div>

                <div className={styles.meta}>
                    <span className={styles.tag}>Region: {analytics.region}</span>
                    <span className={styles.tag}>Timeframe: {analytics.timeframe}</span>
                </div>
            </div>
        </div>
    );
};

export default CropAnalyticsCard;
