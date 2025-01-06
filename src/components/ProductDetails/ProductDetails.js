import React from 'react';
import { useParams } from 'react-router-dom';
import './ProductPage.css';
import ProductDetails from '../../components/ProductDetails/ProductDetails';
import Footer from '../../components/Footer/Footer';

const ProductPage = () => {
  // Get product details from the URL
  const { id } = useParams();

  // Example data; can load data from a server in the future.
  const product = {
    id,
    name: `Product ${id}`,
    price: (100 * id).toFixed(2),
    description: `This is a detailed description of Product ${id}.`,
    image: 'https://via.placeholder.com/300', // Placeholder image
  };

  return (
    <div className="container product-page mt-5">
      <ProductDetails product={product} />
      <Footer />
    </div>
  );
};

export default ProductPage;
