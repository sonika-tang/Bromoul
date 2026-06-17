import React, { useState, useRef } from 'react';
import { db } from '../services/mockDB';
import styles from '../styles/ProfilePage.module.css';

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconUpload = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
  </svg>
);

const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ProfilePage = ({ onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    crop_id: 'c1',
    quantity: '',
    unit: 'គីឡូ',
    price: '',
    budget: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const crops = db._read('crops');
  const currentUser = db.getCurrentUser();
  const currentRole = db.getCurrentRole();

  const handleRoleSwitch = (role) => {
    db.setCurrentRole(role);
    if (onRoleChange) onRoleChange();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
      setPhotoBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    handleImageFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const crop = crops.find(c => c.id === formData.crop_id);
      const payload = {
        user_id: currentUser.id,
        crop_id: formData.crop_id,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        type: currentRole === 'farmer' ? 'supply' : 'demand',
        status: 'active',
        location: currentUser.location || 'ភ្នំពេញ',
        photo_url: photoBase64 || crop?.image || null,
      };

      if (currentRole === 'farmer') {
        payload.price_riel = Number(formData.price);
        payload.description = `${crop?.name_kh} - ${formData.quantity} ${formData.unit}`;
      } else {
        payload.budget_riel = Number(formData.budget);
        payload.duration = '៧ ថ្ងៃ';
        payload.description = `ត្រូវការ ${crop?.name_kh}`;
      }

      await db.create('listings', payload);
      alert('បានបង្កើតការដាក់លក់ជោគជ័យ!');
      setFormData({ crop_id: 'c1', quantity: '', unit: 'គីឡូ', price: '', budget: '' });
      setPhotoPreview(null);
      setPhotoBase64(null);
      window.dispatchEvent(new Event('listingsUpdated'));
    } catch (err) {
      console.error(err);
      alert('មានបញ្ហា៖ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const emoji = currentRole === 'farmer' ? '' : '';

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.avatarRing}>
              <div className={styles.avatarInner}>{emoji}</div>
            </div>
            <h1 className={styles.heroName}>{currentUser?.name || 'ឈ្មោះអ្នកប្រើប្រាស់'}</h1>
            <span className={`${styles.tag} ${currentRole === 'buyer' ? styles.tagBuyer : ''}`}>
              {currentRole === 'farmer' ? 'កសិករផលិតកម្ម' : 'អ្នកទិញ · ផ្សារទំនើប'}
            </span>

            {/* Role switcher */}
            <div className={styles.roleSwitcher}>
              <button
                onClick={() => handleRoleSwitch('farmer')}
                className={`${styles.roleBtn} ${currentRole === 'farmer' ? styles.roleBtnActiveFarmer : ''}`}
              >
                🌾 កសិករ
              </button>
              <button
                onClick={() => handleRoleSwitch('buyer')}
                className={`${styles.roleBtn} ${currentRole === 'buyer' ? styles.roleBtnActiveBuyer : ''}`}
              >
                🏪 អ្នកទិញ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className={styles.content}>
        <div className="container">
          <div className={styles.inner}>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                onClick={() => setActiveTab('info')}
                className={`${styles.tab} ${activeTab === 'info' ? styles.tabActive : ''}`}
              >
                ព័ត៌មានគណនី
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`${styles.tab} ${activeTab === 'listings' ? styles.tabActive : ''}`}
              >
                {currentRole === 'farmer' ? 'ដាក់លក់ផលិតផល' : 'សរសេរសំណើ'}
              </button>
            </div>

            {/* Info tab */}
            {activeTab === 'info' && (
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ឈ្មោះ</span>
                  <span className={styles.infoValue}>{currentUser?.name}</span>
                </div>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>អ៊ីម៉ែល</span>
                  <span className={styles.infoValue}>{currentUser?.email || '—'}</span>
                </div>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ទំនាក់ទំនង</span>
                  <span className={styles.infoValue}>{currentUser?.contact || '—'}</span>
                </div>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ទីតាំង</span>
                  <span className={styles.infoValue}>{currentUser?.location || '—'}</span>
                </div>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ការផ្ទៀងផ្ទាត់</span>
                  {currentUser?.verified ? (
                    <span className={styles.verifiedBadge}><IconCheck /> បានផ្ទៀងផ្ទាត់</span>
                  ) : (
                    <span className={styles.pendingBadge}>◯ រង់ចាំការផ្ទៀងផ្ទាត់</span>
                  )}
                </div>
              </div>
            )}

            {/* Listings tab */}
            {activeTab === 'listings' && (
              <form onSubmit={handleSubmitListing} className={styles.formCard}>
                <h3 className={styles.formTitle}>
                  {currentRole === 'farmer' ? 'ដាក់លក់ផលិតផលថ្មី' : 'សរសេរសំណើទិញ'}
                </h3>

                {/* Image upload */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>រូបភាពផលិតផល</label>
                  <div
                    className={`${styles.imageUpload} ${dragOver ? styles.imageUploadActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="preview" className={styles.imagePreview} />
                        <div className={styles.imageUploadOverlay}>
                          <IconCamera />
                          ប្ដូររូបភាព
                        </div>
                      </>
                    ) : (
                      <>
                        <IconUpload className={styles.uploadIcon} />
                        <span className={styles.uploadText}>ចុច ឬ អូស​រូបភាព​ទីនេះ</span>
                        <span className={styles.uploadHint}>JPG, PNG — អតិបរិមា 2MB</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Crop */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ប្រភេទដំណាំ</label>
                  <select
                    name="crop_id"
                    value={formData.crop_id}
                    onChange={handleChange}
                    required
                    className={styles.formSelect}
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.id}>{c.name_kh} — {c.name_en}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>បរិមាណ (គីឡូក្រាម)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="ឧ. 100"
                    required
                    min="1"
                    className={styles.formInput}
                  />
                </div>

                {/* Price — farmer only */}
                {currentRole === 'farmer' && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>តម្លៃក្នុង ១ គីឡូ (៛)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="ឧ. 2000"
                      required
                      min="1"
                      className={styles.formInput}
                    />
                  </div>
                )}

                {/* Budget — buyer only */}
                {currentRole === 'buyer' && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ថវិកា (៛)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="ឧ. 5000"
                      required
                      min="1"
                      className={styles.formInput}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={currentRole === 'farmer' ? styles.btnSubmitFarmer : styles.btnSubmitBuyer}
                >
                  {loading ? 'កំពុងបង្កើត...' : (currentRole === 'farmer' ? 'ដាក់លក់' : 'ដាក់សំណើ')}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
