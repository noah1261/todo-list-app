import React from 'react';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">ToDo List Pro</div>
            <ul className="navbar-links">
                {token ? (
                    <>
                        <li><Link to="/tasks">המשימות שלי</Link></li>
                        <li><button className="btn-logout" onClick={handleLogout}>התנתק</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">כניסה</Link></li>
                        <li><Link to="/register">הרשמה</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};


export default Navbar;