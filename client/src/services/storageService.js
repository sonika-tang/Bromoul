const DB_PREFIX = 'bromoul:';

export const StorageService = {
  read: async (key) => {
    const fullKey = DB_PREFIX + key;
    try {
      const data = localStorage.getItem(fullKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Storage read error:', e);
      return [];
    }
  },

  write: async (key, data) => {
    const fullKey = DB_PREFIX + key;
    try {
      localStorage.setItem(fullKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage write error:', e);
      return false;
    }
  },

  query: async (key, filter = {}) => {
    let items = await StorageService.read(key);
    if (!filter || Object.keys(filter).length === 0) return items;
    
    return items.filter(item => {
      return Object.entries(filter).every(([k, v]) => {
        if (v === undefined || v === null) return true;
        return item[k] == v;
      });
    });
  },

  clear: async () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(DB_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};