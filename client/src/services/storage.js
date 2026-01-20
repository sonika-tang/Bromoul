
/**
 * Generic Local Storage Service
 * Simulates async API calls with delays
 */

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  /**
   * Read data from local storage
   * @param {string} key 
   * @returns {Promise<any[]>}
   */
  read: async (key) => {
    await delay();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Write data to local storage
   * @param {string} key 
   * @param {any} data 
   * @returns {Promise<boolean>}
   */
  write: async (key, data) => {
    await delay();
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage', error);
      return false;
    }
  },

  /**
   * Helper to generate ID
   */
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};
