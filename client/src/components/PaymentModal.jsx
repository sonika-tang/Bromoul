
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from '../styles/PaymentModal.module.css';

const PaymentModal = ({ onClose, onConfirm, totalAmount }) => {
    const [method, setMethod] = useState('aba'); // aba | cash
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('pending'); // pending | paid

    // Parse amount string "50,000 ៛" -> 50000
    const numericAmount = parseInt(totalAmount.replace(/\D/g, '')) || 0;

    useEffect(() => {
        if (method === 'aba' && !qrData) {
            generateQr();
        }
    }, [method]);

    const generateQr = async () => {
        setLoading(true);
        try {
            // Simulate Order ID for QR generation (real order created after confirmation usually, or before)
            // Here we generate generic QR
            const res = await api.post('/payments/aba/qr', { order_id: 'TEMP', amount_riel: numericAmount });
            setQrData(res.data);

            // Start Polling simulation
            setTimeout(() => {
                setStatus('paid');
            }, 5000); // Auto-pay after 5s for Demo

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>ការទូទាត់ (Payment): {totalAmount}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.methods}>
                        <button className={`${styles.methodBtn} ${method === 'aba' ? styles.active : ''}`} onClick={() => setMethod('aba')}>ABA</button>
                        <button className={`${styles.methodBtn} ${method === 'cash' ? styles.active : ''}`} onClick={() => setMethod('cash')}>សាច់ប្រាក់ (Cash)</button>
                    </div>

                    {method === 'cash' ? (
                        <div className={styles.cashInfo}>
                            <p>សូមទូទាត់សាច់ប្រាក់នៅពេលដឹកជញ្ជូនដល់។</p>
                            <p>(Please pay cash on delivery)</p>
                            <button className={styles.confirmBtn} onClick={onConfirm}>បញ្ជាក់ (Confirm)</button>
                        </div>
                    ) : (
                        <div className={styles.qrSection}>
                            {loading ? <p>Generating QR...</p> : (
                                qrData && (
                                    <>
                                        <img src={qrData.qr_image} alt="ABA QR" className={styles.qrImage} />
                                        <p className={styles.scanText}>Scan to pay with ABA Mobile</p>

                                        {status === 'paid' ? (
                                            <div className={styles.successMsg}>
                                                ការទូទាត់ជោគជ័យ! (Paid)
                                                <button className={styles.confirmBtn} onClick={onConfirm}>បន្ត (Continue)</button>
                                            </div>
                                        ) : (
                                            <div className={styles.pendingMsg}>កំពុងរង់ចាំការទូទាត់...</div>
                                        )}
                                    </>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
