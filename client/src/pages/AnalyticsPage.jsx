import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { db } from '../services/mockDB';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

const CROP_COLORS = ['#4FC3F7', '#EF5350', '#FFB300', '#AB47BC', '#FF7043'];

const pieLabelPlugin = {
    id: 'pieLabels',
    afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        if (!total) return;
        chart.getDatasetMeta(0).data.forEach((arc, i) => {
            const value = data.datasets[0].data[i];
            if (!value) return;
            const pct = Math.round((value / total) * 100);
            if (pct < 5) return;
            const midAngle = (arc.startAngle + arc.endAngle) / 2;
            const r = (arc.outerRadius + (arc.innerRadius || 0)) / 2;
            const x = arc.x + Math.cos(midAngle) * r;
            const y = arc.y + Math.sin(midAngle) * r;
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 3;
            ctx.fillText(`${pct}%`, x, y);
            ctx.restore();
        });
    },
};

const barLabelPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        chart.getDatasetMeta(0).data.forEach((bar, i) => {
            const value = data.datasets[0].data[i];
            if (!value) return;
            ctx.save();
            ctx.fillStyle = '#444';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(value.toLocaleString(), bar.x, bar.y - 4);
            ctx.restore();
        });
    },
};

const getSignal = (demandQty, supplyQty) => {
    if (demandQty === 0) return { label: 'គ្មានតម្រូវការ', color: '#757575', bg: '#f5f5f5' };
    if (supplyQty === 0) return { label: 'ត្រូវការខ្លាំង',  color: '#c62828', bg: '#ffebee' };
    const ratio = demandQty / supplyQty;
    if (ratio >= 2)      return { label: 'ឱកាសធំ',         color: '#e65100', bg: '#fff3e0' };
    if (ratio >= 1)      return { label: 'ស្ទើរស្មើ',       color: '#1565c0', bg: '#e3f2fd' };
    return                      { label: 'ផ្គត់ផ្គង់ច្រើន', color: '#2e7d32', bg: '#e8f5e9' };
};

