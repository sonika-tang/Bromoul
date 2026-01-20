
import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/api';
// Use Charts if available, or simple HTML bars for MVP zero-dependency
// Re-implementing simplified charts to ensure low friction
import styles from '../styles/VipheakPage.module.css';

const VipheakPage = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await AnalyticsService.getStats();
            setStats(data);
        };
        load();
    }, []);

    return (
        <div className={styles.container}>
            <h2>វិភាគទីផ្សារ (Market Analytics)</h2>
            <div className={styles.grid}>
                {/* Simple Bar Chart Visualization */}
                {stats.map(s => (
                    <div key={s.crop_name} className={styles.card}>
                        <h3>{s.crop_name}</h3>
                        <div className={styles.barContainer}>
                            <div className={styles.label}>Supply: {s.supply}</div>
                            <div className={styles.bar} style={{ width: `${Math.min(s.supply / 10, 100)}%`, background: '#4CAF50' }}></div>
                        </div>
                        <div className={styles.barContainer}>
                            <div className={styles.label}>Demand: {s.demand}</div>
                            <div className={styles.bar} style={{ width: `${Math.min(s.demand / 10, 100)}%`, background: '#FF9800' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VipheakPage;
