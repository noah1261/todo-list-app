import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <header className="home-hero">
        <h1>נהלו את המשימות שלכם בקלות</h1>
        <p>הפלטפורמה המושלמת לארגון היום שלכם, מעקב אחרי הספקים וניהול זמן חכם.</p>
       
      </header>
      
      <section className="features">
        <div className="feature-card">
          <h3>אבטחה מקסימלית</h3>
          <p>כל המשימות שלכם מאובטחות עם טכנולוגיית JWT המתקדמת ביותר.</p>
        </div>
        <div className="feature-card">
          <h3>נגישות מכל מקום</h3>
          <p>התחברו מהמחשב או מהנייד וסנכרנו את המשימות בזמן אמת.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;