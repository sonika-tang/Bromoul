import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockDB';
import styles from '../styles/Marketplace.module.css';

/* ── Inline icons ─────────────────────────────────────────── */
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconScale = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-3 6a3 3 0 006 0z" /><path d="M19 7l3 6a3 3 0 01-6 0z" /><path d="M8 21h8" />
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-5h16l1 5" /><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" /><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const Marketplace = ({ userRole, user }) => {
  const [listings, setListings] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const crops = db._read('crops');
  const users = db._read('users');

  // Farmers see supermarket demand requests; buyers see farmer supply listings
  const isFarmer = userRole === 'farmer';
  const visibleType = isFarmer ? 'demand' : 'supply';

  useEffect(() => {
    loadListings();
    const handleUpdate = () => loadListings();
    window.addEventListener('listingsUpdated', handleUpdate);
    window.addEventListener('db_update_listings', handleUpdate);
    return () => {
      window.removeEventListener('listingsUpdated', handleUpdate);
      window.removeEventListener('db_update_listings', handleUpdate);
    };
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const allListings = await db.get('listings');
      setListings(allListings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(item => {
    const typeMatch = item.type === visibleType;
    const cropMatch = !selectedCrop || item.crop_id === selectedCrop;
    return typeMatch && cropMatch;
  });

  const handleChat = (listing) => {
    localStorage.setItem('bromoul:chatWithUserId', listing.user_id);
    navigate('/chat');
  };

  // Buyer adds supply listing to cart
  const handleAddToCart = (listing) => {
    const cart = JSON.parse(localStorage.getItem('bromoul:cart') || '[]');
    cart.push({ ...listing, cartId: Date.now().toString(), quantity: 1 });
    localStorage.setItem('bromoul:cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToast({ text: `បានបន្ថែមទៅកន្ត្រក!`, color: '#4CAF50', shadow: 'rgba(76,175,80,0.35)' });
    setTimeout(() => setToast(null), 2500);
  };

  // Farmer submits a supply proposal in response to a demand listing
  const handlePropose = (listing) => {
    const crop = crops.find(c => c.id === listing.crop_id);
    const buyer = users.find(u => u.id === listing.user_id);
    const proposal = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      proposal: true,
      seller_id: user.id,
      buyer_id: listing.user_id,
      listing_id: listing.id,
      crop_id: listing.crop_id,
      crop_name: crop?.name_kh || listing.crop_id,
      quantity: listing.quantity,
      unit: listing.unit || 'គីឡូ',
      price_riel: listing.budget_riel,
      total_price: (listing.budget_riel || 0) * listing.quantity,
      payment_status: 'pending',
      delivery_status: 'offered',
      seller_name: user?.name || 'កសិករ',
      buyer_name: buyer?.name || 'ផ្សារទំនើប',
      photo_url: listing.photo_url || crop?.image || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      delivery_history: [{
        status: 'offered',
        timestamp: new Date().toISOString(),
        message: 'កសិករបានស្នើផ្គត់ផ្គង់',
      }],
    };
    const allOrders = db._read('orders') || [];
    db._write('orders', [...allOrders, proposal]);
    setToast({ text: 'បានស្នើ! ផ្សារទំនើបនឹងទូទាត់ប្រាក់', color: '#FF9800', shadow: 'rgba(255,152,0,0.35)' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('តើប្រាកដថាលុបចេញទេ?')) {
      await db.delete('listings', listingId);
      loadListings();
    }
  };

  const visibleCount = listings.filter(l => l.type === visibleType).length;

  return (
    <div className={styles.page}>

      {/* ─── Hero Header ───────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
        <div className="container">
          <div className={styles.heroInner}>
            <span className={styles.tag}>ផ្សារ · Psar</span>
            <h1 className={styles.title}>
              {isFarmer
                ? <><span className={styles.titleAccent}>សំណើ</span>ពីផ្សារទំនើប</>
                : <>ផលិតផល<span className={styles.titleAccent}>កសិករ</span></>
              }
            </h1>
            <p className={styles.subtitle}>
              {isFarmer
                ? 'មើលអ្វីដែលផ្សារទំនើបកំពុងត្រូវការ — ស្នើផ្គត់ផ្គង់ ហើយទទួលប្រាក់'
                : 'ស្វែងរកផលិតផលស្រស់ ដោយផ្ទាល់ពីកសិករ — គ្មានឈ្មួញកណ្តាល'
              }
            </p>
            <div className={styles.statsBar}>
              <div className={styles.stat}>
                <strong>{visibleCount}</strong>
                <span>{isFarmer ? 'សំណើទិញ' : 'ផលិតផល'}</span>
              </div>
              <div className={styles.statLine} />
              <div className={styles.stat}>
                <strong>{crops.length}</strong>
                <span>ប្រភេទដំណាំ</span>
              </div>
              <div className={styles.statLine} />
              <div className={styles.stat}>
                <strong>{users.length}</strong>
                <span>អ្នកប្រើ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Content ───────────────────────────────────────────── */}
      <div className={styles.content}>
        <div className="container">

          {/* Role label */}
          <div className={styles.controls}>
            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${isFarmer ? styles.tabActiveDemand : styles.tabActiveSupply}`}
                style={{ cursor: 'default' }}
              >
                {isFarmer
                  ? <><IconStore /> សំណើពីផ្សារទំនើប</>
                  : <><IconUser /> ផលិតផលកសិករ</>
                }
              </div>
            </div>
          </div>

          {/* Crop filter chips */}
          <div className={styles.cropFilter}>
            <button
              onClick={() => setSelectedCrop('')}
              className={`${styles.cropChip} ${selectedCrop === '' ? styles.cropChipActive : ''}`}
            >
              គ្រប់ដំណាំ
            </button>
            {crops.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCrop(c.id)}
                className={`${styles.cropChip} ${selectedCrop === c.id ? styles.cropChipActive : ''}`}
              >
                {c.name_kh}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && <div className={styles.loading}>កំពុងដំណើរការ...</div>}

          {/* Grid */}
          {!loading && (
            <div className={styles.grid}>
              {filteredListings.length === 0 ? (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                    </svg>
                  </span>
                  {isFarmer ? 'គ្មានសំណើពីផ្សារទំនើបទេ' : 'គ្មានផលិតផលកសិករទេ'}
                </div>
              ) : (
                filteredListings.map(listing => {
                  const crop = crops.find(c => c.id === listing.crop_id);
                  const party = users.find(u => u.id === listing.user_id);
                  const isMyListing = user?.id === listing.user_id;
                  const isSupply = listing.type === 'supply';
                  const image = listing.photo_url || crop?.image;

                  return (
                    <div key={listing.id} className={styles.card}>
                      {/* Image */}
                      <div className={styles.imageWrap}>
                        <img src={image} alt={crop?.name_kh} className={styles.image} loading="lazy" />
                        <span className={`${styles.typeBadge} ${isSupply ? styles.typeSupply : styles.typeDemand}`}>
                          {isSupply ? 'ផលិតផល' : 'សំណើទិញ'}
                        </span>
                        {crop?.season && (
                          <span className={styles.seasonBadge}>
                            <IconCalendar /> {crop.season}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className={styles.body}>
                        <h3 className={styles.cropName}>{crop?.name_kh}</h3>
                        {crop?.name_en && <div className={styles.nameEn}>{crop.name_en}</div>}

                        <div className={styles.meta}>
                          <div className={styles.metaRow}>
                            <IconScale />
                            បរិមាណ៖ {listing.quantity?.toLocaleString()} {listing.unit}
                          </div>
                          <div className={styles.metaRow}>
                            <IconPin />
                            {listing.location}
                          </div>
                          <div className={styles.metaRow}>
                            {isSupply ? <IconUser /> : <IconStore />}
                            <span className={styles.party}>
                              {party?.name || (isSupply ? 'កសិករ' : 'ផ្សារទំនើប')}
                              {party?.verified && (
                                <span className={styles.verified}><IconCheck /> ផ្ទៀងផ្ទាត់</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className={styles.price}>
                          <span className={`${styles.priceValue} ${isSupply ? styles.priceSupply : styles.priceDemand}`}>
                            {(isSupply ? listing.price_riel : listing.budget_riel)?.toLocaleString()} ៛
                          </span>
                          <span className={styles.priceUnit}>
                            {isSupply ? `/ ${listing.unit}` : `/ ${listing.unit} (ថវិកា)`}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                          <button onClick={() => handleChat(listing)} className={styles.btnChat}>
                            <IconChat /> ឆាត
                          </button>

                          {/* Farmer: propose to supply this demand */}
                          {isFarmer && !isMyListing && (
                            <button onClick={() => handlePropose(listing)} className={styles.btnPropose}>
                              ✓ ស្នើផ្គត់ផ្គង់
                            </button>
                          )}

                          {/* Buyer: add farmer supply to cart */}
                          {!isFarmer && !isMyListing && (
                            <button onClick={() => handleAddToCart(listing)} className={styles.btnCart}>
                              + កន្ត្រក
                            </button>
                          )}

                          {isMyListing && (
                            <button onClick={() => handleDeleteListing(listing.id)} className={styles.btnDelete}>
                              លុប
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 2000,
          background: `linear-gradient(135deg, ${toast.color} 0%, ${toast.color}cc 100%)`,
          color: '#fff', padding: '14px 20px', borderRadius: 12,
          fontSize: 14, fontWeight: 700,
          boxShadow: `0 8px 24px ${toast.shadow}`,
          pointerEvents: 'none',
        }}>
          ✓ {toast.text}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
