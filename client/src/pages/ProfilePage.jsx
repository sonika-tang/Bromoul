import React, { useState } from 'react';
import { db } from '../services/mockDB';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = ({ user, onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    crop_id: 'c1',
    quantity: '',
    unit: 'គីឡូ',
    price: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);

  const crops = db._read('crops');
  const currentUser = db.getCurrentUser();
  const currentRole = db.getCurrentRole();

  const handleRoleSwitch = (role) => {
    db.setCurrentRole(role);
    if (onRoleChange) onRoleChange();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        user_id: currentUser.id,
        crop_id: formData.crop_id,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        type: currentRole === 'farmer' ? 'supply' : 'demand',
        status: 'active'
      };

      if (currentRole === 'farmer') {
        payload.price_riel = Number(formData.price);
        payload.certification = formData.certification;
        payload.description = `${crops.find(c => c.id === formData.crop_id)?.name_kh} - ${formData.quantity} ${formData.unit}`;
        payload.photo_url = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(crops.find(c => c.id === formData.crop_id)?.name_kh || 'Crop');
      } else {
        payload.budget_riel = Number(formData.budget);
        payload.duration = '៧ ថ្ងៃ';
        payload.description = `ត្រូវការ ${crops.find(c => c.id === formData.crop_id)?.name_kh}`;
      }

      await db.create('listings', payload);
      alert('បានបង្កើតលក់ដំណាំជោគជ័យ!');
      setFormData({
        crop_id: 'c1',
        quantity: '',
        unit: 'គីឡូ',
        price: '',
        budget: '',
      });
      window.dispatchEvent(new Event('listingsUpdated'));
    } catch (err) {
      console.error(err);
      alert('មានបញ្ហា៖ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.container}`} style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* User Profile Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '24px',
        background: '#f9f9f9',
        borderRadius: '12px'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #FF9800)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: 'white'
        }}>
          {currentRole === 'farmer' ? '' : ''}
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          {currentUser?.name || 'ឈ្មោះអ្នកប្រើប្រាស់'}
        </h1>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          {currentRole === 'farmer' ? 'កសិករផលិតកម្ម' : 'អ្នកទិញផលិតផល'}
        </p>

        {/* Role Switcher */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <button
            onClick={() => handleRoleSwitch('farmer')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              background: currentRole === 'farmer' ? '#4CAF50' : '#e0e0e0',
              color: currentRole === 'farmer' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            កសិករ
          </button>
          <button
            onClick={() => handleRoleSwitch('buyer')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              background: currentRole === 'buyer' ? '#FF9800' : '#e0e0e0',
              color: currentRole === 'buyer' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            អ្នកទិញ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e0e0e0', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            borderBottom: activeTab === 'info' ? '2px solid #4CAF50' : 'none',
            color: activeTab === 'info' ? '#4CAF50' : '#757575',
            marginBottom: '-2px'
          }}
        >
          ព័ត៌មាន
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            borderBottom: activeTab === 'listings' ? '2px solid #4CAF50' : 'none',
            color: activeTab === 'listings' ? '#4CAF50' : '#757575',
            marginBottom: '-2px'
          }}
        >
          បង្កើត
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' && (
        <div style={{ width: '350px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ឈ្មោះ</label>
              <p style={{ margin: '0', color: '#333' }}>{currentUser?.name}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ទំនាក់ទំនង</label>
              <p style={{ margin: '0', color: '#333' }}>{currentUser?.contact}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ទីតាំង</label>
              <p style={{ margin: '0', color: '#333' }}>{currentUser?.location}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ការផ្ទៀងផ្ទាត់</label>
              <p style={{ margin: '0', color: currentUser?.verified ? '#4CAF50' : '#FF9800' }}>
                {currentUser?.verified ? '✓ បានផ្ទៀងផ្ទាត់' : '◯ រង់ចាំការផ្ទៀងផ្ទាត់'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div style={{ width: '350px', margin: '0 auto' }}>
          <form onSubmit={handleSubmitListing} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ marginTop: '0', marginBottom: '24px' }}>
              {currentRole === 'farmer' ? 'ដាក់លក់ផលិតផល' : 'សរសេរសំណើ'}
            </h3>

            {/* Crop Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ដំណាំ</label>
              <select
                name="crop_id"
                value={formData.crop_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'Noto Sans Khmer'
                }}
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name_kh}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>បរិមាណ (គីឡូក្រាម)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="ឧ. 100"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Price (Farmer only) */}
            {currentRole === 'farmer' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>តម្លៃក្នុង១ឯកតា (៛)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="ឧ. 2000"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </>
            )}

            {/* Budget (Buyer only) */}
            {currentRole === 'buyer' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>ថវិកា (៛)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="ឧ. 5000"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                background: currentRole === 'farmer' ? '#4CAF50' : '#FF9800',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
            >
              {loading ? 'កំពុងបង្កើត...' : 'បង្កើត'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;