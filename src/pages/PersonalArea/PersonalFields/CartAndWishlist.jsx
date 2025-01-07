import React from "react";

const CartAndWishlist = ({ cart, wishlist }) => {
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5>Your Cart</h5>
            {cart?.length > 0 ? (
              cart.map((item, index) => (
                <p key={index}>
                  Product ID: {item.productId}, Quantity: {item.quantity}
                </p>
              ))
            ) : (
              <p>No items in cart.</p>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5>Your Wishlist</h5>
            {wishlist?.length > 0 ? (
              wishlist.map((item, index) => <p key={index}>{item}</p>)
            ) : (
              <p>No items in wishlist.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartAndWishlist;
