import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('register.errors.passwordMismatch'));
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName,lastName, email, password }),
      });
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      alert(t('register.success'));
    } catch (err) {
      console.error(err.message);
      alert(t('register.errors.failed'));
    }
  };

  return (
    <div className="container mt-5">
    <div className="row justify-content-center">
    <div className="col-md-6">
    <div className="card p-4 shadow">
    <h2 className="text-center mb-4">{t('register.title')}</h2>
    <form onSubmit={handleSubmit}>
    <div className="mb-3">
    <label htmlFor="first_name" className="form-label">{t('register.first_name')}</label>
    <input
    type="text"
    className="form-control"
    id="last_name"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    required
    />
    </div>
    <div className="mb-3">
    <label htmlFor="last_name" className="form-label">{t('register.last_name')}</label>
    <input
    type="text"
    className="form-control"
    id="last_name"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    required
    />
    </div>
    <div className="mb-3">
    <label htmlFor="email" className="form-label">{t('register.email')}</label>
    <input
    type="email"
    className="form-control"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    />
    </div>
    <div className="mb-3">
    <label htmlFor="password" className="form-label">{t('register.password')}</label>
    <input
    type="password"
    className="form-control"
    id="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />
    </div>
    <div className="mb-3">
    <label htmlFor="confirmPassword" className="form-label">{t('register.confirmPassword')}</label>
    <input
    type="password"
    className="form-control"
    id="confirmPassword"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    />
    </div>
    <button type="submit" className="btn btn-primary w-100">{t('register.submit')}</button>
    </form>
    </div>
    </div>
    </div>
    </div>
  );
};

export default RegisterPage;
