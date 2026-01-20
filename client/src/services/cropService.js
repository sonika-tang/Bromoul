
import { StorageService } from './storage';

const CROPS_KEY = 'ls_crops';

export const CropService = {
    getCrops: async () => {
        return await StorageService.read(CROPS_KEY);
    },

    getCropById: async (id) => {
        const crops = await StorageService.read(CROPS_KEY);
        return crops.find(c => c.id === id) || null;
    }
};
