import React, { useState, useEffect } from 'react'; // Importing necessary React hooks
import { useTranslation } from 'react-i18next'; // Importing the translation hook
import axios from 'axios'; // Importing axios for making HTTP requests
import './StoreManagePage.css'; // Importing the CSS for the StoreManage page

const StoreManagment = () => {
  const { t } = useTranslation(); // Initializing the translation function

  // State hooks for storing products and product details
  const [products, setProducts] = useState([]); // To store the list of products
  const [newProductName, setNewProductName] = useState(''); // To store the name of a new product
  const [newProductPrice, setNewProductPrice] = useState(''); // To store the price of the new product

  // Fetching products from the database using axios when the component is mounted
  useEffect(() => {
    axios.get('/api/products') // HTTP GET request to the /api/products endpoint
      .then((res) => setProducts(res.data)) // On success, set the fetched products in state
      .catch((err) => console.log(err)); // On error, log the error
  }, []); // Empty dependency array means it runs once when the component mounts

  // Function to handle adding a new product
  const handleAddProduct = () => {
    axios.post('/api/products', { name: newProductName, price: newProductPrice }) // HTTP POST request to add a new product
      .then((res) => {
        setProducts([...products, res.data]); // Add the new product to the state
        setNewProductName(''); // Reset the product name input field
        setNewProductPrice(''); // Reset the product price input field
      })
      .catch((err) => console.log(err)); // Log any errors
  };

  // Function to handle deleting a product
  const handleDeleteProduct = (productId) => {
    axios.delete(`/api/products/${productId}`) // HTTP DELETE request to remove the product
      .then(() => setProducts(products.filter((product) => product._id !== productId))) // Remove the product from the state
      .catch((err) => console.log(err)); // Log any errors
  };

  return (
    <div className="storemanage-page container">
      <header className="bg-custom text-white text-center py-5">
        <h1>{t('storemanage.manage_products')}</h1> {/* Translated title */}
      </header>

      <section className="my-5">
        <h2 className="text-center">{t('storemanage.add_product')}</h2> {/* Translated text */}
        <div className="text-center mt-4">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)} // Update the state with the input value
            placeholder={t('storemanage.product_name')} // Placeholder text, translated
          />
          <input
            type="number"
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(e.target.value)} // Update the price state
            placeholder={t('storemanage.product_price')} // Placeholder for price, translated
          />
          <button className="btn btn-primary mt-3" onClick={handleAddProduct}>
            {t('storemanage.add')} {/* Translated text for the button */}
          </button>
        </div>
      </section>

      <section className="my-5">
        <h2 className="text-center">{t('storemanage.products')}</h2> {/* Translated text for products section */}
        <div className="mt-4">
          {products.map((product) => (
            <div key={product._id} className="product-item">
              <span>{product.name} - {t('price')}: ${product.price}</span> {/* Displaying product name and price */}
              <button className="btn btn-danger" onClick={() => handleDeleteProduct(product._id)}>
                {t('storemanage.delete')} {/* Translated delete button */}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StoreManagment; // Exporting the StoreManagePage component
