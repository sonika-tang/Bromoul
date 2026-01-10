import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import DeliveryTracker from '../components/DeliveryTracker';
import styles from './BuyerDashboard.module.css';

const BuyerDashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [deliveryStep, setDeliveryStep] = useState(0); // 0: Not started

    const [rfsList, setRfsList] = useState([
        { id: 1, crop: 'ស្វាយចន្ទី', quantity: 5, unit: 'តោន', price: 0, notes: 'ត្រូវការគុណភាពលេខ ១' }
    ]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEditRfs = (rfs) => {
        setEditingId(rfs.id);
        setEditForm(rfs);
    };

    const handleSaveRfs = () => {
        setRfsList(rfsList.map(r => r.id === editingId ? editForm : r));
        setEditingId(null);
    };

    const handleDeleteRfs = (id) => {
        setRfsList(rfsList.filter(r => r.id !== id));
    };

    // Simulation of Delivery Flow trigger
    const handleTestPurchase = () => {
        alert('ការបញ្ជាទិញបានសម្រេច! ចូលទៅកាន់ "ការបញ្ជាទិញរបស់ខ្ញុំ" ដើម្បីតាមដាន។');
        setActiveTab('orders');
        setDeliveryStep(1); // Step 1: Agreed to buy
    };

    const handleSendDelivery = () => {
        setDeliveryStep(4); // Buyer sends delivery
    };

    const handleConfirmCompletion = () => {
        setDeliveryStep(6); // Process Complete
    };

    return (
        <div className={`container ${styles.dashboard}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>អ្នកទិញ</h1>
                <Button variant="secondary" onClick={() => setActiveTab('post-rfs')}>+ បង្កើតសំណើ (RFS)</Button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'search' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    ស្វែងរកកសិផល
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'my-rfs' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('my-rfs')}
                >
                    សំណើរបស់ខ្ញុំ (RFS)
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    ការបញ្ជាទិញ
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'search' && (
                    <div>
                        <div className={styles.searchBar}>
                            <Input placeholder="ស្វែងរក... (ឧ. ស្រូវផ្កាម្លិះ)" className={styles.searchInput} />
                            <Button>ស្វែងរក</Button>
                        </div>

                        <div className={styles.filters}>
                            <span>ច្រោះតាម:</span>
                            <select className={styles.select}><option>គ្រប់ប្រភេទ</option><option>ផ្លែឈើ</option><option>បន្លែ</option></select>
                            <select className={styles.select}><option>គ្រប់ទីកន្លែង</option><option>បាត់ដំបង</option><option>កំពត</option></select>
                        </div>

                        <div className={styles.grid}>
                            <Card>
                                <img src="https://via.placeholder.com/300x200" alt="Rice" className={styles.cardImg} />
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h3>ស្រូវផ្កាម្លិះ (Oraganic)</h3>
                                        <span className={styles.price}>4,800 ៛/kg</span>
                                    </div>
                                    <p className={styles.location}>📍 បាត់ដំបង • សល់ 500kg</p>
                                    <div className={styles.cardActions}>
                                        <Button variant="outline" className={styles.smBtn}>លម្អិត</Button>
                                        <Button className={styles.smBtn} onClick={handleTestPurchase}>បញ្ជាទិញ (Test)</Button>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <img src="https://via.placeholder.com/300x200" alt="Pepper" className={styles.cardImg} />
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h3>ម្រេចកំពត</h3>
                                        <span className={styles.price}>60,000 ៛/kg</span>
                                    </div>
                                    <p className={styles.location}>📍 កំពត • សល់ 100kg</p>
                                    <div className={styles.cardActions}>
                                        <Button variant="outline" className={styles.smBtn}>លម្អិត</Button>
                                        <Button className={styles.smBtn} onClick={handleTestPurchase}>បញ្ជាទិញ (Test)</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'my-rfs' && (
                    <div className={styles.grid}>
                        {rfsList.map(rfs => (
                            <Card key={rfs.id}>
                                {editingId === rfs.id ? (
                                    <div className={styles.editForm}>
                                        <Input label="ដំណាំ" value={editForm.crop} onChange={e => setEditForm({ ...editForm, crop: e.target.value })} />
                                        <div className={styles.row}>
                                            <Input label="បរិមាណ" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} />
                                            <Input label="ខ្នាត" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })} />
                                        </div>
                                        <div className={styles.cardActions} style={{ marginTop: '16px' }}>
                                            <Button variant="outline" className={styles.smBtn} onClick={() => setEditingId(null)}>បោះបង់</Button>
                                            <Button variant="primary" className={styles.smBtn} onClick={handleSaveRfs}>រក្សាទុក</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.cardContent}>
                                        <h3>{rfs.crop}</h3>
                                        <p>បរិមាណ: {rfs.quantity} {rfs.unit}</p>
                                        <p className={styles.notes}>"{rfs.notes}"</p>
                                        <div className={styles.cardActions}>
                                            <Button variant="outline" className={styles.smBtn} onClick={() => handleEditRfs(rfs)}>កែប្រែ</Button>
                                            <Button variant="outline" className={styles.smBtn} style={{ borderColor: 'red', color: 'red' }} onClick={() => handleDeleteRfs(rfs.id)}>លុប</Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'post-rfs' && (
                    <Card className={styles.formCard}>
                        <h2>បង្កើតសំណើ (RFS)</h2>
                        <p className={styles.helperText}>ប្រាប់កសិករពីអ្វីដែលអ្នកត្រូវការ</p>
                        <form className={styles.form}>
                            <Input label="ឈ្មោះដំណាំ" placeholder="ឧ. ស្វាយចន្ទី" required />
                            <div className={styles.row}>
                                <Input label="បរិមាណ" placeholder="ឧ. 5" type="number" required />
                                <Input label="ខ្នាត" placeholder="តោន" required />
                            </div>
                            <Input label="តម្លៃគោលដៅ (រៀល)" placeholder="មិនដាក់ក៏បាន" type="number" />
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>កំណត់សម្គាល់ / តម្រូវការ</label>
                                <textarea className={styles.textarea} rows="4" placeholder="គុណភាព, ថ្ងៃទទួល..."></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <Button variant="outline" onClick={() => setActiveTab('search')}>បោះបង់</Button>
                                <Button variant="secondary" type="submit">បង្កើត RFS</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {activeTab === 'orders' && (
                    <div className={styles.orderList}>
                        {deliveryStep > 0 ? (
                            <Card>
                                <div className={styles.orderHeader}>
                                    <h3>ការបញ្ជាទិញ #ORD-NEW</h3>
                                    <span className={styles.price}>សរុប: 480,000 ៛</span>
                                </div>
                                <p>ស្រូវផ្កាម្លិះ 100kg • កសិករ: សោភា</p>

                                <DeliveryTracker currentStep={deliveryStep} />

                                <div className={styles.orderActions}>
                                    {deliveryStep === 1 && (
                                        <p style={{ color: 'orange' }}>រង់ចាំកសិកររៀបចំ...</p>
                                    )}
                                    {deliveryStep === 3 && (
                                        <Button variant="primary" onClick={handleSendDelivery}>ផ្ញើការដឹកជញ្ជូន (Foodpanda/Grab)</Button>
                                    )}
                                    {deliveryStep === 4 && (
                                        <p style={{ color: 'orange' }}>រង់ចាំកសិករប្រគល់ជូនអ្នកដឹក...</p>
                                    )}
                                    {deliveryStep === 5 && (
                                        <Button variant="primary" onClick={handleConfirmCompletion}>បញ្ជាក់ការទទួល</Button>
                                    )}
                                    {deliveryStep === 6 && (
                                        <p style={{ color: 'green', fontWeight: 'bold' }}>ការបញ្ជាទិញបានបញ្ចប់ជោគជ័យ!</p>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <p>មិនទាន់មានការបញ្ជាទិញទេ</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDashboard;
