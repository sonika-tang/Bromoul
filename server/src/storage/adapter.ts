
// Standard Storage Interface for MVP
export interface StorageAdapter {
    get(collection: string, id?: string): Promise<any>;
    query(collection: string, filter?: object): Promise<any[]>;
    create(collection: string, item: object): Promise<any>;
    update(collection: string, id: string, patch: object): Promise<any>;
    delete(collection: string, id: string): Promise<void>;
}

// In-Memory Implementation for Server MVP
export class MemoryAdapter implements StorageAdapter {
    private store: Map<string, Map<string, any>>;
    private persistPath?: string;

    constructor(persistPath?: string) {
        this.store = new Map();
        this.persistPath = persistPath;
        this.loadFromDisk();
    }

    private getCollection(name: string) {
        if (!this.store.has(name)) {
            this.store.set(name, new Map());
        }
        return this.store.get(name)!;
    }

    async get(collection: string, id?: string): Promise<any> {
        if (!id) {
            return Array.from(this.getCollection(collection).values());
        }
        return this.getCollection(collection).get(id) || null;
    }

    async query(collection: string, filter?: object): Promise<any[]> {
        const items = Array.from(this.getCollection(collection).values());
        if (!filter || Object.keys(filter).length === 0) return items;
        
        return items.filter(item => {
            return Object.entries(filter).every(([key, value]) => {
                if (value === undefined || value === null) return true;
                return item[key] === value;
            });
        });
    }

    async create(collection: string, item: object): Promise<any> {
        const col = this.getCollection(collection);
        const id = (item as any).id || Date.now().toString() + Math.random().toString().slice(2, 8);
        const newItem = { ...item, id, created_at: new Date().toISOString() };
        col.set(id, newItem);
        this.saveToDisk();
        return newItem;
    }

    async update(collection: string, id: string, patch: object): Promise<any> {
        const col = this.getCollection(collection);
        const existing = col.get(id);
        if (!existing) {
            throw new Error(`Item ${id} not found in ${collection}`);
        }
        const updated = { ...existing, ...patch, id, updated_at: new Date().toISOString() };
        col.set(id, updated);
        this.saveToDisk();
        return updated;
    }

    async delete(collection: string, id: string): Promise<void> {
        const col = this.getCollection(collection);
        if (!col.has(id)) {
            throw new Error(`Item ${id} not found in ${collection}`);
        }
        col.delete(id);
        this.saveToDisk();
    }

    // Helper methods for backward compatibility
    async getAll(collection: string, filter?: any): Promise<any[]> {
        return this.query(collection, filter);
    }

    async set(collection: string, id: string, data: any): Promise<any> {
        const existing = await this.get(collection, id);
        if (existing) {
            return this.update(collection, id, data);
        }
        return this.create(collection, { ...data, id });
    }

    async find(collection: string, predicate: (item: any) => boolean): Promise<any[]> {
        const items = Array.from(this.getCollection(collection).values());
        return items.filter(predicate);
    }

    async findOne(collection: string, predicate: (item: any) => boolean): Promise<any | null> {
        const items = Array.from(this.getCollection(collection).values());
        return items.find(predicate) || null;
    }

    // Optional JSON persistence for debugging
    private saveToDisk() {
        if (!this.persistPath) return;
        try {
            const fs = require('fs');
            const data: any = {};
            this.store.forEach((map, collection) => {
                data[collection] = Object.fromEntries(map);
            });
            fs.writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
        } catch (err) {
            // Ignore errors in MVP
        }
    }

    private loadFromDisk() {
        if (!this.persistPath) return;
        try {
            const fs = require('fs');
            if (fs.existsSync(this.persistPath)) {
                const data = JSON.parse(fs.readFileSync(this.persistPath, 'utf8'));
                Object.entries(data).forEach(([collection, items]: [string, any]) => {
                    const map = new Map(Object.entries(items));
                    this.store.set(collection, map);
                });
            }
        } catch (err) {
            // Ignore errors in MVP
        }
    }
}

// Singleton Instance
export const adapter = new MemoryAdapter();

// Initialize Seed Data
export const initSeedData = async () => {
    // Check if data already exists
    const existingUsers = await adapter.query('users');
    if (existingUsers.length > 0) {
        console.log('Seed data already exists, skipping initialization');
        return;
    }

    const bcrypt = require('bcryptjs');
    
    // Users
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    await adapter.create('users', {
        id: '1',
        name: 'សុខា កសិករ',
        email: 'farmer@test.com',
        password_hash: farmerPassword,
        role: 'farmer',
        contact_info: '012345678',
        profile_picture: null
    });

    const buyerPassword = await bcrypt.hash('buyer123', 10);
    await adapter.create('users', {
        id: '2',
        name: 'វិចិត្រ អ្នកទិញ',
        email: 'buyer@test.com',
        password_hash: buyerPassword,
        role: 'buyer',
        contact_info: '098765432',
        profile_picture: null
    });

    // Crops
    await adapter.create('crops', { id: '1', name_kh: 'ស្វាយ', name_en: 'Mango', category: 'Fruit' });
    await adapter.create('crops', { id: '2', name_kh: 'ចេក', name_en: 'Banana', category: 'Fruit' });
    await adapter.create('crops', { id: '3', name_kh: 'ល្ពៅ', name_en: 'Pumpkin', category: 'Vegetable' });
    await adapter.create('crops', { id: '4', name_kh: 'ស្រូវ', name_en: 'Rice', category: 'Grain' });
    await adapter.create('crops', { id: '5', name_kh: 'ត្រសក់', name_en: 'Cucumber', category: 'Vegetable' });
    await adapter.create('crops', { id: '6', name_kh: 'ប៉េងប៉ោះ', name_en: 'Tomato', category: 'Vegetable' });

    // Sample Listings
    await adapter.create('listings', {
        id: '101',
        user_id: '1',
        crop_id: '1',
        type: 'supply',
        quantity: 500,
        unit: 'kg',
        price_riel: 3000,
        certification: 'CamGAP',
        status: 'active',
        location: 'Kandal'
    });

    await adapter.create('listings', {
        id: '102',
        user_id: '2',
        crop_id: '4',
        type: 'demand',
        quantity: 1000,
        unit: 'kg',
        price_riel: 5000,
        certification: null,
        status: 'active',
        location: 'Phnom Penh',
        duration_needed: '30 days'
    });

    console.log('Seed Data initialized in Memory Store');
};
