import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/mockDB';

const Messaging = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUser = db.getCurrentUser();
  const allUsers = db._read('users');

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 1000); // Poll for new messages
    
    // Check if we need to open a conversation with a specific user
    const targetUserId = localStorage.getItem('bromoul:chatWithUserId');
    if (targetUserId) {
      // Find or create conversation
      setTimeout(() => {
        const convKey = getConversationKey(currentUser.id, targetUserId);
        const existingConv = conversations.find(c => c.id === convKey);
        if (existingConv) {
          setActiveConversationId(existingConv.id);
        } else {
          startConversation(targetUserId);
        }
        localStorage.removeItem('bromoul:chatWithUserId');
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const getConversationKey = (userId1, userId2) => {
    // Create consistent key regardless of order
    return [userId1, userId2].sort().join('-');
  };

  const loadConversations = () => {
    setLoading(true);
    try {
      const allConversations = db._read('conversations') || [];
      
      // Filter conversations where current user is a participant
      const userConversations = allConversations.filter(conv =>
        conv.participantIds.includes(currentUser.id)
      );

      // Sort by last message time (newest first)
      userConversations.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageTime || 0).getTime();
        return timeB - timeA;
      });

      setConversations(userConversations);

      // Auto-select first conversation
      if (userConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(userConversations[0].id);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (conversationId) => {
    try {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setMessages(conv.messages || []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const startConversation = (otherUserId) => {
    const convKey = getConversationKey(currentUser.id, otherUserId);
    let allConversations = db._read('conversations') || [];
    
    // Check if conversation already exists
    let existing = allConversations.find(c => 
      c.participantIds.includes(currentUser.id) && 
      c.participantIds.includes(otherUserId)
    );

    if (!existing) {
      const otherUser = allUsers.find(u => u.id === otherUserId);
      existing = {
        id: convKey,
        participantIds: [currentUser.id, otherUserId],
        participantNames: {
          [currentUser.id]: currentUser.name,
          [otherUserId]: otherUser?.name || 'Unknown'
        },
        messages: [],
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      allConversations.push(existing);
      db._write('conversations', allConversations);
    }

    setActiveConversationId(existing.id);
    loadConversations();
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversationId) {
      return;
    }

    try {
      const allConversations = db._read('conversations') || [];
      const convIndex = allConversations.findIndex(c => c.id === activeConversationId);
      
      if (convIndex === -1) {
        console.error('Conversation not found');
        return;
      }

      const newMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
      };

      allConversations[convIndex].messages.push(newMessage);
      allConversations[convIndex].lastMessageTime = new Date().toISOString();
      
      db._write('conversations', allConversations);
      
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      // Trigger update for other components
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (err) {
      console.error('Error sending message:', err);
      alert('មានបញ្ហាក្នុងការផ្ញើសារ');
    }
  };

  const getOtherParticipant = (conversation) => {
    const otherUserId = conversation.participantIds.find(id => id !== currentUser.id);
    return allUsers.find(u => u.id === otherUserId);
  };

  const getLastMessage = (conversation) => {
    if (conversation.messages.length === 0) return '';
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    const isMe = lastMsg.senderId === currentUser.id;
    return (isMe ? 'ខ្ញុំ: ' : '') + (lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + '...' : lastMsg.text);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'ឥឡូវ';
    if (diffMinutes < 60) return diffMinutes + ' នាទីមុន';
    if (diffMinutes < 1440) return Math.floor(diffMinutes / 60) + ' ម៉ោងមុន';
    
    return date.toLocaleDateString('km-KH');
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConversation ? getOtherParticipant(activeConversation) : null;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <h1 style={{ marginBottom: '24px' }}>💬 សារ</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '24px',
        height: 'calc(100vh - 200px)',
        minHeight: '600px'
      }}>
        {/* Conversations Sidebar */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            ការសន្ទនា
          </div>

          {/* Conversations List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {conversations.length === 0 ? (
              <div style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                មិនមានការសន្ទនាទេ
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: activeConversationId === conv.id ? '#e8f5e9' : 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = '#f9f9f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#333'
                      }}>
                        {otherUser?.name || 'Unknown'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#999'
                      }}>
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '13px',
                      color: '#666',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {getLastMessage(conv)}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Start New Conversation */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            background: '#f9f9f9'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: '600', color: '#666' }}>
              ចាប់ផ្តើមថ្មី
            </div>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {allUsers
                .filter(u => u.id !== currentUser.id)
                .filter(u => !conversations.some(c => c.participantIds.includes(u.id)))
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: '#333',
                      fontFamily: 'Noto Sans Khmer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4CAF50';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = '#4CAF50';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#333';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}
                  >
                    {user.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {activeConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9f9f9'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {otherParticipant.name}
                  </h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                    {otherParticipant.role === 'farmer' ? '🚜 កសិករ' : '🛒 អ្នកទិញ'}
                  </p>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {otherParticipant.location || 'Unknown'}
                </div>
              </div>

              {/* Messages List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                background: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#999',
                    paddingTop: '40px',
                    fontSize: '14px'
                  }}>
                    មិនមានសារទេ។ ចាប់ផ្តើមការសន្ទនា!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMyMessage = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end',
                          gap: '8px'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          background: isMyMessage ? '#4CAF50' : 'white',
                          color: isMyMessage ? 'white' : '#333',
                          padding: '12px 16px',
                          borderRadius: isMyMessage ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          wordWrap: 'break-word',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          border: isMyMessage ? 'none' : '1px solid #e0e0e0'
                        }}>
                          <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            lineHeight: '1.4'
                          }}>
                            {msg.text}
                          </p>
                          <span style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            display: 'block',
                            textAlign: 'right'
                          }}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} style={{
                padding: '16px',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: '12px',
                background: 'white'
              }}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="វាយសារ..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '24px',
                    fontSize: '16px',
                    fontFamily: 'Noto Sans Khmer',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  style={{
                    padding: '12px 24px',
                    background: messageText.trim() ? '#4CAF50' : '#e0e0e0',
                    color: messageText.trim() ? 'white' : '#999',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans Khmer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (messageText.trim()) {
                      e.currentTarget.style.background = '#43a047';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (messageText.trim()) {
                      e.currentTarget.style.background = '#4CAF50';
                    }
                  }}
                >
                  ផ្ញើ
                </button>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>💬</div>
              <p>ជ្រើសរើស ឬបង្កើតការសន្ទនា ដើម្បីចាប់ផ្តើម</p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          [style*="gridTemplateColumns: '300px 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Messaging;