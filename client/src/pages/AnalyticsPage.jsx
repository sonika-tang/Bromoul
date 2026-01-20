import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ListingService } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalyticsPage = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [supplyList, demandList] = await Promise.all([
                    ListingService.getAll({ type: 'supply' }),
                    ListingService.getAll({ type: 'demand' })
                ]);

                const totalSupply = supplyList.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
                const totalDemand = demandList.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

                setChartData({
                    labels: ['ការផ្គត់ផ្គង់ (Supply)', 'តម្រូវការ (Demand)'],
                    datasets: [
                        {
                            data: [totalSupply, totalDemand],
                            backgroundColor: ['#4CAF50', '#FF9800'],
                            borderColor: ['#388E3C', '#F57C00'],
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="container" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem', color: '#2E7D32' }}>វិភាគទិន្នន័យកសិកម្ម</h2>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#555' }}>សមាមាត្របរិមាណ (គ.ក្រ)</h3>

                {loading ? (
                    <p>កំពុងដំណើរការ...</p>
                ) : chartData && (chartData.datasets[0].data.some(v => v > 0)) ? (
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                ) : (
                    <p>មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់។</p>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
