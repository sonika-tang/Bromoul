
import { StorageService } from './storage';

const FARMER_PRODUCTS_KEY = 'ls_farmer_products';
const BUYER_REQUESTS_KEY = 'ls_buyer_requests';

export const ProductService = {
    // --- Farmer Products ---

    getFarmerProducts: async (filters = {}) => {
        const products = await StorageService.read(FARMER_PRODUCTS_KEY);
        return products.filter(p => {
            if (filters.userId && p.userId !== filters.userId) return false;
            if (filters.cropId && p.cropId !== filters.cropId) return false;
            return true;
        });
    },

    createFarmerProduct: async (product) => {
        const products = await StorageService.read(FARMER_PRODUCTS_KEY);
        const newProduct = {
            id: StorageService.generateId(),
            createdAt: new Date().toISOString(),
            // Add certification and price defaults if missing
            certification: 'None',
            price: 0,
            ...product
        };
        products.push(newProduct);
        await StorageService.write(FARMER_PRODUCTS_KEY, products);
        return newProduct;
    },

    // --- Buyer Requests ---

    getBuyerRequests: async (filters = {}) => {
        const requests = await StorageService.read(BUYER_REQUESTS_KEY);
        return requests.filter(r => {
            if (filters.userId && r.userId !== filters.userId) return false;
            if (filters.cropId && r.cropId !== filters.cropId) return false;
            return true;
        });
    },

    createBuyerRequest: async (request) => {
        const requests = await StorageService.read(BUYER_REQUESTS_KEY);
        const newRequest = {
            id: StorageService.generateId(),
            createdAt: new Date().toISOString(),
            // Add budget default if missing
            budget: 0,
            ...request
        };
        requests.push(newRequest);
        await StorageService.write(BUYER_REQUESTS_KEY, requests);
        return newRequest;
    }
};
