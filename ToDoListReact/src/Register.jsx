import React, { useState } from 'react';
import service from './service';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // שולחים לשרת את כל פרטי המשתמש
            await service.register(email, username, password);
            alert("נרשמת בהצלחה! כעת תוכל להתחבר.");
            navigate('/login'); // מעבר אוטומטי לדף הלוגין
        } catch (err) {
            console.error(err);
            alert("ההרשמה נכשלה. ייתכן והמשתמש כבר קיים.");
        }
    };

    return (
        
        <div className="auth-container">
            <h2 >הרשמה למערכת</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                <input 
                    type="text" 
                    placeholder="שם משתמש" 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                /></div>
                <div className="form-group">
                <input 
                    type="email" 
                    placeholder="אימייל" 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                /></div>
                <div className="form-group">
                <input 
                    type="password" 
                    placeholder="סיסמה" 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                /></div>

                <button className="btn-primary" type="submit" >הירשם</button>
            </form>
            <p>
                כבר רשום? <Link to="/login">התחבר כאן</Link>
            </p>
        </div>
    );
};



export default Register;

