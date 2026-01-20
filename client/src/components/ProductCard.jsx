
import React from 'react';
import styles from '../styles/ProductCard.module.css';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isRequest }) => {
    const navigate = useNavigate();

    const handleChat = (e) => {
        e.stopPropagation();
        // In a real app we would create a conversation ID and navigate to it.
        // For now, let's navigate to chat. Ideally passing state.
        navigate('/chat');
        // We could also call API to "Start Conversation" if not exists.
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {/* Use product photo or placeholder */}
                <img src={product.photo_url || 'https://placehold.co/600x400/png'} alt={product.name} className={styles.image} />
                {product.certification && product.certification !== 'None' && (
                    <span className={styles.badge}>{product.certification}</span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{product.name}</h3>
                    <span className={styles.price}>
                        {isRequest
                            ? `Budget: ${(product.budget || 0).toLocaleString()} ៛`
                            : `${(product.price || 0).toLocaleString()} ៛`}
                    </span>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>បរិមាណ (Qty):</span>
                        <span className={styles.value}>{product.quantity} {product.unit}</span>
                    </div>
                </div>

                <div className={styles.footer}>
                    {/* Show seller/buyer name if available */}
                    <span className={styles.user}>{isRequest ? 'Buyer' : 'Farmer'} #{product.user_id}</span>

                    <div className={styles.actions}>
                        <button className={styles.chatBtn} onClick={handleChat}>
                            💬 ឆាត (Chat)
                        </button>
                        {/* Only show "Add to Cart" for Supply items */}
                        {!isRequest && <button
                            className={styles.cartBtn}
                            onClick={() => {
                                // Add to local storage cart for now
                                const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');
                                cart.push(product);
                                localStorage.setItem('cart_items', JSON.stringify(cart));
                                window.dispatchEvent(new Event('cartUpdated'));
                                alert('បានបញ្ចូលទៅកន្ត្រក!');
                            }}
                        >
                            + កន្ត្រក
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
