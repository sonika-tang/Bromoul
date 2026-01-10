import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import styles from './Marketplace.module.css';

const Marketplace = () => {
    // Mock Data
    const products = [
        { id: 1, name: 'ទឹកឃ្មុំធម្មជាតិ', price: '32,000 ៛/លីត្រ', location: 'មណ្ឌលគិរី', img: 'https://via.placeholder.com/300x200', type: 'certified' },
        { id: 2, name: 'គ្រាប់ស្វាយចន្ទី', price: '48,000 ៛/kg', location: 'កំពង់ធំ', img: 'https://via.placeholder.com/300x200', type: 'standard' },
        { id: 3, name: 'ស្ករត្នោតកំពង់ស្ពឺ', price: '10,000 ៛/kg', location: 'កំពង់ស្ពឺ', img: 'https://via.placeholder.com/300x200', type: 'certified' },
        { id: 4, name: 'ធុរេនកំពត', price: '24,000 ៛/kg', location: 'កំពត', img: 'https://via.placeholder.com/300x200', type: 'standard' },
        { id: 5, name: 'ពោតក្រហម', price: '1,200 ៛/kg', location: 'បាត់ដំបង', img: 'https://via.placeholder.com/300x200', type: 'standard' },
        { id: 6, name: 'មៀនប៉ៃលិន', price: '6,000 ៛/kg', location: 'ប៉ៃលិន', img: 'https://via.placeholder.com/300x200', type: 'certified' },
    ];

    return (
        <div className={`container ${styles.marketplace}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>ផ្សារកសិផល</h1>
                <div className={styles.sort}>
                    <span>តម្រៀបតាម:</span>
                    <select className={styles.select}>
                        <option>ថ្មីបំផុត</option>
                        <option>តម្លៃ: ទាប ទៅ ខ្ពស់</option>
                        <option>តម្លៃ: ខ្ពស់ ទៅ ទាប</option>
                    </select>
                </div>
            </div>

            <div className={styles.grid}>
                {products.map(product => (
                    <Card key={product.id} className={styles.productCard}>
                        <div className={styles.imgWrapper}>
                            <img src={product.img} alt={product.name} className={styles.img} />
                            {product.type === 'certified' && <span className={styles.badge}>មានការទទួលស្គាល់</span>}
                        </div>
                        <div className={styles.details}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.price}>{product.price}</p>
                            <p className={styles.location}>📍 {product.location}</p>
                            <div className={styles.actions}>
                                <Button fullWidth variant="primary">ទិញឥឡូវនេះ</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
