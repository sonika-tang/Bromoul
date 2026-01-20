
import React from 'react';
import styles from '../styles/GraphView.module.css';

const GraphView = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className={styles.empty}>No data to display</div>;
    }

    // Find max value to normalize height
    const maxVal = Math.max(
        ...data.map(d => Math.max(d.demand, d.supply))
        , 100);

    return (
        <div className={styles.container}>
            <h3>Demand vs Supply Analysis</h3>
            <div className={styles.graphArea}>
                {data.map((item) => {
                    const demandHeight = (item.demand / maxVal) * 100;
                    const supplyHeight = (item.supply / maxVal) * 100;

                    return (
                        <div key={item.id} className={styles.group}>
                            <div className={styles.bars}>
                                <div
                                    className={`${styles.bar} ${styles.demand}`}
                                    style={{ height: `${demandHeight}%` }}
                                    title={`Demand: ${item.demand}`}
                                >
                                    <span className={styles.value}>{item.demand}</span>
                                </div>
                                <div
                                    className={`${styles.bar} ${styles.supply}`}
                                    style={{ height: `${supplyHeight}%` }}
                                    title={`Supply: ${item.supply}`}
                                >
                                    <span className={styles.value}>{item.supply}</span>
                                </div>
                            </div>
                            <div className={styles.label}>{item.cropName}</div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.demand}`}></span> Demand
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.supply}`}></span> Supply
                </div>
            </div>
        </div>
    );
};

export default GraphView;
