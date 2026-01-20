
import React from 'react';
import styles from '../styles/PieChart.module.css';

const PieChart = ({ data }) => {
    // Data expected: [{ cropName, percentageShare, color? }]
    // Default colors for 4 specific crops if not provided
    const cropColors = {
        'ស្វាយ (Mango)': '#ff9f43',
        'ល្ហុង (Papaya)': '#fdcb6e',
        'ចេក (Banana)': '#ffeaa7',
        'ល្ពៅ (Pumpkin)': '#e17055'
    };

    const processedData = data.map(d => ({
        ...d,
        color: cropColors[d.cropName] || '#0984e3'
    }));

    // Create conic-gradient string
    // e.g. red 0% 25%, blue 25% 50%, ...
    let gradientParts = [];
    let currentPercentage = 0;

    processedData.forEach(item => {
        const start = currentPercentage;
        const end = currentPercentage + item.percentageShare;
        gradientParts.push(`${item.color} ${start}% ${end}%`);
        currentPercentage = end;
    });

    const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className={styles.container}>
            <div className={styles.chartWrapper}>
                <div
                    className={styles.chart}
                    style={{ background: gradientString }}
                ></div>
                <div className={styles.centerHole}></div>
            </div>

            <div className={styles.legend}>
                {processedData.map((item, idx) => (
                    <div key={idx} className={styles.legendItem}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: item.color }}
                        ></span>
                        <span className={styles.label}>
                            {item.cropName}: <strong>{item.percentageShare}%</strong>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
