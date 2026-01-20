
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { ProductService } from '../services/productService';
import styles from '../styles/BuyingPage.module.css';

const BuyingPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            // Buying page specifically targets available products
            const data = await ProductService.getFarmerProducts();
            setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Buying Opportunities</h1>
            <p className={styles.subtitle}>Direct from Farmers</p>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className={styles.grid}>
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuyingPage;
