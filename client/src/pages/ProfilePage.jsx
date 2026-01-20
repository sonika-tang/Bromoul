
import React, { useState, useEffect } from 'react';
import { ListingService, RefService } from '../services/api'; // Axios version
import { clientDB } from '../storage/clientAdapter'; // LocalStorage
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [listings, setListings] = useState([]);

    // Reference Data
    const [crops, setCrops] = useState([]);

    // Form State (Using Drafts)
    const [formData, setFormData] = useState({
        crop_id: '', quantity: '', price: '', unit: 'kg', type: 'supply', certification: 'None'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const u = JSON.parse(localStorage.getItem('user'));
            setUser(u);
            if (u) {
                // Load Ref Data
                try {
                    const cropData = await RefService.getCrops();
                    setCrops(cropData);
                    fetchListings(u.id);
                } catch (e) { console.error(e); }
            }
        };

        // Load Draft from LocalStorage Adapter
        const loadDraft = async () => {
            const draft = await clientDB.get('drafts', 'current_listing');
            if (draft) setFormData(draft);
        };

        loadUser();
        loadDraft();
    }, []);

    // Save Draft on Change
    const handleChange = (e) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        // Debounced save ideally, but direct for MVP
        clientDB.set('drafts', 'current_listing', newData);
    };

    const fetchListings = async (userId) => {
        const data = await ListingService.getMyListings(userId);
        setListings(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                user_id: user.id,
                crop_id: formData.crop_id,
                quantity: Number(formData.quantity),
                unit: formData.unit,
                price_riel: Number(formData.price),
                type: formData.type, // supply/demand
                certification: formData.certification
            };

            await ListingService.create(payload);
            alert('បានបង្កើតការបញ្ជាក់ជោគជ័យ!');

            // Clear Draft
            await clientDB.delete('drafts', 'current_listing');
            setFormData({ crop_id: '', quantity: '', price: '', unit: 'kg', type: user.role === 'buyer' ? 'demand' : 'supply', certification: 'None' });
            fetchListings(user.id);
        } catch (err) {
            console.error(err);
            alert('មានបញ្ហា (Error): ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className={styles.container}>សូមចូលគណនីជាមុន</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={user.profile_picture || 'https://placehold.co/100'} alt="Profile" className={styles.avatar} />
                <div className={styles.userInfo}>
                    <h2>{user.name}</h2>
                    <p>{user.role.toUpperCase()} | {user.email}</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`} onClick={() => setActiveTab('info')}>ពត៌មាន (Info)</button>
                    <button className={`${styles.tab} ${activeTab === 'listings' ? styles.active : ''}`} onClick={() => setActiveTab('listings')}>ការដាក់លក់ (Listings)</button>
                </div>

                {activeTab === 'listings' && (
                    <div className={styles.listingsSection}>
                        <h3>ដាក់លក់ផលិតផលថ្មី (New Listing)</h3>
                        {/* Draft Indicator */}
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            (Drafts are saved automatically to LocalStorage)
                        </span>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>ប្រភេទដំណាំ (Crop)</label>
                                    <select name="crop_id" value={formData.crop_id} onChange={handleChange} required>
                                        <option value="">ជ្រើសរើស (Select)</option>
                                        {crops.map(c => <option key={c.id} value={c.id}>{c.name_kh} ({c.category})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>បរិមាណ (Qty)</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                                </div>
                                <div className={styles.group}>
                                    <label>ខ្នាត (Unit)</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange}>
                                        <option value="kg">គីឡូ (kg)</option>
                                        <option value="ton">តោន (ton)</option>
                                    </select>
                                </div>
                            </div>

                            {user.role === 'farmer' && (
                                <div className={styles.row}>
                                    <div className={styles.group}>
                                        <label>តម្លៃ (Price - Riel)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.group}>
                                        <label>វិញ្ញាបនបត្រ (Cert)</label>
                                        <select name="certification" value={formData.certification} onChange={handleChange}>
                                            <option value="None">គ្មាន (None)</option>
                                            <option value="CamGAP">CamGAP</option>
                                            <option value="Organic">Organic</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Buyer "Budget" field mapping to price logic if needed, simplify for MVP */}
                            {user.role === 'buyer' && (
                                <div className={styles.group}>
                                    <label>ថវិកាដែលរំពឹងទុក (Budget - Riel)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'កំពុងបង្កើត...' : 'ដាក់លក់ (Submit)'}
                            </button>
                        </form>

                        <div className={styles.list}>
                            <h4>ប្រវត្តិការដាក់លក់ (History)</h4>
                            {listings.map(l => (
                                <div key={l.id} className={styles.listingItem}>
                                    <span>{l.crop_name}</span>
                                    <span>{l.quantity} {l.unit}</span>
                                    <span>{Number(l.price_riel).toLocaleString()} ៛</span>
                                    <span className={styles.badge}>{l.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className={styles.infoSection}>
                        <p>Name: {user.name}</p>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <button className={styles.logoutBtn} onClick={() => {
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}>ចាកចេញ (Logout)</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
