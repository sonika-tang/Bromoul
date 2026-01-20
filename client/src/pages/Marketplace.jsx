
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { ListingService, RefService } from '../services/api';
import styles from '../styles/Marketplace.module.css';

const Marketplace = () => {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'requests'
    const [farmerProducts, setFarmerProducts] = useState([]);
    const [buyerRequests, setBuyerRequests] = useState([]);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCrop, setSelectedCrop] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Supply (products) and Demand (requests)
                // Note: New API requires 'type' query param
                const [fProducts, bRequests, allCrops] = await Promise.all([
                    ListingService.getAll({ type: 'supply' }),
                    ListingService.getAll({ type: 'demand' }),
                    RefService.getCrops()
                ]);

                // Map backend naming to frontend expectation if needed (e.g. crop_name vs cropName)
                // Backend returns snake_case usually if raw pg, let's normalize
                const normalize = (list) => list.map(i => ({
                    ...i,
                    name: i.crop_name, // Map crop_name to name for Card
                    price: i.price_riel,
                    budget: i.budget_riel
                }));

                setFarmerProducts(normalize(fProducts));
                setBuyerRequests(normalize(bRequests));
                setCrops(allCrops);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredItems = (activeTab === 'products' ? farmerProducts : buyerRequests).filter(item => {
        if (selectedCrop && item.crop_id !== Number(selectedCrop)) return false;
        return true;
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>ផ្សារ <span className={styles.thin}>(Market)</span></h1>

            <div className={styles.controls}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        ផលិតផលកសិករ (Farmers)
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        តម្រូវការអ្នកទិញ (Buyers)
                    </button>
                </div>

                <select
                    className={styles.filter}
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                >
                    <option value="">គ្រប់ដំណាំ</option>
                    {crops.map(c => <option key={c.id} value={c.id}>{c.name_kh || c.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className={styles.loading}>កំពុងដំណើរការ...</div>
            ) : (
                <div className={styles.grid}>
                    {filteredItems.length === 0 ? (
                        <div className={styles.empty}>គ្មានទិន្នន័យ។</div>
                    ) : (
                        filteredItems.map(item => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                isRequest={activeTab === 'requests'}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
