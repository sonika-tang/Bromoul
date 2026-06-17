import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { db } from '../services/mockDB';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const getSignal = (supplyQty, demandQty) => {
    if (demandQty === 0 && supplyQty === 0) return null;
    if (supplyQty === 0)   return { label: 'ត្រូវការខ្លាំង', color: '#c62828', bg: '#ffebee', tip: 'គ្មានអ្នកលក់ ប៉ុន្តែមានអ្នកទិញ — ឱកាសធំណាស់' };
    const ratio = demandQty / supplyQty;
    if (ratio >= 2)        return { label: 'ឱកាសធំ',        color: '#e65100', bg: '#fff3e0', tip: 'តម្រូវការខ្ពស់ជាងផ្គត់ផ្គង់ច្រើនដង' };
    if (ratio >= 1)        return { label: 'ស្ទើរស្មើ',      color: '#1565c0', bg: '#e3f2fd', tip: 'តម្រូវការ និងផ្គត់ផ្គង់ស្ទើរស្មើគ្នា' };
    if (ratio > 0)         return { label: 'ផ្គត់ផ្គង់ច្រើន', color: '#2e7d32', bg: '#e8f5e9', tip: 'ផ្គត់ផ្គង់ច្រើនជាងតម្រូវការ' };
    return                        { label: 'គ្មានអ្នកទិញ',  color: '#757575', bg: '#f5f5f5', tip: 'មិនទាន់មានអ្នកទិញប្រកាស' };
};

