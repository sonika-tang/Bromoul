import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import styles from './LandingPage.module.css';

const LandingPage = () => {
    return (
        <div className={styles.landing}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={`container ${styles.heroContainer}`}>
                    <h1 className={styles.heroTitle}>
                        កន្លែងដែលកសិកម្មកម្ពុជា <br />
                        <span className={styles.highlight}>ជួបតម្រូវការទីផ្សារពិតប្រាកដ</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        ភ្ជាប់ទំនាក់ទំនងផ្ទាល់ជាមួយកសិករ និងអ្នកទិញដែលមានការផ្ទៀងផ្ទាត់ តាមរយៈប្រព័ន្ធផ្សារ និងបណ្តាញដឹកជញ្ជូនដ៏មានតម្លាភាព។
                    </p>
                    {/* <div className={styles.heroActions}>
                        <Link to="/Marketplace" onClick={() => localStorage.setItem('bromoul:role', 'farmer')}>
                            <Button variant="primary" className={styles.ctaBtn}>ចូលជាកសិករ</Button>
                        </Link>
                        <Link to="/Marketplace" onClick={() => localStorage.setItem('bromoul:role', 'buyer')}>
                            <Button variant="secondary" className={styles.ctaBtn}>ចូលជាអ្នកទិញ</Button>
                        </Link>
                    </div> */}
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>ហេតុអ្វីជ្រើសរើស ប្រមូល?</h2>
                    <div className={styles.featureGrid}>
                        <Card className={styles.featureCard}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#e8f5e9', color: '#4CAF50' }}>

                            </div>
                            <h3 className={styles.featureTitle}>ផ្សារ (Psar)</h3>
                            <p className={styles.featureText}>ទទួលបានកសិផលស្រស់ៗដោយផ្ទាល់ ជាមួយតម្លៃច្បាស់លាស់ និងគុណភាពដែលបានបញ្ជាក់។</p>
                        </Card>
                        <Card className={styles.featureCard}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#fff3e0', color: '#FF9800' }}>

                            </div>
                            <h3 className={styles.featureTitle}>សំណើស្វែងរក</h3>
                            <p className={styles.featureText}>អ្នកទិញអាចប្រកាសពីតម្រូវការ ហើយកសិករយើងអាចដេញថ្លៃដើម្បីផ្គត់ផ្គង់។</p>
                        </Card>
                        <Card className={styles.featureCard}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#e3f2fd', color: '#2196F3' }}>

                            </div>
                            <h3 className={styles.featureTitle}>ការដឹកជញ្ជូន</h3>
                            <p className={styles.featureText}>ប្រព័ន្ធតាមដានការដឹកជញ្ជូន និងគណនាតម្លៃដឹក ទាំងការដឹកធម្មតា និងដឹកត្រជាក់។</p>
                        </Card>
                        <Card className={styles.featureCard}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: '#f3e5f5', color: '#9C27B0' }}>

                            </div>
                            <h3 className={styles.featureTitle}>ទំនុកចិត្ត</h3>
                            <p className={styles.featureText}>ប្រព័ន្ធសម្គាល់កសិករដែលមានការបញ្ជាក់ និងអាចតាមដានប្រភពកសិផលតាម QR។</p>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
