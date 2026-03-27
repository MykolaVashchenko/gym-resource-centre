import React from 'react';

function Profile() {
    // Дістаємо пошту з пам'яті браузера
    const email = localStorage.getItem('userEmail');

    const handleLogout = () => {
        // При виході видаляємо всі дані
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        // Перекидаємо на головну сторінку
        window.location.href = '/';
    };

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2>Особистий кабінет</h2>

            <div style={{ margin: '30px 0', fontSize: '18px' }}>
                Ви увійшли як: <strong>{email}</strong>
            </div>

            <button
                onClick={handleLogout}
                style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Вийти з акаунту
            </button>
        </div>
    );
}

export default Profile;