const Analytics = () => {
    const [cropData, setCropData] = useState([]);
    const [totalDemandQty, setTotalDemandQty] = useState(0);
    const [totalSupplyQty, setTotalSupplyQty] = useState(0);

    useEffect(() => {
        const crops    = db._read('crops')    || [];
        const listings = db._read('listings') || [];

        let totalD = 0, totalS = 0;

        const data = crops.map(crop => {
            const supplyListings = listings.filter(l => l.crop_id === crop.id && l.type === 'supply');
            const demandListings = listings.filter(l => l.crop_id === crop.id && l.type === 'demand');

            const supplyQty = supplyListings.reduce((s, l) => s + Number(l.quantity || 0), 0);
            const demandQty = demandListings.reduce((s, l) => s + Number(l.quantity || 0), 0);

            const avgSupplyPrice = supplyListings.length > 0
                ? Math.round(supplyListings.reduce((s, l) => s + (l.price_riel  || 0), 0) / supplyListings.length)
                : 0;
            const avgBuyerBudget = demandListings.length > 0
                ? Math.round(demandListings.reduce((s, l) => s + (l.budget_riel || 0), 0) / demandListings.length)
                : 0;

            totalD += demandQty;
            totalS += supplyQty;

            return {
                id: crop.id,
                name: crop.name_kh,
                nameEn: crop.name_en,
                image: crop.image,
                season: crop.season,
                supplyQty,
                demandQty,
                gap: demandQty - supplyQty,
                supplyCount: supplyListings.length,
                demandCount: demandListings.length,
                avgSupplyPrice,
                avgBuyerBudget,
                signal: getSignal(supplyQty, demandQty),
            };
        }).sort((a, b) => b.gap - a.gap);

        setCropData(data);
        setTotalDemandQty(totalD);
        setTotalSupplyQty(totalS);
    }, []);

    const maxBar = Math.max(totalDemandQty, totalSupplyQty, 1);
    const hotCrop = cropData.find(c => c.demandQty > 0);

    const barData = {
        labels: cropData.map(c => c.name),
        datasets: [
            {
                label: 'ផ្គត់ផ្គង់ (Supply)',
                data: cropData.map(c => c.supplyQty),
                backgroundColor: 'rgba(76,175,80,0.75)',
                borderRadius: 6,
            },
            {
                label: 'តម្រូវការ (Demand)',
                data: cropData.map(c => c.demandQty),
                backgroundColor: 'rgba(198,40,40,0.7)',
                borderRadius: 6,
            },
        ],
    };

    return (
        <div style={{ overflow: 'hidden' }}>

            {/* Hero */}
            <section style={{
                position: 'relative',
                padding: '56px 0 44px',
                background: 'linear-gradient(165deg, #f3fbf3 0%, #fffdf5 55%, #eef6ff 100%)',
                textAlign: 'center',
                overflow: 'hidden',
                isolation: 'isolate',
            }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
                    <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(76,175,80,0.14) 0%, transparent 70%)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(33,150,243,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                </div>
                <div className="container">
                    <span style={{ display: 'inline-block', padding: '5px 16px', background: 'rgba(76,175,80,0.1)', color: '#2e7d32', borderRadius: 100, fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
                        ទីផ្សារ · Market Intelligence
                    </span>
                    <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, margin: '12px 0 8px', color: '#333' }}>
                        <span style={{ background: 'linear-gradient(120deg,#4CAF50 0%,#2196F3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            ទីផ្សារត្រូវការ
                        </span>
                        អ្វី?
                    </h1>
                    <p style={{ fontSize: 15, color: '#757575', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                        ស្វែងយល់ពីតម្រូវការពិតៗនៃទីផ្សារ — ដើម្បីជ្រើសរើសដំណាំត្រឹមត្រូវ
                    </p>
                </div>
            </section>

            {/* Content */}
            <div style={{ padding: '40px 0 80px', background: '#fafafa' }}>
                <div className="container">

                    {/* Snapshot cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
                        <SnapshotCard
                            label="តម្រូវការទីផ្សារសរុប"
                            value={`${totalDemandQty.toLocaleString()} គ.ក្រ`}
                            color="#c62828"
                            bg="#ffebee"
                        />
                        <SnapshotCard
                            label="ផ្គត់ផ្គង់កសិករសរុប"
                            value={`${totalSupplyQty.toLocaleString()} គ.ក្រ`}
                            color="#2e7d32"
                            bg="#e8f5e9"
                        />
                        <SnapshotCard
                            label="ខ្វះខាតទីផ្សារ"
                            value={`${Math.max(0, totalDemandQty - totalSupplyQty).toLocaleString()} គ.ក្រ`}
                            color="#e65100"
                            bg="#fff3e0"
                        />
                        {hotCrop && (
                            <SnapshotCard
                                label="ដំណាំត្រូវការច្រើន"
                                value={hotCrop.name}
                                color="#6a1b9a"
                                bg="#f3e5f5"
                            />
                        )}
                    </div>

                    {/* Opportunity cards */}
                    <SectionTitle>ឱកាសសម្រាប់ការដាំដំណាំ</SectionTitle>
                    <p style={{ fontSize: 14, color: '#999', marginBottom: 20, marginTop: -12 }}>
                        តម្រៀបតាមចន្លោះ (Demand − Supply) — ចន្លោះខ្ពស់ = ឱកាសច្រើនបំផុត
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
                        {cropData.map(crop => {
                            const signal = crop.signal;
                            if (!signal) return null;
                            return (
                                <div
                                    key={crop.id}
                                    style={{
                                        background: '#fff',
                                        border: `1.5px solid ${signal.color}33`,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'box-shadow 0.25s, transform 0.25s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    {/* Image */}
                                    <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                                        <img src={crop.image} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                                        <span style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontWeight: 800, fontSize: 16 }}>
                                            {crop.name}
                                        </span>
                                        <span style={{
                                            position: 'absolute', top: 10, right: 10,
                                            padding: '4px 10px',
                                            background: signal.bg,
                                            color: signal.color,
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}>
                                            {signal.label}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div style={{ padding: '16px 18px' }}>
                                        <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px' }}>{signal.tip}</p>

                                        <BarRow label="ផ្គត់ផ្គង់" qty={crop.supplyQty} max={maxBar} color="#4CAF50" unit="គ.ក្រ" />
                                        <BarRow label="តម្រូវការ"  qty={crop.demandQty} max={maxBar} color="#c62828"  unit="គ.ក្រ" />

                                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <MiniStat
                                                label="ចន្លោះ (Gap)"
                                                value={crop.gap > 0 ? `+${crop.gap.toLocaleString()}` : crop.gap.toLocaleString()}
                                                color={crop.gap > 0 ? '#c62828' : '#2e7d32'}
                                            />
                                            <MiniStat
                                                label="ចំនួនអ្នកទិញ"
                                                value={`${crop.demandCount} ក្រុមហ៊ុន`}
                                                color="#1565c0"
                                            />
                                            {crop.avgBuyerBudget > 0 && (
                                                <MiniStat label="ថវិកាអ្នកទិញ" value={`${crop.avgBuyerBudget.toLocaleString()} ៛`} color="#6a1b9a" />
                                            )}
                                            {crop.avgSupplyPrice > 0 && (
                                                <MiniStat label="តម្លៃអ្នកលក់" value={`${crop.avgSupplyPrice.toLocaleString()} ៛`} color="#2e7d32" />
                                            )}
                                        </div>

                                        {crop.season && (
                                            <div style={{ marginTop: 10, padding: '6px 10px', background: '#f5f5f5', borderRadius: 8, fontSize: 12, color: '#666' }}>
                                                រដូវ — {crop.season}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bar chart */}
                    <SectionTitle>ប្រៀបធៀបផ្គត់ផ្គង់ និងតម្រូវការ</SectionTitle>
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: 20,
                        padding: '24px 24px 16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        marginBottom: 40,
                    }}>
                        <p style={{ fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' }}>
                            ផ្គត់ផ្គង់ (បៃតង) vs តម្រូវការ (ក្រហម) — គ.ក្រ
                        </p>
                        {cropData.length > 0 ? (
                            <div style={{ height: 260 }}>
                                <Bar
                                    data={barData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { font: { size: 12 } } },
                                        },
                                        scales: {
                                            y: { beginAtZero: true, ticks: { font: { size: 11 } } },
                                            x: { ticks: { font: { size: 12 } } },
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>មិនទាន់មានទិន្នន័យ</p>
                        )}
                    </div>

                    {/* Price table */}
                    <SectionTitle>ព័ត៌មានតម្លៃ</SectionTitle>
                    <p style={{ fontSize: 14, color: '#999', marginBottom: 16, marginTop: -12 }}>
                        ប្រៀបធៀបថវិកាដែលអ្នកទិញព្រមបង់ vs តម្លៃដែលកសិករកំពុងលក់
                    </p>
                    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388e3c 100%)' }}>
                                    {['ដំណាំ', 'ថវិកាអ្នកទិញ / គ.ក្រ', 'តម្លៃអ្នកលក់ / គ.ក្រ', 'ភាពខុសគ្នា'].map(h => (
                                        <th key={h} style={{ padding: '13px 16px', color: '#fff', fontSize: 13, fontWeight: 700, textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cropData
                                    .filter(c => c.avgBuyerBudget > 0 || c.avgSupplyPrice > 0)
                                    .map((crop, i) => {
                                        const diff = crop.avgBuyerBudget - crop.avgSupplyPrice;
                                        const bothPresent = crop.avgBuyerBudget > 0 && crop.avgSupplyPrice > 0;
                                        return (
                                            <tr key={crop.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, borderBottom: '1px solid #f0f0f0' }}>
                                                    {crop.name}
                                                    <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, display: 'block' }}>{crop.nameEn}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #f0f0f0', color: crop.avgBuyerBudget > 0 ? '#c62828' : '#bbb', fontWeight: 600 }}>
                                                    {crop.avgBuyerBudget > 0 ? `${crop.avgBuyerBudget.toLocaleString()} ៛` : '—'}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #f0f0f0', color: crop.avgSupplyPrice > 0 ? '#2e7d32' : '#bbb', fontWeight: 600 }}>
                                                    {crop.avgSupplyPrice > 0 ? `${crop.avgSupplyPrice.toLocaleString()} ៛` : '—'}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #f0f0f0' }}>
                                                    {bothPresent ? (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '3px 10px',
                                                            borderRadius: 20,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            background: diff > 0 ? '#e8f5e9' : '#ffebee',
                                                            color:      diff > 0 ? '#2e7d32' : '#c62828',
                                                        }}>
                                                            {diff > 0 ? '+' : ''}{diff.toLocaleString()} ៛
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {cropData.filter(c => c.avgBuyerBudget > 0 || c.avgSupplyPrice > 0).length === 0 && (
                            <p style={{ textAlign: 'center', color: '#bbb', padding: 32 }}>មិនទាន់មានទិន្នន័យតម្លៃ</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 16, fontWeight: 800, color: '#333', margin: '0 0 20px' }}>{children}</p>
);

const SnapshotCard = ({ label, value, color, bg }) => (
    <div style={{
        background: bg,
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        border: `1.5px solid ${color}22`,
    }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</span>
    </div>
);

const BarRow = ({ label, qty, max, color, unit }) => (
    <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#666' }}>{label}</span>
            <span style={{ fontWeight: 700, color }}>{qty.toLocaleString()} {unit}</span>
        </div>
        <div style={{ height: 7, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: max > 0 ? `${Math.min(100, (qty / max) * 100)}%` : '0%',
                background: color,
                borderRadius: 4,
                transition: 'width 0.5s ease',
            }} />
        </div>
    </div>
);

const MiniStat = ({ label, value, color }) => (
    <div>
        <p style={{ margin: 0, fontSize: 11, color: '#aaa', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color }}>{value}</p>
    </div>
);

export default Analytics;
