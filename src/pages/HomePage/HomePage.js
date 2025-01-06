import React from 'react';
import { useTranslation } from 'react-i18next';
import './HomePage.css';
import Product from '../../components/Product/Product';
import Category from '../../components/Category/Category';

const HomePage = () => {
  const { t } = useTranslation();

  const products = [
    { id: 1, name: 'Smartphone', price: 699.99 },
    { id: 2, name: 'Laptop', price: 1299.99 },
    { id: 3, name: 'Headphones', price: 199.99 },
  ];

  const categories = [
    { id: 1, name: t('categories.electronics') },
    { id: 2, name: t('categories.clothing') },
    { id: 3, name: t('categories.home_garden') },
    { id: 4, name: t('categories.beauty_health') },
  ];

  return (
    <div className="homepage container">
      {/* Main Title */}
      <header className="homepage-header bg-custom text-white text-center py-5">
        <h1>{t('welcome')}</h1>
        <p>{t('welcome_subtitle')}</p>
      </header>

      {/* Categories */}
      <section className="homepage-categories my-5">
        <h2 className="text-center">{t('categories.title')}</h2>
        <div className="row text-center mt-4">
          {categories.map((category) => (
            <div key={category.id} className="col-md-3">
              <Category name={category.name} />
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="homepage-products my-5">
        <h2 className="text-center">{t('featured_products')}</h2>
        <div className="row mt-4">
          {products.map((product) => (
            <div key={product.id} className="col-md-4">
              <Product id={product.id} name={product.name} price={product.price} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
