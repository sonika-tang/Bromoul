import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockDB';
import styles from '../styles/Marketplace.module.css';

const Marketplace = ({ userRole, user }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [listings, setListings] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const crops = db._read('crops');

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
    const typeMatch = item.type === (activeTab === 'products' ? 'supply' : 'demand');
    const cropMatch = !selectedCrop || item.crop_id === selectedCrop;
    return typeMatch && cropMatch;
  });

  const handleChat = (listing) => {
    const otherUserId = listing.user_id;
    
    // Store the target user ID to open chat with
    localStorage.setItem('bromoul:chatWithUserId', otherUserId);
    
    // Navigate to messages page
    navigate('/chat');
  };

  const handleAddToCart = (listing) => {
    const cart = JSON.parse(localStorage.getItem('bromoul:cart') || '[]');
    cart.push({
      ...listing,
      cartId: Date.now().toString()
    });
    localStorage.setItem('bromoul:cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('បានបន្ថែមទៅកន្ត្រក!');
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('តើប្រាកដថាលុបចេញទេ?')) {
      await db.delete('listings', listingId);
      loadListings();
    }
  };

  return (
    <div className={`container ${styles.container}`} style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>
          ផ្សារ
        </h1>
      </div>

      {/* Tabs and Filter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'products' ? '2px solid #4CAF50' : 'none',
              color: activeTab === 'products' ? '#4CAF50' : '#757575',
              marginBottom: '-2px'
            }}
          >
            ផលិតផលកសិករ
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'requests' ? '2px solid #FF9800' : 'none',
              color: activeTab === 'requests' ? '#FF9800' : '#757575',
              marginBottom: '-2px'
            }}
          >
            សំណើអ្នកទិញ
          </button>
        </div>

        {/* Filter by Crop */}
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Noto Sans Khmer'
          }}
        >
          <option value="">គ្រប់ដំណាំ</option>
          {crops.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name_kh}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          កំពុងដំណើរការ...
        </div>
      )}

      {/* Listings Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredListings.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#999'
            }}>
              គ្មានលក់ដំណាំទេ
            </div>
          ) : (
            filteredListings.map(listing => {
              const crop = crops.find(c => c.id === listing.crop_id);
              const isMyListing = user?.id === listing.user_id;

              return (
                <div
                  key={listing.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
                >
                  {/* Image */}
                  <div style={{
                    height: '200px',
                    background: '#f0f0f0',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={listing.photo_url || 'https://via.placeholder.com/400x300'}
                      alt={crop?.name_kh}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>
                        {crop?.icon} {crop?.name_kh}
                      </h3>
                      <span style={{
                        background: listing.type === 'supply' ? '#e8f5e9' : '#fff3e0',
                        color: listing.type === 'supply' ? '#2e7d32' : '#f57c00',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {listing.type === 'supply' ? 'ផលិតផល' : 'សំណើ'}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                      <p style={{ margin: '4px 0' }}>
                        បរិមាណ៖ {listing.quantity} {listing.unit}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        📍 {listing.location}
                      </p>
                      {listing.type === 'supply' && (
                        <p style={{ margin: '4px 0', fontWeight: '600', color: '#4CAF50' }}>
                          {listing.price_riel?.toLocaleString()} ៛
                        </p>
                      )}
                      {listing.type === 'demand' && (
                        <p style={{ margin: '4px 0', fontWeight: '600', color: '#FF9800' }}>
                          ថវិកា៖ {listing.budget_riel?.toLocaleString()} ៛
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleChat(listing)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #e0e0e0',
                          background: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          color: '#4CAF50'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e8f5e9';
                          e.currentTarget.style.borderColor = '#4CAF50';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        ឆាត
                      </button>

                      {listing.type === 'supply' && !isMyListing && (
                        <button
                          onClick={() => handleAddToCart(listing)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            background: '#4CAF50',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#43a047'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}
                        >
                          + កន្ត្រក
                        </button>
                      )}

                      {isMyListing && (
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #d32f2f',
                            background: 'white',
                            color: '#d32f2f',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ffebee';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
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
  );
};

export default Marketplace;