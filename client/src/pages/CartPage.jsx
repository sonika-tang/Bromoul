import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/mockDB';
import abaQr from '../assets/ABA_QR.jpg';
import styles from '../styles/CartPage.module.css';

const STATUS_SEQUENCE = ['agreed', 'preparing', 'ready', 'picked_up', 'in_delivery', 'completed'];

const STATUS_LABELS = {
    agreed: 'យល់ព្រម',
    preparing: 'រៀបចំ',
    ready: 'រួចរាល់',
    picked_up: 'ទទួល',
    in_delivery: 'ដឹកជញ្ជូន',
    completed: 'ជោគជ័យ',
};

const STATUS_COLORS = {
    agreed: '#FF9800',
    preparing: '#FF9800',
    ready: '#2196F3',
    picked_up: '#2196F3',
    in_delivery: '#FF5722',
    completed: '#4CAF50',
};

const CartPage = ({ userRole, user }) => {
    const isFarmer = userRole === 'farmer';

    const [cartItems, setCartItems] = useState([]);
    const [activeTab, setActiveTab] = useState(isFarmer ? 'proposals' : 'cart');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMode, setPaymentMode] = useState('cart'); // 'cart' | 'proposal'
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('aba');
    const [farmerProposals, setFarmerProposals] = useState([]);
    const [incomingProposals, setIncomingProposals] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const crops = db._read('crops');
    const allUsers = db._read('users');

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const loadCart = useCallback(() => {
        if (!isFarmer) {
            const saved = localStorage.getItem('bromoul:cart') || '[]';
            setCartItems(JSON.parse(saved));
        }
    }, [isFarmer]);

    const loadOrders = useCallback(() => {
        setLoading(true);
        try {
            const allOrders = db._read('orders') || [];
            if (isFarmer) {
                // Proposals farmer sent (awaiting supermarket payment)
                setFarmerProposals(
                    allOrders
                        .filter(o => o.seller_id === user?.id && o.delivery_status === 'offered')
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                );
                // Orders where farmer is seller (confirmed)
                setOrders(
                    allOrders
                        .filter(o => o.seller_id === user?.id && o.delivery_status !== 'offered')
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                );
            } else {
                // Proposals from farmers awaiting buyer's payment
                setIncomingProposals(
                    allOrders
                        .filter(o => o.buyer_id === user?.id && o.delivery_status === 'offered')
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                );
                // Orders where buyer is buyer (confirmed)
                setOrders(
                    allOrders
                        .filter(o => o.buyer_id === user?.id && o.delivery_status !== 'offered')
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isFarmer, user]);

    useEffect(() => {
        loadCart();
        loadOrders();
        window.addEventListener('cartUpdated', loadCart);
        const interval = setInterval(loadOrders, 2000);
        return () => {
            window.removeEventListener('cartUpdated', loadCart);
            clearInterval(interval);
        };
    }, [loadCart, loadOrders]);

    /* ── Cart ops (buyer only) ── */
    const removeFromCart = (cartId) => {
        const updated = cartItems.filter(item => item.cartId !== cartId);
        localStorage.setItem('bromoul:cart', JSON.stringify(updated));
        setCartItems(updated);
    };

    const updateQuantity = (cartId, newQty) => {
        if (newQty < 1) { removeFromCart(cartId); return; }
        const updated = cartItems.map(item =>
            item.cartId === cartId ? { ...item, quantity: newQty } : item
        );
        localStorage.setItem('bromoul:cart', JSON.stringify(updated));
        setCartItems(updated);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price_riel || 0) * (item.quantity || 1), 0);
    const deliveryFee = 5000;
    const cartTotal = subtotal + deliveryFee;
    const proposalGrandTotal = selectedProposal
        ? (selectedProposal.price_riel || 0) * (selectedProposal.quantity || 1) + deliveryFee
        : 0;

    /* ── Payment triggers ── */
    const handleCheckout = () => {
        if (cartItems.length === 0) { showToast('សូមបន្ថែមផលិតផលជាមុន!', 'error'); return; }
        setPaymentMode('cart');
        setSelectedProposal(null);
        setShowPaymentModal(true);
    };

    const handleAcceptProposal = (proposal) => {
        setSelectedProposal(proposal);
        setPaymentMode('proposal');
        setShowPaymentModal(true);
    };

    const handleRejectProposal = (proposalId) => {
        if (!window.confirm('តើប្រាកដថាបដិសេធការស្នើនេះ?')) return;
        const allOrders = db._read('orders') || [];
        db._write('orders', allOrders.filter(o => o.id !== proposalId));
        loadOrders();
        showToast('បានបដិសេធការស្នើ', 'error');
    };

    const handleCancelProposal = (proposalId) => {
        if (!window.confirm('តើប្រាកដថាលុបការស្នើ?')) return;
        const allOrders = db._read('orders') || [];
        db._write('orders', allOrders.filter(o => o.id !== proposalId));
        loadOrders();
        showToast('បានលុបការស្នើ');
    };

    const handleConfirmPayment = () => {
        paymentMode === 'cart' ? handleCartPayment() : handleProposalPayment();
    };

    /* ── Cart checkout: buyer pays for supply listings ── */
    const handleCartPayment = () => {
        const newOrders = cartItems.map(item => {
            const crop = crops.find(c => c.id === item.crop_id);
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
                seller_name: allUsers.find(u => u.id === item.user_id)?.name || 'Unknown',
                buyer_name: user.name,
                photo_url: item.photo_url || crop?.image || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                delivery_history: [{
                    status: 'agreed',
                    timestamp: new Date().toISOString(),
                    message: 'ការបញ្ជាទិញបានទទួលយក',
                }],
            };
        });

        const allOrders = db._read('orders') || [];
        db._write('orders', [...allOrders, ...newOrders]);
        localStorage.setItem('bromoul:cart', JSON.stringify([]));
        setCartItems([]);
        setShowPaymentModal(false);
        setActiveTab('orders');
        loadOrders();
        showToast('ការបញ្ជាទិញបានបង្កើតដោយជោគជ័យ!');
    };

    /* ── Proposal payment: buyer accepts and pays a farmer's proposal ── */
    const handleProposalPayment = () => {
        const allOrders = db._read('orders') || [];
        const idx = allOrders.findIndex(o => o.id === selectedProposal.id);
        if (idx === -1) return;

        allOrders[idx] = {
            ...allOrders[idx],
            delivery_status: 'agreed',
            payment_status: paymentMethod === 'cash' ? 'pending' : 'completed',
            payment_method: paymentMethod,
            updated_at: new Date().toISOString(),
            delivery_history: [
                ...(allOrders[idx].delivery_history || []),
                {
                    status: 'agreed',
                    timestamp: new Date().toISOString(),
                    message: 'ផ្សារទំនើបបានទទួលយក និងទូទាត់',
                },
            ],
        };
        db._write('orders', allOrders);
        setShowPaymentModal(false);
        setSelectedProposal(null);
        setActiveTab('orders');
        loadOrders();
        showToast('បានទទួលយក! ការបញ្ជាទិញចាប់ផ្តើម');
    };

    /* ── Order status progression ── */
    const updateOrderStatus = (orderId, newStatus) => {
        const allOrders = db._read('orders') || [];
        const idx = allOrders.findIndex(o => o.id === orderId);
        if (idx === -1) return;
        const order = { ...allOrders[idx] };
        order.delivery_status = newStatus;
        if (newStatus === 'completed' && order.payment_method === 'cash') {
            order.payment_status = 'completed';
        }
        order.updated_at = new Date().toISOString();
        if (!order.delivery_history) order.delivery_history = [];
        order.delivery_history.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: STATUS_LABELS[newStatus] || newStatus,
        });
        allOrders[idx] = order;
        db._write('orders', allOrders);
        loadOrders();
    };

    const modalTotal = paymentMode === 'cart' ? cartTotal : proposalGrandTotal;
    const modalSubtitle = paymentMode === 'cart'
        ? `${cartItems.length} ឈ្មោះផលិតផល · ថ្លៃដឹក ${deliveryFee.toLocaleString()} ៛`
        : `${selectedProposal?.crop_name} ${selectedProposal?.quantity?.toLocaleString()} ${selectedProposal?.unit} · ថ្លៃដឹក ${deliveryFee.toLocaleString()} ៛`;

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.heroSection}>
                <div className={styles.heroBg}>
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                </div>
                <div className="container">
                    <div className={styles.heroInner}>
                        <span className={styles.tag}>
                            {isFarmer ? 'ការស្នើ · Proposals' : 'កន្ត្រក · Cart'}
                        </span>
                        <h1 className={styles.heroTitle}>
                            {isFarmer
                                ? <><span className={styles.heroTitleAccent}>ការស្នើ</span>ផ្គត់ផ្គង់</>
                                : <><span className={styles.heroTitleAccent}>កន្ត្រក</span>ទំនិញ</>
                            }
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className={styles.content}>
                <div className="container">

                    {/* ── Tabs: Farmer ── */}
                    {isFarmer && (
                        <div className={styles.tabBar}>
                            <button
                                className={`${styles.tab} ${activeTab === 'proposals' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('proposals')}
                            >
                                📋 ការស្នើ ({farmerProposals.length})
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 ការបញ្ជាទិញ ({orders.length})
                            </button>
                        </div>
                    )}

                    {/* ── Tabs: Buyer ── */}
                    {!isFarmer && (
                        <div className={styles.tabBar}>
                            <button
                                className={`${styles.tab} ${activeTab === 'cart' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('cart')}
                            >
                                🛒 កន្ត្រក ({cartItems.length})
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'incoming' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('incoming')}
                            >
                                📩 ស្នើចូល ({incomingProposals.length})
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 ការបញ្ជាទិញ ({orders.length})
                            </button>
                        </div>
                    )}

                    {/* ════ FARMER: PROPOSALS SENT ════ */}
                    {isFarmer && activeTab === 'proposals' && (
                        loading ? (
                            <div className={styles.loadingWrap}>កំពុងដំណើរការ...</div>
                        ) : farmerProposals.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📋</div>
                                <p className={styles.emptyTitle}>មិនទាន់មានការស្នើ</p>
                                <p className={styles.emptySubtitle}>ចូលទៅផ្សារ ហើយស្នើផ្គត់ផ្គង់ ផ្សារទំនើបនឹងទូទាត់</p>
                            </div>
                        ) : (
                            <div className={styles.proposalsList}>
                                {farmerProposals.map(proposal => {
                                    const crop = crops.find(c => c.id === proposal.crop_id);
                                    return (
                                        <div key={proposal.id} className={styles.proposalCard}>
                                            <img
                                                src={proposal.photo_url || crop?.image}
                                                alt={proposal.crop_name}
                                                className={styles.proposalImage}
                                            />
                                            <div className={styles.proposalBody}>
                                                <div className={styles.proposalTop}>
                                                    <h3 className={styles.proposalName}>{proposal.crop_name}</h3>
                                                    <span className={styles.badgePending}>⏳ រង់ចាំការទូទាត់</span>
                                                </div>
                                                <p className={styles.proposalMeta}>
                                                    ផ្ញើទៅ: <strong>{proposal.buyer_name}</strong>
                                                </p>
                                                <p className={styles.proposalMeta}>
                                                    {proposal.quantity?.toLocaleString()} {proposal.unit}
                                                    {' · '}
                                                    {proposal.price_riel?.toLocaleString()} ៛ / {proposal.unit}
                                                </p>
                                                <p className={styles.proposalTotalText}>
                                                    សរុប: <strong>{((proposal.price_riel || 0) * (proposal.quantity || 1)).toLocaleString()} ៛</strong>
                                                </p>
                                                <p className={styles.proposalNote}>
                                                    ផ្សារទំនើបនឹងទូទាត់ ហើយការបញ្ជាទិញនឹងចាប់ផ្តើម
                                                </p>
                                            </div>
                                            <button
                                                className={styles.btnCancelProposal}
                                                onClick={() => handleCancelProposal(proposal.id)}
                                                title="លុបការស្នើ"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* ════ BUYER: CART ════ */}
                    {!isFarmer && activeTab === 'cart' && (
                        cartItems.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>🛒</div>
                                <p className={styles.emptyTitle}>កន្ត្រកទទេ</p>
                                <p className={styles.emptySubtitle}>ស្វែងរកផលិតផលក្នុងផ្សារ ដើម្បីបន្ថែម</p>
                            </div>
                        ) : (
                            <div className={styles.cartLayout}>
                                <div className={styles.itemsList}>
                                    {cartItems.map(item => {
                                        const crop = crops.find(c => c.id === item.crop_id);
                                        const seller = allUsers.find(u => u.id === item.user_id);
                                        return (
                                            <div key={item.cartId} className={styles.cartItem}>
                                                <img
                                                    src={item.photo_url || crop?.image || 'https://via.placeholder.com/400x300'}
                                                    alt={crop?.name_kh}
                                                    className={styles.cartItemImage}
                                                />
                                                <div className={styles.cartItemBody}>
                                                    <h3 className={styles.cartItemName}>{crop?.name_kh || item.crop_name}</h3>
                                                    <p className={styles.cartItemSeller}>ពី៖ {seller?.name || '—'}</p>
                                                    <p className={styles.cartItemUnitPrice}>
                                                        {item.price_riel?.toLocaleString()} ៛ / {item.unit || 'គីឡូ'}
                                                    </p>
                                                    <div className={styles.qtyControls}>
                                                        <button
                                                            className={styles.qtyBtn}
                                                            onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                        >−</button>
                                                        <input
                                                            type="number"
                                                            className={styles.qtyInput}
                                                            value={item.quantity || 1}
                                                            min="1"
                                                            onChange={e => updateQuantity(item.cartId, parseInt(e.target.value) || 1)}
                                                        />
                                                        <button
                                                            className={styles.qtyBtn}
                                                            onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                        >+</button>
                                                        <span style={{ fontSize: 13, color: 'var(--color-text-light)', marginLeft: 4 }}>
                                                            {item.unit || 'គីឡូ'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.cartItemFooter}>
                                                        <span className={styles.cartItemTotal}>
                                                            {((item.price_riel || 0) * (item.quantity || 1)).toLocaleString()} ៛
                                                        </span>
                                                        <button
                                                            className={styles.btnRemove}
                                                            onClick={() => removeFromCart(item.cartId)}
                                                        >
                                                            ✕ ដកចេញ
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.summaryPanel}>
                                    <h3 className={styles.summaryTitle}>📋 សង្ខេបការទិញ</h3>
                                    <div className={styles.summaryRow}>
                                        <span>ចំនួនផលិតផល</span>
                                        <strong>{cartItems.length} មុខ</strong>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>ចំនួនសរុប</span>
                                        <strong>{cartItems.reduce((a, b) => a + (b.quantity || 1), 0)} {cartItems[0]?.unit || 'គីឡូ'}</strong>
                                    </div>
                                    <hr className={styles.summaryDivider} />
                                    <div className={styles.summaryRow}>
                                        <span>ថ្លៃផលិតផល</span>
                                        <strong>{subtotal.toLocaleString()} ៛</strong>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>ថ្លៃដឹកជញ្ជូន</span>
                                        <strong>{deliveryFee.toLocaleString()} ៛</strong>
                                    </div>
                                    <div className={styles.summaryRowTotal}>
                                        <span>សរុបទាំងអស់</span>
                                        <span>{cartTotal.toLocaleString()} ៛</span>
                                    </div>
                                    <button className={styles.checkoutBtn} onClick={handleCheckout}>
                                        💳 បន្តទៅការទូទាត់
                                    </button>
                                </div>
                            </div>
                        )
                    )}

                    {/* ════ BUYER: INCOMING PROPOSALS ════ */}
                    {!isFarmer && activeTab === 'incoming' && (
                        loading ? (
                            <div className={styles.loadingWrap}>កំពុងដំណើរការ...</div>
                        ) : incomingProposals.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📩</div>
                                <p className={styles.emptyTitle}>មិនទាន់មានការស្នើចូល</p>
                                <p className={styles.emptySubtitle}>នៅពេលដែលកសិករស្នើចូល វានឹងបង្ហាញនៅទីនេះ</p>
                            </div>
                        ) : (
                            <div className={styles.proposalsList}>
                                {incomingProposals.map(proposal => {
                                    const crop = crops.find(c => c.id === proposal.crop_id);
                                    const propSubtotal = (proposal.price_riel || 0) * (proposal.quantity || 1);
                                    return (
                                        <div key={proposal.id} className={`${styles.proposalCard} ${styles.proposalCardIncoming}`}>
                                            <img
                                                src={proposal.photo_url || crop?.image}
                                                alt={proposal.crop_name}
                                                className={styles.proposalImage}
                                            />
                                            <div className={styles.proposalBody}>
                                                <div className={styles.proposalTop}>
                                                    <h3 className={styles.proposalName}>{proposal.crop_name}</h3>
                                                    <span className={styles.badgeIncoming}>📩 ស្នើចូល</span>
                                                </div>
                                                <p className={styles.proposalMeta}>
                                                    ពីកសិករ: <strong>{proposal.seller_name}</strong>
                                                </p>
                                                <p className={styles.proposalMeta}>
                                                    {proposal.quantity?.toLocaleString()} {proposal.unit}
                                                    {' · '}
                                                    {proposal.price_riel?.toLocaleString()} ៛ / {proposal.unit}
                                                </p>
                                                <p className={styles.proposalTotalText}>
                                                    សរុប (+ ថ្លៃដឹក): <strong>{(propSubtotal + deliveryFee).toLocaleString()} ៛</strong>
                                                </p>
                                                <div className={styles.proposalActions}>
                                                    <button
                                                        className={`${styles.btnAction} ${styles.btnGreen}`}
                                                        onClick={() => handleAcceptProposal(proposal)}
                                                    >
                                                        💳 ទទួលយក &amp; ទូទាត់
                                                    </button>
                                                    <button
                                                        className={styles.btnReject}
                                                        onClick={() => handleRejectProposal(proposal.id)}
                                                    >
                                                        ✕ បដិសេធ
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* ════ ORDERS TAB (both roles) ════ */}
                    {activeTab === 'orders' && (
                        loading ? (
                            <div className={styles.loadingWrap}>កំពុងដំណើរការ...</div>
                        ) : orders.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📦</div>
                                <p className={styles.emptyTitle}>មិនទាន់មានការបញ្ជាទិញ</p>
                                <p className={styles.emptySubtitle}>
                                    {isFarmer
                                        ? 'ស្នើផ្គត់ផ្គង់ ហើយរង់ចាំការទូទាត់ពីផ្សារទំនើប'
                                        : 'ទិញផលិតផល ឬទទួលការស្នើពីកសិករ'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className={styles.ordersList}>
                                {orders.map(order => {
                                    const currentIdx = STATUS_SEQUENCE.indexOf(order.delivery_status);
                                    return (
                                        <div key={order.id} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <div className={styles.orderHeaderLeft}>
                                                    <span className={styles.orderId}>#{order.id.substring(0, 10).toUpperCase()}</span>
                                                    <span className={styles.orderDate}>
                                                        {new Date(order.created_at).toLocaleDateString('km-KH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className={styles.orderHeaderRight}>
                                                    <span className={`${styles.paymentBadge} ${order.payment_status === 'completed' ? styles.paymentPaid : styles.paymentPending}`}>
                                                        {order.payment_status === 'completed' ? '✓ បានបង់' : '◎ រង់ចាំបង់'}
                                                    </span>
                                                    <span className={styles.orderTotal}>{order.total_price?.toLocaleString()} ៛</span>
                                                </div>
                                            </div>

                                            <div className={styles.orderBody}>
                                                <div className={styles.orderMeta}>
                                                    <div className={styles.orderMetaCell}>
                                                        <span className={styles.orderMetaLabel}>ផលិតផល</span>
                                                        <span className={styles.orderMetaValue}>{order.crop_name}</span>
                                                        <span style={{ fontSize: 12, color: 'var(--color-text-lighter)' }}>{order.quantity} {order.unit}</span>
                                                    </div>
                                                    <div className={styles.orderMetaCell}>
                                                        <span className={styles.orderMetaLabel}>{isFarmer ? 'អ្នកទិញ' : 'អ្នកលក់'}</span>
                                                        <span className={styles.orderMetaValue}>
                                                            {isFarmer ? order.buyer_name : order.seller_name}
                                                        </span>
                                                    </div>
                                                    <div className={styles.orderMetaCell}>
                                                        <span className={styles.orderMetaLabel}>ស្ថានភាព</span>
                                                        <span className={styles.statusValue} style={{ color: STATUS_COLORS[order.delivery_status] }}>
                                                            {STATUS_LABELS[order.delivery_status] || order.delivery_status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={styles.trackerSection}>
                                                    <p className={styles.trackerLabel}>ដំណើរការដឹកជញ្ជូន</p>
                                                    <div className={styles.stepsWrap}>
                                                        {STATUS_SEQUENCE.map((status, i) => {
                                                            const isDone = i < currentIdx;
                                                            const isActive = i === currentIdx;
                                                            return (
                                                                <React.Fragment key={status}>
                                                                    <div className={styles.step}>
                                                                        <div className={`${styles.stepDot} ${isDone ? styles.stepDotDone : ''} ${isActive ? styles.stepDotActive : ''}`}>
                                                                            {isDone ? '✓' : i + 1}
                                                                        </div>
                                                                        <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                                                                            {STATUS_LABELS[status]}
                                                                        </span>
                                                                    </div>
                                                                    {i < STATUS_SEQUENCE.length - 1 && (
                                                                        <div className={`${styles.stepConnector} ${isDone || isActive ? styles.stepConnectorDone : ''}`} />
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className={styles.orderActions}>
                                                    {isFarmer && order.delivery_status === 'agreed' && (
                                                        <button className={`${styles.btnAction} ${styles.btnOrange}`} onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                                            ▶ ចាប់ផ្តើមរៀបចំ
                                                        </button>
                                                    )}
                                                    {isFarmer && order.delivery_status === 'preparing' && (
                                                        <button className={`${styles.btnAction} ${styles.btnBlue}`} onClick={() => updateOrderStatus(order.id, 'ready')}>
                                                            ✓ រៀបចំរួចរាល់
                                                        </button>
                                                    )}
                                                    {!isFarmer && order.delivery_status === 'ready' && (
                                                        <button className={`${styles.btnAction} ${styles.btnBlue}`} onClick={() => updateOrderStatus(order.id, 'picked_up')}>
                                                            📦 បានទទួលផលិតផល
                                                        </button>
                                                    )}
                                                    {!isFarmer && (order.delivery_status === 'picked_up' || order.delivery_status === 'in_delivery') && (
                                                        <button className={`${styles.btnAction} ${styles.btnGreen}`} onClick={() => updateOrderStatus(order.id, 'completed')}>
                                                            ✓ បញ្ជាក់ការទទួល
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                </div>
            </div>

            {/* ── Payment Modal ── */}
            {showPaymentModal && (
                <div className={styles.modalOverlay} onClick={() => { setShowPaymentModal(false); setSelectedProposal(null); }}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>💳 ការទូទាត់</h2>

                        <div className={styles.modalSummary}>
                            <div className={styles.modalSummaryTotal}>
                                <span>សរុប</span>
                                <span>{modalTotal.toLocaleString()} ៛</span>
                            </div>
                            <p className={styles.modalSummaryCount}>{modalSubtitle}</p>
                        </div>

                        <p className={styles.payMethodTitle}>ជ្រើសរើសវិធីទូទាត់</p>

                        <label
                            className={`${styles.payOption} ${paymentMethod === 'aba' ? styles.payOptionActive : ''}`}
                            onClick={() => setPaymentMethod('aba')}
                        >
                            <span className={styles.payOptionIcon}>📱</span>
                            <div className={styles.payOptionText}>
                                <span className={styles.payOptionLabel}>ABA Mobile QR</span>
                                <span className={styles.payOptionDesc}>ស្កេន QR ហើយទូទាត់ភ្លាមៗ</span>
                            </div>
                            <input type="radio" name="payment" value="aba" checked={paymentMethod === 'aba'} onChange={() => setPaymentMethod('aba')} style={{ marginLeft: 'auto' }} />
                        </label>

                        <label
                            className={`${styles.payOption} ${paymentMethod === 'cash' ? styles.payOptionActive : ''}`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <span className={styles.payOptionIcon}>💵</span>
                            <div className={styles.payOptionText}>
                                <span className={styles.payOptionLabel}>សាច់ប្រាក់នៅពេលទទួល</span>
                                <span className={styles.payOptionDesc}>ទូទាត់នៅពេលផលិតផលមកដល់</span>
                            </div>
                            <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} style={{ marginLeft: 'auto' }} />
                        </label>

                        {paymentMethod === 'aba' && (
                            <div className={styles.qrBox}>
                                <img src={abaQr} alt="ABA QR" className={styles.qrImage} />
                                <p className={styles.qrLabel}>ស្កេន QR ដោយ ABA Mobile</p>
                            </div>
                        )}
                        {paymentMethod === 'cash' && (
                            <div className={styles.cashBox}>
                                អ្នកនឹងបង់ប្រាក់សាច់ប្រាក់នៅពេលផលិតផលមកដល់
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => { setShowPaymentModal(false); setSelectedProposal(null); }}>
                                បោះបង់
                            </button>
                            <button className={styles.btnConfirm} onClick={handleConfirmPayment}>
                                {paymentMode === 'proposal' ? 'ទទួលយក & ទូទាត់' : 'បង្កើតការបញ្ជាទិញ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default CartPage;
