import React, { useState } from 'react';
import logo from '../assets/Bromoul-logo.png';
import styles from './RoleSelectPage.module.css';

const RoleSelectPage = ({ onSelect }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="ប្រមូល" className={styles.logo} style={{ width: 200, height: 'auto', borderRadius: '8px' }}/>
        </div>

        <h1 className={styles.title}>សូមស្វាគមន៍មកកាន់ ប្រមូល</h1>
        <p className={styles.subtitle}>
          អ្នកជានរណា?
        </p>

        <div className={styles.cards}>
          {/* Farmer card */}
          <button
            className={`${styles.card} ${styles.cardFarmer} ${hovered === 'farmer' ? styles.cardHovered : ''}`}
            onMouseEnter={() => setHovered('farmer')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('farmer')}
          >
            <h2 className={styles.cardTitle}>កសិករ</h2>
            <p className={styles.cardRole}>Farmer</p>
            <p className={styles.cardDesc}>
              ដាក់លក់ផលិតផលរបស់អ្នកដោយផ្ទាល់ទៅផ្សារទំនើប
              ដោយគ្មានឈ្មួញកណ្តាល
            </p>
            <ul className={styles.cardFeatures}>
              <li>✓ ដាក់លក់ផលិតផល</li>
              <li>✓ ភ្ជាប់ជាមួយផ្សារទំនើប</li>
              <li>✓ មើលតម្លៃ និងទិន្នន័យទីផ្សារ</li>
            </ul>
            <div className={styles.cardBtn}>ចូលជាកសិករ</div>
          </button>

          {/* Supermarket card */}
          <button
            className={`${styles.card} ${styles.cardBuyer} ${hovered === 'buyer' ? styles.cardHovered : ''}`}
            onMouseEnter={() => setHovered('buyer')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('buyer')}
          >
            <h2 className={styles.cardTitle}>ផ្សារទំនើប</h2>
            <p className={styles.cardRole}>Supermarket</p>
            <p className={styles.cardDesc}>
              ស្វែងរកផលិតផលកសិកម្មក្នុងស្រុក ពីកសិករជាច្រើននៅទូទាំងប្រទេស
            </p>
            <ul className={styles.cardFeatures}>
              <li>✓ ស្វែងរកផលិតផលកសិកម្ម</li>
              <li>✓ ដាក់សំណើទិញ</li>
              <li>✓ ទំនាក់ទំនងផ្ទាល់ជាមួយកសិករ</li>
            </ul>
            <div className={styles.cardBtn}>ចូលជាផ្សារទំនើប</div>
          </button>
        </div>

        <p className={styles.note}>
          អ្នកអាចផ្លាស់ប្តូរតួនាទីបានពីទំព័រ <strong>គណនី</strong> នៅពេលណាក៏បាន
        </p>
      </div>
    </div>
  );
};

export default RoleSelectPage;
