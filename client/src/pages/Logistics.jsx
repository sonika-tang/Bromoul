import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import styles from './Logistics.module.css';

const Logistics = () => {
    return (
        <div className={`container ${styles.logistics}`}>
            <h1 className={styles.title}>ឆ្លង (Chhlon) - ដឹកជញ្ជូន</h1>

            <div className={styles.grid}>
                <div className={styles.leftCol}>
                    <Card className={styles.calculator}>
                        <h2>គណនាតម្លៃដឹកជញ្ជូន</h2>
                        <form className={styles.form}>
                            <div className={styles.row}>
                                <Input label="ពី" placeholder="ឧ. បាត់ដំបង" />
                                <Input label="ទៅ" placeholder="ឧ. ភ្នំពេញ" />
                            </div>
                            <div className={styles.row}>
                                <Input label="ទម្ងន់ (kg)" type="number" placeholder="100" />
                                <div className={styles.inputGroup}>
                                    <label>ប្រភេទ</label>
                                    <select className={styles.select}>
                                        <option>រថយន្តធម្មតា</option>
                                        <option>រថយន្តត្រជាក់ (Cold Chain)</option>
                                    </select>
                                </div>
                            </div>
                            <Button fullWidth variant="primary">គណនាតម្លៃ</Button>
                        </form>

                        <div className={styles.result}>
                            <p>តម្លៃប្រហាក់ប្រហែល: <span className={styles.price}>180,000 ៛</span></p>
                            <p className={styles.note}>សេវាធម្មតា • រយៈពេល 2 ថ្ងៃ</p>
                        </div>
                    </Card>

                    <Card className={styles.tracker}>
                        <h2>តាមដានការដឹកជញ្ជូន</h2>
                        <div className={styles.trackInput}>
                            <Input placeholder="លេខកូដដឹកជញ្ជូន..." />
                            <Button>តាមដាន</Button>
                        </div>
                    </Card>
                </div>

                <div className={styles.rightCol}>
                    <Card className={styles.mapCard}>
                        <div className={styles.mapPlaceholder}>
                            <span>ផែនទីអន្តរកម្ម</span>
                            <p>មើលទីតាំងរថយន្តជាក់ស្តែង</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Logistics;
