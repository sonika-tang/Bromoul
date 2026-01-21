// Mock Database Service for LocalStorage Persistence
// Limited to 4 crops: Mango, Papaya, Banana, Pumpkin
// Role-based data with no login required
// Now includes Chat Conversations Support

const DB_PREFIX = 'bromoul:';

const initialData = {
  users: [
    {
      id: 'f1',
      name: 'សុខលី',
      role: 'farmer',
      email: 'sokha@farm.com',
      profile_picture: null,
      contact: '012345678',
      location: 'បាត់ដំបង',
    },
    {
      id: 'b1',
      name: 'ជៀវ',
      role: 'buyer',
      email: 'vichitra@buyer.com',
      profile_picture: null,
      contact: '098765432',
      location: 'ភ្នំពេញ',
    },
    {
      id: 'f2',
      name: 'ជាតា',
      role: 'farmer',
      email: 'lekha@farm.com',
      profile_picture: null,
      contact: '088888888',
      location: 'កាលវាល',
    },
    {
      id: 'b2',
      name: 'ន្និកា',
      role: 'buyer',
      email: 'deng@buyer.com',
      profile_picture: null,
      contact: '077777777',
      location: 'សៀមរាប',
      verified: false
    }
  ],
  crops: [
    {
      id: 'c1',
      name_kh: 'ស្វាយ',
      name_en: 'Mango',
      category: 'ផ្លែឈើ',
    },
    {
      id: 'c2',
      name_kh: 'ល្ហុង',
      name_en: 'Papaya',
      category: 'ផ្លែឈើ',
    },
    {
      id: 'c3',
      name_kh: 'ចេក',
      name_en: 'Banana',
      category: 'ផ្លែឈើ',
    },
    {
      id: 'c4',
      name_kh: 'ល្ពៅ',
      name_en: 'Pumpkin',
      category: 'បន្លែ',
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
      location: 'បាត់ដំបង',
      description: 'ស្វាយកែវរមៀត គុណភាពលេខ១',
      photo_url: 'https://images.unsplash.com/photo-1585518419759-69cf4a1dd103?auto=format&fit=crop&q=80&w=400',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'l2',
      user_id: 'f1',
      crop_id: 'c3',
      type: 'supply',
      quantity: 200,
      unit: 'គីឡូ',
      price_riel: 1500,
      status: 'active',
      location: 'បាត់ដំបង',
      description: 'ចេកទើបប្រមូលផល',
      photo_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'l3',
      user_id: 'b1',
      crop_id: 'c2',
      type: 'demand',
      quantity: 100,
      unit: 'គីឡូ',
      budget_riel: 5000,
      status: 'active',
      duration: '៧ ថ្ងៃ',
      location: 'ភ្នំពេញ',
      description: 'ត្រូវការល្ហុង',
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'l4',
      user_id: 'b1',
      crop_id: 'c4',
      type: 'demand',
      quantity: 50,
      unit: 'គីឡូ',
      budget_riel: 2000,
      status: 'active',
      duration: '១៤ ថ្ងៃ',
      location: 'ភ្នំពេញ',
      description: 'សម្រាប់ផលិតកម្មម្ហូប',
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
    // Check if data already exists
    if (!localStorage.getItem(DB_PREFIX + 'users')) {
      console.log('🌾 Seeding Bromoul Mock DB...');
      Object.keys(initialData).forEach(key => {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(initialData[key]));
      });
      // Set default role
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