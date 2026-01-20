
import React from 'react';
import styles from '../styles/TrendGraph.module.css';

const TrendGraph = ({ analytics }) => {
    // Mocking trend data for visual purposes because dynamic historical data 
    // requires a much more complex backend structure. 
    // We will visualize the Current Supply vs Demand as a "Trend" snapshot.

    const maxVal = Math.max(...analytics.map(a => Math.max(a.supply, a.demand))) || 100;

    return (
        <div className={styles.container}>
            {analytics.map(item => {
                // Calculate bar heights relative to maxVal
                const supplyHeight = `${(item.supply / maxVal) * 100}%`;
                const demandHeight = `${(item.demand / maxVal) * 100}%`;

                return (
                    <div key={item.id} className={styles.itemGroup}>
                        <div className={styles.barsArea}>
                            <div
                                className={styles.barSupply}
                                style={{ height: supplyHeight }}
                                title={`Supply: ${item.supply}`}
                            ></div>
                            <div
                                className={styles.barDemand}
                                style={{ height: demandHeight }}
                                title={`Demand: ${item.demand}`}
                            ></div>
                        </div>
                        <span className={styles.label}>{item.cropName}</span>
                    </div>
                );
            })}

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.dotSupply}></span> ផ្គត់ផ្គង់ (Supply)
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.dotDemand}></span> តម្រូវការ (Demand)
                </div>
            </div>
        </div>
    );
};

export default TrendGraph;
