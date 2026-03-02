import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './NavBar';
import Login from './Login';
import Register from './Register';
import TodoList from './TodoList';
import Home from './Home'
import './App.css'; // <--- הייבוא של דף העיצוב החדש!

function App() {
  // שימוש ב-State כדי שהאפליקציה תתרענן כשהטוקן משתנה
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  // מאזין לשינויים ב-Storage (עוזר כשמתנתקים/מתחברים)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // פונקציית עזר להתחברות
  const handleLoginSuccess = () => {
    setIsAuth(true);
  };

  return (
    <Router>
      {/* שלחנו ל-Navbar את מצב ההתחברות כדי שיגיב מיד */}
      <Navbar auth={isAuth} setAuth={setIsAuth} />

      <div className="container"> {/* שינוי ל-Class מה-CSS החדש */}
        <Routes>       
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuth ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/tasks" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tasks" element={isAuth ? <TodoList /> : <Navigate to="/login" />}/>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;