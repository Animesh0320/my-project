import React from 'react';
import ProductDisplay from './ProductCard.jsx'; 
import './App.css';

const productData = [
  { id: 'p1', name: 'Wireless Mouse', price: '$25.99', available: true },
  { id: 'p2', name: 'Keyboard', price: '$45.5', available: false },
  { id: 'p3', name: 'Monitor', price: '$199.99', available: true }
];

function App() {
  return (
    // Add the flex centering wrapper here
    <div className="center-container">
      <main className="product-container">
        <h1 className="list-title">Products List</h1>
        <section className="product-grid">
          {productData.map((item) => (
            <ProductDisplay
              key={item.id}
              name={item.name}
              price={item.price}
              inStock={item.available}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
