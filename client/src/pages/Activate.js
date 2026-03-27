import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Activate() {
    const { link } = useParams();
    const [message, setMessage] = useState('Зачекайте, йде підтвердження...');
    const [isSuccess, setIsSuccess] = useState(false);

    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const activateAccount = async () => {
            try {
                const response = await axios.get(`/api/auth/activate/${link}`);
                setMessage(response.data.message);
                if (response.data.email) {
                    setUserEmail(response.data.email);
                }
                setIsSuccess(true);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Помилка підтвердження або посилання застаріло');
                setIsSuccess(false);
            }
        };

        activateAccount();
    }, [link]);

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: isSuccess ? '#155724' : '#dc3545', marginBottom: '20px' }}>
                {message}
            </h2>

            <Link
                to="/authorization"
                state={{ prefilledEmail: userEmail }}
                style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
                Перейти до сторінки входу
            </Link>
        </div>
    );
}

export default Activate;