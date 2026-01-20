
import { StorageService } from './storage';
import { ProductService } from './productService';
import { CropService } from './cropService';

// We no longer rely on static ANALYTICS_KEY for reading, but we might still use it for caching if needed.
// For now, we will compute dynamic analytics from products.

export const AnalyticsService = {
    /**
     * Get dynamic analytics based on real product data
     * @param {Object} filters - { cropId?, timeframe?, region? }
     */
    getAnalytics: async (filters = {}) => {
        const [products, requests, crops] = await Promise.all([
            ProductService.getFarmerProducts(),
            ProductService.getBuyerRequests(),
            CropService.getCrops()
        ]);

        // Simple aggregation: Group by Crop
        // We want to return data structure: { cropId, cropName, supply, demand, percentageShare, needsDescription }

        // 1. Calculate Supply (Sum Quantity from Farmer Products)
        const supplyMap = {};
        products.forEach(p => {
            if (!supplyMap[p.cropId]) supplyMap[p.cropId] = 0;
            supplyMap[p.cropId] += Number(p.quantity || 0);
        });

        // 2. Calculate Demand (Sum RequiredQuantity from Buyer Requests)
        const demandMap = {};
        requests.forEach(r => {
            if (!demandMap[r.cropId]) demandMap[r.cropId] = 0;
            demandMap[r.cropId] += Number(r.requiredQuantity || 0);
        });

        // 3. Combine into Analytics List
        const totalSupply = Object.values(supplyMap).reduce((a, b) => a + b, 0);

        let analyticsData = crops.map(crop => {
            const supply = supplyMap[crop.id] || 0;
            const demand = demandMap[crop.id] || 0;

            // Percentage Share of Total Market Supply (as an example metric for the Pie Chart)
            // Or we could use Demand Share. Let's send Supply Share for now.
            const percentageShare = totalSupply > 0 ? Math.round((supply / totalSupply) * 100) : 0;

            return {
                id: `gen_${crop.id}`,
                cropId: crop.id,
                cropName: crop.name,
                supply,
                demand,
                percentageShare,
                // Dynamic description based on Gap
                needsDescription: demand > supply
                    ? `ខ្វះខាត ${demand - supply} ${crop.unit} (Deficit)`
                    : `ផ្គត់ផ្គង់លើស ${supply - demand} ${crop.unit} (Surplus)`
            };
        });

        // Filter
        if (filters.cropId) {
            analyticsData = analyticsData.filter(a => a.cropId === filters.cropId);
        }

        // Only return items that have activity
        return analyticsData.filter(a => a.supply > 0 || a.demand > 0);
    },

    /**
     * Get Price Distribution Data (Histogram)
     * Returns: { labels: ['0-1000', '1000-2000', ...], values: [count, count, ...] }
     */
    getPriceDistribution: async () => {
        const products = await ProductService.getFarmerProducts();
        const prices = products.map(p => Number(p.price || 0)).filter(p => p > 0);

        if (prices.length === 0) return { labels: [], values: [] };

        // Create simple buckets
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const bucketCount = 5;
        const step = Math.ceil((maxPrice - minPrice + 1) / bucketCount) || 1000;

        const buckets = Array(bucketCount).fill(0);
        const labels = [];

        // Initialize labels
        for (let i = 0; i < bucketCount; i++) {
            const start = minPrice + (i * step);
            const end = start + step;
            labels.push(`${start}-${end} ៛`);
        }

        // Fill buckets
        prices.forEach(price => {
            let bucketIndex = Math.floor((price - minPrice) / step);
            if (bucketIndex >= bucketCount) bucketIndex = bucketCount - 1;
            buckets[bucketIndex]++;
        });

        return { labels, values: buckets };
    }
};
