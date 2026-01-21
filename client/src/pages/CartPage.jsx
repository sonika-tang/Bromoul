import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDB';
import abaQr from '../assets/ABA_QR.jpg';

const CartPage = ({ userRole, user }) => {
    const [cartItems, setCartItems] = useState([]);
    const [activeTab, setActiveTab] = useState('cart');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('aba');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const crops = db._read('crops');
    const allUsers = db._read('users');

    useEffect(() => {
        loadCart();
        loadOrders();
        window.addEventListener('cartUpdated', loadCart);
        const interval = setInterval(loadOrders, 2000); // Poll for order updates
        return () => {
            window.removeEventListener('cartUpdated', loadCart);
            clearInterval(interval);
        };
    }, []);

    const loadCart = () => {
        const saved = localStorage.getItem('bromoul:cart') || '[]';
        setCartItems(JSON.parse(saved));
    };

    const loadOrders = () => {
        setLoading(true);
        try {
            const allOrders = db._read('orders') || [];
            let myOrders;

            if (userRole === 'buyer') {
                myOrders = allOrders.filter(o => o.buyer_id === user.id);
            } else {
                myOrders = allOrders.filter(o => o.seller_id === user.id);
            }

            setOrders(myOrders.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            ));
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = (cartId) => {
        const updated = cartItems.filter(item => item.cartId !== cartId);
        localStorage.setItem('bromoul:cart', JSON.stringify(updated));
        setCartItems(updated);
    };

    const updateQuantity = (cartId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(cartId);
            return;
        }
        const updated = cartItems.map(item =>
            item.cartId === cartId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('bromoul:cart', JSON.stringify(updated));
        setCartItems(updated);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => {
            return acc + ((item.price_riel || 0) * (item.quantity || 1));
        }, 0);
    };

    const calculateDeliveryFee = () => 5000;

    const calculateTotal = () => calculateSubtotal() + calculateDeliveryFee();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('សូមបន្ថែមផលិតផល!');
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePayment = () => {
        if (!paymentMethod) {
            alert('សូមជ្រើសរើសវិធីបង់ប្រាក់!');
            return;
        }

        const newOrders = cartItems.map(item => {
            const seller = allUsers.find(u => u.id === item.user_id);
            const crop = crops.find(c => c.id === item.crop_id); // Find crop to ensure name is correct if missing

            return {
                id: Date.now().toString() + Math.random().toString().slice(2, 6),
                buyer_id: user.id,
                seller_id: item.user_id,
                listing_id: item.id,
                crop_id: item.crop_id,
                crop_name: item.crop_name || crop?.name_kh || 'ដំណាំ',
                quantity: item.quantity || 1,
                unit: item.unit || 'គីឡូ',
                price_riel: item.price_riel,
                total_price: (item.price_riel || 0) * (item.quantity || 1),
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cash' ? 'pending' : 'completed',
                delivery_status: 'agreed',
                seller_name: seller?.name || 'Unknown',
                buyer_name: user.name,
                photo_url: item.photo_url || crop?.image || 'https://via.placeholder.com/150',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                delivery_history: [{
                    status: 'agreed',
                    timestamp: new Date().toISOString(),
                    message: 'ការបញ្ជាទិញបានទទួលយក'
                }]
            };
        });

        const allOrders = db._read('orders') || [];
        allOrders.push(...newOrders);
        db._write('orders', allOrders);

        localStorage.setItem('bromoul:cart', JSON.stringify([]));
        setCartItems([]);

        setShowPaymentModal(false);
        setActiveTab('orders');
        loadOrders();

        alert('ការបញ្ជាទិញបានបង្កើតដោយជោគជ័យ!');
    };

    const updateOrderStatus = (orderId, newStatus) => {
        const allOrders = db._read('orders') || [];
        const orderIndex = allOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) return;

        const order = allOrders[orderIndex];
        order.delivery_status = newStatus;

        // Auto-update payment status if cash and completed
        if (newStatus === 'completed' && order.payment_method === 'cash') {
            order.payment_status = 'completed';
        }

        order.updated_at = new Date().toISOString();

        if (!order.delivery_history) order.delivery_history = [];

        const statusLabels = {
            'agreed': 'ការបញ្ជាទិញបានទទួលយក',
            'preparing': 'កំពុងរៀបចំ',
            'ready': 'រួចរាល់សម្រាប់ទទួល',
            'picked_up': 'បានទទួល',
            'in_delivery': 'កំពុងដឹកជញ្ជូន',
            'completed': 'ជោគជ័យ'
        };

        order.delivery_history.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: statusLabels[newStatus] || newStatus
        });

        allOrders[orderIndex] = order;
        db._write('orders', allOrders);
        loadOrders();
    };

    const getStatusLabel = (status) => {
        const labels = {
            'agreed': '① យល់ព្រម',
            'preparing': '② កំពុងរៀបចំ',
            'ready': '③ រួចរាល់',
            'picked_up': '④ បានទទួល',
            'in_delivery': '⑤ កំពុងដឹក',
            'completed': '⑥ ជោគជ័យ'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'agreed': '#FF9800',
            'preparing': '#FF9800',
            'ready': '#2196F3',
            'picked_up': '#2196F3',
            'in_delivery': '#FF5722',
            'completed': '#4CAF50'
        };
        return colors[status] || '#999';
    };

    const getProgressPercentage = (status) => {
        const statusSequence = ['agreed', 'preparing', 'ready', 'picked_up', 'in_delivery', 'completed'];
        const index = statusSequence.indexOf(status);
        return Math.max(5, ((index) / (statusSequence.length - 1)) * 100);
    };

    // Payment Modal
    if (showPaymentModal) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: '24px' }}>💳 ការទូទាត់</h2>

                    <div style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <span>សរុប:</span>
                            <strong>{calculateTotal().toLocaleString()} ៛</strong>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            {cartItems.length} ឈ្មោះផលិតផល
                        </p>
                    </div>

                    <h4 style={{ marginBottom: '12px' }}>វិធីបង់ប្រាក់</h4>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            marginBottom: '8px',
                            border: paymentMethod === 'aba' ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'aba' ? '#e8f5e9' : 'white'
                        }}>
                            <input
                                type="radio"
                                name="payment"
                                value="aba"
                                checked={paymentMethod === 'aba'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginRight: '12px' }}
                            />
                            <div>
                                <strong>ABA Mobile QR</strong>
                                <p style={{ margin: '0 0 0 0', fontSize: '12px', color: '#666' }}>
                                    ទូទាត់ឥឡូវ
                                </p>
                            </div>
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            border: paymentMethod === 'cash' ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'cash' ? '#e8f5e9' : 'white'
                        }}>
                            <input
                                type="radio"
                                name="payment"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ marginRight: '12px' }}
                            />
                            <div>
                                <strong>សាច់ប្រាក់នៅពេលទទួល</strong>
                                <p style={{ margin: '0 0 0 0', fontSize: '12px', color: '#666' }}>
                                    ទូទាត់នៅពេលផលិតផលមកដល់
                                </p>
                            </div>
                        </label>
                    </div>

                    {paymentMethod === 'aba' && (
                        <div style={{
                            background: '#e8f5e9',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: '#f0f0f0',
                                margin: '0 auto 12px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                border: '2px dashed #4CAF50'
                            }}>
                                <img src={abaQr} alt="aba qr" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <p style={{ margin: 0, color: '#2e7d32', fontWeight: '600' }}>
                                ស្កេន QR ដោយប្រើ ABA Mobile
                            </p>
                        </div>
                    )}

                    {paymentMethod === 'cash' && (
                        <div style={{
                            background: '#fff3e0',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ margin: 0, color: '#f57c00' }}>
                                អ្នកនឹងបង់ថ្លៃលុយសាច់ប្រាក់នៅពេលផលិតផលមកដល់
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '1px solid #e0e0e0',
                                background: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                        >
                            បោះបង់
                        </button>
                        <button
                            onClick={handlePayment}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                background: '#4CAF50',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                        >
                            បង្កើតការបញ្ជាទិញ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Cart View
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <h1 style={{ marginBottom: '32px' }}>កន្ត្រកទំនិញ</h1>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '16px',
                borderBottom: '2px solid #e0e0e0',
                marginBottom: '32px',
                overflowX: 'auto'
            }}>
                <button
                    onClick={() => setActiveTab('cart')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'cart' ? '2px solid #4CAF50' : 'none',
                        color: activeTab === 'cart' ? '#4CAF50' : '#757575',
                        marginBottom: '-2px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    កន្ត្រក ({cartItems.length})
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'orders' ? '2px solid #4CAF50' : 'none',
                        color: activeTab === 'orders' ? '#4CAF50' : '#757575',
                        marginBottom: '-2px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    ការបញ្ជាទិញ ({orders.length})
                </button>
            </div>

            {/* Cart Tab */}
            {activeTab === 'cart' && (
                <div>
                    {cartItems.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 0',
                            color: '#999'
                        }}>
                            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>
                                កន្ត្រកទទេ
                            </p>
                            <p style={{ margin: 0, fontSize: '14px' }}>
                                ស្វែងរកផលិតផល ក្នុងផ្សារដើម្បីបន្ថែម
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '24px',
                                marginBottom: '32px'
                            }}>
                                {cartItems.map((item) => {
                                    const crop = crops.find(c => c.id === item.crop_id);
                                    const seller = allUsers.find(u => u.id === item.user_id);

                                    return (
                                        <div
                                            key={item.cartId}
                                            style={{
                                                background: 'white',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: '1px solid #e0e0e0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <img
                                                src={item.photo_url || 'https://via.placeholder.com/400x300'}
                                                alt={crop?.name_kh}
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div style={{ padding: '16px' }}>
                                                <h3 style={{ margin: '0 0 8px 0' }}>
                                                    {crop?.icon} {crop?.name_kh}
                                                </h3>
                                                <p style={{
                                                    margin: '4px 0',
                                                    fontSize: '14px',
                                                    color: '#666'
                                                }}>
                                                    តម្លៃ៖ {item.price_riel?.toLocaleString()} ៛/គីឡូ
                                                </p>
                                                <p style={{
                                                    margin: '4px 0 8px 0',
                                                    fontSize: '12px',
                                                    color: '#999'
                                                }}>
                                                    ពី៖ {seller?.name}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    marginBottom: '12px',
                                                    background: '#f5f5f5',
                                                    borderRadius: '6px',
                                                    padding: '4px'
                                                }}>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                        style={{
                                                            background: 'white',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity || 1}
                                                        onChange={(e) => updateQuantity(item.cartId, parseInt(e.target.value) || 1)}
                                                        style={{
                                                            flex: 1,
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }}
                                                        min="1"
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                        style={{
                                                            background: 'white',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            width: '28px',
                                                            height: '28px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <p style={{
                                                    margin: '8px 0',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#4CAF50'
                                                }}>
                                                    សរុប៖ {((item.price_riel || 0) * (item.quantity || 1)).toLocaleString()} ៛
                                                </p>

                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #d32f2f',
                                                        background: 'white',
                                                        color: '#d32f2f',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        marginTop: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#ffebee';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                    }}
                                                >
                                                    ដកចេញ
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary & Checkout */}
                            <div style={{
                                background: '#f9f9f9',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                maxWidth: '400px',
                                marginLeft: 'auto'
                            }}>
                                <h3 style={{ margin: '0 0 16px 0' }}>សង្ខេប</h3>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <span>ចំនួនផលិតផល៖</span>
                                    <strong>{cartItems.length}</strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <span>ចំនួនគីឡូក្រាម៖</span>
                                    <strong>{cartItems.reduce((a, b) => a + (b.quantity || 1), 0)} គីឡូ</strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <span>ថ្លៃសរុប៖</span>
                                    <strong>{calculateSubtotal().toLocaleString()} ៛</strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <span>ថ្លៃដឹកជញ្ជូន៖</span>
                                    <strong>{calculateDeliveryFee().toLocaleString()} ៛</strong>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    marginBottom: '24px',
                                    color: '#4CAF50'
                                }}>
                                    <span>សរុប៖</span>
                                    <span>{calculateTotal().toLocaleString()} ៛</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#43a047'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}
                                >
                                    បន្តទៅការទូទាត់
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            កំពុងដំណើរការ...
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 0',
                            color: '#999'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>
                                មិនទាន់មានការបញ្ជាទិញទេ
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {orders.map((order) => {
                                const statusSequence = ['agreed', 'preparing', 'ready', 'picked_up', 'in_delivery', 'completed'];
                                const currentStatusIndex = statusSequence.indexOf(order.delivery_status);

                                return (
                                    <div
                                        key={order.id}
                                        style={{
                                            background: 'white',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {/* Order Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            marginBottom: '16px',
                                            paddingBottom: '16px',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                                                    {order.id.substring(0, 8).toUpperCase()}
                                                </h3>
                                                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                                                    {new Date(order.created_at).toLocaleDateString('km-KH')}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    background: order.payment_status === 'completed' ? '#e8f5e9' : '#fff3e0',
                                                    color: order.payment_status === 'completed' ? '#2e7d32' : '#f57c00',
                                                    marginBottom: '8px'
                                                }}>
                                                    {order.payment_status === 'completed' ? '✓ បានបង់' : '◯ រង់ចាំបង់'}
                                                </div>
                                                <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#4CAF50' }}>
                                                    {order.total_price.toLocaleString()} ៛
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div style={{
                                            background: '#f9f9f9',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr',
                                                gap: '12px',
                                                fontSize: '14px'
                                            }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>ផលិតផល</p>
                                                    <p style={{ margin: 0, fontWeight: '500' }}>{order.crop_name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                                        {order.quantity} {order.unit}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>
                                                        {userRole === 'buyer' ? 'ពីអ្នកលក់' : 'អ្នកទិញ'}
                                                    </p>
                                                    <p style={{ margin: 0, fontWeight: '500' }}>
                                                        {userRole === 'buyer' ? order.seller_name : order.buyer_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>ស្ថានភាព</p>
                                                    <p style={{ margin: 0, fontWeight: '600', color: getStatusColor(order.delivery_status) }}>
                                                        {getStatusLabel(order.delivery_status)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Tracker */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ដំណើរការដឹកជញ្ជូន:</p>
                                            <div style={{
                                                height: '8px',
                                                background: '#e0e0e0',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: `${getProgressPercentage(order.delivery_status)}%`,
                                                    background: getStatusColor(order.delivery_status),
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                            {userRole === 'farmer' && (
                                                <>
                                                    {order.delivery_status === 'agreed' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#FF9800',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            ចាប់ផ្តើមរៀបចំ
                                                        </button>
                                                    )}
                                                    {order.delivery_status === 'preparing' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, 'ready')}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#2196F3',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            រៀបចំរួចរាល់
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {userRole === 'buyer' && (
                                                <>
                                                    {(order.delivery_status === 'ready') && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#2196F3',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            បានទទួលផលិតផល
                                                        </button>
                                                    )}
                                                    {(order.delivery_status === 'picked_up' || order.delivery_status === 'in_delivery') && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#4CAF50',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            បញ្ជាក់ការទទួល
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartPage;