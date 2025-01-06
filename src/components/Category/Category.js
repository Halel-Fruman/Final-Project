import React from 'react';
import './Category.css';

const Category = ({ name }) => {
  return (
    <div className="card category shadow-sm">
      <div className="card-body text-center">
        <h5 className="card-title">{name}</h5>
      </div>
    </div>
  );
};

export default Category;
