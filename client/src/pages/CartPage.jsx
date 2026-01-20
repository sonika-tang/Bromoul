
import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/api'; // Mock version
import { db } from '../services/mockDB'; // Direct DB access for cart reading
import PaymentModal from '../components/PaymentModal';
import styles from '../styles/CartPage.module.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [activeTab, setActiveTab] = useState('cart');
    const [deliveryType, setDeliveryType] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('aba');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        loadCart();

        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const loadCart = () => {
        const saved = localStorage.getItem('cart_items');
        if (saved) setCartItems(JSON.parse(saved));
        else setCartItems([]);
    };

    const calculateTotal = () => {
        let subtotal = cartItems.reduce((acc, item) => acc + ((item.quantity || 1) * (item.price_riel || 0)), 0);
        if (deliveryType === 'cold') subtotal += 20000;
        else subtotal += 5000;
        return subtotal;
    };

    const handleCheckout = async () => {
        if (!currentUser) {
            alert('សូមប្តូរតួនាទីជាអ្នកទិញជាមុនសិន!');
            return;
        }

        try {
            // Prepare Payload
            const orderPayload = {
                buyer_id: currentUser.id,
                items: cartItems.map(i => ({ listing_id: i.id, quantity: i.quantity || 1 })),
                payment_method: paymentMethod,
                delivery_option: deliveryType
            };

            await OrderService.create(orderPayload);

            alert('ការបញ្ជាទិញជោគជ័យ!');
            localStorage.removeItem('cart_items');
            setCartItems([]);
            setShowPayment(false);
            setActiveTab('tracking');
        } catch (err) {
            console.error(err);
            alert('បរាជ័យក្នុងការបញ្ជាទិញ');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>កន្ត្រករបស់អ្នក</h1>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'cart' ? styles.active : ''}`} onClick={() => setActiveTab('cart')}>កន្ត្រកទំនិញ</button>
                <button className={`${styles.tab} ${activeTab === 'tracking' ? styles.active : ''}`} onClick={() => setActiveTab('tracking')}>ការដឹកជញ្ជូន</button>
            </div>

            {activeTab === 'cart' ? (
                cartItems.length === 0 ? <p className={styles.empty}>កន្ត្រកទទេ</p> : (
                    <div className={styles.checkoutSection}>
                        {cartItems.map((item, idx) => (
                            <div key={idx} className={styles.cartItemSimple}>
                                <span>{item.crop_name || item.name}</span>
                                <span>{item.quantity} {item.unit}</span>
                                <span>{(item.price_riel || 0).toLocaleString()} ៛</span>
                            </div>
                        ))}

                        <div className={styles.summary}>
                            <h3>សរុប: {calculateTotal().toLocaleString()} ៛</h3>
                            <button className={styles.checkoutBtn} onClick={() => setShowPayment(true)}>បន្តទៅការទូទាត់</button>
                        </div>
                    </div>
                )
            ) : (
                <MyOrdersList user={currentUser} />
            )}

            {showPayment && (
                <PaymentModal
                    totalAmount={calculateTotal().toLocaleString() + ' ៛'}
                    onClose={() => setShowPayment(false)}
                    onConfirm={handleCheckout}
                />
            )}
        </div>
    );
};

const MyOrdersList = ({ user }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            const load = async () => {
                const data = await OrderService.getMyOrders(user.id, user.role);
                setOrders(data);
            };
            load();
            const interval = setInterval(load, 2000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleUpdate = async (id, status) => {
        await OrderService.updateStatus(id, status);
        // Optimistic UI handled by re-fetch
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'agreed': return 'យល់ព្រម';
            case 'preparing': return 'កំពុងរៀបចំ';
            case 'ready': return 'រួចរាល់';
            case 'out_for_delivery': return 'កំពុងដឹក';
            case 'completed': return 'បានទទួល';
            default: return status;
        }
    };

    if (orders.length === 0) return <p>មិនទាន់មានការបញ្ជាទិញ។</p>;

    return (
        <div className={styles.trackingList}>
            {orders.map(o => (
                <div key={o.id} className={styles.trackingItem}>
                    <h4>{o.crop_name} (ស្ថានភាព៖ {getStatusLabel(o.delivery_status)})</h4>
                    <p>ដៃគូ៖ {user.role === 'farmer' ? o.buyer_name : o.seller_name}</p>

                    {/* Controls */}
                    {user.role === 'farmer' && o.delivery_status === 'agreed' && <button onClick={() => handleUpdate(o.id, 'preparing')}>ចាប់ផ្តើមរៀបចំ</button>}
                    {user.role === 'farmer' && o.delivery_status === 'preparing' && <button onClick={() => handleUpdate(o.id, 'ready')}>រួចរាល់</button>}
                    {user.role === 'buyer' && o.delivery_status === 'ready' && <button onClick={() => handleUpdate(o.id, 'out_for_delivery')}>ស្នើដឹកជញ្ជូន</button>}
                    {user.role === 'buyer' && o.delivery_status === 'out_for_delivery' && <button onClick={() => handleUpdate(o.id, 'completed')}>បញ្ជាក់ការទទួល</button>}
                </div>
            ))}
        </div>
    );
};

export default CartPage;
