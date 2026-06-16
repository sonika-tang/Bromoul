// Mock Database Service for LocalStorage Persistence
// Limited to 4 crops: Mango, Papaya, Banana, Pumpkin
// Role-based data with no login required
// Now includes Chat Conversations Support

const DB_PREFIX = 'bromoul:';
// Bump this when seed data (crops/listings/users) changes so cached browsers re-seed.
const SCHEMA_VERSION = '3';

const initialData = {
  users: [
    {
      id: 'f1',
      name: 'សុខលី',
      role: 'farmer',
      email: 'sokha@farm.com',
      profile_picture: null,
      contact: '012345678',
      location: 'កណ្តាល',
    },
    {
      id: 'b1',
      name: 'Chip Mong Supermarket',
      role: 'buyer',
      email: 'procurement@chipmong.com',
      profile_picture: null,
      contact: '098765432',
      location: 'ភ្នំពេញ',
      verified: true
    },
    {
      id: 'f2',
      name: 'ជាតា',
      role: 'farmer',
      email: 'lekha@farm.com',
      profile_picture: null,
      contact: '088888888',
      location: 'កណ្តាល',
    },
    {
      id: 'b2',
      name: 'AEON MaxValu',
      role: 'buyer',
      email: 'supply@aeonmaxvalu.com',
      profile_picture: null,
      contact: '077777777',
      location: 'ភ្នំពេញ',
      verified: true
    }
  ],
  crops: [
    {
      id: 'c1',
      name_kh: 'ស្វាយកែវរមៀត',
      name_en: 'Keo Romeat Mango',
      category: 'ផ្លែឈើ',
      season: 'រដូវកំពូល៖ កុម្ភៈ–មិថុនា',
      image: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'c2',
      name_kh: 'ល្ហុង',
      name_en: 'Papaya',
      category: 'ផ្លែឈើ',
      season: 'មានពាក់កណ្តាលឆ្នាំ',
      image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'c3',
      name_kh: 'ចេក',
      name_en: 'Banana',
      category: 'ផ្លែឈើ',
      season: 'មានពេញមួយឆ្នាំ',
      image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'c4',
      name_kh: 'ល្ពៅ',
      name_en: 'Pumpkin',
      category: 'បន្លែ',
      season: 'តាមរដូវកាល',
      image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&q=80&w=600',
    }
  ],
  listings: [
    {
      id: 'l1',
      user_id: 'f1',
      crop_id: 'c1',
      type: 'supply',
      quantity: 500,
      unit: 'គីឡូ',
      price_riel: 3000,
      status: 'active',
      location: 'កណ្តាល',
      description: 'ស្វាយកែវរមៀត គុណភាពលេខ១ ប្រមូលផលថ្មី',
      photo_url: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&q=80&w=600',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'l2',
      user_id: 'f1',
      crop_id: 'c3',
      type: 'supply',
      quantity: 800,
      unit: 'គីឡូ',
      price_riel: 1500,
      status: 'active',
      location: 'កំពង់ចាម',
      description: 'ចេកស្រស់ ប្រមូលផលពេញមួយឆ្នាំ',
      photo_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=600',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'l5',
      user_id: 'f2',
      crop_id: 'c4',
      type: 'supply',
      quantity: 350,
      unit: 'គីឡូ',
      price_riel: 2200,
      status: 'active',
      location: 'តាកែវ',
      description: 'ល្ពៅទុំ ផ្អែម សាច់ក្រាស់',
      photo_url: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&q=80&w=600',
      created_at: new Date(Date.now() - 200000000).toISOString()
    },
    {
      id: 'l3',
      user_id: 'b1',
      crop_id: 'c2',
      type: 'demand',
      quantity: 1000,
      unit: 'គីឡូ',
      budget_riel: 5000,
      status: 'active',
      duration: '៧ ថ្ងៃ',
      location: 'ភ្នំពេញ',
      description: 'Chip Mong ត្រូវការល្ហុងផ្គត់ផ្គង់ប្រចាំសប្តាហ៍ ៥០០–១០០០ គីឡូ',
      photo_url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&q=80&w=600',
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'l4',
      user_id: 'b2',
      crop_id: 'c1',
      type: 'demand',
      quantity: 2000,
      unit: 'គីឡូ',
      budget_riel: 3200,
      status: 'active',
      duration: '១៤ ថ្ងៃ',
      location: 'ភ្នំពេញ',
      description: 'AEON MaxValu ត្រូវការស្វាយកែវរមៀត ១–៣ តោន តម្លៃយុត្តិធម៌',
      photo_url: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&q=80&w=600',
      created_at: new Date(Date.now() - 129600000).toISOString()
    }
  ],
  conversations: [
    {
      id: 'b1-f1',
      participantIds: ['b1', 'f1'],
      participantNames: {
        'b1': 'វិចិត្រ',
        'f1': 'សុខា'
      },
      messages: [
        {
          id: '1',
          senderId: 'b1',
          senderName: 'វិចិត្រ',
          text: 'សួស្តី, តើស្វាយនៅមានទេ?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: '2',
          senderId: 'f1',
          senderName: 'សុខា',
          text: 'បាទ, យើងនៅសល់ប្រហែល 500 គីឡូ',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          read: true
        },
        {
          id: '3',
          senderId: 'b1',
          senderName: 'វិចិត្រ',
          text: 'តម្លៃប៉ុន្មាននៃគីឡូ?',
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          read: true
        },
        {
          id: '4',
          senderId: 'f1',
          senderName: 'សុខា',
          text: '3000 រៀល ក្នុងមួយគីឡូ',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          read: true
        }
      ],
      lastMessageTime: new Date(Date.now() - 3300000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  carts: [],
  orders: []
};

class MockDB {
  constructor() {
    this.init();
  }

  init() {
    const storedVersion = localStorage.getItem(DB_PREFIX + 'schemaVersion');
    const isFresh = !localStorage.getItem(DB_PREFIX + 'users');
    const isOutdated = storedVersion !== SCHEMA_VERSION;

    if (isFresh || isOutdated) {
      console.log('🌾 Seeding Bromoul Mock DB (v' + SCHEMA_VERSION + ')...');
      // Re-seed reference + sample collections so updated crops/listings show up.
      // User-generated collections (carts/orders/conversations) are left untouched
      // unless this is a brand-new install.
      const collectionsToSeed = isFresh
        ? Object.keys(initialData)
        : ['users', 'crops', 'listings'];

      collectionsToSeed.forEach(key => {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(initialData[key]));
      });

      localStorage.setItem(DB_PREFIX + 'schemaVersion', SCHEMA_VERSION);
      // Refresh the cached current user (its name/location may have changed).
      localStorage.removeItem(DB_PREFIX + 'currentUser');

      if (!localStorage.getItem(DB_PREFIX + 'currentRole')) {
        localStorage.setItem(DB_PREFIX + 'currentRole', 'farmer');
      }
    }
  }

  // Reset all data to initial state
  reset() {
    console.log('Resetting Bromoul Mock DB...');
    localStorage.removeItem(DB_PREFIX + 'users');
    localStorage.removeItem(DB_PREFIX + 'crops');
    localStorage.removeItem(DB_PREFIX + 'listings');
    localStorage.removeItem(DB_PREFIX + 'carts');
    localStorage.removeItem(DB_PREFIX + 'orders');
    localStorage.removeItem(DB_PREFIX + 'conversations');
    localStorage.removeItem(DB_PREFIX + 'currentRole');
    localStorage.removeItem(DB_PREFIX + 'currentUser');
    localStorage.removeItem(DB_PREFIX + 'bromoul:cart');
    this.init();
  }

  _read(collection) {
    return JSON.parse(localStorage.getItem(DB_PREFIX + collection) || '[]');
  }

  _write(collection, data) {
    localStorage.setItem(DB_PREFIX + collection, JSON.stringify(data));
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

  // Chat-specific methods
  getConversation(conversationId) {
    const conversations = this._read('conversations');
    return conversations.find(c => c.id === conversationId);
  }

  saveConversation(conversation) {
    const conversations = this._read('conversations');
    const idx = conversations.findIndex(c => c.id === conversation.id);
    if (idx === -1) {
      conversations.push(conversation);
    } else {
      conversations[idx] = conversation;
    }
    this._write('conversations', conversations);
  }

  // Role management
  setCurrentRole(role) {
    localStorage.setItem(DB_PREFIX + 'currentRole', role);
    // Get user for this role
    const users = this._read('users');
    const user = users.find(u => u.role === role);
    if (user) {
      localStorage.setItem(DB_PREFIX + 'currentUser', JSON.stringify(user));
    }
    window.dispatchEvent(new Event('roleChanged'));
  }

  getCurrentRole() {
    return localStorage.getItem(DB_PREFIX + 'currentRole') || 'farmer';
  }

  getCurrentUser() {
    const userJson = localStorage.getItem(DB_PREFIX + 'currentUser');
    if (!userJson) {
      const role = this.getCurrentRole();
      const users = this._read('users');
      const user = users.find(u => u.role === role);
      if (user) {
        localStorage.setItem(DB_PREFIX + 'currentUser', JSON.stringify(user));
        return user;
      }
    }
    return userJson ? JSON.parse(userJson) : null;
  }
}

export const db = new MockDB();

// Initialize default user on load
if (!localStorage.getItem(DB_PREFIX + 'currentUser')) {
  db.setCurrentRole('farmer');
}