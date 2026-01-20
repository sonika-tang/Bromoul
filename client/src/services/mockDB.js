
// Mock Database Service for LocalStorage Persistence
// Mock Database Service for LocalStorage Persistence
const DB_PREFIX = 'bromoul:';

const initialData = {
    users: [
        { id: 'f1', name: 'សុខា កសិករ', role: 'farmer', email: 'farmer@test.com', profile_picture: null, contact: '012345678', location: 'Kandal' },
        { id: 'b1', name: 'វិចិត្រ អ្នកទិញ', role: 'buyer', email: 'buyer@test.com', profile_picture: null, contact: '098765432', location: 'Phnom Penh' }
    ],
    crops: [
        { id: 'c1', name_kh: 'ស្វាយកែវរមៀត', category: 'Fruit' },
        { id: 'c2', name_kh: 'ចេកអំបូង', category: 'Fruit' },
        { id: 'c3', name_kh: 'ល្ពៅ', category: 'Vegetable' },
        { id: 'c4', name_kh: 'ស្រូវសែនក្រអូប', category: 'Grain' },
        { id: 'c5', name_kh: 'ត្រសក់', category: 'Vegetable' },
        { id: 'c6', name_kh: 'ប៉េងប៉ោះ', category: 'Vegetable' },
        { id: 'c7', name_kh: 'ម្ទេស', category: 'Spices' },
        { id: 'c8', name_kh: 'ដូង', category: 'Fruit' },
        { id: 'c9', name_kh: 'ពោត', category: 'Grain' },
        { id: 'c10', name_kh: 'ស្ពៃក្តោប', category: 'Vegetable' }
    ],
    listings: [
        { id: 'l1', user_id: 'f1', crop_id: 'c1', type: 'supply', quantity: 500, unit: 'kg', price_riel: 3000, status: 'active', certification: 'CamGAP', location: 'Kandal', description: 'ស្វាយកែវរមៀត គុណភាពលេខ១', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'l2', user_id: 'f1', crop_id: 'c4', type: 'supply', quantity: 2000, unit: 'kg', price_riel: 1100, status: 'active', certification: 'None', location: 'Battambang', description: 'ស្រូវសែនក្រអូប ទើបប្រមូលផល', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 'l3', user_id: 'f1', crop_id: 'c7', type: 'supply', quantity: 50, unit: 'kg', price_riel: 5000, status: 'active', certification: 'Organic', location: 'Kampong Cham', description: '', created_at: new Date(Date.now() - 259200000).toISOString() },
        { id: 'l4', user_id: 'b1', crop_id: 'c4', type: 'demand', quantity: 1000, unit: 'kg', price_riel: 1200, status: 'active', duration: '30 days', location: 'Phnom Penh', description: 'ត្រូវការស្រូវបន្ទាន់', created_at: new Date(Date.now() - 43200000).toISOString() },
        { id: 'l5', user_id: 'b1', crop_id: 'c6', type: 'demand', quantity: 200, unit: 'kg', price_riel: 2000, status: 'active', duration: '7 days', location: 'Siem Reap', description: 'សម្រាប់ភោជនីយដ្ឋាន', created_at: new Date(Date.now() - 129600000).toISOString() }
    ],
    carts: [],
    orders: [],
    messages: []
};

class MockDB {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_PREFIX + 'users')) {
            console.log('Seeding Mock DB...');
            Object.keys(initialData).forEach(key => {
                localStorage.setItem(DB_PREFIX + key, JSON.stringify(initialData[key]));
            });
        }
    }

    _read(collection) {
        return JSON.parse(localStorage.getItem(DB_PREFIX + collection) || '[]');
    }

    _write(collection, data) {
        localStorage.setItem(DB_PREFIX + collection, JSON.stringify(data));
        // Trigger event for multi-tab sync (optional)
        window.dispatchEvent(new Event('db_update_' + collection));
    }

    async get(collection, id) {
        const items = this._read(collection);
        if (id) return items.find(i => i.id === id);
        return items;
    }

    async query(collection, filter = {}) {
        const items = this._read(collection);
        return items.filter(item => {
            return Object.entries(filter).every(([key, val]) => item[key] == val);
        });
    }

    async create(collection, item) {
        const items = this._read(collection);
        const newItem = {
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            created_at: new Date().toISOString(),
            ...item
        };
        items.push(newItem);
        this._write(collection, items);
        return newItem;
    }

    async update(collection, id, updates) {
        const items = this._read(collection);
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) throw new Error('Not found');

        items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
        this._write(collection, items);
        return items[idx];
    }

    async delete(collection, id) {
        const items = this._read(collection);
        const newItems = items.filter(i => i.id !== id);
        this._write(collection, newItems);
    }
}

export const db = new MockDB();
