import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Messaging.module.css';

const Messaging = () => {
    const [activeChat, setActiveChat] = useState(1);
    const [message, setMessage] = useState('');

    const chats = [
        { id: 1, name: 'កសិដ្ឋាន សុខា', lastMsg: 'បាទ/ចាស, យើងមាន 500kg។', time: '10:30 ព្រឹក', avatar: 'https://via.placeholder.com/40' },
        { id: 2, name: 'តារា ដឹកជញ្ជូន', lastMsg: 'អ្នកបើកបរទៅដល់ហើយ។', time: 'ម្សិលមិញ', avatar: 'https://via.placeholder.com/40' },
    ];

    const messages = [
        { id: 1, sender: 'them', text: 'សួស្តី, តើស្រូវផ្កាម្លិះនៅមានទេ?', time: '10:00 ព្រឹក' },
        { id: 2, sender: 'me', text: 'បាទ/ចាស, យើងនៅសល់ប្រហែល 500kg។', time: '10:05 ព្រឹក' },
        { id: 3, sender: 'them', text: 'ល្អណាស់! អាចផ្ញើលិខិតបញ្ជាក់បានទេ?', time: '10:15 ព្រឹក' },
        { id: 4, sender: 'me', text: 'បាន, កំពុងផ្ញើជូន។', time: '10:20 ព្រឹក', file: 'certification.pdf' },
        { id: 5, sender: 'them', text: 'អរគុណ។ តើលក់ដុំតម្លៃប៉ុន្មាន?', time: '10:25 ព្រឹក' },
        { id: 6, sender: 'me', text: 'សម្រាប់ 500kg, ខ្ញុំអាចជូនតម្លៃ 4,600 ៛/kg។', time: '10:30 ព្រឹក' },
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            // Add message logic here (mock)
            console.log('Sending:', message);
            setMessage('');
        }
    };

    return (
        <div className={`container ${styles.messaging}`}>
            <div className={styles.layout}>
                <Card className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>សារ</h2>
                    <div className={styles.chatList}>
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`${styles.chatItem} ${activeChat === chat.id ? styles.active : ''}`}
                                onClick={() => setActiveChat(chat.id)}
                            >
                                <img src={chat.avatar} alt={chat.name} className={styles.avatar} />
                                <div className={styles.chatInfo}>
                                    <div className={styles.chatHeader}>
                                        <span className={styles.name}>{chat.name}</span>
                                        <span className={styles.time}>{chat.time}</span>
                                    </div>
                                    <p className={styles.lastMsg}>{chat.lastMsg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className={styles.chatWindow}>
                    <div className={styles.chatTop}>
                        <div className={styles.chatHeaderInfo}>
                            <img src="https://via.placeholder.com/40" alt="Avatar" className={styles.avatar} />
                            <h3>កសិដ្ឋាន សុខា</h3>
                        </div>
                        <Button variant="outline" className={styles.smBtn}>មើលប្រវត្តិរូប</Button>
                    </div>

                    <div className={styles.messagesList}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.messageRow} ${msg.sender === 'me' ? styles.myMsgRow : ''}`}>
                                <div className={`${styles.bubble} ${msg.sender === 'me' ? styles.myBubble : styles.theirBubble}`}>
                                    {msg.text}
                                    {msg.file && (
                                        <div className={styles.fileAttachment}>
                                            <span>📄 {msg.file}</span>
                                        </div>
                                    )}
                                </div>
                                <span className={styles.msgTime}>{msg.time}</span>
                            </div>
                        ))}
                    </div>

                    <form className={styles.inputArea} onSubmit={handleSend}>
                        <Button variant="outline" type="button" className={styles.attachBtn}>📎</Button>
                        <input
                            className={styles.msgInput}
                            placeholder="វាយសារ..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button type="submit" variant="primary">ផ្ញើ</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Messaging;
