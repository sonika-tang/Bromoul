// Client-side Storage Adapter
// Uses IndexedDB via localForage with fallback to localStorage
// Mirrors the server adapter interface

let localForage = null;

// Try to load localForage dynamically
try {
    // eslint-disable-next-line
    localForage = require('localforage');
} catch (e) {
    // Will use localStorage fallback
}

export class ClientStorageAdapter {
    constructor() {
        this.prefix = 'bromoul_';
        this.useIndexedDB = false;
        this.forageInstances = new Map();
        this.init();
    }

    async init() {
        if (localForage) {
            try {
                // Test IndexedDB availability
                await localForage.setItem('__test__', 'test');
                await localForage.removeItem('__test__');
                this.useIndexedDB = true;
            } catch (e) {
                this.useIndexedDB = false;
            }
        }
    }

    getCollectionKey(collection) {
        return `${this.prefix}${collection}`;
    }

    getForageInstance(collection) {
        if (!this.useIndexedDB || !localForage) return null;
        
        if (!this.forageInstances.has(collection)) {
            const instance = localForage.createInstance({
                name: 'Bromoul',
                storeName: collection,
                description: `Bromoul ${collection} storage`
            });
            this.forageInstances.set(collection, instance);
        }
        return this.forageInstances.get(collection);
    }

    async getCollectionData(collection) {
        const key = this.getCollectionKey(collection);
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                const data = {};
                await instance.iterate((value, id) => {
                    data[id] = value;
                });
                return data;
            } catch (e) {
                // Fallback to localStorage
            }
        }
        
        // localStorage fallback
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    }

    async saveCollectionData(collection, data) {
        const key = this.getCollectionKey(collection);
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                // Clear existing
                await instance.clear();
                // Set all items
                for (const [id, value] of Object.entries(data)) {
                    await instance.setItem(id, value);
                }
                return;
            } catch (e) {
                // Fallback to localStorage
            }
        }
        
        // localStorage fallback
        localStorage.setItem(key, JSON.stringify(data));
    }

    async get(collection, id) {
        if (!id) {
            return this.query(collection);
        }
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                return await instance.getItem(id) || null;
            } catch (e) {
                // Fallback
            }
        }
        
        const data = await this.getCollectionData(collection);
        return data[id] || null;
    }

    async query(collection, filter) {
        const data = await this.getCollectionData(collection);
        let items = Object.values(data);
        
        if (filter && Object.keys(filter).length > 0) {
            items = items.filter(item => {
                return Object.entries(filter).every(([key, value]) => {
                    if (value === undefined || value === null) return true;
                    return item[key] === value;
                });
            });
        }
        
        return items;
    }

    async create(collection, item) {
        const id = item.id || Date.now().toString() + Math.random().toString().slice(2, 8);
        const newItem = { ...item, id, created_at: new Date().toISOString() };
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                await instance.setItem(id, newItem);
                return newItem;
            } catch (e) {
                // Fallback
            }
        }
        
        const data = await this.getCollectionData(collection);
        data[id] = newItem;
        await this.saveCollectionData(collection, data);
        return newItem;
    }

    async update(collection, id, patch) {
        const existing = await this.get(collection, id);
        if (!existing) {
            throw new Error(`Item ${id} not found in ${collection}`);
        }
        
        const updated = { ...existing, ...patch, id, updated_at: new Date().toISOString() };
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                await instance.setItem(id, updated);
                return updated;
            } catch (e) {
                // Fallback
            }
        }
        
        const data = await this.getCollectionData(collection);
        data[id] = updated;
        await this.saveCollectionData(collection, data);
        return updated;
    }

    async delete(collection, id) {
        const existing = await this.get(collection, id);
        if (!existing) {
            throw new Error(`Item ${id} not found in ${collection}`);
        }
        
        if (this.useIndexedDB && localForage) {
            try {
                const instance = this.getForageInstance(collection);
                await instance.removeItem(id);
                return;
            } catch (e) {
                // Fallback
            }
        }
        
        const data = await this.getCollectionData(collection);
        delete data[id];
        await this.saveCollectionData(collection, data);
    }
}

export const clientDB = new ClientStorageAdapter();
