import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage/HomePage';
import ProductPage from './pages/ProductPage/ProductPage';

const App = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    // קביעת הכיווניות על בסיס השפה הנבחרת
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <Router>
      <div>
        {/* בורר שפה */}
        <div className="language-selector">
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('he')}>עברית</button>
        </div>

        {/* ניהול נתיבים */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
