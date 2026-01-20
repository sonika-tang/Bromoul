
import { StorageService } from './storage';

export const SeedData = {
    init: async () => {
        // Clear old data to force update
        localStorage.removeItem('ls_users');
        localStorage.removeItem('ls_crops');
        localStorage.removeItem('ls_analytics');
        localStorage.removeItem('ls_farmer_products');
        localStorage.removeItem('ls_buyer_requests');
        // Note: In a real app we wouldn't wipe everything, but this ensures the new crops and Khmer data are applied.

        // 1. Users
        const seedUsers = [
            { id: 'u1', name: 'សុខា កសិករ', email: 'sokha@farm.com', role: 'farmer', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sokha' },
            { id: 'u2', name: 'តារា អ្នកទិញ', email: 'dara@mart.com', role: 'buyer', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dara' }
        ];
        await StorageService.write('ls_users', seedUsers);

        // 2. Crops (Mango, Papaya, Banana, Pumpkin)
        const seedCrops = [
            { id: 'c1', name: 'ស្វាយ (Mango)', category: 'Fruits', unit: 'kg' },
            { id: 'c2', name: 'ល្ហុង (Papaya)', category: 'Fruits', unit: 'kg' },
            { id: 'c3', name: 'ចេក (Banana)', category: 'Fruits', unit: 'bunch' },
            { id: 'c4', name: 'ល្ពៅ (Pumpkin)', category: 'Vegetables', unit: 'kg' }
        ];
        await StorageService.write('ls_crops', seedCrops);

        // 3. Analytics (Pie Chart Data - Percentages)
        // Distribution example: Mango 40%, Papaya 20%, Banana 25%, Pumpkin 15%
        const seedAnalytics = [
            {
                id: 'a1', cropId: 'c1', cropName: 'ស្វាយ (Mango)', percentageShare: 40,
                needsDescription: 'តម្រូវការខ្ពស់សម្រាប់នាំចេញទៅក្រៅប្រទេស។', // High demand for export
            },
            {
                id: 'a2', cropId: 'c2', cropName: 'ល្ហុង (Papaya)', percentageShare: 20,
                needsDescription: 'ត្រូវការសម្រាប់ធ្វើម្ហូប និងបង្អែម។', // Cooking and dessert
            },
            {
                id: 'a3', cropId: 'c3', cropName: 'ចេក (Banana)', percentageShare: 25,
                needsDescription: 'ពេញនិយមសម្រាប់ពិធីបុណ្យផ្សេងៗ។', // Popular for festivals
            },
            {
                id: 'a4', cropId: 'c4', cropName: 'ល្ពៅ (Pumpkin)', percentageShare: 15,
                needsDescription: 'តម្រូវការប្រចាំថ្ងៃនៅទីផ្សារ។', // Daily market need
            }
        ];
        await StorageService.write('ls_analytics', seedAnalytics);

        // 4. Farmer Products
        const seedProducts = [
            {
                id: 'p1', userId: 'u1', cropId: 'c1', name: 'ស្វាយកែវរមៀត',
                quantity: 500, unit: 'kg', availableFrom: '2025-02-01', availableTo: '2025-03-01',
                photoUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=400'
            },
            {
                id: 'p2', userId: 'u1', cropId: 'c3', name: 'ចេកណាំវ៉ា',
                quantity: 100, unit: 'bunch', availableFrom: '2025-01-20', availableTo: '2025-02-10',
                photoUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400'
            }
        ];
        await StorageService.write('ls_farmer_products', seedProducts);

        // 5. Buyer Requests
        const seedRequests = [
            {
                id: 'r1', userId: 'u2', cropId: 'c4', name: 'ល្ពៅសាច់',
                requiredQuantity: 200, unit: 'kg', deliveryWindowStart: '2025-02-01', deliveryWindowEnd: '2025-02-15',
                notes: 'ត្រូវការល្ពៅសាច់ស្អិតល្អ' // Need sticky flesh pumpkin
            }
        ];
        await StorageService.write('ls_buyer_requests', seedRequests);

        console.log('Khmer Seed data initialized');
    }
};
