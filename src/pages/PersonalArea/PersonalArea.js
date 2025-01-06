import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PersonalArea = ({ userId }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/User/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUser();
  }, [userId]);

  return user ? (
    <div>
      <h1>{t('personal_area.welcome', { username: user.username })}</h1>
      <p>{t('personal_area.email')}: {user.email}</p>
      <h2>{t('personal_area.yourCart')}</h2>
      {user.cart.map((item, index) => (
        <div key={`${item.productId}-${index}`}>
          <p>{t('personal_area.productId')}: {item.productId}</p>
          <p>{t('personal_area.quantity')}: {item.quantity}</p>
        </div>
      ))}
      <h2>{t('personal_area.yourWishlist')}</h2>
      {user.wishlist.map((item, index) => (
        <p key={`${item}-${index}`}>{t('personal_area.productId')}: {item}</p>
      ))}
    </div>
  ) : (
    <p>{t('personal_area.loading')}</p>
  );
};

export default PersonalArea;
