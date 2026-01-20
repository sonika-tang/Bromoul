import { MemoryAdapter } from '../storage/adapter';

describe('MemoryAdapter', () => {
    let adapter: MemoryAdapter;

    beforeEach(() => {
        adapter = new MemoryAdapter();
    });

    describe('create', () => {
        it('should create a new item', async () => {
            const item = await adapter.create('test', { name: 'Test Item' });
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('name', 'Test Item');
            expect(item).toHaveProperty('created_at');
        });

        it('should use provided id if given', async () => {
            const item = await adapter.create('test', { id: 'custom-id', name: 'Test' });
            expect(item.id).toBe('custom-id');
        });
    });

    describe('get', () => {
        it('should return null for non-existent item', async () => {
            const result = await adapter.get('test', 'non-existent');
            expect(result).toBeNull();
        });

        it('should return item by id', async () => {
            const created = await adapter.create('test', { name: 'Test' });
            const retrieved = await adapter.get('test', created.id);
            expect(retrieved).toEqual(created);
        });

        it('should return all items when id not provided', async () => {
            await adapter.create('test', { name: 'Item 1' });
            await adapter.create('test', { name: 'Item 2' });
            const all = await adapter.get('test');
            expect(all).toHaveLength(2);
        });
    });

    describe('query', () => {
        it('should return all items when no filter', async () => {
            await adapter.create('test', { name: 'Item 1', type: 'A' });
            await adapter.create('test', { name: 'Item 2', type: 'B' });
            const results = await adapter.query('test');
            expect(results).toHaveLength(2);
        });

        it('should filter by properties', async () => {
            await adapter.create('test', { name: 'Item 1', type: 'A' });
            await adapter.create('test', { name: 'Item 2', type: 'B' });
            const results = await adapter.query('test', { type: 'A' });
            expect(results).toHaveLength(1);
            expect(results[0].type).toBe('A');
        });
    });

    describe('update', () => {
        it('should update existing item', async () => {
            const created = await adapter.create('test', { name: 'Original' });
            const updated = await adapter.update('test', created.id, { name: 'Updated' });
            expect(updated.name).toBe('Updated');
            expect(updated).toHaveProperty('updated_at');
        });

        it('should throw error for non-existent item', async () => {
            await expect(adapter.update('test', 'non-existent', { name: 'Test' }))
                .rejects.toThrow();
        });
    });

    describe('delete', () => {
        it('should delete existing item', async () => {
            const created = await adapter.create('test', { name: 'To Delete' });
            await adapter.delete('test', created.id);
            const retrieved = await adapter.get('test', created.id);
            expect(retrieved).toBeNull();
        });

        it('should throw error for non-existent item', async () => {
            await expect(adapter.delete('test', 'non-existent'))
                .rejects.toThrow();
        });
    });
});
