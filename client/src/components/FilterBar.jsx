
import React from 'react';
import styles from '../styles/FilterBar.module.css';

const FilterBar = ({
    filters,
    onFilterChange,
    userRole,
    setUserRole,
    crops,
    regions = ['Battambang', 'Kampot', 'Kampong Speu', 'Pursat'],
    isKhmer = false
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.roleToggle}>
                <button
                    className={`${styles.roleBtn} ${userRole === 'farmer' ? styles.active : ''}`}
                    onClick={() => setUserRole('farmer')}
                >
                    {isKhmer ? 'ខ្ញុំជាកសិករ' : 'I am a Farmer'}
                </button>
                <button
                    className={`${styles.roleBtn} ${userRole === 'buyer' ? styles.active : ''}`}
                    onClick={() => setUserRole('buyer')}
                >
                    {isKhmer ? 'ខ្ញុំជាអ្នកទិញ' : 'I am a Buyer'}
                </button>
            </div>

            <div className={styles.controls}>
                <select
                    value={filters.cropId || ''}
                    onChange={(e) => onFilterChange('cropId', e.target.value)}
                    className={styles.select}
                >
                    <option value="">{isKhmer ? 'គ្រប់ដំណាំ' : 'All Crops'}</option>
                    {crops.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={filters.region || ''}
                    onChange={(e) => onFilterChange('region', e.target.value)}
                    className={styles.select}
                >
                    <option value="">{isKhmer ? 'គ្រប់តំបន់' : 'All Regions'}</option>
                    {regions.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                <select
                    value={filters.timeframe || ''}
                    onChange={(e) => onFilterChange('timeframe', e.target.value)}
                    className={styles.select}
                >
                    <option value="">{isKhmer ? 'គ្រប់កាលបរិច្ឆេទ' : 'All Timeframes'}</option>
                    <option value="week">{isKhmer ? 'សប្តាហ៍នេះ' : 'This Week'}</option>
                    <option value="month">{isKhmer ? 'ខែនេះ' : 'This Month'}</option>
                    <option value="quarter">{isKhmer ? 'ត្រីមាសនេះ' : 'This Quarter'}</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
