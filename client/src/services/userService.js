
import { StorageService } from './storage';

const USERS_KEY = 'ls_users';

export const UserService = {
    getUsers: async () => {
        return await StorageService.read(USERS_KEY);
    },

    getUserById: async (id) => {
        const users = await StorageService.read(USERS_KEY);
        return users.find(u => u.id === id) || null;
    },

    /**
     * @param {Object} user - { name, email, role, avatarUrl? }
     */
    createUser: async (user) => {
        const users = await StorageService.read(USERS_KEY);
        const newUser = {
            id: StorageService.generateId(),
            ...user
        };
        users.push(newUser);
        await StorageService.write(USERS_KEY, users);
        return newUser;
    },

    updateUser: async (id, updates) => {
        const users = await StorageService.read(USERS_KEY);
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');

        users[index] = { ...users[index], ...updates };
        await StorageService.write(USERS_KEY, users);
        return users[index];
    },

    // Simple login mock - just finds first user of that role or creats a mock one if empty
    loginAsRole: async (role) => {
        const users = await StorageService.read(USERS_KEY);
        let user = users.find(u => u.role === role);
        return user || null;
    }
};
