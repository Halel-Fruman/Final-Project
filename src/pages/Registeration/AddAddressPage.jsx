import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AddAddressPage = ({ userId }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const navigate = useNavigate(); // הוסף את השימוש בנווט

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/add-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        throw new Error('Failed to add address');
      }
      alert(t('addAddress.success'));
      navigate('/personal-area'); // חזרה לאזור האישי
    } catch (err) {
      console.error(err.message);
      alert(t('addAddress.errors.failed'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h2 className="text-center mb-4">{t('addAddress.title')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">{t('addAddress.address')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">{t('addAddress.submit')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressPage;
