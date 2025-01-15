import React from 'react';
import { Link } from 'react-router-dom';

const Product = ({ name, price, id }) => {
  return (
    <div className="card product shadow-sm">
      <div className="card-body text-center">
        <h3 className="card-title">{name}</h3>
        <p className="card-text">₪{price.toFixed(2)}</p>
        <Link to={`/product/${id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default Product;
