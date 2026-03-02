import React, { useState } from 'react';
import service from './service';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Login = ({onLogin}) => {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await service.login(email, password);
            onLogin();
            navigate('/tasks'); // אחרי לוגין מוצלח, עוברים לדף הבית (המשימות)
        } catch (err) {
            alert("Login failed! Check your credentials.");
        }
    };

    return (
        <div className="auth-container">
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="form-group">
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit">Login</button>
        </form>
        </div>
            
    );
};

export default Login;