const Analytics = () => {
    const [cropData, setCropData]   = useState([]);
    const [chartType, setChartType] = useState('pie');
    const [isMobile, setIsMobile]   = useState(() => window.innerWidth < 640);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    useEffect(() => {
        const crops    = db._read('crops')    || [];
        const listings = db._read('listings') || [];

        const data = crops.map((crop, i) => {
            const supplyListings = listings.filter(l => l.crop_id === crop.id && l.type === 'supply');
            const demandListings = listings.filter(l => l.crop_id === crop.id && l.type === 'demand');

            const supplyQty = supplyListings.reduce((s, l) => s + Number(l.quantity || 0), 0);
            const demandQty = demandListings.reduce((s, l) => s + Number(l.quantity || 0), 0);
            const avgBuyerBudget = demandListings.length > 0
                ? Math.round(demandListings.reduce((s, l) => s + (l.budget_riel || 0), 0) / demandListings.length)
                : 0;

            return {
                id: crop.id, name: crop.name_kh, nameEn: crop.name_en,
                image: crop.image, season: crop.season,
                supplyQty, demandQty,
                gap:         demandQty - supplyQty,
                demandCount: demandListings.length,
                avgBuyerBudget,
                signal: getSignal(demandQty, supplyQty),
                color:  CROP_COLORS[i % CROP_COLORS.length],
            };
        }).sort((a, b) => b.demandQty - a.demandQty);

        setCropData(data);
    }, []);

    const hotCrop     = cropData.find(c => c.demandQty > 0);
    const totalDemand = cropData.reduce((s, c) => s + c.demandQty, 0);

    const pieData = {
        labels: cropData.map(c => `${c.name}  ${c.demandQty.toLocaleString()} គ.ក្រ`),
        datasets: [{
            data:            cropData.map(c => c.demandQty),
            backgroundColor: cropData.map(c => c.color),
            borderWidth: 2, borderColor: '#fff',
        }],
    };

    const barData = {
        labels: cropData.map(c => c.name),
        datasets: [{
            label:           'តម្រូវការ (Demand)',
            data:            cropData.map(c => c.demandQty),
            backgroundColor: cropData.map(c => c.color),
            borderRadius:    8,
        }],
    };

    const hasData = cropData.some(c => c.demandQty > 0);

    return (
        <div style={{ overflow: 'hidden' }}>

            {/* Hero */}
            <section style={{
                position: 'relative',
                padding: isMobile ? '32px 0 24px' : '56px 0 44px',
                background: 'linear-gradient(165deg, #f3fbf3 0%, #fffdf5 55%, #eef6ff 100%)',
                textAlign: 'center', overflow: 'hidden', isolation: 'isolate',
            }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
                    <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(76,175,80,0.14) 0%, transparent 70%)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(33,150,243,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                </div>
                <div className="container">
                    <span style={{ display: 'inline-block', padding: '5px 16px', background: 'rgba(76,175,80,0.1)', color: '#2e7d32', borderRadius: 100, fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
                        ទីផ្សារ · Market Intelligence
                    </span>
                    <h1 style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 800, margin: '12px 0 8px', color: '#333' }}>
                        <span style={{ background: 'linear-gradient(120deg,#4CAF50 0%,#2196F3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            ទីផ្សារត្រូវការ
                        </span>
                        អ្វី?
                    </h1>
                    <p style={{ fontSize: isMobile ? 13 : 15, color: '#757575', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, padding: isMobile ? '0 16px' : 0 }}>
                        ស្វែងយល់ពីតម្រូវការពិតៗនៃទីផ្សារ — ដើម្បីជ្រើសរើសដំណាំត្រឹមត្រូវ
                    </p>
                </div>
            </section>

            {/* Content */}
            <div style={{ padding: isMobile ? '20px 0 48px' : '40px 0 80px', background: '#fafafa' }}>
                <div className="container">

                    {/* Chart panel + right column */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
                        gap: isMobile ? 14 : 20,
                        marginBottom: isMobile ? 28 : 40,
                        alignItems: 'start',
                    }}>

                        {/* Chart card with toggle */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: isMobile ? '16px 14px' : '24px 28px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

                            {/* Title + toggle row */}
                            <div style={{
                                display: 'flex',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? 10 : 0,
                                marginBottom: 20,
                            }}>
                                <p style={{ fontSize: isMobile ? 13 : 16, fontWeight: 800, color: '#333', margin: 0 }}>
                                    {chartType === 'pie' ? 'ចែកចាយតម្រូវការតាមប្រភេទដំណាំ' : 'តម្រូវការតាមប្រភេទដំណាំ (គ.ក្រ)'}
                                </p>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <ToggleBtn active={chartType === 'pie'} onClick={() => setChartType('pie')} label="ក្រាបផ្លិត" />
                                    <ToggleBtn active={chartType === 'bar'} onClick={() => setChartType('bar')} label="ក្រាបសសរ" />
                                </div>
                            </div>

                            {hasData ? (
                                <div style={{ height: isMobile ? 260 : 320 }}>
                                    {chartType === 'pie' ? (
                                        <Pie
                                            data={pieData}
                                            plugins={[pieLabelPlugin]}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: isMobile ? 'bottom' : 'right',
                                                        labels: {
                                                            font: { size: isMobile ? 11 : 13 },
                                                            padding: isMobile ? 10 : 16,
                                                            boxWidth: 12,
                                                        },
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: ctx => {
                                                                const val   = ctx.raw;
                                                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                                                const pct   = total ? Math.round((val / total) * 100) : 0;
                                                                return `  ${val.toLocaleString()} គ.ក្រ  (${pct}%)`;
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <Bar
                                            data={barData}
                                            plugins={[barLabelPlugin]}
                                            options={{
                                                maintainAspectRatio: false,
                                                layout: { padding: { top: 24 } },
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: ctx => `  ${ctx.raw.toLocaleString()} គ.ក្រ`,
                                                        },
                                                    },
                                                },
                                                scales: {
                                                    y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: '#f0f0f0' } },
                                                    x: { ticks: { font: { size: isMobile ? 11 : 13, weight: 'bold' } }, grid: { display: false } },
                                                },
                                            }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#bbb', padding: 60 }}>មិនទាន់មានទិន្នន័យ</p>
                            )}

                            {/* Bar color legend */}
                            {chartType === 'bar' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                                    {cropData.map(c => (
                                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right column */}
                        <div style={{
                            display: isMobile ? 'grid' : 'flex',
                            gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
                            flexDirection: 'column',
                            gap: isMobile ? 12 : 16,
                        }}>

                            {/* Hot crop card */}
                            {hotCrop && (
                                <div style={{
                                    background: '#fff', border: `2px solid ${hotCrop.color}55`,
                                    borderRadius: 20, overflow: 'hidden',
                                    boxShadow: `0 4px 20px ${hotCrop.color}22`,
                                    gridColumn: isMobile ? '1 / -1' : undefined,
                                }}>
                                    <div style={{ position: 'relative', height: isMobile ? 100 : 130, overflow: 'hidden' }}>
                                        <img src={hotCrop.image} alt={hotCrop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
                                        <span style={{ position: 'absolute', bottom: 10, left: 14, color: '#fff', fontWeight: 800, fontSize: isMobile ? 15 : 17 }}>{hotCrop.name}</span>
                                        <span style={{
                                            position: 'absolute', top: 10, right: 10,
                                            padding: '4px 10px', background: '#ffebee', color: '#c62828',
                                            borderRadius: 20, fontSize: 11, fontWeight: 700,
                                        }}>
                                            🔥 ត្រូវការច្រើន
                                        </span>
                                    </div>
                                    <div style={{ padding: isMobile ? '12px 14px' : '16px 18px' }}>
                                        <p style={{ margin: '0 0 2px', fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>ដំណាំត្រូវការខ្លាំងបំផុត</p>
                                        <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#333', lineHeight: 1.1 }}>
                                            {hotCrop.demandQty.toLocaleString()}
                                            <span style={{ fontSize: 13, fontWeight: 400, color: '#888', marginLeft: 4 }}>គ.ក្រ</span>
                                        </p>
                                        {hotCrop.avgBuyerBudget > 0 && (
                                            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6a1b9a', fontWeight: 700 }}>
                                                ថវិការ {hotCrop.avgBuyerBudget.toLocaleString()} ៛ / គ.ក្រ
                                            </p>
                                        )}
                                        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>
                                            {hotCrop.nameEn} · {hotCrop.season}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Total demand */}
                            <div style={{
                                background: '#ffebee', border: '1.5px solid #ef9a9a',
                                borderRadius: 16, padding: isMobile ? '14px 16px' : '18px 20px',
                                display: 'flex', flexDirection: 'column', gap: 4,
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#c62828', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    តម្រូវការទីផ្សារសរុប
                                </span>
                                <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#c62828', lineHeight: 1.1 }}>
                                    {totalDemand.toLocaleString()}
                                    <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>គ.ក្រ</span>
                                </span>
                                <span style={{ fontSize: 12, color: '#e57373' }}>{cropData.filter(c => c.demandQty > 0).length} ប្រភេទដំណាំ</span>
                            </div>

                            {/* Color legend */}
                            <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #e0e0e0' }}>
                                {cropData.map(c => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{c.name}</span>
                                        <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>
                                            {c.demandQty > 0 ? `${c.demandQty.toLocaleString()} គ.ក្រ` : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Opportunity cards */}
                    <SectionTitle>ឱកាសសម្រាប់ការដាំដំណាំ</SectionTitle>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: isMobile ? 12 : 20,
                        marginBottom: 48,
                    }}>
                        {cropData.map(crop => {
                            const signal = crop.signal;
                            if (crop.demandQty === 0) return null;
                            return (
                                <div
                                    key={crop.id}
                                    style={{
                                        background: '#fff', border: `1.5px solid ${crop.color}44`,
                                        borderRadius: 20, overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'box-shadow 0.25s, transform 0.25s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    <div style={{ position: 'relative', height: isMobile ? 90 : 110, overflow: 'hidden' }}>
                                        <img src={crop.image} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
                                        <span style={{ position: 'absolute', bottom: 8, left: 10, color: '#fff', fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{crop.name}</span>
                                        <span style={{
                                            position: 'absolute', top: 8, right: 8,
                                            padding: '3px 8px', background: signal.bg, color: signal.color,
                                            borderRadius: 20, fontSize: isMobile ? 10 : 11, fontWeight: 700,
                                        }}>
                                            {signal.label}
                                        </span>
                                    </div>
                                    <div style={{ padding: isMobile ? '10px 10px' : '14px 16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 6 : 10 }}>
                                            <MiniStat label="តម្រូវការ"    value={`${crop.demandQty.toLocaleString()} គ.ក្រ`} color="#c62828" small={isMobile} />
                                            <MiniStat label="អ្នកទិញ"     value={`${crop.demandCount}`}                       color="#1565c0" small={isMobile} />
                                            {crop.avgBuyerBudget > 0 && (
                                                <MiniStat label="ថវិការ/គ.ក្រ" value={`${crop.avgBuyerBudget.toLocaleString()} ៛`} color="#6a1b9a" small={isMobile} />
                                            )}
                                            {crop.gap > 0 && (
                                                <MiniStat label="ចន្លោះ" value={`+${crop.gap.toLocaleString()} គ.ក្រ`} color="#e65100" small={isMobile} />
                                            )}
                                        </div>
                                        {crop.season && !isMobile && (
                                            <div style={{ marginTop: 10, padding: '5px 10px', background: '#f5f5f5', borderRadius: 8, fontSize: 11, color: '#666' }}>
                                                {crop.season}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
};

const ToggleBtn = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '7px 14px', border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
            background: active ? '#333' : '#f0f0f0',
            color:      active ? '#fff' : '#666',
            boxShadow:  active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
        }}
    >
        {label}
    </button>
);

const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 16, fontWeight: 800, color: '#333', margin: '0 0 16px' }}>{children}</p>
);

const MiniStat = ({ label, value, color, small }) => (
    <div>
        <p style={{ margin: 0, fontSize: small ? 10 : 11, color: '#aaa', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: small ? 12 : 14, fontWeight: 800, color }}>{value}</p>
    </div>
);

export default Analytics;
