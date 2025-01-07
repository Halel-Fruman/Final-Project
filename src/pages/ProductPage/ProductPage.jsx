import React from 'react';
import { useParams } from 'react-router-dom';
import './ProductPage.css';

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
      <div className="row">
        <div className="col-md-6 text-center">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>
          <p className="product-price text-danger fs-4">₪{product.price}</p>
          <p className="product-description">{product.description}</p>
          <button className="btn btn-success btn-lg">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
