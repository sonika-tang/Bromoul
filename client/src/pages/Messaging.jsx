import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/mockDB';
import styles from './Messaging.module.css';

/* ── Quick-reply suggestions by current user role ─────────── */
const QUICK_REPLIES = {
  farmer: [
    'ផលិតផលស្រស់ ប្រមូលផលថ្មីៗ',
    'តម្លៃអាចចរចាបាន',
    'អាចដឹកជញ្ជូនបាន',
    'ចង់ទិញ ប៉ុន្មានគីឡូ?',
    'Wholesale មានបញ្ចុះតម្លៃ',
    'ផ្ញើ Location ទៅ',
  ],
  buyer: [
    'ផលិតផលនៅ Stock ទេ?',
    'តម្លៃ ១ គីឡូ ប៉ុន្មាន?',
    'អាចដឹកទៅ ភ្នំពេញ ទេ?',
    'យើងត្រូវការ ១ តោន/សប្តាហ៍',
    'មានការធានាគុណភាពទេ?',
    'ចង់ Sign Contract',
  ],
};

/* ── Icons ────────────────────────────────────────────────── */
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const activeConvIdRef = useRef(null);

  // Always read live from localStorage so interval callbacks are never stale
  const currentUser = db.getCurrentUser();
  const currentRole = db.getCurrentRole();
  const allUsers = db._read('users');

  const quickReplies = QUICK_REPLIES[currentRole] || QUICK_REPLIES.farmer;

  // Keep ref in sync so interval can access latest value without stale closure
  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 1500);

    const targetId = localStorage.getItem('bromoul:chatWithUserId');
    if (targetId) {
      localStorage.removeItem('bromoul:chatWithUserId');
      setTimeout(() => openOrCreate(targetId), 300);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      const conv = db._read('conversations').find(c => c.id === activeConvId);
      if (conv) setMessages(conv.messages || []);
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const convKey = (a, b) => [a, b].sort().join('-');

  const loadConversations = () => {
    // Read user fresh every tick — avoids stale closure when role switches
    const user = db.getCurrentUser();
    if (!user) return;
    const all = db._read('conversations') || [];
    const mine = all
      .filter(c => c.participantIds.includes(user.id))
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    setConversations(mine);
    setActiveConvId(prev => {
      if (!prev && mine.length > 0) return mine[0].id;
      return prev;
    });
  };

  const openOrCreate = (otherId) => {
    const user = db.getCurrentUser();
    if (!user) return;
    const key = convKey(user.id, otherId);
    const all = db._read('conversations') || [];
    let conv = all.find(c =>
      c.participantIds.includes(user.id) && c.participantIds.includes(otherId)
    );
    if (!conv) {
      const other = allUsers.find(u => u.id === otherId);
      conv = {
        id: key,
        participantIds: [user.id, otherId],
        participantNames: {
          [user.id]: user.name,
          [otherId]: other?.name || 'Unknown',
        },
        messages: [],
        lastMessageTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      all.push(conv);
      db._write('conversations', all);
    }
    setActiveConvId(conv.id);
    loadConversations();
  };

  const sendMessage = (e, quickText) => {
    if (e) e.preventDefault();
    const msgText = quickText || text;
    const convId = activeConvIdRef.current;
    if (!msgText.trim() || !convId) return;

    const user = db.getCurrentUser();
    if (!user) return;

    const all = db._read('conversations') || [];
    const idx = all.findIndex(c => c.id === convId);
    if (idx === -1) return;

    const msg = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: msgText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    all[idx].messages.push(msg);
    all[idx].lastMessageTime = msg.timestamp;
    db._write('conversations', all);
    setMessages(prev => [...prev, msg]);
    setText('');
    window.dispatchEvent(new Event('messagesUpdated'));
  };

  const getOther = (conv) => {
    const otherId = conv.participantIds.find(id => id !== currentUser.id);
    return allUsers.find(u => u.id === otherId);
  };

  const getPreview = (conv) => {
    if (!conv.messages.length) return 'ចាប់ផ្ដើមការសន្ទនា...';
    const last = conv.messages[conv.messages.length - 1];
    const prefix = last.senderId === currentUser.id ? 'ខ្ញុំ: ' : '';
    const t = last.text;
    return prefix + (t.length > 32 ? t.slice(0, 32) + '…' : t);
  };

  const fmtTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return 'ឥឡូវ';
    if (diff < 60) return diff + ' នាទី';
    if (diff < 1440) return Math.floor(diff / 60) + ' ម៉ោង';
    return new Date(ts).toLocaleDateString('km-KH');
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherUser = activeConv ? getOther(activeConv) : null;
  const isBuyer = (u) => u?.role === 'buyer';

  const newContactList = allUsers
    .filter(u => u.id !== currentUser.id)
    .filter(u => !conversations.some(c => c.participantIds.includes(u.id)));

  const totalMsgs = conversations.reduce((n, c) => n + c.messages.length, 0);

  return (
    <div className={styles.page}>

      {/* ── Compact gradient header ──────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerBlob1} />
        <div className={styles.headerBlob2} />
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <span className={styles.headerTag}>សារ · Chat</span>
              <h1 className={styles.headerTitle}>ការសន្ទនា</h1>
            </div>
            <div className={styles.headerMeta}>
              <div className={styles.headerStat}>
                <strong>{conversations.length}</strong>
                <span>សន្ទនា</span>
              </div>
              <div className={styles.headerStatLine} />
              <div className={styles.headerStat}>
                <strong>{totalMsgs}</strong>
                <span>សារទាំងអស់</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chat area ────────────────────────────────────────── */}
      <div className={styles.chatArea}>
        <div className="container" style={{ height: '100%' }}>
          <div className={styles.layout}>

            {/* ── Sidebar ─────────────────────────────────────── */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarHeader}>ការសន្ទនា ({conversations.length})</div>

              <div className={styles.convList}>
                {conversations.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-lighter)', fontSize: '13px' }}>
                    មិនទាន់មានការសន្ទនា
                  </div>
                ) : conversations.map(conv => {
                  const other = getOther(conv);
                  const isActive = conv.id === activeConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
                    >
                      <div className={`${styles.convAvatar} ${isBuyer(other) ? styles.convAvatarBuyer : ''}`}>
                        {isBuyer(other) ? '🏪' : '🌾'}
                      </div>
                      <div className={styles.convInfo}>
                        <div className={styles.convNameRow}>
                          <span className={styles.convName}>{other?.name || 'Unknown'}</span>
                          <span className={styles.convTime}>{fmtTime(conv.lastMessageTime)}</span>
                        </div>
                        <p className={styles.convPreview}>{getPreview(conv)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Start new conversation */}
              {newContactList.length > 0 && (
                <div className={styles.newConvPanel}>
                  <div className={styles.newConvLabel}>ទំនាក់ទំនងថ្មី</div>
                  <div className={styles.newConvList}>
                    {newContactList.map(u => (
                      <button
                        key={u.id}
                        onClick={() => openOrCreate(u.id)}
                        className={`${styles.newConvBtn} ${isBuyer(u) ? styles.newConvBtnBuyer : ''}`}
                      >
                        {isBuyer(u) ? '🏪' : '🌾'} {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Chat window ──────────────────────────────────── */}
            <div className={styles.chatWindow}>
              {activeConv && otherUser ? (
                <>
                  {/* Header */}
                  <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderLeft}>
                      <div className={`${styles.chatAvatar} ${isBuyer(otherUser) ? styles.chatAvatarBuyer : ''}`}>
                        {isBuyer(otherUser) ? '🏪' : '🌾'}
                      </div>
                      <div>
                        <p className={styles.chatContactName}>{otherUser.name}</p>
                        <span className={`${styles.chatContactRole} ${isBuyer(otherUser) ? styles.rolePillBuyer : styles.rolePillFarmer}`}>
                          {isBuyer(otherUser) ? 'ផ្សារទំនើប · Buyer' : 'កសិករ · Farmer'}
                        </span>
                      </div>
                    </div>
                    {otherUser.location && (
                      <span className={styles.chatLocBadge}>📍 {otherUser.location}</span>
                    )}
                  </div>

                  {/* Messages */}
                  <div className={styles.messages}>
                    {messages.length === 0 ? (
                      <div className={styles.emptyChat}>
                        <div className={styles.emptyChatIcon}><IconChat /></div>
                        <p className={styles.emptyChatText}>មិនទាន់មានសារ</p>
                        <p className={styles.emptyChatHint}>
                          ប្រើ "ចម្លើយរហ័ស" ខាងក្រោម ឬ វាយសារដើម្បីចាប់ផ្ដើម
                        </p>
                      </div>
                    ) : messages.map(msg => {
                      const mine = msg.senderId === currentUser.id;
                      return (
                        <div key={msg.id} className={`${styles.msgRow} ${mine ? styles.msgRowMine : ''}`}>
                          {!mine && (
                            <div className={`${styles.msgAvatarSmall} ${isBuyer(otherUser) ? styles.convAvatarBuyer : ''}`}>
                              {isBuyer(otherUser) ? '🏪' : '🌾'}
                            </div>
                          )}
                          <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                            <p className={styles.bubbleText}>{msg.text}</p>
                            <span className={styles.bubbleTime}>{fmtTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick replies */}
                  <div className={styles.quickReplies}>
                    {quickReplies.map((q, i) => (
                      <button
                        key={i}
                        className={styles.quickReplyChip}
                        onClick={() => sendMessage(null, q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className={styles.inputArea}>
                    <input
                      className={styles.msgInput}
                      type="text"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="វាយសារ..."
                    />
                    <button type="submit" disabled={!text.trim()} className={styles.sendBtn}>
                      <IconSend /> ផ្ញើ
                    </button>
                  </form>
                </>
              ) : (
                <div className={styles.noChatSelected}>
                  <div className={styles.noChatIcon}><IconChat /></div>
                  <p className={styles.noChatText}>ជ្រើសរើសការសន្ទនា</p>
                  <p className={styles.noChatHint}>
                    ចុចលើការសន្ទនានៅខាងឆ្វេង ឬ បង្កើតទំនាក់ទំនងថ្មី
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
