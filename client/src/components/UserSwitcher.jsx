
import React from 'react';
import { AuthService } from '../services/api';

const UserSwitcher = () => {
    const handleSwitch = async (role) => {
        await AuthService.login('ignored', role);
        window.location.reload();
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 9999
        }}>
            <strong style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Dev: Switch Role</strong>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleSwitch('farmer')} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Farmer</button>
                <button onClick={() => handleSwitch('buyer')} style={{ background: '#2196F3', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Buyer</button>
                <button onClick={() => AuthService.logout()} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
            </div>
        </div>
    );
};

export default UserSwitcher;
