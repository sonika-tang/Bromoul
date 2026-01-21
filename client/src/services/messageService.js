import { StorageService } from './storageService';

export const MessageService = {
  getConversations: async (userId) => {
    const messages = await StorageService.read('messages');
    const partners = new Set();
    
    messages.forEach(msg => {
      if (msg.sender_id === userId) partners.add(msg.receiver_id);
      if (msg.receiver_id === userId) partners.add(msg.sender_id);
    });
    
    return Array.from(partners);
  },

  getMessages: async (userId, partnerId) => {
    const messages = await StorageService.read('messages');
    return messages.filter(m =>
      (m.sender_id === userId && m.receiver_id === partnerId) ||
      (m.sender_id === partnerId && m.receiver_id === userId)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  sendMessage: async (senderId, receiverId, text) => {
    const messages = await StorageService.read('messages');
    const newMessage = {
      id: 'm' + Date.now(),
      sender_id: senderId,
      receiver_id: receiverId,
      text,
      created_at: new Date().toISOString()
    };
    messages.push(newMessage);
    await StorageService.write('messages', messages);
    return newMessage;
  }
};