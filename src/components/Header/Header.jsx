import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';
import logo from '../../logo-ilan-g.svg';

const Header = ({ onLogout, isLoggedIn }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="bg-light shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-light bg-light container">
        {/* לוגו */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Logo" className="logo-image me-2" />
          <span className="fw-bold text-primary"></span>
        </Link>

        {/* תפריט ניווט */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* בורר שפות */}
            <li className="nav-item me-3">
              <div className="d-flex">
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => changeLanguage('en')}
                >
                  EN 🌍
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => changeLanguage('he')}
                >
                  HE 🌍
                </button>
              </div>
            </li>

            {/* כפתור אזור אישי */}
            {isLoggedIn && (
              <li className="nav-item">
                <Link to="/personal-area" className="btn btn-info btn-sm me-2">
                  אזור אישי
                </Link>
              </li>
            )}

            {/* כפתורי התחברות/הרשמה/התנתקות */}
            {isLoggedIn ? (
              <li className="nav-item">
                <button className="btn btn-danger btn-sm" onClick={onLogout}>
                  התנתק
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-success btn-sm me-2">
                    התחבר
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-primary btn-sm">
                    הרשם
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
