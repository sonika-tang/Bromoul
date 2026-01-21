import { StorageService } from './storageService';

export const AnalyticsService = {
  getStats: async () => {
    const listings = await StorageService.read('listings');
    const crops = await StorageService.read('crops');
    
    return crops.map(crop => {
      const cropListings = listings.filter(l => l.crop_id === crop.id);
      const supply = cropListings
        .filter(l => l.type === 'supply')
        .reduce((sum, l) => sum + (l.quantity || 0), 0);
      const demand = cropListings
        .filter(l => l.type === 'demand')
        .reduce((sum, l) => sum + (l.quantity || 0), 0);
      
      const total = supply + demand || 1;
      return {
        id: crop.id,
        crop_name: crop.name_kh,
        supply,
        demand,
        supply_percent: Math.round((supply / total) * 100),
        demand_percent: Math.round((demand / total) * 100)
      };
    }).filter(s => s.supply > 0 || s.demand > 0);
  }
};
