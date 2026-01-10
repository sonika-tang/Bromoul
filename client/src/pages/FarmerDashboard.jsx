import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';
import DeliveryTracker from '../components/DeliveryTracker';
import styles from './FarmerDashboard.module.css';

const FarmerDashboard = () => {
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([
        { id: 1, name: 'ស្រូវផ្កាម្លិះ', quantity: 500, unit: 'kg', price: 4800, status: 'active', img: 'https://via.placeholder.com/60' },
        { id: 2, name: 'xoay keo romeat', quantity: 2000, unit: 'kg', price: 3200, status: 'pending', img: 'https://via.placeholder.com/60' }
    ]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Delivery Workflow State
    const [deliveryStep, setDeliveryStep] = useState(1); // Step 1: Buyer agreed (simulated)

    const handleEdit = (listing) => {
        setEditingId(listing.id);
        setEditForm(listing);
    };

    const handleSave = () => {
        setListings(listings.map(l => l.id === editingId ? editForm : l));
        setEditingId(null);
    };

    const handleStartDelivery = () => {
        setDeliveryStep(2); // Move to Step 2: Farmer prepares
        setTimeout(() => {
            alert('បញ្ជាក់ការរៀបចំរួចរាល់!');
            setDeliveryStep(3); // Auto move to Step 3: Ready
        }, 1000);
    };

    const handleHandover = () => {
        setDeliveryStep(5); // Farmer confirms handover
    };

    return (
        <div className={`container ${styles.dashboard}`}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>សួស្តី, កសិករ សោភា</h1>
                    <div className={styles.status}>
                        <Badge type="verified" text="កសិករមានការបញ្ជាក់" />
                        <span className={styles.location}>📍 បាត់ដំបង</span>
                    </div>
                </div>
                <Button variant="primary" onClick={() => setActiveTab('add')}>+ បន្ថែមដំណាំថ្មី</Button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'listings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    ដំណាំរបស់ខ្ញុំ
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    ការបញ្ជាទិញ & ដឹកជញ្ជូន
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'rfs' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('rfs')}
                >
                    សំណើអ្នកទិញ (RFS)
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'listings' && (
                    <div className={styles.grid}>
                        {listings.map(listing => (
                            <Card key={listing.id}>
                                {editingId === listing.id ? (
                                    <div className={styles.editForm}>
                                        <Input
                                            label="ឈ្មោះ"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                        <div className={styles.row}>
                                            <Input
                                                label="បរិមាណ"
                                                type="number"
                                                value={editForm.quantity}
                                                onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                                            />
                                            <Input
                                                label="តម្លៃ (រៀល)"
                                                type="number"
                                                value={editForm.price}
                                                onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.cardActions}>
                                            <Button variant="outline" className={styles.smBtn} onClick={() => setEditingId(null)}>បោះបង់</Button>
                                            <Button variant="primary" className={styles.smBtn} onClick={handleSave}>រក្សាទុក</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.cropHeader}>
                                            <img src={listing.img} alt={listing.name} className={styles.cropImg} />
                                            <div>
                                                <h3>{listing.name}</h3>
                                                <span className={styles.meta}>សល់ {listing.quantity} {listing.unit}</span>
                                            </div>
                                        </div>
                                        <div className={styles.cropDetails}>
                                            <p>តម្លៃ: {listing.price.toLocaleString()} ៛ / {listing.unit}</p>
                                            <p>ស្ថានភាព: <span style={{ color: listing.status === 'active' ? 'green' : 'orange' }}>
                                                {listing.status === 'active' ? 'កំពុងដាក់លក់' : 'រង់ចាំការត្រួតពិនិត្យ'}
                                            </span></p>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <Button variant="outline" className={styles.smBtn} onClick={() => handleEdit(listing)}>កែប្រែ</Button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'add' && (
                    <Card className={styles.formCard}>
                        <h2>ដាក់លក់ដំណាំថ្មី</h2>
                        <form className={styles.form}>
                            <Input label="ឈ្មោះដំណាំ" placeholder="ឧ. ធុរេន" required />
                            <div className={styles.row}>
                                <Input label="បរិមាណ" placeholder="ឧ. 100" type="number" required />
                                <Input label="ខ្នាត" placeholder="kg, តោន" required />
                            </div>
                            <Input label="តម្លៃក្នុងមួយឯកតា (រៀល)" placeholder="0" type="number" required />
                            <Input label="ថ្ងៃប្រមូលផល" type="date" />

                            <div className={styles.uploadSection}>
                                <label>ឯកសារបញ្ជាក់ / រូបភាព</label>
                                <div className={styles.uploadBox}>
                                    <span>ចុចដើម្បីបញ្ចូលរូបភាព</span>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <Button variant="outline" onClick={() => setActiveTab('listings')}>បោះបង់</Button>
                                <Button variant="primary" type="submit">ដាក់លក់</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {activeTab === 'orders' && (
                    <div className={styles.orderList}>
                        <Card>
                            <div className={styles.orderHeader}>
                                <h3>ការបញ្ជាទិញ #ORD-001</h3>
                                <span className={styles.price}>សរុប: 2,400,000 ៛</span>
                            </div>
                            <p>ធុរេនកំពត 500kg • អ្នកទិញ: ក្រុមហ៊ុន ខ្មែរ ហ្វូដ</p>

                            <DeliveryTracker currentStep={deliveryStep} />

                            <div className={styles.orderActions}>
                                {deliveryStep === 1 && (
                                    <Button variant="primary" onClick={handleStartDelivery}>ចាប់ផ្តើមរៀបចំ</Button>
                                )}
                                {deliveryStep === 3 && (
                                    <Button disabled>រង់ចាំអ្នកទិញបញ្ជូនការដឹកជញ្ជូន...</Button>
                                )}
                                {deliveryStep === 4 && (
                                    <Button variant="primary" onClick={handleHandover}>បញ្ជាក់ថាផលិតផលចេញដឹកជញ្ជូន</Button>
                                )}
                                {deliveryStep === 5 && (
                                    <Button disabled style={{ color: 'green' }}>កំពុងដឹកជញ្ជូន...</Button>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'rfs' && (
                    <div className={styles.placeholderState}>
                        <p>មិនទាន់មានសំណើ (RFS) ថ្មីទេ</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerDashboard;
